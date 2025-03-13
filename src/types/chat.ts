export interface ChatMessage {
  id: string;
  group_id: string;
  content: string;
  created_at: string;
  user_id: string;
  user?: {
    email: string | null;
  } | null;
}

export interface SupabaseChatMessage {
  id: string;
  group_id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    email: string;
  } | null;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export interface SendMessageInput {
  group_id: string;
  content: string;
}

export interface ChatProps {
  group_id: string;
  className?: string;
} 