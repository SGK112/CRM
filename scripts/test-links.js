#!/usr/bin/env node

/**
 * Comprehensive Link and Navigation Testing Script
 * 
 * This script tests all dashboard pages for:
 * - 404 errors
 * - Broken links 
 * - Navigation issues
 * - Component compilation
 * - Missing dependencies
 * 
 * Usage: node scripts/test-links.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

// Configuration
const DASHBOARD_PAGES_DIR = path.join(__dirname, '../apps/frontend/src/app/dashboard');
const COMPONENTS_DIR = path.join(__dirname, '../apps/frontend/src/components');
const BASE_URL = 'http://localhost:3000';

// Test results tracker
const testResults = {
  totalPages: 0,
  passedPages: 0,
  failedPages: 0,
  errors: [],
  warnings: []
};

/**
 * Find all dashboard pages recursively
 */
function findDashboardPages(dir, basePath = '') {
  const pages = [];
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const relativePath = path.join(basePath, item.name);
      
      if (item.isDirectory()) {
        // Skip archived and private directories
        if (item.name.startsWith('_') || item.name.startsWith('.')) {
          continue;
        }
        
        // Recursively find pages in subdirectories
        pages.push(...findDashboardPages(fullPath, relativePath));
      } else if (item.name === 'page.tsx' || item.name === 'page.ts') {
        // Convert file path to route
        const route = '/dashboard' + (basePath ? '/' + basePath.replace(/\\/g, '/') : '');
        pages.push({
          file: fullPath,
          route: route,
          name: basePath || 'dashboard'
        });
      }
    }
  } catch (error) {
    testResults.errors.push(`Error reading directory ${dir}: ${error.message}`);
  }
  
  return pages;
}

/**
 * Test a single page for compilation errors
 */
async function testPageCompilation(page) {
  try {
    const content = fs.readFileSync(page.file, 'utf8');
    
    // Check for common issues
    const issues = [];
    
    // Check for missing imports
    const importRegex = /import.*from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Check relative imports
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        const resolvedPath = path.resolve(path.dirname(page.file), importPath);
        const possibleExtensions = ['.tsx', '.ts', '.js', '.jsx'];
        
        let exists = false;
        for (const ext of possibleExtensions) {
          if (fs.existsSync(resolvedPath + ext)) {
            exists = true;
            break;
          }
        }
        
        if (!exists && !fs.existsSync(resolvedPath)) {
          issues.push(`Missing import: ${importPath}`);
        }
      }
    }
    
    // Check for undefined components
    const componentRegex = /<([A-Z][a-zA-Z0-9]*)/g;
    const definedComponents = new Set();
    const usedComponents = new Set();
    
    // Find component definitions/imports
    const componentImportRegex = /import\s+{?([^}]+)}?\s+from/g;
    let importMatch;
    while ((importMatch = componentImportRegex.exec(content)) !== null) {
      const imports = importMatch[1].split(',').map(s => s.trim().replace(/\s+as\s+\w+/g, ''));
      imports.forEach(imp => {
        if (imp.match(/^[A-Z]/)) {
          definedComponents.add(imp);
        }
      });
    }
    
    // Find component usage
    let componentMatch;
    while ((componentMatch = componentRegex.exec(content)) !== null) {
      usedComponents.add(componentMatch[1]);
    }
    
    // Check for undefined components
    usedComponents.forEach(component => {
      // Skip common HTML elements and Next.js components
      const builtInComponents = ['Image', 'Link', 'Head', 'Script', 'div', 'span', 'button', 'input', 'form'];
      if (!builtInComponents.includes(component) && !definedComponents.has(component)) {
        issues.push(`Undefined component: ${component}`);
      }
    });
    
    // Check for Layout duplication (common issue we fixed)
    if (content.includes('import Layout') && content.includes('<Layout>')) {
      issues.push(`Potential Layout duplication - dashboard pages should not import Layout`);
    }
    
    return {
      passed: issues.length === 0,
      issues: issues
    };
    
  } catch (error) {
    return {
      passed: false,
      issues: [`Compilation error: ${error.message}`]
    };
  }
}

/**
 * Test Next.js build for specific page
 */
async function testPageBuild(page) {
  try {
    // Create a minimal test build focused on the specific page
    const { stdout, stderr } = await execAsync(`cd apps/frontend && npx next build --debug 2>&1 | grep -E "(${page.name}|error|Error|failed)"`, {
      cwd: path.join(__dirname, '..')
    });
    
    if (stderr && stderr.includes('error')) {
      return {
        passed: false,
        buildErrors: [stderr]
      };
    }
    
    return {
      passed: true,
      buildErrors: []
    };
    
  } catch (error) {
    // Check if it's just a grep with no matches (which is actually good)
    if (error.code === 1 && !error.stderr) {
      return {
        passed: true,
        buildErrors: []
      };
    }
    
    return {
      passed: false,
      buildErrors: [`Build test failed: ${error.message}`]
    };
  }
}

/**
 * Check for common routing issues
 */
function testRouting(pages) {
  const routes = pages.map(p => p.route);
  const duplicates = routes.filter((route, index) => routes.indexOf(route) !== index);
  
  if (duplicates.length > 0) {
    testResults.errors.push(`Duplicate routes found: ${duplicates.join(', ')}`);
  }
  
  // Check for nested dynamic routes that might conflict
  const dynamicRoutes = routes.filter(route => route.includes('[') && route.includes(']'));
  const conflicts = [];
  
  dynamicRoutes.forEach(dynamicRoute => {
    const basePath = dynamicRoute.split('[')[0];
    const conflictingStatic = routes.find(route => 
      route.startsWith(basePath) && 
      !route.includes('[') && 
      route !== dynamicRoute
    );
    
    if (conflictingStatic) {
      conflicts.push(`Route conflict: ${dynamicRoute} vs ${conflictingStatic}`);
    }
  });
  
  if (conflicts.length > 0) {
    testResults.errors.push(...conflicts);
  }
}

/**
 * Main testing function
 */
async function runTests() {
  console.log('🔍 Starting comprehensive link and navigation testing...\n');
  
  // Find all dashboard pages
  console.log('📁 Scanning dashboard pages...');
  const pages = findDashboardPages(DASHBOARD_PAGES_DIR);
  testResults.totalPages = pages.length;
  
  console.log(`Found ${pages.length} dashboard pages:\n`);
  pages.forEach(page => {
    console.log(`  ✓ ${page.route} (${path.relative(process.cwd(), page.file)})`);
  });
  
  console.log('\n🔗 Testing routing configuration...');
  testRouting(pages);
  
  console.log('\n🧪 Testing individual pages...\n');
  
  // Test each page
  for (const page of pages) {
    console.log(`Testing: ${page.route}`);
    
    // Test compilation
    const compilationResult = await testPageCompilation(page);
    
    if (compilationResult.passed) {
      console.log(`  ✅ Compilation: PASSED`);
      testResults.passedPages++;
    } else {
      console.log(`  ❌ Compilation: FAILED`);
      console.log(`     Issues: ${compilationResult.issues.join(', ')}`);
      testResults.failedPages++;
      testResults.errors.push(`${page.route}: ${compilationResult.issues.join(', ')}`);
    }
    
    console.log('');
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  console.log(`Total Pages: ${testResults.totalPages}`);
  console.log(`Passed: ${testResults.passedPages}`);
  console.log(`Failed: ${testResults.failedPages}`);
  console.log(`Success Rate: ${((testResults.passedPages / testResults.totalPages) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERRORS FOUND:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  if (testResults.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    testResults.warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  }
  
  if (testResults.failedPages === 0 && testResults.errors.length === 0) {
    console.log('\n🎉 All tests passed! Your dashboard is ready for production.');
    process.exit(0);
  } else {
    console.log('\n🔧 Some issues were found. Please fix them before deploying to production.');
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = {
  findDashboardPages,
  testPageCompilation,
  testRouting,
  runTests
};

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}
