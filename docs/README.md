# TokenDirectory - Real World Assets (RWA) Directory

TokenDirectory is a comprehensive platform for discovering, exploring, and submitting tokenized real-world assets (RWAs). This directory serves as a hub for investors interested in blockchain-based investments backed by physical assets like real estate, art, and commodities.

## Features

- **Curated Directory**: Browse a verified list of RWA projects
- **Detailed Information**: View comprehensive project details, ROI, blockchain, and more
- **Filtering Capabilities**: Filter projects by asset type, blockchain, and ROI range
- **Knowledge Base**: Access educational content about RWA investing
- **Project Submission**: Submit your own RWA project for review

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **Styling**: TailwindCSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (for database and authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rwa-directory.git
   cd rwa-directory
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables by creating a `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

### Database Setup

1. Create a new Supabase project from [Supabase Dashboard](https://app.supabase.io/)

2. Run the database migrations to set up the required tables:
   - Go to the SQL Editor in your Supabase Dashboard
   - Copy and run the SQL from `supabase/migrations/01_create_projects.sql`
   - Copy and run the SQL from `supabase/migrations/02_create_blog_posts.sql`

3. Set up the authentication settings:
   - In Supabase dashboard, go to Authentication > Settings
   - Configure your site URL and redirect URLs
   - Enable Email/Password sign-in method

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Admin Access

1. Create an admin user by signing up through the application
2. Connect to your Supabase database and update the user's role to 'admin':
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
3. Log in with your admin credentials at `/login`
4. Access the admin dashboard at `/admin`

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server operations)
- `NEXT_PUBLIC_SITE_URL` - Your site URL (for SEO features)
- `REVALIDATION_TOKEN` - Token for revalidating sitemap (optional)

## Project Structure

- `/app` - Next.js app directory with route components
- `/components` - Reusable UI components
- `/lib` - Utility functions and service layer
- `/styles` - Global CSS and Tailwind configuration
- `/types` - TypeScript type definitions
- `/public` - Static assets like images
- `/supabase` - Supabase-related files (migrations, schema)

## Contributing

We welcome contributions to TokenDirectory!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
