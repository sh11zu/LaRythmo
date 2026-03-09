// app/page.js
// Page d'accueil - redirection vers dashboard ou login selon présence du cookie d'authentification

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function HomeRedirector() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');

  if (token) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}