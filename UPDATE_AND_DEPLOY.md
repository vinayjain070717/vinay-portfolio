# Portfolio Website — Update & Deploy Guide

A step-by-step guide for making changes to the portfolio website and redeploying it. Uses **Vercel** for hosting and **Supabase** for database and storage.

---

## 1. Quick Changes (No Redeploy Needed)

Changes made through the **Admin Panel** take effect immediately on page refresh. Data is fetched from Supabase/API at runtime, so no build or redeploy is required.

### What You Can Configure via Admin Panel

| Category | Location | What You Can Change |
|----------|----------|---------------------|
| **Theme** | Admin → Settings → Theme | Primary color, accent color, heading font, body font, default theme (dark/light) |
| **Hero** | Admin → Settings → Hero | Hero title, subtitle, CTA buttons, background style (particles/gradient/minimal), scroll indicator |
| **Footer** | Admin → Settings → Footer | Footer tagline, copyright text, "Made with" visibility |
| **SEO** | Admin → Settings → SEO | Site title, description, keywords, author, OG image URL |
| **Sections** | Admin → Settings → Sections | Section ordering, visibility (show/hide sections) |
| **Navigation** | Admin → Settings → Navigation | Nav items (labels and hrefs), admin link visibility |
| **Social Links** | Admin → Settings → Social | LinkedIn, GitHub, HackerRank, LeetCode, website URLs |
| **Profile** | Admin → Settings → Profile | Full name, title, tagline, bio, email, phone, location, avatar URL, resume filename |
| **Experience** | Admin → Experience | Add, edit, reorder work experience entries |
| **Education** | Admin → Education | Add, edit, reorder education entries |
| **Skills** | Admin → Skills | Add, edit, reorder skills with categories and proficiency |
| **Projects** | Admin → Projects | Add, edit, reorder projects with media, tech stack, links |
| **Certificates** | Admin → Certificates | Add, edit, reorder certificates and badges |
| **Services** | Admin → Services | Add, edit, reorder services offered |
| **Journey** | Admin → Journey | Add, edit, reorder journey/timeline events |
| **Resume** | Admin → Resume | Upload and manage resume PDF |
| **Photos** | Admin → Photos | Upload and manage profile/portfolio images |

**Access Admin:** `https://your-site.vercel.app/admin` (login required when Supabase is configured)

---

## 2. Config File Changes (Requires Redeploy)

Edit `lib/site.config.ts` to change defaults. These values are used when Supabase is not connected or when a key is not set in the database.

### What You Can Edit in `site.config.ts`

- **Site identity:** `siteName`, `siteUrl`, `siteLanguage`
- **Default SEO metadata:** `siteTitle`, `siteDescription`, `siteKeywords`, `siteAuthor`, `ogImageUrl`
- **Default theme:** `primaryColor`, `accentColor`, `fontHeading`, `fontBody`, `defaultTheme`, `googleFontsUrl`
- **Profile defaults:** `profile.fullName`, `profile.title`, `profile.tagline`, `profile.bio`, `profile.email`, `profile.phone`, `profile.location`, social URLs, avatar, resume filename
- **Hero defaults:** `heroTitle`, `heroSubtitle`, `heroCTAs`, `heroBackgroundStyle`, `showScrollIndicator`
- **Section headings:** `aboutHeading`, `skillsHeading`, `experienceHeading`, etc.
- **About stats:** `aboutStats` (years, projects, companies, badges)
- **Coding stats:** `codingStats` (GitHub repos/stars/languages, HackerRank badges/certificates)
- **Navigation defaults:** `navItems`, `showAdminLink`
- **Footer defaults:** `footerTagline`, `footerCopyright`, `footerShowMadeWith`
- **Visitor counter:** `visitorCounter.initialCount`, `visitorCounter.suffix`, `showVisitorCounter`
- **Feature toggles:** `showQRCode`, `showSaveContact`
- **Admin branding:** `adminBranding`

### After Editing

1. Commit and push to GitHub
2. Vercel auto-deploys from the push

```bash
git add lib/site.config.ts
git commit -m "Update site config"
git push origin main
```

---

## 3. Code Changes (Requires Redeploy)

Code changes (new sections, layout changes, new admin pages, etc.) require a full redeploy.

### Before Deploying

1. **Test locally:**
   ```bash
   npm run dev
   ```
   Site runs at `http://localhost:4000`

2. **Verify build:**
   ```bash
   npm run build
   ```
   Fix any TypeScript or build errors before pushing.

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add new section / fix layout / etc."
   git push origin main
   ```

4. Vercel auto-deploys from the GitHub push. Check the Vercel dashboard for status.

---

## 4. Resume & Media Updates

### Upload Resume

- **Admin Panel → Resume** — Upload or replace the resume PDF
- Stored in Supabase Storage when configured, or in `public/` for local-only setups

### Upload Profile Photo

- **Admin Panel → Settings → Profile** — Set avatar URL or upload via Photos
- **Admin Panel → Photos** — Upload images; use the returned URL in Profile

### Upload Project Media

- **Admin Panel → Projects → Edit project → Media section** — Add thumbnails, screenshots, or other media for each project

### Storage

- **With Supabase:** Files go to Supabase Storage; URLs are stored in the database
- **Local only:** Files go to `public/` folder; reference them as `/filename.ext`

---

## 5. Step-by-Step Redeploy Process

1. **Make changes** to code or `lib/site.config.ts`
2. **Test locally:** `npm run dev` (port 4000)
3. **Build test:** `npm run build`
4. **Stage changes:** `git add .`
5. **Commit:** `git commit -m "your change description"`
6. **Push:** `git push origin main`
7. **Verify:** Check [Vercel Dashboard](https://vercel.com) for deployment status and logs

---

## 6. Environment Variables

Set these in **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (with Supabase) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (with Supabase) | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (for admin) | Supabase service role key (server-side only) |

### Where to Find Them

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 7. Database Changes

### Schema

- **File:** `supabase/schema.sql`
- **Use:** Run in Supabase SQL Editor to create or update tables
- **To add new tables:** Edit `schema.sql`, then run the relevant SQL in Supabase

### Seed Data

- **File:** `supabase/seed.sql`
- **Use:** Run in Supabase SQL Editor to populate initial data
- **To reset data:** Run `seed.sql` (or custom SQL) in Supabase SQL Editor

### Typical Workflow

1. Edit `supabase/schema.sql` or `supabase/seed.sql` locally
2. Open Supabase Dashboard → SQL Editor
3. Paste and run the SQL
4. No redeploy needed for schema/seed changes; they affect the database only

---

## 8. Common Tasks Cheat Sheet

- Change profile info → Admin Panel → Settings → Profile or `lib/site.config.ts`
- Add a project → Admin Panel → Projects
- Change theme colors → Admin Panel → Settings → Theme
- Update resume → Admin Panel → Resume
- Add experience → Admin Panel → Experience
- Change hero text → Admin Panel → Settings → Hero
- Change SEO → Admin Panel → Settings → SEO
- Reorder sections → Admin Panel → Settings → Sections
- Change nav items → Admin Panel → Settings → Navigation

---

## 9. Troubleshooting

### Build fails

- Run `npm run build` locally and fix TypeScript or build errors
- Check for missing imports, type errors, or invalid syntax

### Deployment fails on Vercel

- Check Vercel dashboard → Deployments → failed deployment → View logs
- Ensure all env vars are set for the correct environment (Production/Preview)
- Confirm `main` (or your default branch) is connected in Vercel

### Admin not working

- Verify `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are set in Vercel
- Check Supabase project is active and tables exist
- Ensure RLS policies allow the intended access

### Data not showing

- Visit `/api/projects`, `/api/experience`, etc. to confirm API responses
- Check Supabase tables have data
- If using local fallback, ensure `lib/data.ts` has the expected data

---

## 10. Without Supabase (Local Only)

When Supabase is not configured:

- **Data source:** `lib/data.ts` and `lib/site.config.ts`
- **Admin writes:** Go to local files in `public/` (no database)
- **Use case:** Development, simple static deployments, or when you don’t need a database

### To deploy without Supabase

1. Push to GitHub
2. Import the repo in Vercel
3. No Supabase env vars needed
4. Site uses fallback data from `lib/data.ts` and `lib/site.config.ts`
