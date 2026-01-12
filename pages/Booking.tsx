
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ChevronLeft, Scissors, Clock, Calendar as CalendarIcon, Loader2, ArrowRight, CalendarDays } from 'lucide-react';
import { Service, BusinessHours, Appointment } from '../types';

const Booking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editAppointment as Appointment | undefined;

  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const dateInputRef = useRef<HTMLInputElement>(null);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchServices = async () => {
      const q = query(collection(db, "servicos"), where("status", "==", true));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setServices(list);

      if (editData) {
        const service = list.find(s => s.id === editData.servicoId);
        if (service) setSelectedService(service);
        setSelectedDate(editData.dataAgendamento);
        setSelectedTime(editData.horaAgendamento);
        setObservacao(editData.observacao || '');
      }
    };
    fetchServices();
  }, [editData]);

  const addMinutes = (time: string, minutes: number) => {
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + minutes, 0);
    return date.toTimeString().slice(0, 5);
  };

  const validateBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    try {
      setLoading(true);

      const holidayDoc = await getDoc(doc(db, "configuracoes", "holiday"));
      if (holidayDoc.exists()) {
        const holidays = holidayDoc.data();
        const holidayOnDate = holidays[selectedDate];
        if (holidayOnDate && holidayOnDate.ativo === true) {
          throw new Error(`O salão estará fechado em ${selectedDate.split('-').reverse().join('/')}${holidayOnDate.motivo ? ': ' + holidayOnDate.motivo : ''}.`);
        }
      }

      const daysMap = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
      const dayOfWeekName = daysMap[new Date(selectedDate + 'T00:00:00').getDay()];
      
      const hoursDoc = await getDoc(doc(db, "configuracoes", "horarios"));
      if (hoursDoc.exists()) {
        const config = hoursDoc.data();
        const dayConfig = config[dayOfWeekName] as BusinessHours;

        if (!dayConfig || dayConfig.active === false) {
          const diaFormatado = new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long' });
          throw new Error(`O salão não abre aos ${diaFormatado}s.`);
        }

        if (selectedTime < dayConfig.open || selectedTime >= dayConfig.close) {
          throw new Error(`Horário indisponível. Funcionamos das ${dayConfig.open}h às ${dayConfig.close}h.`);
        }
      }

      const horaFinal = addMinutes(selectedTime, selectedService.duracao);
      const q = query(
        collection(db, "appointments"),
        where("dataAgendamento", "==", selectedDate)
      );
      
      const querySnapshot = await getDocs(q);
      const conflicts = querySnapshot.docs.some(doc => {
        const app = doc.data() as Appointment;
        if (editData && doc.id === editData.id) return false;
        if (app.status === 'Cancelado') return false;
        
        return (selectedTime < app.horaFinal && horaFinal > app.horaAgendamento);
      });

      if (conflicts) {
        throw new Error("Desculpe, este horário já está reservado por outra cliente.");
      }

      const appointmentData = {
        clienteId: user?.uid,
        dataAgendamento: selectedDate,
        horaAgendamento: selectedTime,
        horaFinal: horaFinal,
        servicoId: selectedService.id,
        servicoNome: selectedService.displayName,
        valorAgendamento: selectedService.valorServico,
        status: editData ? editData.status : "Aguardando confirmação",
        observacao: observacao,
        updatedAt: serverTimestamp()
      };

      if (editData) {
        await updateDoc(doc(db, "appointments", editData.id), appointmentData);
      } else {
        await addDoc(collection(db, "appointments"), {
          ...appointmentData,
          createdAt: serverTimestamp()
        });
      }

      setModalType('success');
      setTimeout(() => navigate('/appointments'), 3000);

    } catch (err: any) {
      setErrorMessage(err.message || "Não foi possível completar o agendamento.");
      setModalType('error');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 8; h <= 20; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => step > 1 ? setStep(step - 1) : navigate(-1);

  return (
    <div className="pb-10 relative">
      <header className="flex items-center gap-6 mb-12 pt-4">
        <button onClick={handleBack} className="p-3 bg-white border border-rose-50 text-rose-300 rounded-2xl shadow-sm hover:text-rose-500 transition-all">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-serif text-gray-800 italic">{editData ? 'Editar Agendamento' : 'Novo Agendamento'}</h1>
          <p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">Passo {step} de 4</p>
        </div>
      </header>

      {/* Passo 1: Serviço */}
      {step === 1 && (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
          <h3 className="text-lg font-serif text-gray-700 px-1">O que vamos fazer hoje?</h3>
          <div className="grid gap-4">
            {services.map((s) => (
              <button 
                key={s.id}
                onClick={() => { setSelectedService(s); handleNext(); }}
                className={`w-full bg-white p-6 rounded-[2.5rem] border shadow-sm flex items-center justify-between group transition-all text-left ${selectedService?.id === s.id ? 'border-rose-300 ring-2 ring-rose-50' : 'border-rose-50 hover:border-rose-300'}`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${selectedService?.id === s.id ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-300 group-hover:bg-rose-500 group-hover:text-white'}`}>
                    <Scissors size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700">{s.displayName}</h4>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{s.duracao} minutos</p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] text-gray-300 uppercase font-bold tracking-widest mb-1">Valor</p>
                    <span className="font-serif text-rose-400 font-bold text-lg">R$ {s.valorServico.toFixed(2).replace('.', ',')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Passo 2: Data */}
      {step === 2 && (
        <div className="space-y-8 animate-in slide-in-from-right duration-500 text-center">
          <h3 className="text-lg font-serif text-gray-700">Escolha uma data</h3>
          <div className="bg-white p-10 rounded-[3rem] border border-rose-50 shadow-sm w-full flex flex-col items-center">
            
            <div className="relative w-full group">
                {/* Ícone customizado de alto contraste que substitui o visual do nativo */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-700 pointer-events-none z-10">
                    <CalendarDays size={24} />
                </div>
                
                <input 
                  type="date" 
                  ref={dateInputRef}
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-center text-rose-700 font-serif text-2xl focus:outline-none bg-rose-50/40 rounded-[2rem] py-6 pl-12 pr-6 border border-rose-100 cursor-pointer shadow-inner relative z-0"
                />
            </div>
            
            <p className="mt-6 text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] px-4">Toque no campo acima para abrir o calendário do seu dispositivo</p>
            
            {selectedDate && (
              <button 
                onClick={handleNext}
                className="mt-10 w-full py-5 bg-rose-500 text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-rose-100 animate-in fade-in zoom-in duration-300"
              >
                Confirmar Data <ArrowRight size={14} className="inline ml-2" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Passo 3: Horário */}
      {step === 3 && (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
          <h3 className="text-lg font-serif text-gray-700 text-center">Em qual horário?</h3>
          <div className="grid grid-cols-3 gap-3">
            {generateTimeSlots().map((hora) => (
              <button 
                key={hora}
                onClick={() => { setSelectedTime(hora); handleNext(); }}
                className={`py-4 rounded-2xl font-bold text-sm transition-all shadow-sm border ${
                    selectedTime === hora ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-500 border-rose-50 hover:border-rose-200'
                }`}
              >
                {hora}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Passo 4: Revisão */}
      {step === 4 && (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
          <div className="bg-white p-8 rounded-[3rem] border border-rose-100 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Scissors size={120} />
            </div>
            <h3 className="text-xl font-serif text-gray-800 italic text-center">Confirmar Agendamento</h3>
            
            <div className="space-y-5 relative z-10">
              <ReviewRow label="Serviço" value={selectedService?.displayName} />
              <ReviewRow label="Data" value={selectedDate.split('-').reverse().join('/')} />
              <ReviewRow label="Início" value={`${selectedTime}h`} />
              <ReviewRow label="Valor" value={`R$ ${selectedService?.valorServico.toFixed(2).replace('.', ',')}`} color="text-rose-400" />
            </div>

            <div className="pt-4 border-t border-rose-50">
              <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-2 mb-2 block">Informações Adicionais</label>
              <textarea 
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex: Gostaria de lavar o cabelo antes..."
                className="w-full bg-rose-50/30 border border-rose-50 rounded-2xl p-4 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-100 h-32 resize-none"
              />
            </div>
          </div>

          <button 
            onClick={validateBooking}
            disabled={loading}
            className="w-full py-5 bg-rose-500 text-white rounded-[2rem] font-bold shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
                <>
                    {editData ? 'Salvar Alterações' : 'Finalizar Agendamento'} <ArrowRight size={18} />
                </>
            )}
          </button>
        </div>
      )}

      {/* Modais de Status */}
      {modalType === 'success' && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-white/95 backdrop-blur-md animate-in fade-in duration-500">
          <div className="text-center animate-in zoom-in duration-700">
            <img src="https://i.ibb.co/hRZrgFf7/agendando.png" alt="Sucesso" className="w-56 h-56 mx-auto mb-10 object-contain drop-shadow-xl" />
            <h2 className="text-3xl font-serif text-gray-800 mb-4 italic">Tudo pronto!</h2>
            <p className="text-gray-400 text-sm italic">Seu horário foi {editData ? 'atualizado' : 'reservado'} com carinho.</p>
          </div>
        </div>
      )}

      {modalType === 'error' && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-rose-50/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-sm text-center shadow-2xl border border-rose-100 animate-in zoom-in duration-500">
            <img src="https://i.ibb.co/ycqGJL4R/decepcao.png" alt="Erro" className="w-32 h-32 mx-auto mb-8 object-contain" />
            <h2 className="text-2xl font-serif text-gray-800 mb-4 italic text-rose-500">Ops, desculpe...</h2>
            <p className="text-gray-400 text-xs mb-10 leading-relaxed px-4">{errorMessage}</p>
            <button 
              onClick={() => setModalType(null)}
              className="w-full py-4 bg-rose-400 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-rose-100 transition-all active:scale-95"
            >
              Escolher outro horário
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ReviewRow: React.FC<{ label: string, value?: string, color?: string }> = ({ label, value, color }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-400 font-bold uppercase text-[9px] tracking-widest">{label}</span>
    <span className={`font-bold ${color || 'text-gray-700'}`}>{value}</span>
  </div>
);

export default Booking;
