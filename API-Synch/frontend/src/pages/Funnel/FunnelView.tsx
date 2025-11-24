import { useState, useEffect, useCallback, type FormEvent } from "react";
import styles from "./FunnelView.module.css";
import { ListPlus, X } from "lucide-react";
import api from "../../services/api";

interface Estagio {
    id: number;
    estagioNome: string;
}

export default function EstagioView() {
    const [estagios, setEstagios] = useState<Estagio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [estagioNome, setEstagioNome] = useState("");

    const fetchEstagios = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/funis');
            setEstagios(res.data);
        } catch (err) {
            setError("Falha ao carregar dados.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEstagios();
    }, [fetchEstagios]);

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

    return (
        <div className={styles.container}>
            <h1 className={styles.titleNewe}>Newe</h1>
            <h2 className={styles.subTitle}>Visualização de Estágios</h2>

            <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
                <ListPlus size={18} /> Adicionar Estágio
            </button>

            <div className={styles.cardsWrapper}>
                {loading ? (
                    <p>Carregando...</p>
                ) : error ? (
                    <p className={styles.error}>{error}</p>
                ) : estagios.length === 0 ? (
                    <div className={styles.yellowBox}>
                        Nenhum estágio encontrado.
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {estagios.map((e) => (
                            <div key={e.id} className={styles.card}>
                                <p className={styles.cardId}>ID: {e.id}</p>
                                <p className={styles.cardName}>{e.estagioNome}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
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
        </div>
    );
}
