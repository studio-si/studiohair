
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { Calendar, Clock, Scissors, X, DollarSign, Info, Filter, Plus, Edit3 } from 'lucide-react';
import { Appointment, Service } from '../types';
import { useNavigate } from 'react-router-dom';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterService, setFilterService] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    getDocs(query(collection(db, "servicos"), where("status", "==", true)))
      .then(snap => {
        setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
      });

    const q = query(
      collection(db, "appointments"),
      where("clienteId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      
      const sortedList = list.sort((a, b) => {
        const dateCompare = b.dataAgendamento.localeCompare(a.dataAgendamento);
        if (dateCompare !== 0) return dateCompare;
        return b.horaAgendamento.localeCompare(a.horaAgendamento);
      });

      setAppointments(sortedList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredAppointments = appointments.filter(app => {
    const matchesDate = !filterDate || app.dataAgendamento === filterDate;
    const matchesService = !filterService || app.servicoId === filterService;
    return matchesDate && matchesService;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmado': return 'bg-green-50 text-green-500 border-green-100';
      case 'Cancelado': return 'bg-red-50 text-red-400 border-red-100';
      case 'Concluído': return 'bg-blue-50 text-blue-400 border-blue-100';
      default: return 'bg-rose-50 text-rose-300 border-rose-100';
    }
  };

  const handleEdit = (app: Appointment) => {
    navigate('/booking', { state: { editAppointment: app } });
  };

  return (
    <div className="pb-32 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1 mb-8 pt-4">
        <h1 className="text-3xl font-serif text-gray-800 italic">Meus Agendamentos</h1>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Simone Studio Hair</p>
      </header>

      <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-rose-50 mb-8 space-y-4">
        <div className="flex items-center gap-2 text-rose-300 mb-1">
          <Filter size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Filtrar por</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full bg-rose-50/30 border border-rose-50 rounded-xl py-3 px-3 text-[11px] font-bold text-gray-600 focus:outline-none"
          />
          <select 
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="w-full bg-rose-50/30 border border-rose-50 rounded-xl py-3 px-3 text-[11px] font-bold text-gray-600 focus:outline-none appearance-none"
          >
            <option value="">Todos Serviços</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.displayName}</option>
            ))}
          </select>
        </div>
        {(filterDate || filterService) && (
          <button 
            onClick={() => { setFilterDate(''); setFilterService(''); }}
            className="text-[9px] font-bold text-rose-300 uppercase tracking-widest flex items-center gap-1 mx-auto"
          >
            <X size={10} /> Limpar Filtros
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-rose-200">
          <div className="w-8 h-8 border-3 border-rose-100 border-t-rose-400 rounded-full animate-spin mb-4"></div>
          <p className="font-serif italic text-sm">Carregando agenda...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-20 px-10 bg-white rounded-[3rem] border border-dashed border-rose-100">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-200">
            <Calendar size={32} />
          </div>
          <p className="text-gray-400 text-sm font-medium italic">Nenhum registro encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((app) => (
            <div 
              key={app.id}
              onClick={() => setSelectedAppointment(app)}
              className="bg-white p-5 rounded-[2rem] border border-rose-50 shadow-sm hover:shadow-md hover:border-rose-200 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-300 group-hover:bg-rose-500 group-hover:text-white transition-all">
                  <Scissors size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-700 text-sm">{app.servicoNome || 'Serviço'}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={10} /> {app.dataAgendamento.split('-').reverse().join('/')}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={10} /> {app.horaAgendamento}h
                    </span>
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${getStatusColor(app.status)}`}>
                {app.status}
              </div>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={() => navigate('/booking')}
        className="fixed bottom-28 right-8 w-16 h-16 bg-rose-500 text-white rounded-full shadow-[0_15px_30px_-10px_rgba(244,63,94,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60]"
      >
        <Plus size={28} />
      </button>

      {selectedAppointment && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif text-gray-800 italic">Detalhes</h2>
              <button onClick={() => setSelectedAppointment(null)} className="p-2 bg-rose-50 text-rose-300 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 mb-10">
              <DetailRow icon={<Scissors size={18}/>} label="Serviço" value={selectedAppointment.servicoNome || 'Serviço'} />
              <div className="grid grid-cols-2 gap-4">
                <DetailRow icon={<Calendar size={18}/>} label="Data" value={selectedAppointment.dataAgendamento.split('-').reverse().join('/')} />
                <DetailRow icon={<Clock size={18}/>} label="Horário" value={`${selectedAppointment.horaAgendamento} - ${selectedAppointment.horaFinal}`} />
              </div>
              <DetailRow icon={<DollarSign size={18}/>} label="Valor" value={`R$ ${selectedAppointment.valorAgendamento.toFixed(2).replace('.', ',')}`} highlight />
              
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Info size={10} /> Observações
                </p>
                <p className="text-xs text-gray-500 italic">
                  {selectedAppointment.observacao || "Nenhuma informação adicional enviada."}
                </p>
              </div>

              {selectedAppointment.status === 'Aguardando confirmação' && (
                <button 
                  onClick={() => handleEdit(selectedAppointment)}
                  className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
                >
                  <Edit3 size={14} /> Editar Agendamento
                </button>
              )}
            </div>

            <button 
              onClick={() => setSelectedAppointment(null)}
              className="w-full py-4 bg-rose-50 text-rose-400 rounded-2xl font-bold text-[10px] tracking-[0.2em] uppercase hover:bg-rose-100 transition-colors"
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow: React.FC<{ icon: React.ReactNode, label: string, value: string, highlight?: boolean }> = ({ icon, label, value, highlight }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-300">
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{label}</p>
      <p className={`font-bold text-sm ${highlight ? 'text-rose-400' : 'text-gray-700'}`}>{value}</p>
    </div>
  </div>
);

export default Appointments;
