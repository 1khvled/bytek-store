# BytekStore - E-commerce Platform

## Project Overview

BytekStore is a modern e-commerce platform built with React, TypeScript, and Supabase for backend services.

## Technologies

This project is built with:

- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn-ui** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend as a Service (Database, Authentication, Storage)

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

Follow these steps to set up the project locally:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies
npm i

# Step 4: Set up environment variables
# Create a .env file in the root directory with:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Step 5: Start the development server
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

## Database Setup

This project uses Supabase for database management. The database schema is defined in the `supabase/migrations/` directory.

To set up the database:

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migrations in the `supabase/migrations/` directory
3. Configure Row Level Security (RLS) policies as needed

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/       # React context providers (Auth, Cart)
├── hooks/         # Custom React hooks
├── integrations/  # Third-party integrations (Supabase)
├── pages/         # Page components
└── lib/           # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

- Product catalog with categories
- Shopping cart functionality
- User authentication (Supabase Auth)
- Admin dashboard for managing products and orders
- Order management system
- Shipping rate management
- Responsive design

## Deployment

Build the project for production:

```sh
npm run build
```

The `dist` folder will contain the production-ready files that can be deployed to any static hosting service.
