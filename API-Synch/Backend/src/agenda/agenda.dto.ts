//DTOs para eventos, presença e notificações

export interface CriarEventoDto {
  titulo: string;
  desc: string;
  data_ini: Date;
  duracao_h: number;
  link: string;
  organizador_id: number;
}

export interface PresencaDto {
  func_id: number;
  presente: boolean;
  razao_recusa?: string;
}

export interface ConvidadoDto {
  func_id: number;
}

export interface NotificacaoDto {
  titulo: string;
  corpo?: string;
  prioridade?: string;
}
