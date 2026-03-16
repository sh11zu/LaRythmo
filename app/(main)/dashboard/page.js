// app/(main)/dashboard/page.js

import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardHome from './DashboardHome';

export default async function Dashboard() {
  const user = await getSessionUser();

  if (user?.role === 'ADMIN' || user?.role === 'SYS_ADMIN') {
    redirect('/admin');
  }

  return <DashboardHome firstname={user?.first_name ?? ''} />;
}
