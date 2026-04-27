# Contributing Guide

Thank you for your interest in contributing! This project uses a **React (TypeScript) frontend**. Please follow the guidelines below to ensure smooth collaboration.

---

##  Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/rishab-mindfire/Digital-Asset-Management
```

---

### 2. Install Dependencies

#### Frontend (React + TypeScript)

```bash
cd Frontend
npm install
```

---

### 3. Environment Variables

Create a `.env` file for backend base api url point:

```env
VITE_BASE_URL=http://localhost:3000
```

> Never commit `.env` files to version control.

---

### 4. Run the Project
#### Start Frontend

```bash
cd frontend
npm run dev
```

---

##  Coding Standards

### General Rules

* Use **TypeScript** for all new code
* Keep functions small and reusable
* Avoid unnecessary comments — write clean, readable code instead

---

### Naming Conventions

* Variables & functions → `camelCase`
* Components → `PascalCase`
* Constants → `UPPER_CASE`
* Folder name → `lowelcase`

  * React components → `ComponentName.tsx`
  * Services → `serviceName.ts`

---

### Project Structure (Example)

```
src/
  assets/
  auth/
  component/
  context/
  hook/
  models/
  pages/
  reducers/
  services/
  test/
```

---

### Linting & Formatting

* Use **ESLint** and **Prettier**
* Run before committing:

```bash
npm run lint
npm run format
```

---

##  Git Workflow

### Branch Naming

* `feature/your-feature-name`
* `bugfix/issue-name`
* `hotfix/urgent-fix`

---

### Commit Messages

Use clear and meaningful messages:

```
feat: add login API
fix: resolve file upload issue
refactor: clean project controller logic
```

---

## Pull Request (PR) Guidelines

Before submitting a PR:

*  Ensure code compiles without errors
*  Run tests (if available)
*  Follow coding standards
*  No unnecessary console logs

---

### PR Checklist

Include the following in your PR:

* Description of changes
* Related issue (if any)
* Screenshots (for UI changes)
* Steps to test

---

### Example PR Title

```
feat: implement project file upload API
```

---

## Reporting Issues

When creating an issue, include:

* Clear description
* Steps to reproduce
* Expected vs actual behavior
* Screenshots (if applicable)

---

## Important Notes

* Do **not** push directly to `master` branch
* Always create a Pull Request
* Keep PRs small and focused

---

## Final Advice

If something feels unclear, don’t guess — ask.
Good contributions are not just about code, but also clarity and consistency.

---


---
#### Backend (nodeJs + TypeScript)

## Prerequisites

Before you start, ensure you have the following installed:
- **Node.js**: v18.x or higher (required for stable `worker_threads` support).
- **MongoDB**: v6.0+ (Local instance or MongoDB Atlas).
- **Package Manager**: npm or yarn.

---
## Environment Configuration:

## Create a .env.dev file in the root directory:

Code snippet

PORT=5000
MONGO_URI=mongodb://localhost:27017/project_db


## Install Dependencies:

Bash
```
cd Backend
npm install
```

Start the Server:

Bash
```
npm run dev
```

 ## Architectural Guidelines

