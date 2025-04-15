-- Create users table to store user profiles
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('child', 'parent', 'therapist', 'admin')),
  avatar TEXT,
  organization_id TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users table
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all user data" ON users;
CREATE POLICY "Admins can view all user data"
ON users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Therapists can view their patients" ON users;
CREATE POLICY "Therapists can view their patients"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'therapist'
  ) AND 
  (created_by = auth.uid() OR organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ))
);

-- Create parent_child_relationships table
CREATE TABLE IF NOT EXISTS parent_child_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES users(id) NOT NULL,
  child_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- Enable row level security
ALTER TABLE parent_child_relationships ENABLE ROW LEVEL SECURITY;

-- Create policy for parent_child_relationships table
DROP POLICY IF EXISTS "Users can view their own relationships" ON parent_child_relationships;
CREATE POLICY "Users can view their own relationships"
ON parent_child_relationships FOR SELECT
USING (parent_id = auth.uid() OR child_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all relationships" ON parent_child_relationships;
CREATE POLICY "Admins can manage all relationships"
ON parent_child_relationships FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Therapists can manage their patients' relationships" ON parent_child_relationships;
CREATE POLICY "Therapists can manage their patients' relationships"
ON parent_child_relationships FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'therapist'
  ) AND 
  EXISTS (
    SELECT 1 FROM users
    WHERE id = parent_child_relationships.parent_id AND created_by = auth.uid()
  ) AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = parent_child_relationships.child_id AND created_by = auth.uid()
  )
);

-- Enable realtime
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table parent_child_relationships;