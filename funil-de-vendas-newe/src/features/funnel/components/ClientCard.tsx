import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Negotiation } from '../types';

interface ClientCardProps {
  negotiation: Negotiation;
}

export const ClientCard: React.FC<ClientCardProps> = ({ negotiation }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: negotiation.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 mb-2 rounded shadow cursor-grab active:cursor-grabbing"
    >
      <h3 className="font-bold">{negotiation.client.nome}</h3>
      <p>{negotiation.client.email}</p>
      <p>Última movimentação: {new Date(negotiation.dataMovimentacao).toLocaleDateString()}</p>
    </div>
  );
};