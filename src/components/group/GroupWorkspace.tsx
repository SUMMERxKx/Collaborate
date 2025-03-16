'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Canvas from '@/components/canvas/Canvas';
import CanvasToolbar from '@/components/canvas/CanvasToolbar';
import Chat from '@/components/chat/Chat';
import type { Group } from '@/types/group';

interface GroupWorkspaceProps {
  group_id: string;
}

export default function GroupWorkspace({ group_id }: GroupWorkspaceProps) {
  const [group, setGroup] = useState<Group | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', group_id)
          .single();

        if (fetchError) throw fetchError;
        setGroup(data);
      } catch (err) {
        setError('Failed to load group');
      }
    };

    fetchGroup();
  }, [group_id]);

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!group) {
    return <div className="text-center p-4">Loading workspace...</div>;
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="flex h-full">
        <div className="flex-1 relative">
          <Canvas group_id={group_id} className="h-full" />
          <CanvasToolbar />
        </div>
        <div className="w-96 border-l">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">{group.name}</h2>
              <p className="text-sm text-gray-500">Group Chat</p>
            </div>
            <Chat group_id={group_id} className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
} 