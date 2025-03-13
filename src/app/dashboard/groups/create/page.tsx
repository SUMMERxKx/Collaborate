'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreateGroupPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdGroup, setCreatedGroup] = useState<{ id: string; passkey: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError('');

    try {
      const passkey = Math.random().toString(36).substring(2, 10);
      
      const { data, error: insertError } = await supabase
        .from('groups')
        .insert([
          {
            name,
            passkey,
            created_by: session.user.id,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // Add creator as a member
      await supabase
        .from('group_members')
        .insert([
          {
            group_id: data.id,
            user_id: session.user.id,
          },
        ]);

      setCreatedGroup({ id: data.id, passkey: data.passkey });
    } catch (err) {
      setError('Failed to create group. Please try again.');
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

          {createdGroup ? (
            <div className="space-y-6">
              <div className="bg-emerald-700/50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-emerald-100 mb-4">Group Created Successfully!</h2>
                <div className="space-y-4">
                  <p className="text-emerald-200">
                    Share this passkey with others to let them join your group:
                  </p>
                  <div className="bg-emerald-900/50 p-4 rounded-md">
                    <code className="text-lg font-mono text-emerald-100">{createdGroup.passkey}</code>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
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
                    id="name"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-md border-emerald-600 bg-emerald-900/50 text-emerald-100 placeholder-emerald-400 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Enter a name for your group"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-emerald-400 rounded-md shadow-sm text-sm font-medium text-emerald-100 bg-transparent hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
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