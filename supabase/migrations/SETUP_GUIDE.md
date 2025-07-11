# ContestHub Database Setup Guide

This guide will help you set up the ContestHub database in Supabase.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project in your Supabase dashboard
3. **pgvector Extension**: Enable the pgvector extension in your Supabase project

## Quick Setup (Recommended)

### Step 1: Enable pgvector Extension
1. Go to your Supabase dashboard
2. Navigate to **Database** → **Extensions**
3. Find **pgvector** and click **Enable**

### Step 2: Run Complete Setup
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `complete_setup.sql`
3. Paste and execute the SQL

This will create all tables, functions, and security policies at once.

## Alternative Setup (Step-by-step)

If you prefer to run migrations individually:

### Step 1: Enable pgvector Extension
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Step 2: Run Migrations in Order
Execute each migration file in chronological order:

1. `20241201000000_create_api_keys_table.sql`
2. `20241201000002_create_contests_table.sql`
3. `20241201000003_create_notifications_table.sql`
4. `20241201000004_create_contest_details_table.sql`
5. `20241201000005_create_contest_embeddings_table.sql`
6. `20241201000006_create_contest_ideas_table.sql`
7. `20241201000007_create_contest_files_table.sql`
8. `20241201000008_fix_contest_embeddings_table.sql`
9. `20241201000009_create_storage_bucket.sql`
10. `20241201000010_create_contest_prompts_table.sql`
11. `20241201000011_add_prompt_to_contest_files.sql`
12. `20241201000012_create_contest_submissions_table.sql`
13. `20241201000013_update_contest_submissions_table.sql`
14. `20241201000014_create_user_profiles_table.sql`
15. `20241201000015_create_user_activities_table.sql`
16. `20241201000016_create_profile_images_bucket.sql`
17. `20241201000017_fix_duplicate_user_records.sql`

## Storage Bucket Setup

After running the migrations, you need to create storage buckets manually:

### Step 1: Create Storage Buckets
1. Go to **Storage** in your Supabase dashboard
2. Create the following buckets:
   - `profile-images` (public)
   - `contest-files` (private)

### Step 2: Set Storage Policies
For each bucket, create the following policies:

#### profile-images bucket:
- **INSERT**: `auth.uid() = user_id`
- **UPDATE**: `auth.uid() = user_id`
- **DELETE**: `auth.uid() = user_id`
- **SELECT**: `true` (public read)

#### contest-files bucket:
- **INSERT**: `auth.uid() = user_id`
- **UPDATE**: `auth.uid() = user_id`
- **DELETE**: `auth.uid() = user_id`
- **SELECT**: `auth.uid() = user_id`

## Environment Variables

Add these to your `.env` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Keys (Optional)
GEMINI_API_KEY=your_gemini_key
FIRECRAWL_API_KEY=your_firecrawl_key
```

## Verification

To verify your setup is working:

1. **Check Tables**: Go to **Database** → **Tables** and verify all tables exist
2. **Check Functions**: Go to **Database** → **Functions** and verify functions exist
3. **Test RLS**: Try creating a test record and verify RLS policies work
4. **Test Storage**: Try uploading a file to verify storage buckets work

## Troubleshooting

### Common Issues

#### pgvector Extension Error
```sql
-- Ensure extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;
```

#### RLS Policy Issues
- Check that RLS is enabled on all tables
- Verify policies are created correctly
- Test with authenticated user

#### Storage Bucket Issues
- Ensure buckets are created with correct permissions
- Check storage policies are set correctly
- Verify file upload permissions

### Getting Help

If you encounter issues:

1. Check the **README.md** for detailed table descriptions
2. Review the **rollback_all.sql** file if you need to start over
3. Check Supabase logs in the dashboard
4. Verify all environment variables are set correctly

## Development Workflow

### Local Development
```bash
# Start Supabase locally
supabase start

# Apply migrations
supabase db push

# Stop local instance
supabase stop
```

### Production Deployment
1. Test migrations in staging environment
2. Backup production database
3. Apply migrations during low-traffic period
4. Monitor for any issues
5. Use rollback_all.sql if necessary

## Next Steps

After setting up the database:

1. Configure your frontend application
2. Set up authentication
3. Test the API endpoints
4. Deploy to production

Your ContestHub database is now ready to use! 🎉 