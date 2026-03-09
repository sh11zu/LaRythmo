// app/layout.js
// Layout global pour l'ensemble du site, incluant la navbar et le footer sur toutes les pages

import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'LaRythmo',
  description: 'Plateforme de gestion',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${poppins.className} min-h-dvh h-full overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}