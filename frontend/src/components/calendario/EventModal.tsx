import { useState, useEffect } from 'react';
import api, { funcionariosAPI } from '../../services/api';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  organizadorId: number;
}

interface Funcionario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  organizadorId
}) => {
  const [titulo, setTitulo] = useState('');
  const [desc, setDesc] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [duracaoH, setDuracaoH] = useState(1);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [selectedFuncionarios, setSelectedFuncionarios] = useState<number[]>([]);
  const [loadingFuncionarios, setLoadingFuncionarios] = useState(false);

  // Inicializa data e hora quando o modal abre
  useEffect(() => {
    if (isOpen && selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setData(`${year}-${month}-${day}`);
      setHora('09:00'); // Hora padrão
      loadFuncionarios();
    }
  }, [isOpen, selectedDate]);

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
    if (!selectedDate) return;

    setLoading(true);
    try {
      // Combina data e hora em um único ISO string
      const dataHoraCompleta = new Date(`${data}T${hora}:00`).toISOString();
      
      await api.post('/eventos', {
        titulo,
        desc,
        dataIni: dataHoraCompleta,
        duracaoH,
        link,
        status: 'pendente',
        organizadorId,
        convidados: selectedFuncionarios
      });
      
      // Limpa form e fecha
      setTitulo('');
      setDesc('');
      setDuracaoH(1);
      setLink('');
      setSelectedFuncionarios([]);
      onClose();
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      alert('Erro ao criar evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !selectedDate) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
              <h2 className="text-2xl font-bold text-gray-800">Criar Novo Evento</h2>
              <p className="text-sm text-gray-500 mt-1">{formatDate(selectedDate)}</p>
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
                placeholder="Ex: Reunião de Planejamento"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Descreva o evento..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Data e Hora */}
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Convidar Participantes ({selectedFuncionarios.length} selecionado(s))
              </label>
              
              {loadingFuncionarios ? (
                <div className="text-gray-500 text-sm py-4 text-center">Carregando funcionários...</div>
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
                        <div className="text-xs text-gray-500">{func.cargo} • {func.email}</div>
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
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando...' : 'Criar Evento'}
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
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
