// app/(main)/layout.js
// Layout spécifique pour les pages du dashboard, des pages admin, et des pages légales

import { getSessionUser } from '@/lib/auth';
import Navbar from '../components/header';
import Footer from '../components/footer';

export default async function MainLayout({ children }) {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="background-animate" />

      <Navbar user={user} />

      <main className="flex-1 min-h-0 w-full pt-20 overflow-hidden flex flex-col">
        {children}
      </main>

      <Footer />
    </div>
  );
}