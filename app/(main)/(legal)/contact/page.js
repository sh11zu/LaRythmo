// app/(main)/(legal)/contact/page.js
// Page "Contact" - Formulaire de contact pour les visiteurs & accessibilité

'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sujet: '',
    message: ''
  });

  const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    // Simulation d'envoi (à connecter à votre backend ou service d'envoi d'email)
    setTimeout(() => {
      setStatus('success');
      setFormData({ nom: '', email: '', sujet: '', message: '' });
    }, 1500);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="text-gray-500 hover:text-[#7b68ee] transition-colors font-medium text-sm mb-4 inline-block">
            ← Retour au tableau de bord
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
          Contact
        </h1>
      </div>

      <div className="grid gap-8">

        {/* --- SECTION ACCESSIBILITÉ (Texte fourni) --- */}
        <section className="glass-panel rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl p-8 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Accessibilité
          </h2>
          <div className="text-sm text-gray-700 leading-relaxed space-y-4">
            <p className="text-justify">
              L’association LA RYTHMO s’efforce de rendre son site accessible au plus grand nombre.
            </p>
            <p className="text-justify">
              Toute difficulté d’accès à un contenu ou à une fonctionnalité peut être signalée à : <a href="mailto:bureaugr-rythmo@outlook.fr" className="text-[#7b68ee] font-medium hover:underline">bureaugr-rythmo@outlook.fr</a>, afin d’obtenir une assistance ou une solution alternative.
            </p>
          </div>
        </section>

        {/* --- FORMULAIRE DE CONTACT --- */}
        <section className="glass-panel rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl p-8 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">
            Envoyer un message
          </h2>

          {status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-fade-in">
              <div className="text-green-500 text-4xl mb-2">✓</div>
              <h3 className="text-lg font-bold text-green-800">Message envoyé !</h3>
              <p className="text-green-700 mt-1">Merci de nous avoir contactés. Nous vous répondrons dans les meilleurs délais.</p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-4 text-sm text-green-700 underline hover:text-green-900"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nom */}
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    required
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 bg-white/50 px-4 py-2.5 text-gray-900 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm"
                    placeholder="Votre nom"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 bg-white/50 px-4 py-2.5 text-gray-900 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm"
                    placeholder="vous@exemple.com"
                  />
                </div>
              </div>

              {/* Sujet */}
              <div>
                <label htmlFor="sujet" className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                <select
                  id="sujet"
                  name="sujet"
                  required
                  value={formData.sujet}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 bg-white/50 px-4 py-2.5 text-gray-900 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm"
                >
                  <option value="" disabled>Sélectionnez un sujet</option>
                  <option value="Renseignements">Demande de renseignements</option>
                  <option value="Inscription">Problème d'inscription</option>
                  <option value="RGPD">Données personnelles / RGPD</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 bg-white/50 px-4 py-2.5 text-gray-900 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm resize-none"
                  placeholder="Comment pouvons-nous vous aider ?"
                />
              </div>

              {/* Bouton d'envoi */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full md:w-auto px-8 py-3 rounded-xl bg-[#7b68ee] text-white font-bold shadow-md hover:bg-[#6c5ce7] focus:outline-none focus:ring-2 focus:ring-[#7b68ee] focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'submitting' ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le message"
                  )}
                </button>
              </div>

            </form>
          )}
        </section>

      </div>
    </div>
  );
}