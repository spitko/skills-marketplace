# Supabase Migrations

## Setting up the Skills Table

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to the SQL Editor
3. Copy and paste the contents of `migrations/001_create_skills_table.sql`
4. Click "Run" to execute the migration

This will:
- Create the `skills` table with all necessary fields including the `url` field for public skill URLs
- Enable Row Level Security (RLS) with public read access
- Insert 5 example skills with their URLs
- Create indexes for better query performance

## Skills Table Schema

- `id` (uuid): Primary key
- `name` (text): Skill name
- `description` (text): Skill description
- `category` (text): Skill category
- `author` (text): Author/creator name
- `price` (numeric): Price in USD (optional)
- `url` (text): Public URL to the skill (sent to customers after purchase)
- `tags` (text[]): Array of tags
- `created_at` (timestamp): Creation timestamp
- `updated_at` (timestamp): Last update timestamp

## Adding New Skills

You can add new skills directly in the Supabase dashboard or via SQL:

```sql
insert into public.skills (name, description, category, author, price, url, tags)
values (
  'Your Skill Name',
  'Skill description here',
  'Category',
  'Author Name',
  9.99,
  'https://claude.ai/skills/your-skill-url',
  array['tag1', 'tag2', 'tag3']
);
```
