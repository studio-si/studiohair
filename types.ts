
export interface SalonInfo {
  displayName: string;
  logoUrl: string;
}

export interface Service {
  id: string;
  displayName: string; // Nome do serviço
  duracao: number; // minutos
  valorServico: number; // preço
  descricao: string;
  status: boolean; // Ativo/Inativo
  createdAt: number;
}

export interface Appointment {
  id: string;
  clienteId: string;
  dataAgendamento: string; // YYYY-MM-DD
  horaAgendamento: string; // HH:MM
  horaFinal: string; // HH:MM
  servicoId: string;
  servicoNome?: string; // Cache para exibição
  valorAgendamento: number;
  status: 'Aguardando confirmação' | 'Confirmado' | 'Cancelado' | 'Concluído';
  observacao: string;
  createdAt: any;
}

export interface BusinessHours {
  active: boolean;
  open: string;
  close: string;
}

export interface HolidayData {
  ativo: boolean;
  nome: string;
}
