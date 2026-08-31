# Forensix (Criminal Eye)

Forensix is an AI-powered forensic sketch generation and criminal face recognition platform built for modern law enforcement and investigative agencies. It allows investigators to generate composite sketches from witness descriptions, match facial embeddings against criminal databases, and manage ongoing case intelligence.

---

## 📁 Project Folder Structure

```text
forensix/
├── .agents/                        # AI coding assistant skills, rules, and configurations
│   └── skills/                     # Local skill definitions (Radix-to-Base, Prisma Composer, Shadcn)
├── .claude/                        # Claude-specific workspace skills and instructions
├── .cursor/                        # Cursor IDE rules and skills
├── .devin/                         # Devin workspace skills
├── prisma/                         # Database schema & ORM configuration
│   └── schema.prisma               # PostgreSQL & Prisma data models (User, Case, Criminal, etc.)
├── public/                         # Static assets served by Next.js
│   └── images/
│       └── Logo.png                # Forensix application brand logo
├── src/                            # Application source code
│   ├── app/                        # Next.js App Router pages, layouts, and route handlers
│   │   ├── admin/                  # Admin dashboard (KPI metrics, activity feed, user management)
│   │   │   └── page.tsx
│   │   ├── auth/                   # Authentication sign-in portal
│   │   │   └── page.tsx
│   │   ├── cases/                  # Investigation cases management hub
│   │   │   └── page.tsx
│   │   ├── criminals/              # Criminal database & facial recognition registry
│   │   │   └── page.tsx
│   │   ├── signup/                 # User registration & onboarding page
│   │   │   └── page.tsx
│   │   ├── sketch/                 # AI forensic sketch generator interface
│   │   │   └── page.tsx
│   │   ├── favicon.ico             # Application favicon
│   │   ├── globals.css             # Global styles, Tailwind v4 theme variables & utilities
│   │   ├── layout.tsx              # Root layout wrapping all pages (theme, nav, fonts)
│   │   └── page.tsx                # Landing / home presentation page
│   ├── components/                 # Reusable React components
│   │   ├── ui/                     # Primitives & design system components (Base UI / Shadcn)
│   │   │   ├── animated-button.tsx # Interactive button with motion animations
│   │   │   ├── avatar.tsx          # User & profile avatar element
│   │   │   ├── button.tsx          # Base button component
│   │   │   ├── card.tsx            # Card container component
│   │   │   ├── dropdown-menu.tsx   # Context and action dropdown menus
│   │   │   ├── field.tsx           # Accessible form field wrapper
│   │   │   ├── input.tsx           # Styled text input control
│   │   │   ├── label.tsx           # Accessible form label
│   │   │   └── separator.tsx       # Divider / line separator
│   │   ├── watermelon-ui/          # Specialized UI kits & custom compound blocks
│   │   │   ├── auth-01.tsx         # Modern login card template
│   │   │   └── signup-01.tsx       # Modern registration card template
│   │   ├── avatar-dropdown.tsx     # Header user profile dropdown trigger & actions
│   │   ├── header.tsx              # Global navigation bar with brand & route links
│   │   ├── mobile-nav.tsx          # Responsive mobile navigation drawer
│   │   └── portal.tsx              # Client-side portal utility for overlays/modals
│   ├── hooks/                      # Custom React lifecycle and utility hooks
│   │   └── use-scroll.ts           # Window/container scroll detection hook
│   └── lib/                        # Shared utilities, database clients & helpers
│       ├── prisma.ts               # Global Prisma client singleton instance
│       └── utils.ts                # Class merge (clsx + tailwind-merge) utility
├── .env                            # Environment variables (Database URL, API secrets)
├── .gitignore                      # Git ignored files and directories
├── AGENTS.md                       # Workspace coding guidelines and Next.js agent rules
├── CLAUDE.md                       # Claude project instructions and shortcuts
├── components.json                 # Shadcn UI configuration file
├── eslint.config.mjs               # ESLint configuration
├── next.config.ts                  # Next.js framework configuration
├── package.json                    # Project dependencies, scripts, and package metadata
├── pnpm-lock.yaml                  # PNPM deterministic dependency lockfile
├── pnpm-workspace.yaml             # PNPM workspace configuration
├── postcss.config.mjs              # PostCSS configuration for Tailwind CSS v4
├── project_overview.md             # Comprehensive architecture and AI pipeline documentation
├── README.md                       # Project overview, folder structure, and getting started
├── skills-lock.json                # Locked versions for agent skills
└── tsconfig.json                   # TypeScript compiler options and path aliases
```

---

## 🏛️ Directory Descriptions

| Directory / File | Description |
| :--- | :--- |
| **`src/app/`** | Implements the Next.js App Router. Each subdirectory (`admin`, `auth`, `cases`, `criminals`, `signup`, `sketch`) represents a distinct route in the application. |
| **`src/components/ui/`** | Headless and styled primitive UI components built with `@base-ui/react`, Tailwind CSS v4, and Lucide icons. |
| **`src/components/watermelon-ui/`** | Pre-built, styled authentication and form layout components. |
| **`src/lib/`** | Application helpers, including the Prisma database client instance (`prisma.ts`) and CSS class combiners (`utils.ts`). |
| **`src/hooks/`** | Reusable custom React hooks like `use-scroll.ts` to manage header states and scroll events. |
| **`prisma/`** | Defines the PostgreSQL data models (`User`, `Case`, `Witness`, `Sketch`, `Criminal`, `RecognitionResult`, `Report`, `AuditLog`). |
| **`public/`** | Contains static public files such as logos and brand imagery. |
| **`project_overview.md`** | Detailed technical specification covering page components and the AI diffusion & facial embedding pipeline. |

---

## 🚀 Getting Started

First, install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Base UI](https://base-ui.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [Motion](https://motion.dev/) (Framer Motion)
- **Database ORM**: [Prisma 6](https://www.prisma.io/) with PostgreSQL
- **Icons**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)

