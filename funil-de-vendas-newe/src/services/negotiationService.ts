 import axios from 'axios';
import type { Negotiation } from '../features/funnel/types';


export const fetchNegotiations = async (): Promise<Record<string, Negotiation[]>> => {
  try {
    const response = await axios.get('/api/negotiations'); 
    return response.data; 
  } catch (error) {
    console.error('Erro ao buscar negociações:', error);
    throw error;
  }
};


export const updateNegotiationStatus = async (negotiationId: number, newStageId: number): Promise<void> => {
  try {
    await axios.patch(`/api/negotiations/${negotiationId}`, { funilId: newStageId });
  } catch (error) {
    console.error('Erro ao atualizar negociação:', error);
    throw error;
  }
};