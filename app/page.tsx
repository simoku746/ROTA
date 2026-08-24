import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { ROLE_CONFIG } from '@/lib/roles';

export default function Home() {
  const session = getSession();
  if (!session) redirect('/login');
  const firstTab = ROLE_CONFIG[session.role].tabs[0];
  redirect(`/${firstTab}`);
}
