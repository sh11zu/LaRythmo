// app/(main)/dashboard/layout.js
// Applique la transition de page sur toutes les routes /dashboard/*

import PageTransition from '@/app/components/transition';

export default function DashboardLayout({ children }) {
  return <PageTransition>{children}</PageTransition>;
}
