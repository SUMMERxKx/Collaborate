'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';

export default function JoinGroupPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError('');

    try {
      // Find group with passkey
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('passkey', passkey)
        .single();

      if (groupError || !group) {
        setError('Invalid passkey. Please check and try again.');
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', session.user.id)
        .single();

      if (existingMember) {
        setError('You are already a member of this group.');
        return;
      }

      // Join group
      const { error: joinError } = await supabase
        .from('group_members')
        .insert([
          {
            group_id: group.id,
            user_id: session.user.id,
          },
        ]);

      if (joinError) throw joinError;

      router.push('/dashboard');
    } catch (err) {
      setError('Failed to join group. Please try again.');
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
          <h1 className="text-3xl font-bold text-emerald-100 mb-8">Join a Group</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="passkey" className="block text-sm font-medium text-emerald-100">
                Group Passkey
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="passkey"
                  name="passkey"
                  required
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  className="block w-full rounded-md border-emerald-600 bg-emerald-900/50 text-emerald-100 placeholder-emerald-400 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Enter the group passkey"
                />
              </div>
              <p className="mt-2 text-sm text-emerald-300">
                Ask the group creator for the passkey to join their group.
              </p>
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
                {isLoading ? 'Joining...' : 'Join Group'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 