import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import GroupWorkspace from '@/components/group/GroupWorkspace';

interface GroupPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: GroupPageProps): Promise<Metadata> {
  try {
    const { data: group } = await supabase
      .from('groups')
      .select('name')
      .eq('id', params.id)
      .single();

    if (!group) return notFound();

    return {
      title: `${group.name} - Collaborate`,
      description: `Collaborate in ${group.name} workspace`,
    };
  } catch (error) {
    return {
      title: 'Group Workspace - Collaborate',
      description: 'Collaborate in your workspace',
    };
  }
}

export default function GroupPage({ params }: GroupPageProps) {
  return <GroupWorkspace group_id={params.id} />;
} 