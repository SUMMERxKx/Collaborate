'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Group } from '@/types/group';

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data: groupMembers, error: memberError } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

        if (memberError) throw memberError;

        const groupIds = groupMembers.map(member => member.group_id);

        const { data: groups, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .in('id', groupIds);

        if (groupError) throw groupError;

        setGroups(groups);
      } catch (err) {
        setError('Failed to load groups');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (isLoading) {
    return <div className="text-center">Loading groups...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (groups.length === 0) {
    return (
      <div className="text-center">
        <p className="text-gray-500">You haven't joined any groups yet.</p>
        <div className="mt-4 space-x-4">
          <Link
            href="/dashboard/groups/create"
            className="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create a Group
          </Link>
          <Link
            href="/dashboard/groups/join"
            className="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Join a Group
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-4">
        <Link
          href="/dashboard/groups/create"
          className="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create a Group
        </Link>
        <Link
          href="/dashboard/groups/join"
          className="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          Join a Group
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Link
            key={group.id}
            href={`/dashboard/groups/${group.id}`}
            className="block p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
            <p className="mt-2 text-sm text-gray-500">
              Created {new Date(group.created_at).toLocaleDateString()}
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Passkey: {group.passkey}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 