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

-- Create RLS policies
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "Users can view groups they are members of" ON groups
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM group_members WHERE group_id = id
    )
  );

CREATE POLICY "Users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Users can view members of their groups" ON group_members
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM group_members WHERE group_id = group_members.group_id
    )
  );

CREATE POLICY "Users can join groups" ON group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Canvas items policies
CREATE POLICY "Users can view canvas items in their groups" ON canvas_items
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM group_members WHERE group_id = canvas_items.group_id
    )
  );

CREATE POLICY "Users can create canvas items in their groups" ON canvas_items
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM group_members WHERE group_id = canvas_items.group_id
    )
  );

CREATE POLICY "Users can update canvas items in their groups" ON canvas_items
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM group_members WHERE group_id = canvas_items.group_id
    )
  );

CREATE POLICY "Users can delete canvas items in their groups" ON canvas_items
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM group_members WHERE group_id = canvas_items.group_id
    )
  );

-- Chat messages policies
CREATE POLICY "Users can view messages in their groups" ON chat_messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM group_members WHERE group_id = chat_messages.group_id
    )
  );

CREATE POLICY "Users can send messages to their groups" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM group_members WHERE group_id = chat_messages.group_id
    )
  ); 