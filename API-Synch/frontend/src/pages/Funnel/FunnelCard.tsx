import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface FunnelCardProps {
    cliente: {
        id: number;
        nome: string;
        endereco: string;
    };
    onClick?: () => void;
}

export default function FunnelCard({ cliente, onClick }: FunnelCardProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `cliente-${cliente.id}`,
        data: {
            type: "Cliente",
            cliente,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div
            ref={setNodeRef}
            style={{ ...style, touchAction: 'pan-x' }}
            {...listeners}
            {...attributes}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
            onClick={(e) => {
                // Only trigger onClick if not dragging
                if (onClick && !transform) {
                    onClick();
                }
            }}
        >
            <h4 className="font-semibold text-gray-800">{cliente.nome}</h4>
            <p className="text-sm text-gray-500 mt-1 truncate">{cliente.endereco}</p>
        </div>
    );
}
