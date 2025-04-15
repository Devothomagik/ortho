-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  organization_id TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create auth_users table to store email references
CREATE TABLE IF NOT EXISTS auth_users (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parent_child_relationships table
CREATE TABLE IF NOT EXISTS parent_child_relationships (
  id SERIAL PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- Create admin user if it doesn't exist
INSERT INTO users (id, name, role, avatar)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Admin', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin')
ON CONFLICT (id) DO NOTHING;

-- Enable row level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child_relationships ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users table policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Therapists can view their patients" ON users;
CREATE POLICY "Therapists can view their patients"
  ON users FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'therapist'
    ) AND 
    (created_by = auth.uid() OR role = 'therapist')
  );

DROP POLICY IF EXISTS "Parents can view their children" ON users;
CREATE POLICY "Parents can view their children"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_child_relationships
      WHERE parent_id = auth.uid() AND child_id = id
    )
  );

DROP POLICY IF EXISTS "Admin can view all users" ON users;
CREATE POLICY "Admin can view all users"
  ON users FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can insert users" ON users;
CREATE POLICY "Admin can insert users"
  ON users FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Therapists can insert patients and parents" ON users;
CREATE POLICY "Therapists can insert patients and parents"
  ON users FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'therapist'
    ) AND
    (NEW.role = 'parent' OR NEW.role = 'child')
  );

-- Enable realtime
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table auth_users;
alter publication supabase_realtime add table parent_child_relationships;