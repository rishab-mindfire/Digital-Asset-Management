# Digital Asset Management & Media Intelligence Platform

## **1. Project Title**

Digital Asset Management & Media Intelligence Platform

---

## **2. Overview**

Organizations manage thousands to millions of digital assets such as images, videos, documents, marketing creatives, and brand materials. Today, these assets are scattered across shared drives, cloud folders, emails, and messaging tools. Teams often rely on folder naming conventions, manual tagging, and Excel sheets to track what exists, who owns it, and whether it can be used.

As the organization grows, assets are duplicated, lost, outdated, or misused. Finding the “right” version of an asset becomes slow and frustrating. Compliance risks increase when expired or unapproved assets are accidentally used in campaigns. Reporting on asset usage, performance, and compliance is largely manual and unreliable.

The current approach breaks down under scale because manual tagging, searching, and reporting cannot keep up with volume and frequency of uploads. Teams spend more time searching and validating assets than creating value.

The goal is to build a centralized platform that manages digital assets end-to-end, automates intelligence around content, and provides visibility into usage, compliance, and performance—without slowing down day-to-day operations.


## **3. Folder Structure **

```
DIGITA-ASSET-MANAGEMENT/
├── .husky/  # husky setup
├── Frontend/ # Front end (React app)
├── Backend/  # Backend App (node+express)
├── .dockerignore
├── .gitignore
├── commitlint.config.js
├── CONTRIBUTING.md
├── docker-compose.yml
├── HLD.drawoio
├── package.json
├── README.md

```
## App folder **

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

