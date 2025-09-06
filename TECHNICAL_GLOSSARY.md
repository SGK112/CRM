# 🔧 Technical Glossary - Remodely CRM

## Table of Contents
- [Development Environment](#development-environment)
- [Frontend Technologies](#frontend-technologies)
- [Backend Technologies](#backend-technologies)
- [Database & Storage](#database--storage)
- [Authentication & Security](#authentication--security)
- [Deployment & DevOps](#deployment--devops)
- [API & Networking](#api--networking)
- [Build Tools & Configuration](#build-tools--configuration)
- [Performance & Optimization](#performance--optimization)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Business Logic Terms](#business-logic-terms)

---

## Development Environment

### **Node.js**
JavaScript runtime environment that executes JavaScript code outside a web browser. Your CRM runs on Node.js for both frontend and backend.

### **npm (Node Package Manager)**
Package manager for JavaScript. Used to install, update, and manage project dependencies.
- `npm install` - Install all dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production

### **Workspace/Monorepo**
Project structure with multiple packages managed together. Your CRM has:
- `apps/frontend` - Next.js React application
- `apps/backend` - NestJS API server
- `packages/` - Shared libraries

### **VS Code**
Visual Studio Code - Your primary code editor with extensions for development.

### **Git**
Version control system for tracking code changes.
- `git add .` - Stage all changes
- `git commit -m "message"` - Save changes with description
- `git push` - Upload changes to GitHub

---

## Frontend Technologies

### **Next.js**
React framework for building web applications with server-side rendering and static site generation.

### **App Router**
Next.js 13+ routing system using file-based routing in the `app/` directory.
- `app/page.tsx` - Home page
- `app/dashboard/page.tsx` - Dashboard page
- `app/api/` - API routes

### **React**
JavaScript library for building user interfaces with components.

### **TypeScript**
Typed superset of JavaScript that provides better error catching and IDE support.

### **Tailwind CSS**
Utility-first CSS framework for styling. Classes like:
- `bg-blue-500` - Blue background
- `text-center` - Center text
- `p-4` - Padding of 16px

### **Components**
Reusable UI building blocks:
- `<Button>` - Interactive button element
- `<Modal>` - Popup dialog
- `<Form>` - Input form wrapper

### **Client Storage**
Browser-based data storage for development mode:
- `localStorage` - Persistent browser storage
- `sessionStorage` - Session-only storage

---

## Backend Technologies

### **NestJS**
Node.js framework for building scalable server-side applications with TypeScript.

### **Controllers**
Handle incoming HTTP requests and return responses.
```typescript
@Controller('clients')
export class ClientsController {
  @Get()
  findAll() { /* logic */ }
}
```

### **Services**
Business logic layer that controllers use to process data.

### **DTOs (Data Transfer Objects)**
Define the shape of data for API requests and responses.

### **Guards**
Protect routes with authentication and authorization logic.

### **Middleware**
Functions that execute during the request-response cycle.

---

## Database & Storage

### **MongoDB**
NoSQL document database used for storing CRM data.

### **Mongoose**
MongoDB object modeling library for Node.js.

### **Collections**
MongoDB equivalent of database tables:
- `clients` - Customer information
- `projects` - Project details
- `estimates` - Cost estimates
- `appointments` - Scheduled meetings

### **Documents**
Individual records stored in MongoDB collections.

### **Schema**
Defines the structure of documents in a collection.

---

## Authentication & Security

### **JWT (JSON Web Tokens)**
Secure way to transmit information between parties as a JSON object.

### **Bearer Token**
Authentication method where the token is sent in the HTTP Authorization header.

### **CORS (Cross-Origin Resource Sharing)**
Security feature that controls which domains can access your API.

### **Environment Variables**
Configuration values stored outside the code:
- `JWT_SECRET` - Secret key for signing tokens
- `MONGODB_URI` - Database connection string
- `NODE_ENV` - Environment (development/production)

---

## Deployment & DevOps

### **Render**
Cloud platform where your CRM is deployed.
- **Frontend Service** - Serves the Next.js application
- **Backend Service** - Runs the NestJS API
- **Database** - MongoDB instance

### **Production Environment**
Live environment where users access your application.

### **Development Environment**
Local environment for coding and testing.

### **Build Process**
Converting source code into deployable format:
1. `npm install` - Install dependencies
2. `npm run build` - Compile TypeScript, bundle assets
3. Deploy to server

### **Environment Variables (Production)**
Configuration for production deployment:
- `NEXT_PUBLIC_API_URL` - Frontend API endpoint
- `NEXT_PUBLIC_BACKEND_URL` - Backend service URL
- `FRONTEND_URL` - Frontend service URL

---

## API & Networking

### **REST API**
Architectural style for web services using HTTP methods:
- `GET` - Retrieve data
- `POST` - Create new data
- `PUT` - Update existing data
- `DELETE` - Remove data

### **HTTP Status Codes**
- `200` - Success
- `201` - Created successfully
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `500` - Internal server error

### **API Routes**
Endpoint URLs for accessing data:
- `/api/clients` - Client management
- `/api/projects` - Project management
- `/api/estimates` - Estimate management
- `/api/appointments` - Appointment scheduling

### **Middleware**
Functions that process requests before reaching the final handler.

---

## Build Tools & Configuration

### **Turbo**
Build system orchestrator for monorepos. Manages building multiple packages efficiently.

### **ESLint**
Tool for identifying and fixing JavaScript/TypeScript code problems.

### **Prettier**
Code formatter that ensures consistent code style.

### **TypeScript Compiler (tsc)**
Converts TypeScript code to JavaScript.

### **Package.json**
Configuration file that defines project metadata and dependencies.

### **tsconfig.json**
TypeScript compiler configuration file.

---

## Performance & Optimization

### **Server-Side Rendering (SSR)**
Rendering pages on the server before sending to the browser.

### **Static Site Generation (SSG)**
Pre-generating pages at build time for faster loading.

### **Code Splitting**
Breaking code into smaller chunks that load as needed.

### **Bundle Optimization**
Minimizing the size of JavaScript and CSS files.

### **Caching**
Storing frequently accessed data for faster retrieval.

---

## Testing & Quality Assurance

### **Unit Tests**
Testing individual functions or components in isolation.

### **Integration Tests**
Testing how different parts of the application work together.

### **End-to-End (E2E) Tests**
Testing complete user workflows from start to finish.

### **Linting**
Checking code for style and potential errors.

### **Type Checking**
Verifying TypeScript types are used correctly.

---

## Business Logic Terms

### **CRM (Customer Relationship Management)**
System for managing customer interactions and business relationships.

### **Client**
Customer or potential customer in the CRM system.

### **Project**
Work engagement associated with a client.

### **Estimate**
Cost calculation for a project or service.

### **Appointment**
Scheduled meeting or consultation with a client.

### **Dashboard**
Main interface showing overview of CRM data and metrics.

### **Workflow**
Sequence of steps to complete a business process.

---

## File Structure Terms

### **Source Code**
- `src/` - Source code directory
- `components/` - Reusable UI components
- `pages/` - Page components (or `app/` in App Router)
- `lib/` - Utility functions and shared code
- `types/` - TypeScript type definitions

### **Configuration Files**
- `package.json` - Project configuration and dependencies
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `render.yaml` - Render deployment configuration

### **Public Assets**
- `public/` - Static files served directly
- `favicon.svg` - Website icon
- `manifest.json` - PWA configuration

---

## Development Commands Reference

### **Starting Development**
```bash
npm run dev                    # Start both frontend and backend
npm run frontend:dev          # Start only frontend
npm run backend:dev           # Start only backend
./start-dev-robust.sh         # Robust development startup
```

### **Building & Deployment**
```bash
npm run build                 # Build for production
npm run lint                  # Check code quality
npm run format                # Format code with Prettier
```

### **Process Management**
```bash
lsof -i:3000,3001            # Check what's running on ports
pkill -f 'npm run dev'       # Kill development processes
```

### **Git Operations**
```bash
git status                   # Check current changes
git add .                    # Stage all changes
git commit -m "message"      # Commit with message
git push                     # Push to repository
```

---

## Troubleshooting Terms

### **Port Conflicts**
When multiple applications try to use the same network port (3000, 3001).

### **Build Errors**
Compilation failures during the build process.

### **Type Errors**
TypeScript errors when types don't match expectations.

### **CORS Errors**
Cross-origin request blocked by browser security.

### **500 Internal Server Error**
Server-side error in API endpoints.

### **Hot Reload**
Automatic page refresh when code changes in development.

### **Cache Issues**
Outdated files causing unexpected behavior.

---

## Monitoring & Maintenance

### **Health Checks**
API endpoints that verify services are running correctly.

### **Logs**
Records of application events and errors for debugging.

### **Performance Metrics**
Measurements of application speed and resource usage.

### **Uptime**
Percentage of time the application is available and functioning.

### **Error Monitoring**
Systems that track and alert about application errors.

---

*This glossary covers the essential terms for understanding, building, and maintaining your Remodely CRM system. Keep this reference handy when working with the codebase or troubleshooting issues.*
