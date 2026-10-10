# MCC Employee Portal

Modern employee portal for **Midwestern Career College** — built with Next.js 14, TypeScript, Tailwind CSS, and NextAuth.js.

## ✨ Features

- 🔐 **Authentication**: Email/password accounts + Okta SSO (scaffolded)
- 📢 **Announcements**: Company news with priority levels and pinning
- 👥 **Employee Directory**: Searchable directory with department filtering
- 📁 **Documents**: SharePoint-linked document library
- 💊 **Benefits**: Comprehensive benefits overview (medical, dental, retirement, etc.)
- 📋 **HR Resources**: Forms, policies, and payroll links
- 💻 **IT Help Desk**: Support tickets and system status
- 📅 **Events & Calendar**: Company events and important dates
- 🔗 **Quick Links**: Customizable links to frequently used tools
- 🛡️ **Role-based access**: Employee, HR, IT, Admin roles

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm

### 1. Clone and install
```bash
git clone https://github.com/YOUR_ORG/mcc-employee-portal.git
cd mcc-employee-portal
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and fill in your values
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 3. Set up database
```bash
npm run db:push        # Push schema to SQLite
npm run db:seed        # Seed with sample data
```

### 4. Run dev server
```bash
npm run dev
# Open http://localhost:3000
```

**First sign-in after seeding:** the admin account is `admin@mccollege.edu`. Its password is the `INITIAL_ADMIN_PASSWORD` environment variable if you set one, otherwise a random password printed once in the seed log. Change it right away. Sample employee accounts get random passwords; an admin must reset a password before anyone can use one of them.

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js v5 |
| Database | SQLite (Prisma ORM) |
| Icons | Lucide React |
| Deployment | Docker + Coolify |

## 🐳 Docker / Coolify Deployment

### Build and run locally
```bash
docker compose up --build
```

### Deploy to Coolify via GitHub

1. Push to GitHub
2. In Coolify: **New Resource → Application → GitHub**
3. Select your repo, set build type to **Dockerfile**
4. Set environment variables:
   ```
   AUTH_SECRET=<generate with: openssl rand -base64 32>
   NEXTAUTH_URL=https://portal.yourdomain.com
   DATABASE_URL=file:/data/portal.db
   ```
5. Add a **volume**: `/data` → `portal-db`
6. Deploy!

## 🔐 Enabling Okta SSO

1. Create an app in your Okta Admin Console (type: **Web**, grant: **Authorization Code**)
2. Set Sign-in redirect URI: `https://your-portal.com/api/auth/callback/okta`
3. Add to `.env`:
   ```
   AUTH_OKTA_ID=your_client_id
   AUTH_OKTA_SECRET=your_client_secret
   AUTH_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
   ```
4. Uncomment the Okta provider in `auth.ts`

## 🔗 SharePoint Integration

Update the document URLs in `app/(dashboard)/documents/page.tsx` to point to your SharePoint site:
```
https://YOUR-TENANT.sharepoint.com/sites/Intranet/...
```

## 📂 Project Structure

```
├── app/
│   ├── (dashboard)/          # Protected portal pages
│   │   ├── dashboard/        # Home/dashboard
│   │   ├── directory/        # Employee directory
│   │   ├── documents/        # SharePoint docs
│   │   ├── benefits/         # Benefits overview
│   │   ├── hr/               # HR forms & resources
│   │   ├── it-help/          # IT help desk
│   │   └── events/           # Events & calendar
│   ├── auth/                 # Login & register pages
│   └── api/                  # API routes
├── components/
│   ├── sidebar.tsx           # Navigation sidebar
│   ├── topbar.tsx            # Top bar
│   └── widgets/              # Dashboard widgets
├── lib/
│   ├── prisma.ts             # Prisma client
│   └── utils.ts              # Utilities
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Sample data
├── auth.ts                   # NextAuth config
├── middleware.ts              # Route protection
├── Dockerfile
└── docker-compose.yml
```

## 🗺️ Roadmap

- [ ] Paylocity deep integration (time-off requests, pay stubs)
- [ ] Push notifications for announcements
- [ ] Benefits portal direct link integration
- [ ] SharePoint document embed (iframe)
- [ ] Employee onboarding workflow
- [ ] Mobile app (React Native)
