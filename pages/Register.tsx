
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, saveClientData } from '../firebase';
import { User, Mail, Lock, Loader2, ChevronLeft, Eye, EyeOff } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Atualiza Perfil no Auth
      await updateProfile(user, { 
        displayName: name,
        photoURL: "https://i.ibb.co/HpCqCTGw/cliente.png" 
      });
      
      // Salva no Firestore na coleção 'clients'
      await saveClientData(user.uid, {
        displayName: name,
        email: email
      });
      
      navigate('/');
    } catch (err: any) {
      setError('Ocorreu um erro ao criar sua conta. Verifique os dados e tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#fffafb]">
      <div className="w-full max-w-sm animate-in slide-in-from-bottom-12 duration-1000">
        <Link to="/login" className="inline-flex items-center text-rose-200 font-bold text-[10px] uppercase tracking-[0.2em] mb-12 hover:text-rose-400 transition-colors">
          <ChevronLeft size={16} className="mr-1" /> Voltar
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-serif text-gray-800 mb-3 tracking-tight italic">Bem-vinda</h1>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-widest opacity-60">Comece sua jornada de beleza</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-200 group-focus-within:text-rose-400 transition-colors">
              <User size={18} />
            </span>
            <input
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-rose-100/60 rounded-[1.8rem] py-5 pl-14 pr-4 text-gray-700 focus:outline-none focus:ring-4 focus:ring-rose-50/40 transition-all shadow-sm"
              required
            />
          </div>

          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-200 group-focus-within:text-rose-400 transition-colors">
              <Mail size={18} />
            </span>
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-rose-100/60 rounded-[1.8rem] py-5 pl-14 pr-4 text-gray-700 focus:outline-none focus:ring-4 focus:ring-rose-50/40 transition-all shadow-sm"
              required
            />
          </div>

          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-200 group-focus-within:text-rose-400 transition-colors">
              <Lock size={18} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Escolha uma senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-rose-100/60 rounded-[1.8rem] py-5 pl-14 pr-14 text-gray-700 focus:outline-none focus:ring-4 focus:ring-rose-50/40 transition-all shadow-sm"
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

          {error && <p className="text-red-400 text-xs text-center font-medium bg-red-50/50 py-3 rounded-2xl border border-red-100/50">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-300 to-rose-400 hover:from-rose-400 hover:to-rose-500 text-white rounded-[1.8rem] py-5 font-bold shadow-[0_15px_35px_-10px_rgba(244,63,94,0.2)] transition-all active:scale-[0.97] flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Criar Minha Conta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
