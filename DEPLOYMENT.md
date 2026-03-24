# Deployment Guide - Vinay Jain Portfolio

## Local Development

### Port Issue Fix
Windows excludes port range 2980-3079 (includes 3000/3001). The dev server
is configured to use **port 4000** instead.

```bash
cd portfolio-website
npm run dev
# Opens at http://localhost:4000
```

### If port 4000 also fails
Try these safe ports: 4200, 5173, 8888, 9000
```bash
npx next dev --turbopack -p 4200
```

---

## Step 1: Set Up Supabase (Free - $0/month)

1. Go to https://supabase.com and create a free account
2. Click "New Project" and choose a name (e.g., "vinay-portfolio")
3. Set a database password (save it somewhere safe)
4. Wait for the project to be created (~2 minutes)

### Create Database Tables
5. Go to **SQL Editor** in the Supabase dashboard
6. Copy the contents of `supabase/schema.sql` and run it
7. Copy the contents of `supabase/seed.sql` and run it (populates your data)

### Create Storage Bucket
8. Go to **Storage** in Supabase dashboard
9. Click "New Bucket"
10. Name it `uploads`, set it to **Public**
11. This is where your resume, photos, and project images will be stored

### Create Admin User
12. Go to **Authentication** > **Users**
13. Click "Add User" > "Create New User"
14. Enter your email and a password (this is your admin login)

### Get API Keys
15. Go to **Settings** > **API**
16. Copy:
    - **Project URL** (e.g., `https://xxxxx.supabase.co`)
    - **anon public** key
    - **service_role** key (keep this secret!)

### Configure Environment
17. Copy `.env.local.example` to `.env.local`:
```bash
copy .env.local.example .env.local
```

18. Edit `.env.local` with your Supabase keys:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## Step 2: Deploy to Vercel (Free - $0/month)

### Option A: Deploy via GitHub (Recommended)

1. Create a new GitHub repository:
```bash
cd portfolio-website
git init
git add .
git commit -m "Initial portfolio website"
git branch -M main
git remote add origin https://github.com/vinayjain070717/portfolio-website.git
git push -u origin main
```

2. Go to https://vercel.com and sign in with GitHub
3. Click "Add New" > "Project"
4. Import your `portfolio-website` repository
5. In "Environment Variables", add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key
6. Click "Deploy"
7. Your site will be live at `portfolio-website.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
# Follow the prompts, add environment variables when asked
```

### Custom Domain (Optional)
- In Vercel dashboard > Settings > Domains
- Add your custom domain (e.g., vinayjain.dev)
- Update DNS records as instructed by Vercel
- Free SSL is included automatically

---

## Step 3: Post-Deployment

### Access Admin Panel
- Go to `https://your-domain.vercel.app/admin`
- Login with the email/password you created in Supabase Auth

### Upload Content via Admin
- Upload your resume PDF at `/admin/resume`
- Upload profile photos at `/admin/photos`
- Add/edit project screenshots at `/admin/projects`
- Customize theme colors at `/admin/settings/theme`
- Reorder sections at `/admin/settings/sections`

### Verify Everything Works
- [ ] Homepage loads with all sections
- [ ] 3D hero animation works
- [ ] Skills bars animate on scroll
- [ ] Experience timeline is correct
- [ ] Projects show with GitHub links
- [ ] HackerRank badges display correctly
- [ ] Contact form submits messages
- [ ] Admin panel login works
- [ ] Can edit content from admin
- [ ] Resume upload/download works

---

## Cost Summary

| Service    | Plan       | Cost      | What it provides                    |
|------------|------------|-----------|-------------------------------------|
| Vercel     | Hobby      | $0/month  | Hosting, CDN, CI/CD, SSL           |
| Supabase   | Free       | $0/month  | Database, Auth, File Storage        |
| Domain     | Free       | $0        | yourname.vercel.app subdomain       |
| **Total**  |            | **$0/month** |                                  |

### Free Tier Limits (more than enough for a portfolio)
- **Vercel**: 100GB bandwidth, 100 deployments/day
- **Supabase**: 500MB database, 1GB file storage, 50k monthly active users

---

## Troubleshooting

### "EACCES: permission denied" on port 3000
Windows excludes ports 2980-3079. Use port 4000:
```bash
npx next dev --turbopack -p 4000
```

### "self-signed certificate in certificate chain" during build
Corporate proxy issue. Set environment variable:
```bash
# PowerShell
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'
npm run build

# CMD
set NODE_TLS_REJECT_UNAUTHORIZED=0
npm run build
```

### Supabase connection fails
- Check that `.env.local` has correct keys (no extra spaces)
- Verify the Supabase project is not paused (free tier pauses after 7 days of inactivity)
- Go to Supabase dashboard and click "Restore" if paused

### Build fails with type errors
```bash
npx next build
# Check the error output and fix the specific file
```
