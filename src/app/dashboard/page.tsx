'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserGroupIcon, UsersIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      if (!session?.user?.id) return;

      try {
        const [groupsResponse, memberGroupsResponse] = await Promise.all([
          supabase
            .from('groups')
            .select('*')
            .eq('created_by', session.user.id),
          supabase
            .from('group_members')
            .select('group_id, groups(*)')
            .eq('user_id', session.user.id)
        ]);

        const ownedGroups = groupsResponse.data || [];
        const memberGroups = (memberGroupsResponse.data || []).map(mg => mg.groups);
        
        setGroups([...ownedGroups, ...memberGroups]);
      } catch (err) {
        setError('Failed to load groups');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [session]);

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 min-w-0"
          >
            <h2 className="text-3xl font-bold leading-7 text-emerald-50 sm:truncate sm:text-4xl sm:tracking-tight">
              Your Groups
            </h2>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-4 flex md:ml-4 md:mt-0 space-x-4"
          >
            <Link
              href="/dashboard/groups/join"
              className="inline-flex items-center px-4 py-2 border border-emerald-400 rounded-md shadow-sm text-sm font-medium text-emerald-100 bg-transparent hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <UsersIcon className="h-5 w-5 mr-2" />
              Join Group
            </Link>
            <Link
              href="/dashboard/groups/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Create Group
            </Link>
          </motion.div>
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-emerald-100">Loading groups...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400">{error}</div>
          </div>
        ) : groups.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-emerald-800/50 rounded-lg backdrop-blur-sm"
          >
            <UserGroupIcon className="mx-auto h-12 w-12 text-emerald-400" />
            <h3 className="mt-2 text-lg font-medium text-emerald-100">No groups yet</h3>
            <p className="mt-1 text-emerald-200">
              Get started by creating a new group or joining an existing one.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <Link
                href="/dashboard/groups/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600"
              >
                Create Your First Group
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/dashboard/groups/${group.id}`}
                  className="block p-6 bg-emerald-800/50 rounded-lg border border-emerald-700/50 hover:border-emerald-500 transition-colors backdrop-blur-sm"
                >
                  <h3 className="text-lg font-medium text-emerald-100">{group.name}</h3>
                  <p className="mt-2 text-sm text-emerald-300">
                    Created {new Date(group.created_at).toLocaleDateString()}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 