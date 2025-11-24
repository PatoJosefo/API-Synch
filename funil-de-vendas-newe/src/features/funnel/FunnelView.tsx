import { useState, useEffect, useCallback, type FormEvent } from "react";
import styles from "./FunnelView.module.css";
import { ListPlus, X } from "lucide-react";

const BACKEND_BASE_URL = "http://localhost:3000";

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
            const res = await fetch(`${BACKEND_BASE_URL}/funis`);
            if (!res.ok) throw new Error("Erro ao carregar estágios");

            const data = await res.json();
            setEstagios(data);
        } catch (err) {
            setError("Falha ao carregar dados.");
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

        const resposta = await fetch(`${BACKEND_BASE_URL}/funis`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estagioNome }),
        });

        const novo = await resposta.json();
        setEstagios((prev) => [...prev, novo]);
        setEstagioNome("");
        setIsModalOpen(false);
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
