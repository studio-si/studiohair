import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, getSalonInfo } from '../firebase';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [salonInfo, setSalonInfo] = useState({ displayName: 'Simone Studio Hair', logoUrl: 'https://i.ibb.co/wh62vzvP/logo.png' });
  const navigate = useNavigate();

  useEffect(() => {
    getSalonInfo().then(info => setSalonInfo(info as any));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError('E-mail ou senha incorretos. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#fffafb]">
      <div className="w-full max-w-sm animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="relative inline-block p-6 bg-white rounded-[3rem] shadow-[0_20px_50px_-15px_rgba(244,63,94,0.1)] mb-8 border border-rose-50/50">
            <img src={salonInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-4xl font-serif text-gray-800 mb-2 tracking-tight italic">{salonInfo.displayName}</h1>
          <p className="text-rose-300 font-medium text-sm tracking-[0.1em] uppercase">Sua essência, nossa arte</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-200 group-focus-within:text-rose-400 transition-colors">
              <Mail size={18} />
            </span>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-rose-100/60 rounded-[1.8rem] py-5 pl-14 pr-4 text-gray-700 focus:outline-none focus:ring-4 focus:ring-rose-50/40 transition-all placeholder:text-gray-200 shadow-sm"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-200 group-focus-within:text-rose-400 transition-colors">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-rose-100/60 rounded-[1.8rem] py-5 pl-14 pr-14 text-gray-700 focus:outline-none focus:ring-4 focus:ring-rose-50/40 transition-all placeholder:text-gray-200 shadow-sm"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-rose-200 hover:text-rose-400 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="text-right px-2">
              {/* Removed invalid 'size' prop from Link */}
              <Link to="/forgot-password" className="text-[10px] font-bold text-rose-200 hover:text-rose-400 uppercase tracking-widest transition-colors">
                Esqueci minha senha
              </Link>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs text-center font-medium bg-red-50/50 py-3 rounded-2xl border border-red-100/50">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-300 to-rose-400 hover:from-rose-400 hover:to-rose-500 text-white rounded-[1.8rem] py-5 font-bold shadow-[0_15px_35px_-10px_rgba(244,63,94,0.25)] transition-all active:scale-[0.97] flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                Entrar <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-14 text-center">
          <p className="text-gray-300 text-sm">
            Novo por aqui?{' '}
            <Link to="/register" className="text-rose-300 font-bold hover:text-rose-500 transition-colors underline underline-offset-4 decoration-rose-100">
              Crie sua conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;