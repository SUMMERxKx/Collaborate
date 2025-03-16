'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import NavBar from '@/components/ui/NavBar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { supabase, getAuthenticatedClient } from '@/lib/supabase';

export default function Home() {
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
    <main className="min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-800">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/20" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-white relative z-10"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-emerald-100">
            The North Hand
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-emerald-50">
            A collaborative workspace where creativity meets connection. Create, share, and collaborate in real-time.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/auth/signup"
              className="bg-emerald-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-emerald-600 transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="/about"
              className="bg-white/10 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-emerald-100 mb-4">
              Why Choose The North Hand?
            </h2>
            <p className="text-xl text-emerald-50 max-w-2xl mx-auto">
              Experience seamless collaboration with our powerful features designed for modern teams.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-emerald-700/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow backdrop-blur-sm"
              >
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-emerald-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-emerald-50">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const features = [
  {
    title: 'Real-time Collaboration',
    description: 'Work together seamlessly with instant updates and live interactions.',
    icon: (
      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: 'Interactive Canvas',
    description: 'Draw, write, and create together in our intuitive workspace.',
    icon: (
      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    title: 'Secure Groups',
    description: 'Create private groups with passkey protection for your team.',
    icon: (
      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];
