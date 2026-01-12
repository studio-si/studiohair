
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, ChevronLeft, Loader2, CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      setError('E-mail não encontrado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-rose-50/50">
      <div className="w-full max-w-sm">
        <Link to="/login" className="inline-flex items-center text-rose-400 font-medium text-sm mb-8 hover:text-rose-500">
          <ChevronLeft size={20} /> Voltar ao login
        </Link>

        {sent ? (
          <div className="bg-white p-8 rounded-[2.5rem] text-center shadow-soft border border-rose-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6">
              <CheckCircle className="text-green-500" size={40} />
            </div>
            <h2 className="text-2xl font-serif text-gray-800 mb-4">E-mail enviado!</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Enviamos as instruções para recuperação de senha no e-mail <strong>{email}</strong>.
            </p>
            <Link to="/login" className="block w-full py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-100 transition-all">
              Voltar ao Início
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-serif text-gray-800 mb-2">Recuperar senha</h1>
              <p className="text-gray-500 text-sm">Não se preocupe, vamos te ajudar</p>
            </div>

            <form onSubmit={handleReset} className="space-y-6">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  placeholder="Seu e-mail cadastrado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-rose-100 rounded-2xl py-4 pl-12 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
                  required
                />
              </div>

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-2xl py-4 font-bold shadow-lg shadow-rose-100 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Enviar link de recuperação'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
