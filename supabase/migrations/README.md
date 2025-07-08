# Supabase Migrations

This directory contains database migration files for the Supabase project.

## Migration Files

### 20241201000000_create_api_keys_table.sql
Creates the `api_keys` table for storing user API keys securely.

**Features:**
- Stores API keys for Gemini and Firecrawl services
- User-specific key management with Row Level Security (RLS)
- Automatic timestamp management (created_at, updated_at)
- Performance indexes for efficient queries
- Comprehensive security policies

**Table Structure:**
```sql
api_keys (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  key_type TEXT CHECK (key_type IN ('gemini', 'firecrawl')),
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
```

### 20241201000001_drop_api_keys_table.sql
Rollback migration to drop the `api_keys` table and all related objects.

### 20241201000002_create_contests_table.sql
Creates the `contests` table for storing contest data.

**Features:**
- Stores all contest information (title, organization, deadline, etc.)
- User-specific contest management with RLS
- Automatic timestamp management
- Performance indexes for efficient queries

### 20241201000003_create_notifications_table.sql
Creates the `notifications` table for storing user notifications.

**Features:**
- Stores notification messages with types (info, success, warning, error)
- Read/unread status tracking
- User-specific notifications with RLS
- Automatic timestamp management

### 20241201000004_create_contest_details_table.sql
Creates the `contest_details` table for storing team members and schedules.

**Features:**
- JSONB storage for flexible team member and schedule data
- Links to contests via foreign key
- User-specific details with RLS
- GIN index for efficient JSON queries

### 20241201000005_drop_all_tables.sql
Complete rollback migration to drop all tables and related objects.

## Running Migrations

### Using Supabase CLI
```bash
# Apply migrations
supabase db push

# Reset database
supabase db reset

# Generate new migration
supabase migration new migration_name
```

### Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the migration SQL
4. Execute the SQL

## Security Features

- **Row Level Security (RLS)**: Users can only access their own API keys
- **Cascade Delete**: API keys are automatically deleted when a user is deleted
- **Unique Constraints**: Each user can only have one key per service type
- **Input Validation**: Key types are restricted to 'gemini' or 'firecrawl'

## Performance Optimizations

- Indexes on `user_id`, `key_type`, and composite `(user_id, key_type)`
- Automatic timestamp updates via triggers
- Efficient query patterns for common operations 