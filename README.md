# ClaimSnap AI

ClaimSnap AI is an AI-powered web application that automatically tags and organizes photos for insurance claims, significantly reducing processing time and effort for insurance adjusters.

## Features

- **AI Damage Recognition & Tagging**: Upload claimant photos, and the AI will automatically identify and categorize specific types of damage (e.g., dents, scratches, water damage, fire damage) with high accuracy, labeling each identified damage type.

- **Object & Scene Classification**: The AI classifies photos by the primary object of interest (e.g., vehicle, property, individual item) and the environmental context (e.g., indoor, outdoor, weather conditions).

- **Accelerated Claim Review Workflow**: AI-tagged and categorized photos are presented in a user-friendly interface or seamlessly exported, allowing adjusters to review claims much faster.

- **Data Export and Integration**: Provides options to export AI-generated tags and categorized image data in formats compatible with common claims management systems (e.g., CSV, JSON) or for custom reporting.

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **AI**: OpenAI API for image analysis
- **Payments**: Stripe for subscription management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account (for subscription features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/claimsnap-ai.git
   cd claimsnap-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file based on `.env.example` and fill in your API keys:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Supabase Setup

1. Create a new Supabase project
2. Set up the following tables in your Supabase database:

#### Users Table
```sql
CREATE TABLE users (
  userId UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  subscriptionTier TEXT DEFAULT 'Free',
  subscriptionStatus TEXT DEFAULT 'active',
  subscriptionPeriodEnd TIMESTAMP,
  photosThisMonth INTEGER DEFAULT 0,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Claims Table
```sql
CREATE TABLE claims (
  claimId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL REFERENCES users(userId),
  claimNumber TEXT NOT NULL,
  status TEXT DEFAULT 'New',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Photos Table
```sql
CREATE TABLE photos (
  photoId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claimId UUID NOT NULL REFERENCES claims(claimId),
  imageUrl TEXT NOT NULL,
  originalFileName TEXT,
  detectedDamageTypes TEXT[] DEFAULT '{}',
  objectCategory TEXT,
  sceneContext TEXT,
  analysisResults JSONB DEFAULT '{}',
  uploadedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. Create a storage bucket named `claim-photos` in your Supabase project

## Deployment

### Vercel Deployment

This project is configured to deploy automatically to Vercel through GitHub Actions. To set up Vercel deployment:

1. Create a Vercel account and create a new project
2. Link your GitHub repository to the Vercel project
3. Add the following secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

The GitHub Actions workflow will:
1. Build the application
2. Deploy to Vercel production for main/master branch
3. Create preview deployments for pull requests

If Vercel secrets are not configured, the workflow will still build the application but skip the deployment steps.

## Subscription Plans

ClaimSnap AI offers three subscription tiers:

- **Free**: Up to 50 photos per month, basic damage recognition
- **Pro**: Up to 500 photos per month, advanced analysis, full export capabilities
- **Business**: Up to 2000 photos per month, highest accuracy, API access, team management

## License

This project is licensed under the MIT License - see the LICENSE file for details

