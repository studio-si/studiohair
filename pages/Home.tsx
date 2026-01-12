
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { 
  Scissors, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  Calendar,
  ArrowUpRight,
  X,
  DollarSign,
  Info,
  CalendarCheck,
  MapPin,
  Phone,
  MessageCircle,
  Clock3
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Appointment, Service, BusinessHours } from '../types';

interface SalonInfo {
  displayName: string;
  endereco: string;
  logoUrl: string;
  telefone: string;
}

const Home: React.FC = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();
  
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [salonInfo, setSalonInfo] = useState<SalonInfo | null>(null);
  const [horarios, setHorarios] = useState<Record<string, BusinessHours> | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState(user?.displayName?.split(' ')[0] || 'Cliente');
  
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);

  useEffect(() => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    // 1. Monitorar Próximo Agendamento
    const qApp = query(
      collection(db, "appointments"),
      where("clienteId", "==", user.uid)
    );

    const unsubApp = onSnapshot(qApp, (snap) => {
      const appointments = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      const futureApps = appointments
        .filter(app => app.dataAgendamento >= today && app.status !== 'Cancelado')
        .sort((a, b) => {
          const dateCompare = a.dataAgendamento.localeCompare(b.dataAgendamento);
          if (dateCompare !== 0) return dateCompare;
          return a.horaAgendamento.localeCompare(b.horaAgendamento);
        });
      setNextAppointment(futureApps.length > 0 ? futureApps[0] : null);
    });

    // 2. Buscar Serviços
    const qServ = query(collection(db, "servicos"), where("status", "==", true), limit(8));
    getDocs(qServ).then(snap => {
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });

    // 3. Buscar Informações do Salão e Horários
    const fetchSalonData = async () => {
      const infoDoc = await getDoc(doc(db, "configuracoes", "infoSalao"));
      if (infoDoc.exists()) setSalonInfo(infoDoc.data() as SalonInfo);

      const hoursDoc = await getDoc(doc(db, "configuracoes", "horarios"));
      if (hoursDoc.exists()) setHorarios(hoursDoc.data() as Record<string, BusinessHours>);
      
      setLoading(false);
    };

    fetchSalonData();

    return () => unsubApp();
  }, [user]);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  const getWhatsAppLink = (phone: string) => {
    const cleanNumber = phone.replace(/\D/g, '');
    return `https://wa.me/55${cleanNumber}`;
  };

  const dayNames: Record<string, string> = {
    segunda: 'Segunda',
    terca: 'Terça',
    quarta: 'Quarta',
    quinta: 'Quinta',
    sexta: 'Sexta',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  const orderedDays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

  return (
    <div className="pb-24 space-y-10 animate-in fade-in duration-1000">
      {/* Header */}
      <header className="flex items-center justify-between px-1">
        <div>
          <p className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.3em] mb-1">Bem-vinda de volta</p>
          <h1 className="text-3xl font-serif text-gray-800 leading-tight">
            Olá, <span className="text-rose-500 italic">{userName}</span>
          </h1>
        </div>
        <button 
          onClick={() => navigate('/profile')}
          className="relative w-14 h-14 p-1 bg-white rounded-2xl shadow-sm border border-rose-50 hover:scale-105 transition-transform"
        >
          <img 
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${userName}&background=fff1f2&color=f43f5e&rounded=true`} 
            className="w-full h-full rounded-xl object-cover"
            alt="Perfil"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
        </button>
      </header>

      {/* Hero: Próximo Agendamento */}
      <section className="relative">
        {nextAppointment ? (
          <div className="bg-white rounded-[2.5rem] p-7 border border-rose-100 shadow-[0_20px_40px_-15px_rgba(244,63,94,0.1)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <Calendar size={120} />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-rose-50 text-rose-500 p-2 rounded-lg">
                <Sparkles size={16} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sua próxima visita</span>
            </div>

            <div className="flex justify-between items-end relative z-10">
              <div>
                <h2 className="text-2xl font-serif text-gray-800 mb-1">{nextAppointment.servicoNome}</h2>
                <div className="flex items-center gap-4 text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-rose-300" />
                    <span className="text-xs font-medium">{formatDate(nextAppointment.dataAgendamento)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-rose-300" />
                    <span className="text-xs font-medium">{nextAppointment.horaAgendamento}h</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewingAppointment(nextAppointment)}
                className="bg-rose-500 text-white p-4 rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all active:scale-95"
              >
                <ArrowUpRight size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => navigate('/booking')}
            className="bg-gradient-to-br from-rose-400 to-rose-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-rose-100 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-700">
              <Scissors size={140} />
            </div>
            <h2 className="text-2xl font-serif mb-2 relative z-10 italic">Realçar sua beleza?</h2>
            <p className="text-rose-50 text-xs mb-6 opacity-90 relative z-10">Agende agora um horário e sinta-se maravilhosa.</p>
            <div className="bg-white/20 backdrop-blur-md inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest relative z-10 border border-white/30">
              Novo Agendamento
            </div>
          </div>
        )}
      </section>

      {/* Vitrine de Serviços */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-serif text-gray-800 italic">Nossos Serviços</h3>
          <Link to="/booking" className="text-[10px] font-bold text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors">Marcar horário</Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-6 px-1 snap-x custom-scrollbar">
          {services.map((service) => (
            <div 
              key={service.id}
              onClick={() => setViewingService(service)}
              className="min-w-[180px] bg-white p-5 rounded-[2.2rem] border border-rose-50 shadow-sm hover:shadow-md transition-all cursor-pointer snap-start group"
            >
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-400 mb-4 group-hover:bg-rose-500 group-hover:text-white transition-all">
                <Scissors size={20} />
              </div>
              <h4 className="font-bold text-gray-700 text-sm mb-1 truncate">{service.displayName}</h4>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-4">{service.duracao} min</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-rose-400 font-serif font-bold">R$ {service.valorServico.toFixed(2).replace('.', ',')}</span>
                <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center text-rose-300">
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seção Sobre o Studio e Horários */}
      <section className="bg-white rounded-[3rem] border border-rose-50 p-8 shadow-sm space-y-10 animate-in fade-in duration-1000">
        {salonInfo && (
          <div className="space-y-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-[2rem] p-4 mb-4">
                <img src={salonInfo.logoUrl} alt="Logo Salão" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-2xl font-serif text-gray-800 italic">{salonInfo.displayName}</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-300 shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-0.5">Endereço</p>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed">{salonInfo.endereco}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-300 shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-0.5">Contato</p>
                    <p className="text-sm text-gray-600 font-bold">{salonInfo.telefone}</p>
                  </div>
                </div>
                <a 
                  href={getWhatsAppLink(salonInfo.telefone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white p-3 rounded-2xl shadow-lg shadow-green-100 flex items-center gap-2 hover:bg-green-600 transition-all active:scale-95"
                >
                  <MessageCircle size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest pr-1">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {horarios && (
          <div className="pt-8 border-t border-rose-50">
            <div className="flex items-center gap-2 mb-6">
              <Clock3 size={16} className="text-rose-300" />
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Horários de Funcionamento</h4>
            </div>
            
            <div className="grid gap-3">
              {orderedDays.map((dayKey) => {
                const config = horarios[dayKey];
                if (!config) return null;
                
                return (
                  <div key={dayKey} className="flex items-center justify-between text-xs px-2">
                    <span className="text-gray-500 font-medium">{dayNames[dayKey]}</span>
                    {config.active ? (
                      <span className="text-gray-800 font-bold bg-rose-50/50 px-3 py-1 rounded-full">
                        {config.open}h — {config.close}h
                      </span>
                    ) : (
                      <span className="text-rose-300 italic font-medium px-3 py-1">Fechado</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Footer Final */}
      <section className="text-center px-6 py-4 opacity-50">
        <p className="text-gray-400 text-[10px] italic mb-2">"A sua beleza é o nosso compromisso diário."</p>
        <div className="flex justify-center gap-1">
          <Sparkles size={10} className="text-rose-200" fill="currentColor" />
        </div>
      </section>

      {/* Modal de Detalhes do Agendamento */}
      {viewingAppointment && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif text-gray-800 italic">Detalhes da Visita</h2>
              <button onClick={() => setViewingAppointment(null)} className="p-2 bg-rose-50 text-rose-300 rounded-full hover:bg-rose-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 mb-10">
              <DetailItem icon={<Scissors size={18}/>} label="Serviço" value={viewingAppointment.servicoNome || 'Serviço'} />
              <div className="grid grid-cols-2 gap-4">
                <DetailItem icon={<Calendar size={18}/>} label="Data" value={viewingAppointment.dataAgendamento.split('-').reverse().join('/')} />
                <DetailItem icon={<Clock size={18}/>} label="Horário" value={`${viewingAppointment.horaAgendamento}h`} />
              </div>
              <DetailItem icon={<DollarSign size={18}/>} label="Valor Estimado" value={`R$ ${viewingAppointment.valorAgendamento.toFixed(2).replace('.', ',')}`} highlight />
              
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Info size={10} /> Observações
                </p>
                <p className="text-xs text-gray-500 italic">
                  {viewingAppointment.observacao || "Nenhuma informação adicional."}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setViewingAppointment(null)}
              className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold text-[10px] tracking-[0.2em] uppercase shadow-lg shadow-rose-100"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Widget de Detalhes do Serviço */}
      {viewingService && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-4">
                <Scissors size={28} />
              </div>
              <button onClick={() => setViewingService(null)} className="p-2 bg-rose-50 text-rose-300 rounded-full">
                <X size={20} />
              </button>
            </div>

            <h2 className="text-2xl font-serif text-gray-800 mb-2">{viewingService.displayName}</h2>
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-rose-50 text-rose-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{viewingService.duracao} minutos</span>
              <span className="text-rose-400 font-serif font-bold text-lg">R$ {viewingService.valorServico.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="mb-8 p-5 bg-rose-50/30 rounded-[2rem] border border-rose-50">
              <p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest mb-2">Sobre este serviço</p>
              <p className="text-gray-500 text-sm italic leading-relaxed">
                {viewingService.descricao || "Um cuidado especial para realçar sua beleza natural com as melhores técnicas do Studio Simone."}
              </p>
            </div>

            <button 
              onClick={() => {
                const serviceToBook = viewingService;
                setViewingService(null);
                navigate('/booking', { state: { selectedService: serviceToBook } });
              }}
              className="w-full py-5 bg-rose-500 text-white rounded-[1.8rem] font-bold flex items-center justify-center gap-3 shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all active:scale-95"
            >
              Agendar este serviço <CalendarCheck size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem: React.FC<{ icon: React.ReactNode, label: string, value: string, highlight?: boolean }> = ({ icon, label, value, highlight }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-300">
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{label}</p>
      <p className={`font-bold text-sm ${highlight ? 'text-rose-500' : 'text-gray-700'}`}>{value}</p>
    </div>
  </div>
);

export default Home;
