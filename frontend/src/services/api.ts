import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface EventoData {
  titulo: string;
  desc: string;
  dataIni: string;
  duracaoH: number;
  link: string;
  organizadorId: number;
  convidados: number[];
}

// Interface para a resposta do backend
export interface EventoResponse {
  eventoId: number;
  titulo: string;
  desc: string;
  dataIni: string;
  duracaoH: number;
  link: string;
  statusEvento: string;
  organizador: {
    id: number;
    nome: string;
    email: string;
  };
  participantes?: {  // ADICIONE ISTO
    id: number;
    nome: string;
    email: string;
  }[];
  respostaPresenca: {
    presente: boolean;
    razaoRecusa: string | null;
    dataTermino: string | null;
  } | null;
}

export interface Funcionario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
}

export const eventosAPI = {
  criar: async (data: EventoData) => {
    const response = await api.post('/eventos', data);
    return response.data;
  },
  
  listarPorUsuario: async (funcionarioId: number) => {
    const response = await api.get<EventoResponse[]>(`/eventos/usuario/${funcionarioId}`);
    return response.data;
  },

  deletar: async (eventoId: number) => {
    const response = await api.delete(`/eventos/${eventoId}`);
    return response.data;
  },
};

// Adicione método para listar funcionários
export const funcionariosAPI = {
  listarSimples: async () => {
    const response = await api.get('/funcionarios/lista-simples');
    return response.data;
  },
};

export default api;
