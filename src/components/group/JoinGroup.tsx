'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { JoinGroupInput } from '@/types/group';

export default function JoinGroup() {
  const router = useRouter();
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Find group by passkey
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select()
        .eq('passkey', passkey)
        .single();

      if (groupError) throw new Error('Invalid passkey');

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('group_members')
        .select()
        .eq('group_id', group.id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (existingMember) {
        router.push(`/dashboard/groups/${group.id}`);
        return;
      }

      // Add user as a member
      const { error: joinError } = await supabase
        .from('group_members')
        .insert([
          { group_id: group.id, user_id: (await supabase.auth.getUser()).data.user?.id }
        ]);

      if (joinError) throw joinError;

      router.push(`/dashboard/groups/${group.id}`);
    } catch (err) {
      setError('Failed to join group. Please check the passkey and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="passkey" className="block text-sm font-medium text-gray-700">
            Group Passkey
          </label>
          <input
            type="text"
            id="passkey"
            name="passkey"
            required
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter group passkey"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Joining...' : 'Join Group'}
        </button>
      </form>
    </div>
  );
} 