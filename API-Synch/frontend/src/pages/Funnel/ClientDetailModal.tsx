import { X, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import styles from "./FunnelView.module.css";
import api from "../../services/api";

interface Cliente {
    id: number;
    nome: string;
    endereco: string | null;
    funilId: number;
    observacoes?: string | null;
    valorVenda?: number | null;
    dataVenda?: string | null;
}

interface ClientDetailModalProps {
    cliente: Cliente;
    onClose: () => void;
    onUpdate: () => void;
}

export default function ClientDetailModal({ cliente, onClose, onUpdate }: ClientDetailModalProps) {
    // Format dataVenda from DateTime to YYYY-MM-DD for date input
    const formatDateForInput = (dateString: string | null | undefined) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState({
        nome: cliente.nome,
        endereco: cliente.endereco || "",
        observacoes: cliente.observacoes || "",
        valorVenda: cliente.valorVenda?.toString() || "",
        dataVenda: formatDateForInput(cliente.dataVenda),
    });
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put(`/clientes/${cliente.id}`, {
                nome: formData.nome,
                endereco: formData.endereco || null,
                observacoes: formData.observacoes || null,
                valorVenda: formData.valorVenda ? parseFloat(formData.valorVenda) : null,
                dataVenda: formData.dataVenda || null,
            });

            onUpdate();
            onClose();
        } catch (error) {
            console.error("Erro ao atualizar cliente:", error);
            alert("Erro ao atualizar cliente");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Tem certeza que deseja deletar o cliente "${cliente.nome}"?`)) {
            return;
        }

        setDeleting(true);
        try {
            await api.delete(`/clientes/${cliente.id}`);
            onUpdate();
            onClose();
        } catch (error) {
            console.error("Erro ao deletar cliente:", error);
            alert("Erro ao deletar cliente");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.modalContentLarge}
                onClick={(e) => e.stopPropagation()}
            >
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={22} />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                        Detalhes do Cliente
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Visualize e edite as informações do cliente
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome *
                            </label>
                            <input
                                className={styles.input}
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                placeholder="Nome do cliente"
                                required
                            />
                        </div>

                        {/* Endereço */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Endereço / Contato
                            </label>
                            <input
                                className={styles.input}
                                value={formData.endereco}
                                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                placeholder="Endereço ou contato"
                            />
                        </div>

                        {/* Valor da Venda */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valor da Venda (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                className={styles.input}
                                value={formData.valorVenda}
                                onChange={(e) => setFormData({ ...formData, valorVenda: e.target.value })}
                                placeholder="0,00"
                            />
                        </div>

                        {/* Data da Venda */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data da Venda
                            </label>
                            <input
                                type="date"
                                className={styles.input}
                                value={formData.dataVenda}
                                onChange={(e) => setFormData({ ...formData, dataVenda: e.target.value })}
                            />
                        </div>

                        {/* Observações */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Observações
                            </label>
                            <textarea
                                className={styles.textArea}
                                value={formData.observacoes}
                                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                placeholder="Notas ou observações sobre o cliente"
                                rows={4}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 justify-between">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg hover:from-red-600 hover:to-red-800 transition disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            {deleting ? "Deletando..." : "Deletar Cliente"}
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className={styles.saveButton}
                                disabled={loading}
                            >
                                {loading ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
