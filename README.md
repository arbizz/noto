# Noto

**Record, Learn, and Share Your Knowledge.**

Noto is a modern learning platform designed for students and teachers. Create structured notes with a rich text editor, build interactive flashcards, and share your knowledge with a global community — all in a safe, moderated environment.

![Banner](public/banner.png)

## ✨ Key Features

### 📝 Content Creation
- **Rich Text Notes** — Advanced editor powered by [Tiptap](https://tiptap.dev/) with support for headings, lists, code blocks, image uploads, and more.
- **Smart Flashcards** — Turn difficult concepts into interactive study cards for efficient memorization.
- **Image Uploads** — Upload images directly into your notes via [Cloudinary](https://cloudinary.com/).
- **11 Subject Categories** — Mathematics, Science, Computer Science, Language, and more.

### 🌍 Social & Discovery
- **Explore & Discover** — Browse and search public notes and flashcards shared by the community.
- **Like & Bookmark** — Save and organize your favorite materials into a personal collection.
- **Follow Users** — Stay updated with content from creators you follow.
- **User Profiles** — View any user's public profile, their shared content, and follower count.

### 🔔 Notifications
- Real-time notification bell for report updates, content actions, new followers, and more.

### 🛡️ Trust & Safety
- **Content Reporting** — Report inappropriate, inaccurate, or plagiarized content with structured reasons.
- **Reputation System** — Score-based user reputation with automatic score recovery over time.
- **Ban & Suspend** — Automatic enforcement of temporary suspensions and permanent bans for policy violations, with dedicated status pages.

### 👑 Admin Panel
- **Dashboard** — Overview statistics for users, content, and reports.
- **User Management** — View, search, and manage users (modify roles, scores, and status).
- **Report Management** — Review, resolve, or reject reports with pagination and filtering.

### 🔐 Authentication
- **Google OAuth** — One-click sign in with Google.
- **Magic Link (Email)** — Passwordless sign in via email powered by [Resend](https://resend.com/).
- **Role-based Access** — Separate user and admin experiences enforced by middleware.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Components** | [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) |
| **Database** | [Prisma ORM](https://www.prisma.io/) with MySQL / MariaDB |
| **Authentication** | [NextAuth.js v5](https://authjs.dev/) (JWT strategy) |
| **Rich Text Editor** | [Tiptap](https://tiptap.dev/) |
| **Image Storage** | [Cloudinary](https://cloudinary.com/) |
| **Email** | [Resend](https://resend.com/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **Notifications (UI)** | [Sonner](https://sonner.emilkowal.dev/) |

---

## 📂 Project Structure

```
noto/
├── prisma/
│   ├── schema.prisma        # Database schema (10 models, 7 enums)
│   ├── seed.ts              # Database seeding script
│   └── migrations/          # Migration history
├── public/                  # Static assets (banner, logos)
├── src/
│   ├── app/
│   │   ├── (auth)/          # Auth pages: login, banned, suspended, verify-request
│   │   ├── (user)/          # User pages: dashboard, notes, flashcards, discover,
│   │   │                    #   bookmarks, following, profile, settings
│   │   ├── admin/           # Admin pages: dashboard, reports, users
│   │   ├── api/             # 14 API route groups (auth, CRUD, social, moderation)
│   │   ├── explore/         # Public explore & detail pages
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   ├── ui/              # 20 reusable UI primitives (Button, Card, Dialog, Table…)
│   │   ├── shared/          # Cross-role components (Navbar, NotificationBell, Pagination…)
│   │   ├── user/            # User-specific components (NFCard, Sidebar, TiptapEditor…)
│   │   └── admin/           # Admin-specific components (RecentReports, RecentUsers…)
│   ├── lib/                 # Utilities: auth config, prisma client, score recovery…
│   ├── types/               # TypeScript type definitions & NextAuth extensions
│   ├── constants/           # App-wide constants and enum mappings
│   ├── styles/              # Global CSS
│   └── middleware.ts        # Route protection, role-based access, ban/suspend enforcement
├── .env.example             # Environment variable template
├── package.json
└── tsconfig.json
```

---

**Key enums:** `UserRole` (user, admin) · `UserStatus` (active, suspended, banned) · `ContentType` (note, flashcard) · `Visibility` (public, private) · `ContentCategory` (11 subjects) · `ReportStatus` · `ReportReason`

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** v18 or later
- **MySQL** or **MariaDB** database
- **Google OAuth** credentials ([Google Cloud Console](https://console.cloud.google.com/))
- **Resend** API key ([resend.com](https://resend.com/))
- **Cloudinary** account ([cloudinary.com](https://cloudinary.com/))

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Copy `.env.example` to `.env` and fill in the required values:

   ```bash
   cp .env.example .env
   ```

   ```env
   # Admin
   ADMIN_EMAIL="your-admin@gmail.com"

   # Database
   DATABASE_URL="mysql://user:password@localhost:3306/noto"
   DATABASE_USER=
   DATABASE_PASSWORD=
   DATABASE_NAME=
   DATABASE_HOST=localhost
   DATABASE_PORT=

   # Auth
   AUTH_URL=http://localhost:3000
   AUTH_TRUST_HOST=true
   AUTH_SECRET=           # Generate with: npx auth secret

   # Google OAuth
   AUTH_GOOGLE_ID=
   AUTH_GOOGLE_SECRET=

   # Resend (Magic Link email)
   AUTH_RESEND_KEY=
   AUTH_RESEND_EMAIL_FROM=

   # Cloudinary (Image uploads)
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

3. **Set up the database:**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

   Optionally seed with sample data:

   ```bash
   npx tsx prisma/seed.ts
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma db push` | Push schema changes to the database |
| `npx prisma studio` | Open Prisma Studio (database GUI) |

---

## 📄 License

[MIT](LICENSE)
