import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ClientCard } from './ClientCard';
import type { ColumnData } from '../types';

interface FunnelColumnProps {
  column: ColumnData;
}

export const FunnelColumn: React.FC<FunnelColumnProps> = ({ column }) => {
  const { setNodeRef } = useDroppable({
    id: column.stage.id,
  });

  return (
    <div className="bg-gray-100 p-4 rounded w-80 min-h-96">
      <h2 className="font-bold mb-4">{column.stage.estagioNome}</h2>
      <div ref={setNodeRef} className="space-y-2">
        <SortableContext items={column.negotiations.map((n) => n.id)} strategy={verticalListSortingStrategy}>
          {column.negotiations.map((negotiation) => (
            <ClientCard key={negotiation.id} negotiation={negotiation} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};