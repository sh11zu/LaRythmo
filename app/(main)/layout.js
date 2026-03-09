// app/(main)/layout.js
// Layout spécifique pour les pages du dashboard, des pages admin, et des pages légales

import Navbar from '../components/header';
import Footer from '../components/footer';
import PageTransition from '../components/transition.js';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="background-animate" />

      <Navbar />

      <main className="flex-1 min-h-0 w-full pt-20 overflow-hidden flex flex-col">
        <PageTransition>
          {children}
        </PageTransition>
      </main>

      <Footer />
    </div>
  );
}