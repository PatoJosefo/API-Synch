export interface FunnelStage {
  id: number;
  estagioNome: string;
}

export interface Client {
  id: number;
  nome: string; 
  email?: string;
  telefone?: string;
  
}

export interface Negotiation {
  id: number; 
  client: Client;
  currentStage: FunnelStage;
  dataMovimentacao: Date;
}

export interface ColumnData {
  stage: FunnelStage;
  negotiations: Negotiation[];
}