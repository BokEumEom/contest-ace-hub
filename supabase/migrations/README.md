# Supabase Migrations

This directory contains database migration files for the ContestHub Supabase project. The migrations are organized chronologically and should be applied in order.

## Required Extensions

### pgvector Extension
All migration files include the `pgvector` extension for vector search capabilities:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

This extension is required for:
- Vector similarity search in contest embeddings
- AI-powered contest recommendations
- Semantic search functionality

**Note:** The pgvector extension must be enabled in your Supabase project. If you encounter errors, ensure the extension is enabled in your Supabase dashboard under Database > Extensions.

## Quick Setup for New Users

### Option 1: Complete Setup (Recommended for New Projects)
Execute `complete_setup.sql` in your Supabase SQL Editor. This creates all tables, functions, and policies at once.

### Option 2: Step-by-step Migration
Apply migrations in chronological order using Supabase CLI:
```bash
supabase db push
```

## Migration Structure

### Core Tables (Foundation)
1. **20241201000000_create_api_keys_table.sql** - API key management
2. **20241201000002_create_contests_table.sql** - Main contest data
3. **20241201000003_create_notifications_table.sql** - User notifications
4. **20241201000004_create_contest_details_table.sql** - Contest details and schedules

### AI & Search Features
5. **20241201000005_create_contest_embeddings_table.sql** - Vector search setup
6. **20241201000006_create_contest_ideas_table.sql** - AI-generated ideas
7. **20241201000008_fix_contest_embeddings_table.sql** - Embeddings optimization

### File Management
8. **20241201000007_create_contest_files_table.sql** - File storage
9. **20241201000009_create_storage_bucket.sql** - Supabase storage setup
10. **20241201000010_create_contest_prompts_table.sql** - AI prompts
11. **20241201000011_add_prompt_to_contest_files.sql** - File-prompt linking

### User Management
12. **20241201000012_create_contest_submissions_table.sql** - User submissions
13. **20241201000013_update_contest_submissions_table.sql** - Submission enhancements
14. **20241201000014_create_user_profiles_table.sql** - User profiles
15. **20241201000015_create_user_activities_table.sql** - User activity tracking
16. **20241201000016_create_profile_images_bucket.sql** - Profile image storage
17. **20241201000017_fix_duplicate_user_records.sql** - Data cleanup

### Utility Files
- **complete_setup.sql** - Complete database setup (for fresh installations)
- **rollback_all.sql** - Complete rollback (for development/testing)

## Table Descriptions

### Core Tables

#### api_keys
Stores user API keys for external services (Gemini, Firecrawl)
- **Key Features:** RLS, unique constraints, automatic timestamps
- **Indexes:** user_id, key_type, (user_id, key_type)

#### contests
Main contest data storage
- **Key Features:** RLS, status tracking, progress monitoring
- **Indexes:** user_id, deadline, category, status
- **Status Values:** preparing, in-progress, submitted, completed

#### notifications
User notification system
- **Key Features:** RLS, read/unread tracking, type categorization
- **Types:** info, success, warning, error
- **Indexes:** user_id, contest_id, type, is_read, created_at

#### contest_details
Flexible contest details and schedules
- **Key Features:** JSONB storage, RLS, GIN indexes
- **Detail Types:** team_members, schedule, requirements

### AI & Search Tables

#### contest_embeddings
Vector similarity search for contests
- **Key Features:** pgvector integration, automatic embedding generation
- **Functions:** match_contests(), match_contests_by_category()
- **Vector Dimension:** 1536 (OpenAI compatible)

#### contest_ideas
AI-generated and user-created contest ideas
- **Key Features:** RLS, AI generation tracking
- **Fields:** title, description, ai_generated flag

#### contest_prompts
AI prompt management
- **Key Features:** RLS, prompt categorization
- **Usage:** AI-powered contest generation and enhancement

### File Management Tables

#### contest_files
File metadata storage
- **Key Features:** RLS, file type categorization, size tracking
- **Types:** document, image, video, other
- **Indexes:** user_id, contest_id, type, uploaded_at

#### Storage Buckets
- **profile-images:** User profile pictures
- **contest-files:** Contest-related files
- **public:** Publicly accessible files

### User Management Tables

#### user_profiles
User profile information
- **Key Features:** RLS, social links, preferences
- **Fields:** display_name, bio, location, website, avatar_url
- **JSON Fields:** social_links, preferences

#### user_activities
User activity tracking
- **Key Features:** RLS, activity categorization
- **Types:** contest_created, submission_made, profile_updated

#### contest_submissions
User contest submissions
- **Key Features:** RLS, submission status tracking
- **Status Values:** draft, submitted, approved, rejected

## Security Features

### Row Level Security (RLS)
All tables implement RLS with user-specific policies:
- Users can only access their own data
- Automatic user_id filtering
- Secure by default

### Data Integrity
- Foreign key constraints with CASCADE DELETE
- Unique constraints where appropriate
- Input validation with CHECK constraints
- Automatic timestamp management

### Performance Optimizations
- Strategic indexes on frequently queried columns
- GIN indexes for JSONB fields
- Vector indexes for similarity search
- Composite indexes for common query patterns

## Functions and Triggers

### Helper Functions
- `update_updated_at_column()`: Automatic timestamp updates
- `match_contests()`: Vector similarity search
- `match_contests_by_category()`: Category-filtered search
- `create_contest_embedding()`: Automatic embedding generation

### Triggers
- Automatic `updated_at` timestamp updates on all tables
- Automatic embedding generation for contests
- Data validation triggers

## Migration Best Practices

### Naming Convention
- Format: `YYYYMMDDHHMMSS_description.sql`
- Descriptive names indicating the change
- Chronological ordering

### Rollback Strategy
- Each migration should be reversible
- Drop migrations available for major changes
- Test rollbacks in development environment

### Testing
- Test migrations in development first
- Verify RLS policies work correctly
- Check performance with realistic data volumes

## Troubleshooting

### Common Issues

#### pgvector Extension Error
```sql
-- Ensure extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;
```

#### RLS Policy Conflicts
```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

#### Duplicate Migration
- Check migration history in Supabase dashboard
- Use `supabase migration list` to see applied migrations

### Performance Monitoring
- Monitor query performance with Supabase Analytics
- Check index usage with `EXPLAIN ANALYZE`
- Optimize slow queries based on usage patterns

## Development Workflow

### Adding New Migrations
```bash
# Generate new migration
supabase migration new your_migration_name

# Apply locally
supabase db push

# Test thoroughly before deploying
```

### Database Reset
```bash
# Reset to clean state
supabase db reset

# Apply all migrations
supabase db push
```

### Production Deployment
1. Test migrations in staging environment
2. Backup production database
3. Apply migrations during low-traffic period
4. Monitor for any issues
5. Rollback if necessary

## Environment Setup

### Required Environment Variables
```bash
# Supabase configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API keys for external services
GEMINI_API_KEY=your_gemini_key
FIRECRAWL_API_KEY=your_firecrawl_key
```

### Local Development
```bash
# Start Supabase locally
supabase start

# Apply migrations
supabase db push

# Stop local instance
supabase stop
```

This migration structure provides a solid foundation for the ContestHub application with proper security, performance, and scalability considerations. 