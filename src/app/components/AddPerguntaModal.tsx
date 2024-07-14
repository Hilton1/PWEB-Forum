import { useState, useEffect } from 'react';
import { ClipLoader } from 'react-spinners';
import { addPergunta, updatePergunta, Categoria, Pergunta } from '../api';
import { useUser } from '@clerk/nextjs';

interface AddPerguntaModalProps {
  categorias: Categoria[];
  onClose: () => void;
  onPerguntaAdded: () => void;
  isOpen: boolean;
  pergunta?: Pergunta | null;
}

export default function AddPerguntaModal({ categorias, onClose, onPerguntaAdded, isOpen, pergunta }: AddPerguntaModalProps) {
  const [newPergunta, setNewPergunta] = useState({ titulo: '', conteudo: '', categoriaId: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (pergunta) {
      setNewPergunta({ titulo: pergunta.titulo, conteudo: pergunta.conteudo, categoriaId: pergunta.categoria.id });
    } else {
      setNewPergunta({ titulo: '', conteudo: '', categoriaId: '' });
    }
  }, [pergunta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPergunta.titulo || !newPergunta.conteudo || !newPergunta.categoriaId || !user?.id) return;

    setSubmitting(true);
    try {
      if (pergunta) {
        await updatePergunta(pergunta.id, { ...newPergunta, userId: user.id });
      } else {
        await addPergunta({ ...newPergunta, userId: user.id });
      }
      onPerguntaAdded();
      setNewPergunta({ titulo: '', conteudo: '', categoriaId: '' });
      onClose();
    } catch (error) {
      console.error('Error adding pergunta:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const modalClassName = isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95';
  const modalStyle = isOpen ? {} : { pointerEvents: 'none' };

  return (
    <div className={`fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center transition-opacity duration-300 ${modalClassName}`} style={modalStyle}>
      <div className={`bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 transform transition-transform duration-300 ${modalClassName}`}>
        <h2 className="text-2xl font-bold mb-4">{pergunta ? 'Editar Pergunta' : 'Nova Pergunta'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="titulo" className="block mb-2 font-semibold">
              Título
            </label>
            <input
              type="text"
              name="titulo"
              value={newPergunta.titulo}
              onChange={(e) => setNewPergunta({ ...newPergunta, titulo: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="conteudo" className="block mb-2 font-semibold">
              Conteúdo
            </label>
            <textarea
              name="conteudo"
              value={newPergunta.conteudo}
              onChange={(e) => setNewPergunta({ ...newPergunta, conteudo: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              rows={4}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="categoria" className="block mb-2 font-semibold">
              Categoria
            </label>
            <select
              name="categoria"
              value={newPergunta.categoriaId}
              onChange={(e) => setNewPergunta({ ...newPergunta, categoriaId: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              disabled={submitting}
            >
              {submitting ? <ClipLoader size={20} color="#ffffff" /> : (pergunta ? 'Atualizar Pergunta' : 'Enviar Pergunta')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
