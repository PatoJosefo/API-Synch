import { useState, useEffect } from 'react';
import type { EventoResponse } from '../../services/api';
import { eventosAPI } from '../../services/api';
import { EditEventModal } from './EditEventModal';

interface EventDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  eventos: EventoResponse[];
  selectedDate: Date;
  clickedEventId?: number | null;
  onEventUpdated?: () => void;
}

export const EventDetailsPanel: React.FC<EventDetailsPanelProps> = ({
  isOpen,
  onClose,
  eventos,
  selectedDate,
  clickedEventId,
  onEventUpdated
}) => {
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [editingEvento, setEditingEvento] = useState<EventoResponse | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ✅ Expande o evento clicado ou o mais próximo
  useEffect(() => {
    if (clickedEventId !== null && clickedEventId !== undefined) {
      setExpandedEventId(clickedEventId);
    } else if (eventos.length > 0 && isOpen) {
      const now = new Date();
      const sortedByTime = [...eventos].sort((a, b) => 
        new Date(a.dataIni).getTime() - new Date(b.dataIni).getTime()
      );
      
      const closestEvent = sortedByTime.find(ev => 
        new Date(ev.dataIni) >= now
      ) || sortedByTime[0];
      
      setExpandedEventId(closestEvent.eventoId);
    }
  }, [eventos, isOpen, clickedEventId]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleDelete = async (eventoId: number) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    
    setDeletingEventId(eventoId);
    try {
      await eventosAPI.deletar(eventoId);
      alert('Evento excluído com sucesso!');
      onEventUpdated?.();
      onClose();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert('Erro ao excluir evento.');
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleEdit = (evento: EventoResponse) => {
    setEditingEvento(evento);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    // ✅ NÃO MUDA O expandedEventId - mantém o mesmo evento aberto
    onEventUpdated?.();
  };

  const eventGradients = [
    'from-cyan-500 to-blue-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-yellow-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-teal-500 to-cyan-500',
  ];

  // ✅ FUNÇÃO PARA PEGAR O GRADIENTE DO EVENTO BASEADO NO ID
  const getEventGradientById = (eventoId: number) => {
    const index = eventos.findIndex(ev => ev.eventoId === eventoId);
    return eventGradients[index % eventGradients.length];
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'concluido':
        return 'bg-gradient-to-r from-green-400 to-green-600';
      case 'cancelado':
        return 'bg-gradient-to-r from-red-400 to-red-600';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  return (
    <>
      {isOpen && !isEditModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          
          <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-[101] overflow-y-auto transform transition-all duration-300 animate-slideInRight">
            {/* ✅ REMOVIDA A BORDA border-b */}
            <div className="sticky top-0 bg-white p-6 pb-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{formatDate(selectedDate)}</h2>
                <p className="text-sm text-gray-500">{eventos.length} evento(s)</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-3">
              {eventos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum evento neste dia</p>
              ) : (
                eventos
                  .sort((a, b) => new Date(a.dataIni).getTime() - new Date(b.dataIni).getTime())
                  .map((evento, idx) => {
                    const isExpanded = expandedEventId === evento.eventoId;
                    // ✅ USA A FUNÇÃO QUE PEGA PELO ID DO EVENTO
                    const gradient = getEventGradientById(evento.eventoId);
                    
                    return (
                      <div key={evento.eventoId} className={`rounded-xl transition-all overflow-hidden bg-gradient-to-r ${gradient} p-[3px]`}>
                        <div className="bg-white rounded-lg">
                          <div className="p-3 cursor-pointer hover:bg-gray-50 transition" onClick={() => setExpandedEventId(isExpanded ? null : evento.eventoId)}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${gradient} text-white font-semibold text-sm mb-2`}>
                                  {formatTime(evento.dataIni)} ({evento.duracaoH}h)
                                </div>
                                <h3 className="font-bold text-gray-800 text-lg">{evento.titulo}</h3>
                              </div>
                              <svg className={`w-5 h-5 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-3 pb-3 space-y-3 pt-3">
                              <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase">Descrição</label>
                                <p className="text-sm text-gray-700 mt-1">{evento.desc || 'Sem descrição'}</p>
                              </div>

                              <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase">Organizador</label>
                                <p className="text-sm text-gray-700 mt-1">{evento.organizador.nome}</p>
                                <p className="text-xs text-gray-500">{evento.organizador.email}</p>
                              </div>

                              {evento.participantes && evento.participantes.length > 0 && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase">Participantes ({evento.participantes.length})</label>
                                  <div className="mt-2 space-y-1">
                                    {evento.participantes.map(p => (
                                      <div key={p.id} className="text-sm text-gray-700 flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`}></span>
                                        {p.nome}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase">Status</label>
                                <div className="mt-2">
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusGradient(evento.statusEvento)}`}>
                                    {evento.statusEvento.charAt(0).toUpperCase() + evento.statusEvento.slice(1)}
                                  </span>
                                </div>
                              </div>

                              {evento.link && evento.link.trim() !== '' ? (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase">Link da Reunião</label>
                                  <div className="mt-2">
                                    <a href={evento.link} target="_blank" rel="noopener noreferrer" className={`inline-block px-3 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r ${gradient} hover:opacity-90 transition`}>
                                      Acessar Reunião
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase">Link da Reunião</label>
                                  <p className="text-sm text-gray-400 mt-2 italic">Nenhum link cadastrado</p>
                                </div>
                              )}

                              <div className="flex gap-2 pt-2">
                                <button onClick={() => handleEdit(evento)} className={`flex-1 text-white px-3 py-2 rounded-lg text-sm font-medium transition bg-gradient-to-r ${gradient} hover:opacity-90`}>
                                  Editar
                                </button>
                                <button onClick={() => handleDelete(evento.eventoId)} disabled={deletingEventId === evento.eventoId} className="flex-1 bg-gradient-to-r from-red-500 to-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-800 transition disabled:opacity-50">
                                  {deletingEventId === evento.eventoId ? 'Excluindo...' : 'Excluir'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          <style>{`
            @keyframes slideInRight {
              from { opacity: 0; transform: translateX(100%); }
              to { opacity: 1; transform: translateX(0); }
            }
            .animate-slideInRight { animation: slideInRight 0.3s ease-out; }
          `}</style>
        </>
      )}

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        evento={editingEvento}
        onEventUpdated={handleEditSuccess}
      />
    </>
  );
};
