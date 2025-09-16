#!/bin/bash

# Backup important files to backup-files directory
mkdir -p /Users/homepc/CRM-5/backup-files/docs-backup-$(date +%Y%m%d)

echo "Creating backup of all documentation files..."
cp /Users/homepc/CRM-5/*.md /Users/homepc/CRM-5/backup-files/docs-backup-$(date +%Y%m%d)/ 2>/dev/null || true

echo "Removing redundant documentation files..."

# Remove outdated deployment files (keep only the main guides)
rm -f /Users/homepc/CRM-5/DEPLOYMENT_FIX_STATUS.md
rm -f /Users/homepc/CRM-5/DEPLOYMENT_SUCCESS_ESTIMATE_FIX.md
rm -f /Users/homepc/CRM-5/DEPLOYMENT_SUMMARY.md
rm -f /Users/homepc/CRM-5/MANUAL_DEPLOYMENT.md
rm -f /Users/homepc/CRM-5/PRODUCTION_DEPLOYMENT_FIXES.md
rm -f /Users/homepc/CRM-5/PRODUCTION_DEPLOYMENT_STATUS.md

# Remove individual feature completion files (consolidate into main docs)
rm -f /Users/homepc/CRM-5/AI_ENABLE_IMPLEMENTATION.md
rm -f /Users/homepc/CRM-5/AUTH_FIX_SUMMARY.md
rm -f /Users/homepc/CRM-5/BRAND_UPDATE_SUMMARY.md
rm -f /Users/homepc/CRM-5/BROWSER_CACHE_CLEAR_GUIDE.md
rm -f /Users/homepc/CRM-5/BUG_FIXES_SUMMARY.md
rm -f /Users/homepc/CRM-5/BUILD_OPTIMIZATION.md
rm -f /Users/homepc/CRM-5/CALENDAR_LEGACY_REMOVAL_SUMMARY.md
rm -f /Users/homepc/CRM-5/CALENDAR_UPGRADE_SUMMARY.md
rm -f /Users/homepc/CRM-5/CONTACT_CREATION_TEST.md
rm -f /Users/homepc/CRM-5/CONTACT_ONBOARDING_REFACTOR_SUMMARY.md
rm -f /Users/homepc/CRM-5/CONTACT_TYPE_ENHANCEMENTS.md
rm -f /Users/homepc/CRM-5/COPILOT_FIX_COMPLETE.md
rm -f /Users/homepc/CRM-5/COPILOT_FOOTER_FIX_SUMMARY.md
rm -f /Users/homepc/CRM-5/CRM_ISSUES_ANALYSIS_AND_FIXES.md
rm -f /Users/homepc/CRM-5/CRM_STANDARDIZATION_SUMMARY.md
rm -f /Users/homepc/CRM-5/DASHBOARD_SIMPLIFICATION_COMPLETE.md
rm -f /Users/homepc/CRM-5/EMAIL_VERIFICATION_COMPLETE.md
rm -f /Users/homepc/CRM-5/ENHANCED_CONTACT_CREATION_SUMMARY.md
rm -f /Users/homepc/CRM-5/ENHANCEMENT_COMPLETION_SUMMARY.md
rm -f /Users/homepc/CRM-5/ENHANCEMENT_SUMMARY.md
rm -f /Users/homepc/CRM-5/ESTIMATES_COMING_SOON_SUMMARY.md
rm -f /Users/homepc/CRM-5/ESTIMATE_INVOICE_WORKFLOW_COMPLETE.md
rm -f /Users/homepc/CRM-5/HOVER_EFFECTS_FIXED.md
rm -f /Users/homepc/CRM-5/MOBILE_OPTIMIZATION_COMPLETE.md
rm -f /Users/homepc/CRM-5/MOBILE_SIDEBAR_PDF_IMPLEMENTATION.md
rm -f /Users/homepc/CRM-5/PRICING_INTEGRATION_SUMMARY.md
rm -f /Users/homepc/CRM-5/PRODUCTION_BUILD_READY.md
rm -f /Users/homepc/CRM-5/PROFILE_SETTINGS_COMPLETE.md
rm -f /Users/homepc/CRM-5/PROJECTS_MEMORY_OPTIMIZATION_COMPLETE.md
rm -f /Users/homepc/CRM-5/PROJECT_CLIENT_INTEGRATION_COMPLETE.md
rm -f /Users/homepc/CRM-5/RENDER_CONFIG_UPDATED.md
rm -f /Users/homepc/CRM-5/SENDGRID_ESTIMATE_INTEGRATION_COMPLETE.md
rm -f /Users/homepc/CRM-5/STRIPE_INTEGRATION_COMPLETE.md
rm -f /Users/homepc/CRM-5/UPGRADE_SYSTEM_COMPLETE.md
rm -f /Users/homepc/CRM-5/WORKFLOW_INTEGRATION_COMPLETE.md

# Remove very specific implementation notes that are no longer needed
rm -f /Users/homepc/CRM-5/MOCK_API_SOLUTION.md
rm -f /Users/homepc/CRM-5/VSCODE_OPTIMIZATION.md
rm -f /Users/homepc/CRM-5/CHAT_INTEGRATION_GUIDE.md
rm -f /Users/homepc/CRM-5/GOOGLE_MAPS_SETUP.md

echo "Documentation cleanup complete!"
echo "Kept important files: README.md, PROJECT_SUMMARY.md, DEPLOYMENT_GUIDE.md, RENDER_DEPLOYMENT_GUIDE.md, etc."
echo "Backup available in: backup-files/docs-backup-$(date +%Y%m%d)/"