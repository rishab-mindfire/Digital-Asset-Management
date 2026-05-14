# Contributing Guide

Thank you for your interest in contributing! This project uses a **React (TypeScript) frontend**. Please follow the guidelines below to ensure smooth collaboration.

---

##  Project Setup

# 1. Clone the Repository

```bash
git clone https://github.com/rishab-mindfire/Digital-Asset-Management
```

---

# 2. Install Dependencies

#### Frontend (React + TypeScript)

```bash
cd Frontend
npm install
npm run dev
```

#### Backend (Nodejs + express)

```bash
cd Backend
npm install
npm run dev
```

---

# 3. Environment Variables

Create a `.env` file for frontend example
    ` backend base api url point `,
    ` token key ` ,
    ` cookies name key ` ,
    ` user role key `

```env
VITE_BASE_URL=http://localhost:4001
VITE_TOKEN_KEY='*******'
COOKIES_NAME="DigitalAssetApp"
USERROLE_KEY="userRole-DAM"
```


Create a `.env` file for backend example
    ` local server port ` ,
    ` frontend url ` ,
    ` DB connection string ` ,
    ` JWT_SECRET ` ,
    ` JWT_REFRESH_SECRET ` ,
    etc...

```env
PORT=4001
FRONTEND_URL="http://localhost:3001"
DB_CONNECTION_STRING="mongodb://localhost:27017/asset-management"
JWT_SECRET="########################"
JWT_REFRESH_SECRET="##########################"
UPLOAD_DIR="./storage/raw"
RABBITMQ_URL="amqp://127.0.0.1:5672"
QUEUE_UPLOAD_ASSET_NAME="asset_upload_worker"
QUEUE_EXPIRATION_ASSET_NAME="asset_expiration_worker"
RABBITMQ_THUMBNAILPATH="storage/thumbnails"
EXPIRY_DAYS=1
COOKIES_NAME="DigitalAssetApp"
```
### 1. setup docker for rabbit MQ run
   open in other terminal start docker by :
```
   docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management
```
   (make sure rabbit mq is running on correct port else change in env for port configuration)


> note : Never commit `.env` files to version control.

---

# 4.  Coding Standards

### General Rules

* Use **TypeScript** for all new code
* Keep functions small and reusable
* Avoid unnecessary comments — write clean, readable code instead

### Naming Conventions

* Variables & functions → `camelCase`
* Components → `PascalCase`
* Constants → `UPPER_CASE`
* Folder name → `lowelcase`

  * React components → `ComponentName.tsx`
  * Services → `serviceName.ts`

---

# 5. Project Structure (Example)

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

```
npm run lint
npm run format
```
husky used for pre commites error check before commiting to origin

---

##  Git Workflow

### Branch Naming

* `feature/your-feature-name`
* `bugfix/issue-name`
* `hotfix/urgent-fix`

## Prerequisites

Before you start, ensure you have the following installed:
- **Node.js**: v18.x or higher (required for stable `worker_threads` support).
- **MongoDB**: v6.0+ (Local instance or MongoDB Atlas).
- **Package Manager**: npm or yarn.

# 6. App folder structure

 ```
 ├── Frontend/ # Front end (React app)
    ├── node_modeules
    ├── public
     ├── src
        ├── assets                      ( files, img , logo)
        ├── auth                        ( authentication logics)
        ├── components                  ( components)
        ├── context                     ( context, auth-context)
        ├── hooks                       ( custome hookes, pagination hook)
        ├── models                      ( type declearation)
        ├── pages                       ( layout pages)
        ├── reducers                    ( api call, reducers and actions, login, singin)
        ├── services                    ( API services, interceptors)
        ├── App.tsx                     ( main app, routes)
        ├── index.css
        ├── main.tsx
    ├── test
    ├── .env
    ├── .prettierignore
    ├── .prettierrc
    ├── dockerfile
    ├── eslint.config.js
    ├── index.html
    ├── ngnix.config
    ├── packege-lock.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    ├── vite.config.ts

 ├── Backend/  # Backend App (node+express)
    ├── node_module
    ├── src
       ├── config                          ( DB configuration, Rabbit MQ config)
       ├── consumer                        ( Consumer, worker deligation )
       ├── controller                      ( controlers for admin, public, managers)
       ├── helper                          ( helpers for id generator, other)
       ├── middlewares                     ( authentication middleware)
       ├── models                          ( DB schema design and type initialization)
       ├── queuePublicer                   ( public tasks to queue)
       ├── router                          ( routes for admin, public, managers)
       ├── services                        ( services for API routes)
       ├── types                           ( type decleratons)
       ├── utilis                          ( utility folder, globle errror hander)
       ├── validation                      ( validation sanitize frontend payloads)
       ├── index.ts
       ├── server.ts
    ├── storage
    ├── test
    ├── .env.dev
    ├── .env.production
    ├── .prettierignore
    ├── .prettierrc
    ├── dockerfile
    ├── eslint.config.js
    ├── .dockerignore
    ├── packege-lock.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    ├── vite.config.ts
 ```


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

