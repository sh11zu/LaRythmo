// app/(auth)/login/page.js
// Page "Login/Inscription" - gestion de la connexion, création de compte et mot de passe oublié

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState('login');
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', phone: '', firstName: '', lastName: '', accountType: 'me'
  });

  const [errors, setErrors] = useState({});
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' && (!/^\d*$/.test(value) || value.length > 10)) return;

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const checkPassword = (pass) => ({
    len: pass.length >= 12,
    upper: /[A-Z]/.test(pass),
    lower: /[a-z]/.test(pass),
    num: /[0-9]/.test(pass),
    spec: /[^A-Za-z0-9]/.test(pass),
  });

  const criteria = checkPassword(formData.password);
  const score = Object.values(criteria).filter(Boolean).length;

  const getStrengthColor = () => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-orange-400';
    return 'bg-green-500';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    let hasError = false;

    if (view === 'login') {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        if (res.ok) {
          router.refresh();
          router.push('/dashboard');
          return;
        } else {
          const data = await res.json();
          setErrors({
            password: data.error || "Identifiants incorrects",
            email: " "
          });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        setErrors({ password: "Une erreur est survenue." });
        setIsLoading(false);
        return;
      }
    }

    else if (view === 'register') {
      if (formData.phone.length !== 10) {
        newErrors.phone = "Le numéro doit comporter 10 chiffres.";
        hasError = true;
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
        hasError = true;
      }

      if (score < 5) {
        newErrors.password = "Mot de passe trop faible.";
        setIsPasswordFocused(true);
        hasError = true;
      }

      if (hasError) {
        setErrors(newErrors);
        return;
      }

      const recap = `
      ✅ INSCRIPTION VALIDÉE !
      -----------------------------
      Type : ${formData.accountType === 'me' ? 'Pour moi' : 'Pour mon enfant'}
      Nom : ${formData.firstName} ${formData.lastName}
      Email : ${formData.email}
      Tél : ${formData.phone}
      `;
      alert(recap);
    }

    else if (view === 'forgot') {
      alert(`📧 Lien envoyé à : ${formData.email}`);
    }

    setErrors(newErrors);
  };

  const getInputClass = (fieldName) => {
    const baseClass = "input-field";
    return errors[fieldName]
      ? `${baseClass} border-2 border-red-500 bg-red-50/50 text-red-900 placeholder-red-300`
      : baseClass;
  };

  return (
    <main className="min-h-screen flex justify-center items-center relative p-4 py-10">
      <div className="background-animate" />

      <div className="glass-panel p-8 md:p-10 rounded-3xl w-full max-w-md text-center text-gray-700 slide-in relative z-10">

        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-[#7b68ee] to-[#ff69b4] bg-clip-text text-transparent mb-2">
            LaRythmo
          </h1>
          <p className="opacity-80 text-sm">
            {view === 'login' ? 'Connexion à votre espace' : view === 'register' ? 'Création de compte' : 'Récupération'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left" noValidate>

          {view === 'login' && (
            <>
              <div className="relative">
                <input
                  type="text" name="email" placeholder=" "
                  className={getInputClass('email')}
                  onChange={handleChange} required
                />
                <label className={`input-label ${errors.email ? 'text-red-500' : ''}`}>Utilisateur</label>
              </div>

              <div className="relative">
                <input
                  type="password" name="password" placeholder=" "
                  className={getInputClass('password')}
                  onChange={handleChange} required
                />
                <label className={`input-label ${errors.password ? 'text-red-500' : ''}`}>Mot de passe</label>
                {errors.password && <p className="text-xs text-red-500 mt-1 ml-2 font-medium">{errors.password}</p>}
              </div>

              <div className="text-right -mt-2">
                <button type="button" onClick={() => { setView('forgot'); setErrors({}); }} className="text-xs text-[#7b68ee] hover:text-[#ff69b4] font-semibold transition-colors">
                  Mot de passe oublié ?
                </button>
              </div>
            </>
          )}

          {view === 'register' && (
            <>
              <div className="flex justify-center gap-6 bg-white/40 p-2 rounded-xl mb-2">
                {['me', 'child'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer text-sm font-medium select-none">
                    <input type="radio" name="accountType" value={type} checked={formData.accountType === type} onChange={handleChange} className="accent-[#7b68ee] scale-110" />
                    {type === 'me' ? 'Pour moi' : 'Pour mon enfant'}
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <div className="relative w-1/2">
                  <input type="text" name="firstName" placeholder=" " className="input-field" onChange={handleChange} required />
                  <label className="input-label">Prénom</label>
                </div>
                <div className="relative w-1/2">
                  <input type="text" name="lastName" placeholder=" " className="input-field" onChange={handleChange} required />
                  <label className="input-label">Nom</label>
                </div>
              </div>

              <div className="relative">
                <input type="email" name="email" placeholder=" " className="input-field" onChange={handleChange} required />
                <label className="input-label">Email</label>
              </div>

              <div className="relative">
                <input
                  type="tel" name="phone" value={formData.phone} placeholder=" "
                  className={getInputClass('phone')}
                  onChange={handleChange} required
                />
                <label className={`input-label ${errors.phone ? 'text-red-500' : ''}`}>Téléphone</label>

                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1 ml-2 font-medium animate-pulse">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type="password" name="password" placeholder=" "
                  className={getInputClass('password')}
                  onChange={handleChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                />
                <label className={`input-label ${errors.password ? 'text-red-500' : ''}`}>Mot de passe</label>

                {errors.password && (
                  <p className="text-xs text-red-500 mt-1 ml-2 font-medium">{errors.password}</p>
                )}

                <div className={`absolute top-1/2 left-[105%] -translate-y-1/2 w-64 bg-white p-4 rounded-xl shadow-xl z-50 transition-all duration-300 pointer-events-none border border-gray-100
                  ${isPasswordFocused ? 'opacity-100 visible translate-x-0' : 'opacity-0 invisible translate-x-2.5'}
                  hidden md:block`}>

                  <div className="absolute top-1/2 -left-2 -translate-y-1/2 border-y-8 border-y-transparent border-r-8 border-r-white"></div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${getStrengthColor()}`} style={{ width: `${(score / 5) * 100}%` }}></div>
                  </div>
                  <ul className="flex flex-col gap-1 text-xs text-left text-gray-500 font-medium">
                    {[
                      { k: 'len', t: '12 caractères min.' },
                      { k: 'upper', t: '1 Majuscule' },
                      { k: 'lower', t: '1 Minuscule' },
                      { k: 'num', t: '1 Chiffre' },
                      { k: 'spec', t: '1 Caractère spécial' }
                    ].map((item) => (
                      <li key={item.k} className={`flex items-center gap-2 transition-colors duration-300 ${criteria[item.k] ? 'text-green-500' : 'text-gray-400'}`}>
                        <span>{criteria[item.k] ? '✔' : '✖'}</span> {item.t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="relative">
                <input
                  type="password" name="confirmPassword" placeholder=" "
                  className={getInputClass('confirmPassword')}
                  onChange={handleChange} required
                />
                <label className={`input-label ${errors.confirmPassword ? 'text-red-500' : ''}`}>Confirmation</label>

                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 ml-2 font-medium">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}

          {view === 'forgot' && (
            <div className="relative">
              <p className="text-sm text-gray-600 mb-4 text-center">Entrez votre email pour recevoir un lien de réinitialisation.</p>
              <div className="relative">
                <input type="email" name="email" placeholder=" " className="input-field" onChange={handleChange} required />
                <label className="input-label">Votre Email</label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 rounded-xl text-white font-bold text-lg bg-linear-to-r from-[#cdb4db] to-[#a2d2ff] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 tracking-wide cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              view === 'login' ? 'Connexion' : view === 'register' ? "S'inscrire" : 'Envoyer'
            )}
          </button>

        </form>

        <div className="mt-8 text-sm text-gray-600 font-medium">
          {view === 'login' && (
            <p>Pas encore de compte ? <button onClick={() => { setView('register'); setErrors({}); }} className="text-[#7b68ee] font-bold hover:underline ml-1 cursor-pointer">Créer un compte</button></p>
          )}
          {(view === 'register' || view === 'forgot') && (
            <p>Déjà membre ? <button onClick={() => { setView('login'); setErrors({}); }} className="text-[#7b68ee] font-bold hover:underline ml-1 cursor-pointer">Se connecter</button></p>
          )}
        </div>
      </div>
    </main>
  );
}