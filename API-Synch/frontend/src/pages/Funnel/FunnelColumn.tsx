import { useDroppable } from "@dnd-kit/core";
import { Edit2, Trash2 } from "lucide-react";
import FunnelCard from "./FunnelCard";
import { useState } from "react";
import api from "../../services/api";

interface FunnelColumnProps {
    estagio: {
        id: number;
        estagioNome: string;
    };
    clientes: any[];
    onClientClick?: (cliente: any) => void;
    onUpdate: () => void;
}

export default function FunnelColumn({ estagio, clientes, onClientClick, onUpdate }: FunnelColumnProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(estagio.estagioNome);
    const [loading, setLoading] = useState(false);
    const { setNodeRef } = useDroppable({
        id: `estagio-${estagio.id}`,
        data: {
            type: "Estagio",
            estagio,
        },
    });

    const handleEdit = async () => {
        if (!newName.trim()) return;

        setLoading(true);
        try {
            await api.put(`/funis/${estagio.id}`, { estagioNome: newName });
            setIsEditing(false);
            onUpdate();
        } catch (error) {
            console.error("Erro ao atualizar estágio:", error);
            alert("Erro ao atualizar estágio");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (clientes.length > 0) {
            alert(`Não é possível deletar este estágio pois existem ${clientes.length} cliente(s) associado(s).`);
            return;
        }

        if (!confirm(`Tem certeza que deseja deletar o estágio "${estagio.estagioNome}"?`)) {
            return;
        }

        setLoading(true);
        try {
            await api.delete(`/funis/${estagio.id}`);
            onUpdate();
        } catch (error: any) {
            console.error("Erro ao deletar estágio:", error);
            alert(error.response?.data?.message || "Erro ao deletar estágio");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-w-[300px] max-w-[350px] w-full h-full">
            {/* Header da Coluna */}
            <div className="flex items-center justify-between mb-4 p-2 bg-white rounded-lg">
                {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            autoFocus
                        />
                        <button
                            onClick={handleEdit}
                            disabled={loading}
                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                        >
                            Salvar
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setNewName(estagio.estagioNome);
                            }}
                            className="px-2 py-1 bg-gray-300 rounded text-xs hover:bg-gray-400"
                        >
                            Cancelar
                        </button>
                    </div>
                ) : (
                    <>
                        <h3 className="font-bold text-gray-700 text-lg">{estagio.estagioNome}</h3>
                        <div className="flex items-center gap-2">
                            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                {clientes.length}
                            </span>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1 hover:bg-gray-100 rounded transition"
                                title="Editar nome"
                            >
                                <Edit2 size={16} className="text-gray-600" />
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="p-1 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-700/10 rounded transition disabled:opacity-50"
                                title="Deletar estágio"
                            >
                                <Trash2 size={16} className="text-red-600" />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Área de Drop */}
            <div
                ref={setNodeRef}
                className="flex-1 bg-gray-50/50 rounded-2xl p-3 border border-gray-200/50 space-y-3 overflow-y-auto min-h-[200px]"
            >
                {clientes.map((cliente) => (
                    <FunnelCard
                        key={cliente.id}
                        cliente={cliente}
                        onClick={() => onClientClick?.(cliente)}
                    />
                ))}

                {clientes.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm italic border-2 border-dashed border-gray-200 rounded-xl p-4">
                        Arraste aqui
                    </div>
                )}
            </div>
        </div>
    );
}
