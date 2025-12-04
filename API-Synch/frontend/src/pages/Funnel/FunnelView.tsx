import { useState, useEffect, useCallback, type FormEvent } from "react";
import styles from "./FunnelView.module.css";
import { ListPlus, X, UserPlus } from "lucide-react";
import api from "../../services/api";
import { DndContext, DragOverlay, type DragEndEvent, useSensor, useSensors, PointerSensor, TouchSensor } from "@dnd-kit/core";
import FunnelColumn from "./FunnelColumn";
import FunnelCard from "./FunnelCard";
import FloatingNavbar from "../../components/layout/FloatingNavbar";
import ClientDetailModal from "./ClientDetailModal";
import FunnelCharts from "./FunnelCharts";

interface Estagio {
    id: number;
    estagioNome: string;
}

interface Cliente {
    id: number;
    nome: string;
    endereco: string;
    funilId: number;
}

export default function FunnelView() {
    const [estagios, setEstagios] = useState<Estagio[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [estagioNome, setEstagioNome] = useState("");
    const [novoCliente, setNovoCliente] = useState({ nome: "", endereco: "", funilId: 0 });
    const [activeCliente, setActiveCliente] = useState<Cliente | null>(null);
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 100,
                tolerance: 5,
            },
        })
    );

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [resEstagios, resClientes] = await Promise.all([
                api.get('/funis'),
                api.get('/clientes')
            ]);
            setEstagios(resEstagios.data);
            setClientes(resClientes.data);
        } catch (err) {
            setError("Falha ao carregar dados.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!estagioNome.trim()) return;

        try {
            const resposta = await api.post('/funis', { estagioNome });
            const novo = resposta.data;
            setEstagios((prev) => [...prev, novo]);
            setEstagioNome("");
            setIsModalOpen(false);
        } catch (err) {
            console.error("Erro ao criar estágio:", err);
            setError("Erro ao criar estágio.");
        }
    };

    const handleCreateClient = async (e: FormEvent) => {
        e.preventDefault();
        if (!novoCliente.nome.trim() || !novoCliente.endereco.trim()) return;

        // Se não tiver funilId selecionado, pega o primeiro
        const funilId = novoCliente.funilId || (estagios.length > 0 ? estagios[0].id : 0);

        if (funilId === 0) {
            setError("Crie um estágio primeiro.");
            return;
        }

        try {
            const payload = { ...novoCliente, funilId };
            const resposta = await api.post('/clientes', payload);
            const novo = resposta.data;
            setClientes((prev) => [...prev, novo]);
            setNovoCliente({ nome: "", endereco: "", funilId: 0 });
            setIsClientModalOpen(false);
        } catch (err) {
            console.error("Erro ao criar cliente:", err);
            setError("Erro ao criar cliente.");
        }
    };

    const handleDragStart = (event: any) => {
        const { active } = event;
        const clienteId = Number(String(active.id).replace("cliente-", ""));
        const cliente = clientes.find((c) => c.id === clienteId);
        if (cliente) setActiveCliente(cliente);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCliente(null);

        if (!over) return;

        const clienteId = Number(String(active.id).replace("cliente-", ""));
        const novoEstagioId = Number(String(over.id).replace("estagio-", ""));

        const cliente = clientes.find((c) => c.id === clienteId);
        if (!cliente || cliente.funilId === novoEstagioId) return;

        // Atualização Otimista
        setClientes((prev) =>
            prev.map((c) =>
                c.id === clienteId ? { ...c, funilId: novoEstagioId } : c
            )
        );

        try {
            await api.put(`/clientes/${clienteId}`, { funilId: novoEstagioId });
        } catch (err) {
            console.error("Erro ao mover cliente:", err);
            // Reverter em caso de erro
            setClientes((prev) =>
                prev.map((c) =>
                    c.id === clienteId ? { ...c, funilId: cliente.funilId } : c
                )
            );
        }
    };

    return (
        <>
            <FloatingNavbar />
            <div className={styles.container}>
                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="w-full px-4">
                        <div className="flex flex-col items-center justify-center mb-12 gap-6">
                            <div className="text-center">
                                <h1 className={styles.titleNewe}>Funil de Vendas</h1>
                                <p className="text-gray-500">Gerencie seus clientes e estágios de venda</p>
                            </div>
                            <div className="flex gap-2">
                                <button className={styles.addButton} onClick={() => setIsClientModalOpen(true)}>
                                    <UserPlus size={18} /> Novo Cliente
                                </button>
                                <button className={styles.addButtonReversed} onClick={() => setIsModalOpen(true)}>
                                    <ListPlus size={18} /> Novo Estágio
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-nowrap gap-6 justify-start overflow-x-auto pb-8 w-full px-4" style={{ scrollBehavior: 'smooth' }}>
                            {loading ? (
                                <p>Carregando...</p>
                            ) : error ? (
                                <p className={styles.error}>{error}</p>
                            ) : estagios.length === 0 ? (
                                <div className={styles.yellowBox}>
                                    Nenhum estágio encontrado. Crie um para começar.
                                </div>
                            ) : (
                                estagios.map((estagio) => (
                                    <FunnelColumn
                                        key={estagio.id}
                                        estagio={estagio}
                                        clientes={clientes.filter((c) => c.funilId === estagio.id)}
                                        onClientClick={(cliente) => setSelectedCliente(cliente)}
                                        onUpdate={fetchData}
                                    />
                                ))
                            )}
                        </div>

                        <DragOverlay>
                            {activeCliente ? <FunnelCard cliente={activeCliente} /> : null}
                        </DragOverlay>

                        {isModalOpen && (
                            <div className={styles.modalOverlay}>
                                <div className={styles.modalContent}>
                                    <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                                        <X size={22} />
                                    </button>

                                    <h3>Adicionar Estágio</h3>

                                    <form onSubmit={handleSubmit}>
                                        <input
                                            className={styles.input}
                                            value={estagioNome}
                                            onChange={(e) => setEstagioNome(e.target.value)}
                                            placeholder="Nome do Estágio"
                                            required
                                        />

                                        <div style={{ marginTop: "1rem", textAlign: "right" }}>
                                            <button type="submit" className={styles.saveButton}>
                                                Salvar
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.cancelButton}
                                                onClick={() => setIsModalOpen(false)}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {isClientModalOpen && (
                            <div className={styles.modalOverlay}>
                                <div className={styles.modalContent}>
                                    <button className={styles.closeButton} onClick={() => setIsClientModalOpen(false)}>
                                        <X size={22} />
                                    </button>

                                    <h3>Adicionar Cliente</h3>

                                    <form onSubmit={handleCreateClient}>
                                        <input
                                            className={styles.input}
                                            value={novoCliente.nome}
                                            onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                                            placeholder="Nome do Cliente"
                                            required
                                        />
                                        <input
                                            className={styles.input}
                                            value={novoCliente.endereco}
                                            onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
                                            placeholder="Endereço / Contato (Opcional)"
                                            style={{ marginTop: "0.5rem" }}
                                        />

                                        <select
                                            className={styles.input}
                                            value={novoCliente.funilId}
                                            onChange={(e) => setNovoCliente({ ...novoCliente, funilId: Number(e.target.value) })}
                                            style={{ marginTop: "0.5rem" }}
                                        >
                                            <option value={0}>Selecione um estágio...</option>
                                            {estagios.map(estagio => (
                                                <option key={estagio.id} value={estagio.id}>{estagio.estagioNome}</option>
                                            ))}
                                        </select>

                                        <div style={{ marginTop: "1rem", textAlign: "right" }}>
                                            <button type="submit" className={styles.saveButton}>
                                                Salvar
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.cancelButton}
                                                onClick={() => setIsClientModalOpen(false)}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {selectedCliente && (
                            <ClientDetailModal
                                cliente={selectedCliente}
                                onClose={() => setSelectedCliente(null)}
                                onUpdate={fetchData}
                            />
                        )}
                    </div>
                </DndContext>

                {/* Analytics Charts */}
                <FunnelCharts estagios={estagios} clientes={clientes} />
            </div>
        </>
    );
}
