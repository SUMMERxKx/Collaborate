'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/chat';
import { supabase } from '@/lib/supabase';
import type { ChatMessage, SupabaseChatMessage } from '@/types/chat';

interface ChatProps {
  group_id: string;
  className?: string;
}

export default function Chat({ group_id, className }: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const { messages, isLoading, error, addMessage, setMessages, setLoading, setError } =
    useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('chat_messages')
          .select(`
            id,
            group_id,
            content,
            created_at,
            user_id,
            user:auth.users!user_id(email)
          `)
          .eq('group_id', group_id)
          .order('created_at', { ascending: true });

        if (fetchError) throw fetchError;
        setMessages((data as unknown as SupabaseChatMessage[]).map(message => ({
          ...message,
          user: message.user || null
        })));
      } catch (err) {
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`chat:${group_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `group_id=eq.${group_id}`,
      }, (payload) => {
        addMessage(payload.new as ChatMessage);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [group_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: sendError } = await supabase
        .from('chat_messages')
        .insert([
          {
            group_id,
            content: newMessage.trim(),
            user_id: user.id,
          },
        ]);

      if (sendError) throw sendError;
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet</div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {message.user?.email || 'Unknown User'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-1 text-gray-700">{message.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 