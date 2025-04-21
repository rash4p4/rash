# SmartChef

## Overview
SmartChef is a modern web application designed to simplify recipe management and meal planning. Built with a robust tech stack, including React, Express, and TailwindCSS, it offers a seamless user experience. The project integrates various libraries and tools to enhance functionality and maintainability.

---

## Table of Contents
1. [Features](#features)
2. [Workflow](#workflow)
   - [Step 1: Setup](#step-1-setup)
   - [Step 2: Dependency Management](#step-2-dependency-management)
   - [Step 3: Development](#step-3-development)
   - [Step 4: Deployment](#step-4-deployment)

---

## Features
- **Recipe Management**: Add, edit, and organize recipes.
- **Meal Planning**: Plan meals for the week with ease.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Integration**: Uses libraries like `@radix-ui/react` for UI components and `@tanstack/react-query` for state management.
- **Secure Authentication**: Implements `passport` for user authentication.
- **Database Support**: Uses `drizzle-orm` for database interactions.

---

## Workflow

### Step 1: Setup
- Clone the repository and navigate to the project directory.
- Install the required Node.js version (>=18) as specified in the `engines` field of the `package-lock.json`.

### Step 2: Dependency Management
- Install dependencies using `npm install` or `yarn install`.
- The project uses a variety of dependencies for both development and production, including:
  - `react`, `react-dom` for the frontend.
  - `express`, `express-session` for the backend.
  - `tailwindcss` for styling.
  - `vite` for development and build tooling.

### Step 3: Development
- Start the development server using `npm run dev` or `yarn dev`.
- The project uses `vite` for fast builds and hot module replacement.
- Key libraries for development:
  - `@vitejs/plugin-react` for React integration.
  - `@tailwindcss/typography` for enhanced text styling.

### Step 4: Deployment
- Build the project using `npm run build` or `yarn build`.
- Deploy the build output to your preferred hosting platform.
- Ensure all environment variables are correctly configured for production.

---

## License
This project is licensed under the MIT License.
