# Legal AI Automation Suite

A comprehensive legal AI automation platform with multiple AI agents for different legal tasks.

## Features

- Multiple AI agents for different legal tasks
- Free trial with email verification
- Subscription management with Stripe
- User authentication with Supabase

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Supabase Setup

1. Create a new Supabase project
2. Set up the following tables:
   - `profiles` - User profiles
   - `subscriptions` - User subscriptions
   - `trials` - User trial information

### Stripe Setup

1. Create a Stripe account
2. Set up the following products and prices:
   - Individual agent subscriptions
   - All-in-one subscription
   - Free trial product

### Development

Run the development server:

```bash
npm run dev
```

### Building for Production

Build the application for production:

```bash
npm run build
```

## Architecture

- **Frontend**: React with TypeScript
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Payments**: Stripe
- **Styling**: Tailwind CSS with shadcn/ui components

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Project info

**URL**: https://lovable.dev/projects/8f760589-aedb-4139-8319-a2663c22f08c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8f760589-aedb-4139-8319-a2663c22f08c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8f760589-aedb-4139-8319-a2663c22f08c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

This is how i change updated git code
git add .
git commit -m "Lovable Change"
git push

Does this change work?