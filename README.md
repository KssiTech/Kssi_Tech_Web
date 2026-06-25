# KSSI TECH — Official Web Platform

> Leading Technical Future World

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.57-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

The corporate website and analytics dashboard for **KSSI TECH** — a Moroccan industrial services company (SARL) based in Safi, operating across 6 technical sectors with 20+ enterprise clients.

---

## Overview

This repository contains the full-stack frontend of the KSSI TECH web platform. It combines a public-facing marketing site with a protected management dashboard that lets the team track operational KPIs, import Excel data, manage blog content, and publish news — all under a single authenticated interface.

---

## Features

### Public Website

- **Home** — animated hero with dot-grid background, spinning globe, sector panels, and a scrolling client marquee
- **Activity Sectors** — dedicated pages for each of KSSI TECH's 6 business sectors
- **Blog** — full-featured blog with post listings, detail views, like system, and comment sections
- **News** — press releases, awards, industry insights, media coverage, and newsletter
- **Company** — about page, partner program, and company news
- **Products** — product catalogue pages
- **Downloads / Resources** — installation guides, developer docs, user manuals, tutorials
- **Pricing** — transparent pricing tiers
- **Contact & Demo** — contact form and request-a-demo flow

### Admin Dashboard (authenticated)

- **KPI Cards** — live key-performance-indicator summaries with trend indicators
- **Charts** — Recharts-powered responsive visualizations (bar, line, area, pie)
- **Excel Import** — drag-and-drop `.xlsx` / `.xls` upload with automatic schema detection and field mapping
- **Insight Cards** — AI-style data profiling and anomaly surfacing
- **Alerts Panel** — status-keyword-driven alert system
- **Filters Bar** — multi-field dynamic filtering across loaded datasets
- **Blog Management** — post editor with scheduling, analytics (views, likes, shares, comments), and engagement metrics
- **Inbox** — internal messaging inbox
- **Account Settings** — profile management

### Platform

- Dark / light theme with persistent toggle
- Framer Motion animations and page transitions
- Aurora background layers and animated dot-grid backgrounds
- Supabase Auth (email/password, protected routes)
- React Query for server-state management
- `react-router-dom` v6 SPA routing

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 3, tailwindcss-animate |
| UI Components | Radix UI primitives, shadcn/ui patterns |
| Animations | Framer Motion |
| Routing | React Router DOM v6 |
| Server State | TanStack React Query v5 |
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| Charts | Recharts |
| Data Import | xlsx (SheetJS) |
| Validation | Zod |
| Notifications | Sonner |
| SEO | react-helmet-async |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9+ (or pnpm / yarn)
- A [Supabase](https://supabase.com/) project (free tier works for development)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/KssiTech/Kssi_Tech_Web.git
cd Kssi_Tech_Web

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and fill in your Supabase credentials
```

### Environment Variables

Create a `.env` file at the project root (see `.env.example` for the full template):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_APP_URL=http://localhost:5173
NODE_ENV=development
```

### Development

```bash
npm run dev
# App runs at http://localhost:5173
```

### Production Build

```bash
npm run build
# Output goes to dist/

npm run preview
# Preview the production build locally
```

### Linting

```bash
npm run lint
```

---

## Project Structure

```text
src/
├── components/
│   ├── dashboard/        # KPI cards, charts, filters, alerts, schema panel
│   ├── ui/               # Base UI primitives (button, card, input, toast…)
│   ├── AnimatedBackground.tsx
│   ├── ClientsMarquee.tsx
│   ├── Footer.tsx
│   ├── HeroDotGridBackground.tsx
│   ├── HeroSectorPanels.tsx
│   ├── Navigation.tsx
│   ├── SpinningGlobe.tsx
│   └── …
├── contexts/
│   ├── AuthContext.tsx   # Supabase auth state
│   └── ThemeContext.tsx  # Dark/light theme
├── pages/
│   ├── Index.tsx         # Home page
│   ├── Dashboard.tsx     # Main dashboard
│   ├── Blog.tsx / BlogPostDetail.tsx
│   ├── company/          # About, News, PartnerProgram
│   ├── downloads/        # Guides, manuals, GitHub repo page
│   ├── news/             # Awards, Insights, MediaCoverage, Newsletter, PressReleases
│   ├── products/         # Product catalogue
│   └── secteurs/         # Activity sector pages
├── services/
│   ├── authService.ts
│   └── blogService.ts
├── hooks/
│   ├── useExcelData.ts   # Excel import + schema detection
│   └── use-toast.ts
├── lib/
│   ├── dataProfiler.ts
│   ├── schemaDetector.ts
│   ├── supabase.ts
│   └── utils.ts
├── config/
│   ├── fieldMappings.ts
│   └── statusKeywords.ts
├── data/
│   ├── blogTemplates.ts
│   └── sectors.ts
└── types/
    ├── auth.ts
    └── dashboard.ts
```

---

## Activity Sectors

KSSI TECH operates across 6 core technical domains:

| # | Sector |
| --- | --- |
| 1 | Électricité BT/MT (agréé ONEE) |
| 2 | Systèmes automatisés et de commande |
| 3 | Énergie renouvelable |
| 4 | Réseaux informatiques (cuivre et fibre optique) |
| 5 | Vidéosurveillance |
| 6 | Maintenance industrielle |

---

## Notable Clients

Maroc Telecom · Lafarge Placo Maroc · OFPPT · RADEES · Ministère des Habous · Université Cadi Ayyad · Université Chouaib Doukkali · ENSA Safi · FP Safi · EST Safi · Azura · Centrelec Energy Solutions · Verne Telecom · Carlifer · Crespo · VMM · Oualili · Caprel · Haut Commissariat Eaux & Forêts

---

## Company Info

| | |
| --- | --- |
| **Company** | KSSI TECH SARL |
| **Slogan** | Leading Technical Future World |
| **Location** | 59, rue 5, Qu. Lalla Asmae Bd Hassan II, Safi, Maroc |
| **Phone** | +212 524 622 240 |
| **Mobile** | +212 661 979 129 |
| **Email** | [kssitech@gmail.com](mailto:kssitech@gmail.com) |
| **RC** | 3595 |
| **ICE** | 000074736000019 |

---

## Contributing

This is a proprietary project. External contributions are not accepted without prior written authorization from KSSI TECH.

---

## License

All rights reserved. © 2026 KSSI TECH SARL. Unauthorized reproduction or distribution is prohibited.
