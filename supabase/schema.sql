-- Drop existing tables and their dependencies
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS canvas_items CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

-- Create groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  passkey TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create group_members table
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (group_id, user_id)
);

-- Create canvas_items table
CREATE TABLE canvas_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'text', 'drawing', 'sticky-note', 'task'
  content JSONB NOT NULL,
  position JSONB NOT NULL, -- {x: number, y: number}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "Anyone can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Anyone can view groups" ON groups
  FOR SELECT TO authenticated USING (true);

-- Group members policies
CREATE POLICY "Users can join groups" ON group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view group members" ON group_members
  FOR SELECT TO authenticated USING (true);

-- After joining a group, users can access its content
CREATE POLICY "Members can create canvas items" ON canvas_items
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND 
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = canvas_items.group_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can view canvas items" ON canvas_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = canvas_items.group_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update canvas items" ON canvas_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = canvas_items.group_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can delete canvas items" ON canvas_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = canvas_items.group_id 
      AND user_id = auth.uid()
    )
  );

-- Chat messages policies
CREATE POLICY "Members can view messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = chat_messages.group_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = chat_messages.group_id 
      AND user_id = auth.uid()
    )
  ); 