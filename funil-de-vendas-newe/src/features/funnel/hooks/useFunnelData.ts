import { useState, useEffect } from 'react';
import { fetchNegotiations, updateNegotiationStatus } from '../../../services/negotiationService';
import type { ColumnData } from '../types';

export const useFunnelData = () => {
  const [columns, setColumns] = useState<ColumnData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchNegotiations();
        const columnArray: ColumnData[] = Object.entries(data).map(([stageName, negotiations]) => ({
          stage: { id: negotiations[0]?.currentStage.id || 0, estagioNome: stageName }, 
          negotiations,
        }));
        setColumns(columnArray);
      } catch (err) {
        setError('Erro ao carregar dados do funil.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const moveNegotiation = async (negotiationId: number, fromStageId: number, toStageId: number) => {
    try {
      await updateNegotiationStatus(negotiationId, toStageId);
      setColumns((prevColumns) =>
        prevColumns.map((col) => {
          if (col.stage.id === fromStageId) {
            return {
              ...col,
              negotiations: col.negotiations.filter((neg) => neg.id !== negotiationId),
            };
          }
          if (col.stage.id === toStageId) {
            const movedNeg = prevColumns
              .find((c) => c.stage.id === fromStageId)
              ?.negotiations.find((n) => n.id === negotiationId);
            if (movedNeg) {
              return {
                ...col,
                negotiations: [...col.negotiations, { ...movedNeg, currentStage: col.stage }],
              };
            }
          }
          return col;
        })
      );
    } catch (err) {
      setError('Erro ao mover negociação.');
    }
  };

  return { columns, loading, error, moveNegotiation };
};