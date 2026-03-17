# ResumeAI - AI-Powered Resume Builder

A production-ready SaaS web application for building professional, ATS-friendly resumes with AI assistance.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Payments:** Stripe Subscriptions
- **AI:** OpenAI GPT-4o-mini
- **State Management:** Zustand
- **Drag & Drop:** @dnd-kit
- **PDF Export:** html2canvas + jsPDF

## Features

### Resume Builder
- Drag-and-drop section reordering
- Real-time preview with 8 professional templates
- Inline editing with autosave
- Color customization
- PDF export

### Templates
8 ATS-friendly templates: Modern, Professional, Minimal, Executive, Tech, Creative, Compact, Simple

### AI Features (Pro)
- **Bullet Point Generator** - AI-optimized resume bullets from job details
- **Resume Scoring** - Score out of 100 with improvement suggestions
- **Cover Letter Generator** - Professional cover letters from resume data
- **Keyword Matcher** - Match resume against job descriptions

### Subscription Plans
- **Free:** AI features, 10 templates, 10 exports/month, no ads
- **Pro ($2.99/month):** AI features, all 8 templates, unlimited ad-free exports, priority support

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-resume-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/ai_resume_builder"
   NEXTAUTH_SECRET="generate-a-random-secret"
   NEXTAUTH_URL="http://localhost:3000"
   OPENAI_API_KEY="sk-your-openai-api-key"
   STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
   STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   
   Visit [http://localhost:3000](http://localhost:3000)

### Stripe Setup

1. Create a product in Stripe Dashboard with a $2.99/month recurring price
2. Copy the Price ID and set it as `STRIPE_PRO_PRICE_ID` in your `.env`
3. Set up a webhook endpoint pointing to `your-domain/api/stripe/webhook`
4. Listen for events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`

## Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Import your repository on [vercel.com](https://vercel.com)
   - Add all environment variables in the Vercel dashboard
   - Set `NEXTAUTH_URL` to your production URL
   - Deploy

3. **Run database migration**
   ```bash
   npx prisma migrate deploy
   ```

4. **Configure Stripe webhook**
   - Update webhook endpoint URL to your production domain

## Project Structure

```
ai-resume-builder/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth + registration
│   │   ├── ai/            # AI feature endpoints
│   │   ├── resumes/       # Resume CRUD
│   │   └── stripe/        # Payment endpoints
│   ├── builder/           # Resume editor
│   ├── dashboard/         # User dashboard
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── pricing/           # Pricing page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Reusable UI components
│   ├── resume/            # Resume templates & preview
│   └── editor/            # Builder editor components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities & configurations
├── prisma/                # Database schema
├── public/                # Static assets
├── styles/                # Global styles
└── types/                 # TypeScript declarations
```

## License

MIT
