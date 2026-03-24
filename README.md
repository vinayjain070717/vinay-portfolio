# Vinay Jain - Portfolio Website

A modern, animated portfolio website with a full admin panel, built with Next.js 15, Tailwind CSS, Framer Motion, Three.js, and Supabase.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- **Animations:** Framer Motion, Three.js (React Three Fiber)
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Deployment:** Vercel (free tier)

## Features

### Public Portfolio
- 3D animated hero section with typewriter text
- Interactive skills visualization with progress bars
- Animated work experience timeline
- Project showcase with filtering and detail modals
- HackerRank badges and certificates gallery
- Live GitHub coding stats
- Visual career journey timeline
- Contact form with QR code and vCard download
- Resume download section
- Visitor counter

### Admin Panel (`/admin`)
- Supabase authentication (email/password)
- CRUD for all content sections
- Theme configurator (colors, fonts, dark/light mode)
- Section ordering and visibility toggles
- Hero, Navigation, Footer, SEO editors
- Social links manager
- File upload (photos, resume PDF)
- Contact message inbox
- Analytics dashboard

## Getting Started

### 1. Clone and install

```bash
cd portfolio-website
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor to create tables
3. Run `supabase/seed.sql` to populate with initial data
4. Create a storage bucket named `uploads` (set to public)
5. Create an admin user in Authentication > Users

### 3. Configure environment

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` for the portfolio and `http://localhost:3000/admin` for the admin panel.

## Deployment (Vercel - Free)

1. Push code to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy - your site will be at `your-project.vercel.app`

## Project Structure

```
portfolio-website/
  app/
    page.tsx              # Main portfolio page
    admin/                # Admin panel (22 pages)
    api/                  # API routes (9 endpoints)
  components/
    sections/             # 12 portfolio sections
    Navbar.tsx
    Footer.tsx
  lib/
    data.ts               # Seed/fallback data
    types.ts              # TypeScript types
    supabase.ts           # Supabase clients
    utils.ts              # Utilities (cn, vCard)
  supabase/
    schema.sql            # Database schema
    seed.sql              # Initial data
```

## Cost

- **Vercel Hobby:** $0/month
- **Supabase Free:** $0/month
- **Total: $0/month**
