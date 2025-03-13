import { Metadata } from 'next';
import CreateGroup from '@/components/group/CreateGroup';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Group - Collaborate',
  description: 'Create a new collaborative group',
};

export default function CreateGroupPage() {
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Create a New Group
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Groups
          </Link>
        </div>
      </div>
      <CreateGroup />
    </div>
  );
} 