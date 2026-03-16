// app/(main)/admin/layout.js

import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminShell from './AdminShell';

export default async function AdminLayout({ children }) {
  const user = await getSessionUser();

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SYS_ADMIN')) {
    redirect('/dashboard');
  }

  return (
    <AdminShell isSysAdmin={user.role === 'SYS_ADMIN'}>
      {children}
    </AdminShell>
  );
}
