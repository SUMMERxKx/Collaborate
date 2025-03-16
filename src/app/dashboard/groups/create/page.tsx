'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { supabase, getAuthenticatedClient } from '@/lib/supabase';

export default function CreateGroupPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdGroup, setCreatedGroup] = useState<{ id: string; passkey: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      setError('Please sign in to create a group');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a group name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Get authenticated client
      const { data: { session: supabaseSession }, error: authError } = await getAuthenticatedClient();
      
      if (authError) {
        throw new Error('Authentication failed. Please sign in again.');
      }

      // Generate passkey
      const passkey = Math.random().toString(36).substring(2, 10);
      
      // Create the group with a single query
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: name.trim(),
          passkey,
          created_by: session.user.id
        })
        .select()
        .single();

      if (groupError) {
        console.error('Group creation error:', groupError);
        throw new Error(groupError.message);
      }

      if (!group) {
        throw new Error('Failed to create group - no data returned');
      }

      // Add creator as member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: session.user.id
        });

      if (memberError) {
        console.error('Member creation error:', memberError);
        // Try to clean up the created group
        await supabase.from('groups').delete().eq('id', group.id);
        throw new Error('Failed to set up group membership');
      }

      // Success! Set the created group and redirect
      setCreatedGroup({ id: group.id, passkey: group.passkey });
      router.push(`/dashboard/groups/${group.id}`);
      
    } catch (err) {
      console.error('Creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center text-emerald-100 hover:text-emerald-50 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-800/50 rounded-lg p-8 backdrop-blur-sm"
        >
          <h1 className="text-3xl font-bold text-emerald-100 mb-8">Create New Group</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {createdGroup ? (
            <div>
              <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <h3 className="text-lg font-medium text-emerald-100">Group Created Successfully!</h3>
                <p className="mt-2 text-emerald-200">
                  Your group passkey is: <span className="font-mono bg-emerald-900/50 px-2 py-1 rounded">{createdGroup.passkey}</span>
                </p>
                <p className="mt-2 text-emerald-300 text-sm">
                  Share this passkey with others to let them join your group.
                </p>
              </div>
              <div className="flex justify-end">
                <Link
                  href={`/dashboard/groups/${createdGroup.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Go to Group
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-emerald-100">
                  Group Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full rounded-md border-emerald-600 bg-emerald-900/50 text-emerald-100 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="Enter group name"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
} 