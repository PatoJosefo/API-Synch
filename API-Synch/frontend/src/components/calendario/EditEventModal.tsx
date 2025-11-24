import { useState, useEffect } from 'react';
import api, { funcionariosAPI, type EventoResponse } from '../../services/api';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  evento: EventoResponse | null;
  onEventUpdated: () => void;
}

interface Funcionario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  evento,
  onEventUpdated
}) => {
  const [titulo, setTitulo] = useState('');
  const [desc, setDesc] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [duracaoH, setDuracaoH] = useState(1);
  const [link, setLink] = useState('');
  const [status, setStatus] = useState<'pendente' | 'ativo' | 'concluido' | 'cancelado'>('pendente');
  const [loading, setLoading] = useState(false);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [selectedFuncionarios, setSelectedFuncionarios] = useState<number[]>([]);
  const [loadingFuncionarios, setLoadingFuncionarios] = useState(false);

  // Carrega dados do evento ao abrir
  useEffect(() => {
    if (isOpen && evento) {
      setTitulo(evento.titulo);
      setDesc(evento.desc || '');
      setStatus(evento.statusEvento as any);
      setDuracaoH(evento.duracaoH);
      setLink(evento.link || '');
      
      // Extrai data e hora
      const dataEvento = new Date(evento.dataIni);
      const year = dataEvento.getFullYear();
      const month = String(dataEvento.getMonth() + 1).padStart(2, '0');
      const day = String(dataEvento.getDate()).padStart(2, '0');
      const hours = String(dataEvento.getHours()).padStart(2, '0');
      const minutes = String(dataEvento.getMinutes()).padStart(2, '0');
      
      setData(`${year}-${month}-${day}`);
      setHora(`${hours}:${minutes}`);
      
      // Define participantes selecionados
      if (evento.participantes) {
        setSelectedFuncionarios(evento.participantes.map(p => p.id));
      }
      
      loadFuncionarios();
    }
  }, [isOpen, evento]);

  const loadFuncionarios = async () => {
    setLoadingFuncionarios(true);
    try {
      const data = await funcionariosAPI.listarSimples();
      setFuncionarios(data);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    } finally {
      setLoadingFuncionarios(false);
    }
  };

  const toggleFuncionario = (id: number) => {
    setSelectedFuncionarios(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evento) return;

    setLoading(true);
    try {
      const dataHoraCompleta = new Date(`${data}T${hora}:00`).toISOString();
      
      await api.put(`/eventos/${evento.eventoId}`, {
        titulo,
        desc,
        dataIni: dataHoraCompleta,
        duracaoH,
        link,
        status,
        convidados: selectedFuncionarios
      });
      
      alert('Evento atualizado com sucesso!');
      onEventUpdated();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      alert('Erro ao atualizar evento.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !evento) return null;

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'from-yellow-400 to-yellow-600';
      case 'concluido':
        return 'from-green-400 to-green-600';
      case 'cancelado':
        return 'from-red-400 to-red-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 pb-4 flex justify-between items-center sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Editar Evento</h2>
              <p className="text-sm text-gray-500 mt-1">Organizador: {evento.organizador.nome}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Título do Evento *</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Data *</label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hora *</label>
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duração (horas) *</label>
                <input
                  type="number"
                  value={duracaoH}
                  onChange={(e) => setDuracaoH(Number(e.target.value))}
                  min={1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Link (opcional)</label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Seletor de Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status do Evento *</label>
              <div className="grid grid-cols-3 gap-3">
                {(['pendente', 'concluido', 'cancelado'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`px-4 py-3 rounded-lg font-medium transition ${
                      status === s
                        ? `bg-gradient-to-r ${getStatusGradient(s)} text-white shadow-md`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Seletor de Participantes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Participantes ({selectedFuncionarios.length} selecionado(s))
              </label>
              
              {loadingFuncionarios ? (
                <div className="text-gray-500 text-sm py-4 text-center">Carregando...</div>
              ) : (
                <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                  {funcionarios.map(func => (
                    <label 
                      key={func.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFuncionarios.includes(func.id)}
                        onChange={() => toggleFuncionario(func.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{func.nome}</div>
                        <div className="text-xs text-gray-500">{func.cargo}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition text-white bg-gradient-to-r ${getStatusGradient(status)} hover:opacity-90 disabled:opacity-50`}
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </>
  );
};
