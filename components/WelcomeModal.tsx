
import React from 'react';
import { X, Heart, Sparkles } from 'lucide-react';

interface WelcomeModalProps {
  userName: string;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ userName, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#fffafb]/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden relative shadow-[0_40px_100px_-20px_rgba(244,63,94,0.2)] border border-rose-50 animate-in zoom-in duration-700">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-rose-200 hover:text-rose-400 transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="pt-14 pb-10 flex flex-col items-center text-center px-8">
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-rose-100 rounded-[2rem] rotate-12 blur-2xl opacity-40 animate-pulse"></div>
            <img 
              src="https://i.ibb.co/cKbP5rdD/perfil.png" 
              alt="Simone" 
              className="w-28 h-28 rounded-[2rem] border-4 border-white shadow-xl relative z-10 object-cover rotate-[-3deg]"
            />
            <div className="absolute -bottom-3 -right-3 bg-white p-3 rounded-full shadow-lg z-20">
              <Sparkles className="text-rose-400" size={20} />
            </div>
          </div>

          <h2 className="text-3xl font-serif text-gray-800 mb-4 tracking-tight">
            Olá, <span className="text-rose-400 italic">{userName}</span>
          </h2>
          
          <p className="text-gray-400 text-sm leading-relaxed mb-10 italic">
            "Cuidar de você é o que nos move. Sinta-se em casa no nosso universo de beleza e bem-estar."
          </p>

          <button 
            onClick={onClose}
            className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-[1.5rem] font-bold shadow-lg shadow-rose-100 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Vamos começar <Heart size={16} fill="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
