# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-14

### Added
- **Mòdul Amic Invisible (Yule)** complet i integrat:
  - **Backend (Go + Gin + PostgreSQL)**:
    - Arquitectura screaming per domini (`auth`, `edition`, `member`, `wishlist`, `incompatibility`, `draw`, `upload`).
    - Motor de sorteig basat en derangement amb backtracking i respecte estricte d'incompatibilitats privades (`internal/draw/engine.go`).
    - Proves massives del sorteig validant 1.000 iteracions sense cap error (`engine_test.go`).
    - Eina CLI interactiva de simulació de sorteig familiar (`cmd/simulador/main.go`).
    - Accés fàcil per Magic Link d'un sol ús i tokens JWT persistents per a mòbil i web.
    - Gestió d'imatges multipart per a fotos de regals (`/upload`).
    - Esquema de base de dades PostgreSQL amb migracions i sembrat inicial de dades.
  - **Frontend (React + Vite + TypeScript + MUI + Zustand)**:
    - Disseny responsive mòbil-primer amb paleta festiva 100% Nadal/Yule (verds avet, or càlid, vermells cirera).
    - Favicon oficial de l'arbret de Nadal (🎄).
    - Suport de càmera de fotos directa des del mòbil o arrossegament de fitxers des de PC.
    - Targeta de revelació del destinatari assignat i visualització de desitjos amb enllaços a botigues.
    - Panell d'administració amb botó directe de **Copiar enllaç WhatsApp** per facilitar l'accés sense contrasenyes als familiars.
    - Semàfor de viabilitat matemàtica en temps real a la configuració d'incompatibilitats privades.
  - **Infraestructura i CI/CD (Pipeline adaptat de RawCraft Monitor)**:
    - Pipeline d'Integració Contínua ([`.github/workflows/ci.yml`](file:///Users/eric.zapater/Developer/yule/.github/workflows/ci.yml)) per a validació automàtica de tests Go i build de TypeScript/Vite a cada PR/push.
    - Pipeline de Desplegament Continu ([`.github/workflows/deploy.yml`](file:///Users/eric.zapater/Developer/yule/.github/workflows/deploy.yml)) publicant imatges a GHCR i desplegant a VPS remot via SSH i Docker Compose.
    - Containerització multi-stage per a Backend ([`backend/Dockerfile`](file:///Users/eric.zapater/Developer/yule/backend/Dockerfile)) i Frontend amb Nginx ([`frontend/Dockerfile`](file:///Users/eric.zapater/Developer/yule/frontend/Dockerfile)).
    - Orquestració amb Traefik i xarxa PostgreSQL compartida ([`docker-compose.yml`](file:///Users/eric.zapater/Developer/yule/docker-compose.yml)).
    - Plantilles de configuració d'entorn ([`.env.example`](file:///Users/eric.zapater/Developer/yule/.env.example), [`.env.backend.example`](file:///Users/eric.zapater/Developer/yule/.env.backend.example), [`.env.frontend.example`](file:///Users/eric.zapater/Developer/yule/.env.frontend.example)).
  - **Documentació i Contractes**:
    - Contracte OpenAPI 3.1 compartit (`contracts/amic-invisible.openapi.yaml`).
    - Mockups HTML+CSS autocontinguts (`mockups/amic-invisible/`).
    - Informes d'auditoria de QA (APTE), Security (SEGUR) i UX (APTE).
    - Configuració de `.gitignore` per a monorepo Go + Node.
