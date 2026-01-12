
import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Camera, Loader2, Save, Phone, Mail, CheckCircle2 } from 'lucide-react';

const Profile: React.FC = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [telefone, setTelefone] = useState('');
  const [fotoUrl, setFotoUrl] = useState(user?.photoURL || "https://i.ibb.co/HpCqCTGw/cliente.png");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "clients", user.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDisplayName(data.displayName || user.displayName || '');
          setTelefone(data.telefone || '');
          setFotoUrl(data.fotoUrl || user.photoURL || "https://i.ibb.co/HpCqCTGw/cliente.png");
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 10) {
      value = `${value.slice(0, 10)}-${value.slice(10)}`;
    }
    setTelefone(value);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'clienteSi');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dbxkfyyyu/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        setFotoUrl(data.secure_url);
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao carregar imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !displayName) return;

    setSaving(true);
    setSuccess(false);

    try {
      const userRef = doc(db, "clients", user.uid);
      await setDoc(userRef, {
        displayName,
        telefone,
        fotoUrl,
        email: user.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      await updateProfile(user, {
        displayName,
        photoURL: fotoUrl
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Ocorreu um erro ao salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (window.confirm("Deseja realmente sair do Simone Studio Hair?")) {
        await signOut(auth);
        // O App.tsx detectará a mudança de estado e redirecionará para /login
      }
    } catch (error) {
      console.error("Erro ao sair:", error);
      alert("Erro ao tentar sair da conta.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-300">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="font-serif italic">Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center mb-10 pt-4">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-rose-100 rounded-[2.5rem] rotate-6 scale-95 opacity-50"></div>
          <div className="relative z-10 w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden bg-rose-50">
            <img 
              src={fotoUrl} 
              className={`w-full h-full object-cover transition-opacity duration-500 ${uploading ? 'opacity-30' : 'opacity-100'}`}
              alt="Profile"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center text-rose-400">
                <Loader2 className="animate-spin" />
              </div>
            )}
          </div>
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 p-3 bg-white text-rose-400 rounded-2xl shadow-lg border border-rose-50 hover:scale-110 active:scale-95 transition-all z-20"
          >
            <Camera size={18} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*"
          />
        </div>
        <div className="mt-8">
          <h1 className="text-2xl font-serif text-gray-800 mb-1 italic">Edite seu Perfil</h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Simone Studio Hair</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-5">
          <div className="relative group">
            <label className="text-[10px] font-bold text-rose-300 uppercase tracking-widest ml-4 mb-2 block">Seu Nome Completo</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-200 group-focus-within:text-rose-400 transition-colors">
                <User size={18} />
              </span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nome Completo"
                className="w-full bg-white border border-rose-100/60 rounded-[1.8rem] py-5 pl-14 pr-4 text-gray-700 focus:outline-none focus:ring-4 focus:ring-rose-50/40 transition-all shadow-sm"
                required
              />
            </div>
          </div>

          <div className="relative opacity-60">
            <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-4 mb-2 block">E-mail</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-200">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-gray-50 border border-gray-100 rounded-[1.8rem] py-5 pl-14 pr-4 text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="relative group">
            <label className="text-[10px] font-bold text-rose-300 uppercase tracking-widest ml-4 mb-2 block">WhatsApp / Telefone</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-200 group-focus-within:text-rose-400 transition-colors">
                <Phone size={18} />
              </span>
              <input
                type="text"
                value={telefone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                className="w-full bg-white border border-rose-100/60 rounded-[1.8rem] py-5 pl-14 pr-4 text-gray-700 focus:outline-none focus:ring-4 focus:ring-rose-50/40 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {success && (
          <div className="flex items-center justify-center gap-2 text-green-500 bg-green-50 py-4 rounded-2xl animate-in fade-in zoom-in">
            <CheckCircle2 size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Alterações salvas!</span>
          </div>
        )}

        <div className="pt-4 flex flex-col gap-4">
          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full bg-gradient-to-r from-rose-400 to-rose-500 text-white rounded-[1.8rem] py-5 font-bold shadow-[0_15px_30px_-10px_rgba(244,63,94,0.3)] transition-all active:scale-[0.97] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" /> : (
              <>
                <Save size={18} />
                Salvar alterações
              </>
            )}
          </button>

          <button 
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-5 bg-rose-50/30 text-rose-400 rounded-[1.8rem] font-bold text-xs hover:bg-rose-100/50 transition-all group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            Sair da conta
          </button>
        </div>
      </form>

      <footer className="mt-12 text-center pb-10">
        <p className="text-[10px] text-gray-300 uppercase tracking-widest">
          Simone Studio Hair &copy; 2025
        </p>
      </footer>
    </div>
  );
};

export default Profile;
