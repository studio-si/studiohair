
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Appointments from './pages/Appointments';
import Profile from './pages/Profile';
import Booking from './pages/Booking';
import Navbar from './components/Navbar';
import WelcomeModal from './components/WelcomeModal';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser((prevUser) => {
        // Mostra o modal apenas se o usuário está logando agora (de null para algo)
        if (currentUser && !prevUser) {
          setShowWelcome(true);
        }
        return currentUser;
      });
      setLoading(false);
    });
    return () => unsubscribe();
  }, []); // Dependência vazia garante que o listener seja criado apenas uma vez

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fffafb]">
        <div className="flex flex-col items-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-rose-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                <img src="https://i.ibb.co/wh62vzvP/logo.png" alt="Logo" className="w-24 h-24 relative z-10 animate-bounce duration-[2000ms]" />
            </div>
            <p className="text-rose-300 font-serif italic text-lg animate-pulse">Simone Studio Hair...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#fffafb] flex flex-col font-sans selection:bg-rose-100 selection:text-rose-600">
        {user && <Navbar />}
        <main className={`flex-grow ${user ? 'pb-32 pt-6 px-5 max-w-lg mx-auto w-full' : ''}`}>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
            <Route path="/appointments" element={user ? <Appointments /> : <Navigate to="/login" />} />
            <Route path="/booking" element={user ? <Booking /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            
            <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
          </Routes>
        </main>

        {showWelcome && user && (
            <WelcomeModal 
                userName={user.displayName || user.email?.split('@')[0] || 'Cliente'} 
                onClose={() => setShowWelcome(false)} 
            />
        )}
      </div>
    </HashRouter>
  );
};

export default App;
