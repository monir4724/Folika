# ফসলিকা (FOLICA) – Project Upgrade Context

## 1. Project Summary

এটি একটি বাংলাদেশভিত্তিক কৃষি সহায়ক ও ফার্ম ম্যানেজমেন্ট অ্যাপ্লিকেশন। অ্যাপটি কৃষকদের জন্য ডিজাইন করা হয়েছে যাতে তারা:

- ফসল সংক্রান্ত পরামর্শ নিতে পারে
- মাটি, আবহাওয়া ও AEZ অনুযায়ী সিদ্ধান্ত নিতে পারে
- পশু স্বাস্থ্য এবং টিকা reminders দেখতে পারে
- মাছচাষ ও পুকুর ব্যবস্থাপনা সম্পর্কে তথ্য পেতে পারে
- বাজার দর, লাভ, ঋণ ও আর্থিক সহায়তা সম্পর্কে জ্ঞান নিতে পারে
- ভয়েস AI সহকারী বা ছবি-based disease scan এর মাধ্যমে দ্রুত সহায়তা পেতে পারে

অ্যাপটি মূলত React + TypeScript + Vite frontend এবং Express backend এর সমন্বয়ে তৈরি। AI advisory layer হিসেবে Gemini/Groq API ব্যবহার করা হয়েছে।

---

## 2. Project Identity

- Project name: ফসলিকা / FOLICA
- Type: Web application
- Primary users: Bangladeshi farmers, livestock keepers, fish farmers
- Primary language: Bangla first, English secondary
- Deployment model: local dev + Vite SPA + Express backend

---

## 3. Technology Stack

### Frontend
- React 19
- TypeScript
- Vite 6
- Tailwind CSS v4
- Lucide React icons
- Chart.js + react-chartjs-2
- QR code libraries
- Motion library
- Canvas confetti

### Backend / Server
- Node.js
- Express
- TypeScript
- MySQL 2 (optional / conditional)
- dotenv

### AI / External Services
- Google GenAI (@google/genai)
- Groq OpenAI-compatible endpoint
- Gemini fallback and Groq enhancement flow

### Development tools
- TypeScript compiler
- esbuild for backend bundling
- tsx for dev server
- Vite dev server

---

## 4. Project Architecture

### High-level structure

- Frontend: React UI rendered in browser
- App state and local storage: browser-based persistence
- Backend: Express server with REST API routes
- Dataset grounding: local agricultural knowledge dataset
- AI integration: Gemini/Groq models for voice and diagnosis workflows

### Runtime flow

1. User opens app and onboarded profile is loaded from browser storage.
2. Home dashboard shows weather, region, and service access.
3. User chooses a module:
   - crop
   - market
   - livestock
   - fisheries
   - community
4. backend AI APIs provide advisory, scanning, and diagnosis support.
5. results are shown in UI with Bangla/English output depending on current language.

---

## 5. Core Features

### 5.1 Onboarding
- Farmer profile collection
- location, district, upazila, AEZ data
- farm category selection: crops, livestock, fisheries, mixed
- language setting (bn/en)
- stored in browser localStorage

### 5.2 Home Dashboard
- personalized greeting
- region marker (district/upazila/AEZ code)
- weather summary card
- core service tiles
- quick access to key modules

### 5.3 Crop Module
- crop advisory
- soil health suggestions
- crop cycle engine / rotation planning
- disease scanner using camera upload
- crop/soil selection by AEZ

### 5.4 Market & Finance Module
- market price data
- expected price forecast
- best market suggestion
- financial rules and concessional loan info
- agribusiness support

### 5.5 Livestock Module
- animal care guidance
- vaccination schedule
- symptom-based diagnosis
- disease scanning support
- animal profile / health tracking

### 5.6 Fisheries Module
- pond management guidance
- species and management data
- water quality and stocking suggestions

### 5.7 Community / Trust Module
- community support / local trust/information area
- likely social or trust-based advisory flows

### 5.8 AI Voice Assistant
- user asks agricultural question in voice/chat
- prompt is grounded with local agro dataset
- Groq or Gemini is used for answer generation
- multilingual response in Bangla/English

### 5.9 Disease Scanner
- user uploads plant/livestock/fish image
- server validates and calls Gemini model
- returns structured diagnosis with confidence, treatment, prevention
- includes fallback response if no AI key is configured

---

## 6. Key Project Files

### Root files
- package.json – app scripts and dependencies
- tsconfig.json – TypeScript configuration
- vite.config.ts – Vite configuration
- index.html – entry page
- server.ts – Express API server
- README.md – basic setup guidance

### Source folders
- src/App.tsx – main app shell and routing/tab logic
- src/main.tsx – entry point
- src/index.css – app styling
- src/components/ – reusable UI modules
- src/views/ – feature views
- src/data/ – agricultural data, knowledge, crop and risk data
- src/services/ – API integration layer
- src/utils/ – storage and numeral helpers
- src/types/ – shared interfaces and models

### Important directories
- src/data/agriKnowledge.ts – local dataset-aware knowledge base
- src/data/aezZones.ts – agroecological zone metadata
- src/data/cropReference.ts – crop reference data
- src/data/livestockData.ts – livestock disease and breed metadata
- src/data/fisheriesSpecies.ts – fish species metadata
- src/data/financialRules.ts – finance rules and loan logic
- src/data/symptomIndex.ts – symptom mapping for health diagnosis
- src/data/vaccinationSchedule.ts – vaccination schedule info

---

## 7. Main Runtime Scripts

From package.json:

- npm install
- npm run dev -> runs tsx server.ts
- npm run build -> Vite build + esbuild server bundling
- npm run start -> starts built Node server
- npm run clean -> cleans dist output
- npm run lint -> TypeScript noEmit check

---

## 8. Express API Endpoints

### /api/health
Purpose: health check for app and optional MySQL database.

Response includes:
- app status
- version
- db status (ok / error / not-configured)

### /api/voice-assistant
Purpose: AI agricultural advisory assistant.

Input:
- query / prompt / text
- userContext
- lang
- session history

Behavior:
- builds dataset-aware knowledge from local agronomic dataset
- sends grounded prompt to Groq or Gemini
- returns answer, reply, provider, fallback flag

### /api/disease-scan
Purpose: AI diagnosis from image-based symptoms.

Input:
- imageBase64 / image
- mimeType
- type: crop | livestock | fish
- lang

Behavior:
- chooses fallback response if AI key missing
- otherwise sends image + context to Gemini
- returns structured diagnosis object with disease, severity, confidence, and treatment guidance

---

## 9. Data Model Summary

### UserProfile
Core user state:
- name
- phone
- district
- upazila
- aezCode
- aezNameBn / aezNameEn
- soilType
- landAreaDecimal
- primaryCategory
- language

### FarmerProfile
Expanded profile used in farming logic:
- division
- district
- upazila
- zoneFlags
- land size / unit
- interests
- crops / animals
- subscription tier
- consent timestamps

### CropItem
- id
- nameBn, nameEn
- root depth class
- nutrient demand
- season
- water need
- suitability zones
- planting window

### DiseaseScanResult
- topDiagnosis
- diseaseNameBn / diseaseNameEn
- confidence
- severity
- diagnoses array
- treatment strings
- preventive steps

### WeatherData
- temp
- condition
- forecast
- rainfall
- active risks

### MarketPriceItem
- crop name
- price per kg
- history and forecast
- best time
- markets and net price details

---

## 10. State and Persistence Strategy

The app uses browser localStorage-style persistence instead of a full backend auth/session store.

### Stored state categories
- onboarding state
- language preference
- user profile
- lite/dark mode preference
- possibly other local feature state

### Notes for upgrade
- This is good for MVP but not ideal for multi-device or secure profile synchronization.
- future upgrade should consider backend user DB and auth flow.

---

## 11. Configuration and Environment Variables

App relies on environment variables for cloud AI and database support.

Expected variables:
- GEMINI_API_KEY
- GROQ_API_KEY
- GROQ_MODEL
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME

### Important note
- MySQL connection is only initialized when DB_HOST is present.
- AI APIs are optional; app gracefully falls back to static responses if keys are absent.

---

## 12. Functional Business Context

This app is intended to help Bangladesh farmers make better operational decisions in areas like:

- crop and soil planning
- disease detection
- livestock health management
- fisheries management
- price monitoring
- financial inclusion
- answering agriculture knowledge questions

This is not only a generic productivity app; it is a domain-specific advisory product focused on agricultural productivity and resilience.

---

## 13. Existing Strengths

- strong domain focus for Bangladesh agriculture
- bilingual UX (Bangla/English)
- AI-enabled advisory features
- modular data-driven architecture
- fallback behavior when external services are unavailable
- clear feature splitting by domain area

---

## 14. Upgrade Readiness Risks and Gaps

### 14.1 Frontend architecture
- app is organized as a single-page React app, but some logic may become large over time
- if upgraded to larger scale, routes and state management should be clearer

### 14.2 Backend separation
- server is still compact and embedded in one file
- production-ready upgrade will require route/controller/service separation

### 14.3 Security
- API keys are server-side only but should be centralised and validated
- external API error handling should be hardened
- rate limiting, request validation, and CORS configuration should be reviewed

### 14.4 Persistence
- browser localStorage is convenient for MVP
- production app should migrate to a secure backend user auth + database system

### 14.5 Data quality
- local knowledge data is useful, but should be versioned and validated by domain experts
- AI answer quality depends on prompt grounding and dataset quality

### 14.6 Testing coverage
- no explicit test suite is visible in the current project setup
- upgrade should include unit/integration tests for critical flows

### 14.7 Dependency modernization
- dependencies are relatively new, but should be upgraded deliberately to stable major versions
- Vite, React, Tailwind, and Express versions should be checked against compatibility constraints

---

## 15. Recommended Upgrade Strategy

### Phase 1: Foundation cleanup
- standardize TypeScript config and linting rules
- set strict mode and route-safe code patterns
- define environment variable schema

### Phase 2: Architecture refactor
- separate server routes, services, and helper utilities
- create typed service layer for AI providers
- create reusable validation/data transformation utilities

### Phase 3: Data layer maturity
- move static knowledge into a dedicated data layer with versioning
- centralize AEZ, crop, livestock, and market rules in structured JSON/DB models
- create admin or import pipeline for future data updates

### Phase 4: Production quality
- add authentication and user management
- add API validation and rate limiting
- add DB-backed persistence for farmer profiles and logs
- add monitoring and health checks

### Phase 5: Advanced features
- dashboard analytics
- multilingual content management
- alerting for weather, prices, disease outbreaks
- offline support

---

## 16. Suggested Technical Upgrade Plan

### React / Frontend
- upgrade to latest stable React version compatible with project pipeline
- audit all components for strict TypeScript safety
- split feature logic into dedicated hooks and service modules
- migrate repetitive UI blocks to reusable components

### Vite / Build Pipeline
- keep Vite for SPA delivery
- separate frontend build and backend build processes
- configure better production build and environment settings

### Backend / API
- create `routes/`, `controllers/`, `services/`, `lib/` structure
- centralize provider-specific logic for Gemini/Groq
- define response schemas and validation

### Database
- consider MySQL or Postgres for production-grade persistence
- store farmer data, disease logs, price history, and advisory records

### AI pipeline
- unify provider abstraction: `AIProvider` interface
- allow provider fallback strategy
- store prompt templates as typed config

---

## 17. Suggested Project Milestones

1. Baseline audit and dependency review
2. Refinement of TypeScript setup and linting
3. API modularization
4. Security and configuration hardening
5. Database and persistence layer introduction
6. Authentication and user lifecycle management
7. Test coverage and CI/CD setup
8. Production deployment and monitoring

---

## 18. Upgrade Notes for Future Developers

- Project is domain-rich and feature-dense, so maintainability matters more than raw implementation speed.
- All logic should remain aligned with Bangladeshi agriculture context.
- UI language switching is a key product requirement and should remain consistent.
- AI outputs should remain grounded in local agricultural knowledge and not become generic advice only.
- Data sources and prompts should be clearly documented and controlled.

---

## 19. Quick Summary for Upgrade Execution

This project is a multilingual Bangladeshi agricultural advisory platform built with React + TypeScript + Vite on the frontend and Express + Node on the backend. It combines local agricultural knowledge, AI-driven advisory, and feature modules for crops, livestock, fisheries, finance, and market decision support. The system is strong as a product prototype and can be upgraded to a more robust production solution by improving architecture separation, persistence, security, testing, and AI provider abstraction.

---

## 20. Recommended File to Start From for Upgrade

If a new upgrade task begins, the first files to review are:

- package.json
- server.ts
- src/App.tsx
- src/data/agriKnowledge.ts
- src/types/index.ts
- src/views/HomeView.tsx

These files give the clearest view of the app’s purpose, data flow, and integration patterns.

---

## 21. Final Note

This document is intended to act as a single source of truth for project understanding and upgrade planning. Any new engineer or AI agent working on this project should be able to read this file and understand:

- what the app does
- which technologies it uses
- how the system is structured
- what the upgrade risks are
- where to begin modernization

This file should be treated as the baseline for future refactoring, modernization, and production hardening work.
