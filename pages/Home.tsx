
import React from 'react';
import { auth } from '../firebase';
import { Star, Scissors, Sparkles, Clock, ChevronRight, Heart, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const firstName = user?.displayName?.split(' ')[0] || 'Cliente';

  return (
    <div className="pb-12 space-y-12">
      {/* Header Minimalista */}
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-gray-800 leading-tight">
            Olá, <span className="text-rose-400 italic">{firstName}</span>
          </h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">Simone Studio Hair</p>
        </div>
        <div className="relative group cursor-pointer" onClick={() => navigate('/profile')}>
          <div className="absolute inset-0 bg-rose-100 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform opacity-40"></div>
          <img 
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'U'}&background=fff1f2&color=f43f5e&rounded=true`} 
            className="w-14 h-14 rounded-2xl border-2 border-white shadow-soft object-cover relative z-10"
            alt="Avatar"
          />
        </div>
      </header>

      {/* Cartão Fidelidade - Sugestão de Futuro */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-7 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-rose-300 mb-1">Cartão Fidelidade</p>
              <h3 className="text-lg font-serif italic">Seu próximo presente está chegando</h3>
            </div>
            <Gift className="text-rose-400 opacity-50" size={24} />
          </div>
          
          <div className="flex gap-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${i <= 3 ? 'bg-rose-400 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'border-white/10 bg-white/5'}`}>
                {i <= 3 ? <Star size={16} fill="white" /> : <span className="text-xs font-bold text-white/20">{i}</span>}
              </div>
            ))}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-dashed border-rose-300/30 text-rose-300">
                <Heart size={16} />
            </div>
          </div>
          <p className="mt-6 text-[10px] text-gray-400 font-medium tracking-wide">Faltam apenas <span className="text-rose-300 font-bold underline underline-offset-4">2 visitas</span> para ganhar uma hidratação!</p>
        </div>
      </section>

      {/* Banner de Novo Agendamento */}
      <section>
        <div className="bg-white rounded-[2.5rem] p-8 border border-rose-50/50 shadow-[0_20px_50px_-20px_rgba(244,63,94,0.08)] flex justify-between items-center relative overflow-hidden group">
            <div className="relative z-10">
                <h3 className="text-xl font-serif text-gray-800 mb-2 leading-tight">Escolha seu novo <br/><span className="text-rose-400">visual exclusivo</span></h3>
                <button 
                  onClick={() => navigate('/booking')}
                  className="mt-4 flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-widest hover:gap-3 transition-all"
                >
                    Agendar serviço <ChevronRight size={14} />
                </button>
            </div>
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-300 group-hover:scale-110 transition-transform duration-500">
                <Scissors size={40} />
            </div>
        </div>
      </section>

      {/* Tendências / Feed Inspiração */}
      <section>
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="font-serif text-xl text-gray-800">Inspirações da Semana</h3>
          <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">Ver mais</span>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            <InspirationCard img="https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=400&auto=format&fit=crop" label="Loiro Pérola" />
            <InspirationCard img="https://images.unsplash.com/photo-1620331711600-128cff23f5ed?q=80&w=400&auto=format&fit=crop" label="Corte Bob" />
            <InspirationCard img="https://images.unsplash.com/photo-1595476108010-b4d1f8c2b1db?q=80&w=400&auto=format&fit=crop" label="Mechas Mel" />
        </div>
      </section>
    </div>
  );
};

const InspirationCard: React.FC<{ img: string, label: string }> = ({ img, label }) => (
    <div className="min-w-[140px] group cursor-pointer">
        <div className="w-full h-44 rounded-[2rem] overflow-hidden mb-3 shadow-lg shadow-rose-100/20">
            <img src={img} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        </div>
        <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">{label}</p>
    </div>
);

export default Home;
