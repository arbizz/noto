# Noto

**Record, Learn, and Share Your Knowledge.**

Noto is a modern learning platform designed for students and teachers. It allows you to create structured notes, interactive flashcards, and share your knowledge with a global community.

![Banner](public/banner.png)

## 🚀 Key Features

- **Rich Text Notes**: Create structured notes with an advanced editor (Tiptap). Supports rich formatting for Mathematics, Science, and more.
- **Smart Flashcards**: Turn difficult concepts into interactive study cards for efficient memorization.
- **Share & Discover**: Publish your materials to the community or discover works from others.
- **Reputation System**: Earn scores and badges for high-quality contributions.
- **Personal Collection**: Bookmark and organize your favorite materials.
- **Safe Environment**: Built-in moderation and reporting system to ensure content quality and safety.
- **Dark Mode**: Fully supported using `next-themes`.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **Database**: [Prisma ORM](https://www.prisma.io/) (MySQL/MariaDB)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Rich Text Editor**: [Tiptap](https://tiptap.dev/)

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MySQL or MariaDB database

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/noto.git
   cd noto
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add the necessary variables (refer to `.env.example` if available).

   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/noto"
   AUTH_SECRET="your-auth-secret"
   # Add other required variables...
   ```

4. **Setup Database:**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `src/app`: Application routes and pages.
- `src/components`: Reusable UI components.
- `src/lib`: Utility functions and libraries.
- `prisma`: Database schema and migrations.
- `public`: Static assets.

## 📄 License

[MIT](LICENSE)
