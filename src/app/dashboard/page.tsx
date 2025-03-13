import { Metadata } from 'next';
import GroupList from '@/components/group/GroupList';

export const metadata: Metadata = {
  title: 'Dashboard - Collaborate',
  description: 'View and manage your collaborative groups',
};

export default function DashboardPage() {
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Your Groups
          </h2>
        </div>
      </div>
      <GroupList />
    </div>
  );
} 