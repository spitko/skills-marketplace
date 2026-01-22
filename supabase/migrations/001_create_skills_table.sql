-- Create skills table
create table if not exists public.skills (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  category text not null,
  author text not null,
  price numeric(10, 2),
  url text not null, -- Public URL to the skill that customers receive after purchase
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.skills enable row level security;

-- Create policy to allow public read access
create policy "Allow public read access" on public.skills
  for select
  using (true);

-- Insert example skills
insert into public.skills (name, description, category, author, price, url, tags)
values
  (
    'Skill Creator',
    'A skill that helps you create new or updated skills for Claude. Provides guidance on skill structure, metadata, and best practices for extending Claude''s capabilities.',
    'Development',
    'Anthropic',
    9.99,
    'https://github.com/anthropics/skills/tree/main/skills/skill-creator',
    array['skill', 'creation', 'development', 'claude']
  ),
  (
    'Web App Tester',
    'Test web applications by generating test cases, running automated tests, and identifying bugs. Helps ensure your web apps work correctly across different scenarios.',
    'Development',
    'Anthropic',
    12.99,
    'https://github.com/anthropics/skills/tree/main/skills/webapp-testing',
    array['testing', 'web', 'development', 'qa']
  ),
  (
    'MCP Server Generator',
    'Generate Model Context Protocol (MCP) servers to extend Claude''s capabilities with custom tools and data sources. Create powerful integrations with external systems.',
    'Development',
    'Anthropic',
    14.99,
    'https://github.com/anthropics/skills/tree/main/skills/mcp-builder',
    array['mcp', 'server', 'integration', 'development']
  ),
  (
    'Document Creator (DOCX)',
    'Create and manipulate Microsoft Word documents. Generate professional documents with formatting, tables, images, and complex layouts.',
    'Productivity',
    'Anthropic',
    6.99,
    'https://github.com/anthropics/skills/tree/main/skills/docx',
    array['document', 'word', 'docx', 'productivity']
  ),
  (
    'Spreadsheet Generator (XLSX)',
    'Create and manipulate Excel spreadsheets. Generate complex workbooks with formulas, charts, pivot tables, and data analysis capabilities.',
    'Analytics',
    'Anthropic',
    8.99,
    'https://github.com/anthropics/skills/tree/main/skills/xlsx',
    array['spreadsheet', 'excel', 'xlsx', 'analytics']
  );

-- Create index for better query performance
create index if not exists skills_category_idx on public.skills(category);
create index if not exists skills_created_at_idx on public.skills(created_at desc);
