import { useState } from "react";
import "./notifica.css";

interface Notificacao {
  titulo: string;
  detalhes: string;
  permiteJustificativa?: boolean;
}

function Notificacoes() {
  const [expandido, setExpandido] = useState<number | null>(null);
  const [desmarcado, setDesmarcado] = useState<boolean>(false);

  const notificacoes: Notificacao[] = [
    {
      titulo: "Nova reunião marcada",
      detalhes: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      permiteJustificativa: true
    },
    { titulo: "Evento cancelado", detalhes: "Ut enim ad minim veniam, quis nostrud exercitation ullamco." },
    { titulo: "Nova mensagem", detalhes: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore." }
  ];

  const toggleExpandido = (index: number) => {
    setExpandido(expandido === index ? null : index);
    setDesmarcado(false);
  };

  return (
    <div className="notificacoes-container">
      <h1 className="notificacoes-title">Notificações</h1>
      {notificacoes.map((n, i) => (
        <div key={i} className="notificacao-card">
          <div className="notificacao-titulo" onClick={() => toggleExpandido(i)}>
            <strong>{n.titulo}</strong>
          </div>
          <div className={`notificacao-detalhes ${expandido === i ? "aberto" : ""}`}>
            <p>{n.detalhes}</p>
            {n.permiteJustificativa && (
              <div className="botoes-reuniao">
                <button className="btn-confirmar">Confirmar</button>
                <button
                  className="btn-desmarcar"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDesmarcado(!desmarcado);
                  }}
                >
                  Desmarcar
                </button>
              </div>
            )}
            {desmarcado && (
              <textarea
                className="textarea-justificativa"
                placeholder="Justifique o cancelamento..."
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Notificacoes;
