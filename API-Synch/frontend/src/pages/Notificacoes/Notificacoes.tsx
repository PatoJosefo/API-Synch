import { useState, useEffect } from "react";
import FloatingNavbar from "../../components/layout/FloatingNavbar";
import { eventosAPI, type EventoResponse } from "../../services/api";
import api from "../../services/api";
import socketService from "../../services/socketService";
import { useAuth } from "../../components/Context/AuthContext";
import "./Notificacoes.css";

function Notificacoes() {
  const [eventos, setEventos] = useState<EventoResponse[]>([]);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [mostrarJustificativa, setMostrarJustificativa] = useState<number | null>(null);
  const [justificativas, setJustificativas] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);

  const { user } = useAuth();
  const funcionarioId = user ? Number(user.id) : 1; // Fallback para 1 se não houver usuário

  useEffect(() => {
    loadEventos();

    // Conectar ao Socket.io
    socketService.connect();

    // Escutar por novas notificações
    socketService.onNovaNotificacao((data) => {
      // console.log('🔔 Nova notificação recebida:', data);
      loadEventos(); // Recarregar lista de eventos
    });

    // Cleanup ao desmontar o componente
    return () => {
      socketService.removeListener('nova_notificacao');
    };
  }, []);

  const loadEventos = async () => {
    setLoading(true);
    try {
      const eventosData = await eventosAPI.listarPorUsuario(funcionarioId);
      setEventos(eventosData);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandido = (eventoId: number) => {
    setExpandido(expandido === eventoId ? null : eventoId);
    setMostrarJustificativa(null);
  };

  const handleConfirmar = async (eventoId: number) => {
    setSubmitting(eventoId);
    try {
      await api.put(`/eventos/${eventoId}/participantes/${funcionarioId}`, {
        presente: true,
      });

      setEventos((prev) =>
        prev.map((ev) =>
          ev.eventoId === eventoId
            ? { ...ev, respostaPresenca: { presente: true, razaoRecusa: null, dataTermino: null } }
            : ev
        )
      );

      alert("Presença confirmada com sucesso!");
    } catch (error) {
      console.error("Erro ao confirmar presença:", error);
      alert("Erro ao confirmar presença. Tente novamente.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleDesmarcar = (eventoId: number) => {
    setMostrarJustificativa(eventoId);
  };

  const handleEnviarRecusa = async (eventoId: number) => {
    const razao = justificativas[eventoId]?.trim();

    if (!razao) {
      alert("Por favor, informe o motivo da recusa.");
      return;
    }

    setSubmitting(eventoId);
    try {
      await api.put(`/eventos/${eventoId}/participantes/${funcionarioId}`, {
        presente: false,
        razaoRecusa: razao,
      });

      setEventos((prev) =>
        prev.map((ev) =>
          ev.eventoId === eventoId
            ? { ...ev, respostaPresenca: { presente: false, razaoRecusa: razao, dataTermino: new Date().toISOString() } }
            : ev
        )
      );

      setMostrarJustificativa(null);
      setJustificativas((prev) => ({ ...prev, [eventoId]: "" }));

      alert("Recusa enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar recusa:", error);
      alert("Erro ao enviar recusa. Tente novamente.");
    } finally {
      setSubmitting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBorder = (evento: EventoResponse) => {
    if (!evento.respostaPresenca) return "border-gray-300";
    if (evento.respostaPresenca.presente) return "border-green-gradient";
    return "border-red-gradient";
  };


  if (loading) {
    return (
      <>
        <FloatingNavbar />
        <div className="notificacoes-container" style={{ paddingTop: "8rem" }}>
          <h1 className="notificacoes-title">Notificações</h1>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando notificações...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FloatingNavbar />
      <div className="notificacoes-container" style={{ paddingTop: "8rem" }}>
        <h1 className="notificacoes-title">Notificações de Eventos</h1>

        {eventos.length === 0 ? (
          <div className="empty-state">
            <p>📭 Nenhuma notificação no momento</p>
          </div>
        ) : (
          <div className="notificacoes-list">
            {eventos.map((evento) => {
              const isExpanded = expandido === evento.eventoId;
              const showJustificativa = mostrarJustificativa === evento.eventoId;
              const isSubmittingThis = submitting === evento.eventoId;

              return (
                <div
                  key={evento.eventoId}
                  className={`notificacao-pill ${getStatusBorder(evento)}`}
                >
                  <div
                    className="notificacao-header"
                    onClick={() => toggleExpandido(evento.eventoId)}
                  >
                    <div className="notificacao-info">
                      <div>
                        <h3 className="notificacao-titulo">{evento.titulo}</h3>
                        <p className="notificacao-preview">
                          {evento.desc ? evento.desc.substring(0, 60) + "..." : "Sem descrição"}
                        </p>
                      </div>
                    </div>
                    <svg
                      className={`expand-icon ${isExpanded ? "rotated" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  {isExpanded && (
                    <div className="notificacao-detalhes">
                      <div className="detalhe-item">
                        <strong>📝 Descrição:</strong>
                        <p>{evento.desc || "Sem descrição"}</p>
                      </div>

                      <div className="detalhe-item">
                        <strong>📅 Data e Hora:</strong>
                        <p>{formatDate(evento.dataIni)}</p>
                      </div>

                      <div className="detalhe-item">
                        <strong>⏱️ Duração:</strong>
                        <p>{evento.duracaoH} hora(s)</p>
                      </div>

                      <div className="detalhe-item">
                        <strong>👤 Organizador:</strong>
                        <p>{evento.organizador.nome}</p>
                        <small>{evento.organizador.email}</small>
                      </div>

                      {evento.link && (
                        <div className="detalhe-item">
                          <strong>🔗 Link da Reunião:</strong>
                          <a
                            href={evento.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-reuniao"
                          >
                            Acessar Reunião
                          </a>
                        </div>
                      )}

                      {evento.participantes && evento.participantes.length > 0 && (
                        <div className="detalhe-item">
                          <strong>👥 Participantes ({evento.participantes.length}):</strong>
                          <ul className="participantes-list">
                            {evento.participantes.map((p) => (
                              <li key={p.id}>{p.nome}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {evento.respostaPresenca && (
                        <div className="detalhe-item status-atual">
                          <strong>Status:</strong>
                          {evento.respostaPresenca.presente ? (
                            <span className="status-badge confirmed">Confirmado</span>
                          ) : (
                            <>
                              <span className="status-badge declined">Recusado</span>
                              {evento.respostaPresenca.razaoRecusa && (
                                <p className="razao-recusa">
                                  <strong>Motivo:</strong> {evento.respostaPresenca.razaoRecusa}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      <div className="botoes-acao">
                        {!evento.respostaPresenca?.presente && (
                          <button
                            className="btn-confirmar"
                            onClick={() => handleConfirmar(evento.eventoId)}
                            disabled={isSubmittingThis}
                          >
                            {isSubmittingThis ? "Confirmando..." : "Confirmar Presença"}
                          </button>
                        )}

                        {!evento.respostaPresenca?.razaoRecusa && (
                          <button
                            className="btn-desmarcar"
                            onClick={() => handleDesmarcar(evento.eventoId)}
                            disabled={isSubmittingThis}
                          >
                            Não Posso Ir
                          </button>
                        )}
                      </div>

                      {showJustificativa && (
                        <div className="justificativa-box">
                          <label>Por que não pode comparecer?</label>
                          <textarea
                            className="textarea-justificativa"
                            placeholder="Ex: Tenho outro compromisso no mesmo horário..."
                            value={justificativas[evento.eventoId] || ""}
                            onChange={(e) =>
                              setJustificativas((prev) => ({
                                ...prev,
                                [evento.eventoId]: e.target.value,
                              }))
                            }
                            rows={3}
                          />
                          <div className="justificativa-actions">
                            <button
                              className="btn-enviar-justificativa"
                              onClick={() => handleEnviarRecusa(evento.eventoId)}
                              disabled={isSubmittingThis}
                            >
                              {isSubmittingThis ? "Enviando..." : "Enviar Justificativa"}
                            </button>
                            <button
                              className="btn-cancelar-justificativa"
                              onClick={() => setMostrarJustificativa(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default Notificacoes;
