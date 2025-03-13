import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const metadata: Metadata = {
  title: 'Dashboard - Collaborate',
  description: 'View and manage your collaborative groups',
};

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return null;
  }

  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .eq('created_by', session.user.id);

  const { data: memberGroups } = await supabase
    .from('group_members')
    .select('group_id, groups(*)')
    .eq('user_id', session.user.id);

  const allGroups = [
    ...(groups || []),
    ...(memberGroups?.map(mg => mg.groups) || [])
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Your Groups</h1>
        <div className="space-x-4">
          <Link
            href="/dashboard/groups/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Group
          </Link>
          <Link
            href="/dashboard/groups/join"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Join Group
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allGroups.map((group) => (
          <Link
            key={group.id}
            href={`/dashboard/groups/${group.id}`}
            className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors"
          >
            <h2 className="text-lg font-medium text-gray-900">{group.name}</h2>
            <p className="mt-2 text-sm text-gray-500">
              Created {new Date(group.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}

        {allGroups.length === 0 && (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No groups yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create a new group or join an existing one to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 