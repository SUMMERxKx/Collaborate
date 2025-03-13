export interface Group {
  id: string;
  name: string;
  passkey: string;
  created_at: string;
  created_by: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface CreateGroupInput {
  name: string;
}

export interface JoinGroupInput {
  passkey: string;
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
} 