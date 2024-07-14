'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchPerguntas, fetchUser, Pergunta, User, Categoria, fetchCategorias, deletePergunta } from './api';
import AddPerguntaModal from '@/app/components/AddPerguntaModal';
import ConfirmationModal from '@/app/components/ConfirmationModal';
import { useUser } from '@clerk/nextjs';
import { FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';

export default function Home() {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [showForm, setShowForm] = useState(false);
  const [editPergunta, setEditPergunta] = useState<Pergunta | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePerguntaId, setDeletePerguntaId] = useState<string | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    fetchPerguntas()
      .then(async (data) => {
        setPerguntas(data);

        const uniqueUserIds = Array.from(new Set(data.map(p => p.userId)));
        const userPromises = uniqueUserIds.map(userId => fetchUser(userId));
        const usersArray = await Promise.all(userPromises);
        const usersMap = usersArray.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as { [key: string]: User });

        setUsers(usersMap);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching perguntas:', error);
        setLoading(false);
      });

    fetchCategorias()
      .then(data => setCategorias(data))
      .catch(error => console.error('Error fetching categorias:', error));
  }, []);

  const filteredPerguntas = perguntas.filter(pergunta =>
    pergunta.titulo.toLowerCase().includes(search.toLowerCase()) &&
    (selectedCategoria === '' || pergunta.categoria.id === selectedCategoria)
  );

  const handleClick = (id: string) => {
    router.push(`/perguntas/${id}`);
  };

  const handlePerguntaAdded = async () => {
    const updatedPerguntas = await fetchPerguntas();
    setPerguntas(updatedPerguntas);
    setShowForm(false);
    setEditPergunta(null);
  };

  const handleEdit = (pergunta: Pergunta) => {
    setEditPergunta(pergunta);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletePerguntaId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletePerguntaId) return;

    setSubmittingDelete(true);
    try {
      await deletePergunta(deletePerguntaId);
      const updatedPerguntas = await fetchPerguntas();
      setPerguntas(updatedPerguntas);
      setShowDeleteModal(false);
      setDeletePerguntaId(null);
    } catch (error) {
      console.error('Error deleting pergunta:', error);
    } finally {
      setSubmittingDelete(false);
    }
  };

  const handleNewPerguntaClick = () => {
    if (user) {
      setShowForm(true);
      setEditPergunta(null);
    } else {
      toast.error('Você precisa estar logado para fazer uma nova pergunta!');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Toaster />
      <div className="text-gray-700 mb-6">
        <label htmlFor="search" className="block mb-2 font-semibold">
          Pesquisar pergunta:
        </label>
        <input
          type="text"
          name="search"
          placeholder="Como eu faço...?"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-4 text-gray-800 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="text-gray-700 mb-6">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          <FaFilter className="mr-2" />
          Filtrar por categoria
        </button>
        {showFilter && (
          <div className="relative mt-4">
            <select
              name="categoria"
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="w-full p-4 text-gray-800 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 appearance-none"
            >
              <option value="">Todas as categorias</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.3l3.71-4.08a.75.75 0 011.08 1.04l-4.25 4.66a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between mb-6">
        <button
          onClick={handleNewPerguntaClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Nova Pergunta
        </button>
      </div>

      <AddPerguntaModal
        isOpen={showForm}
        categorias={categorias}
        onClose={() => setShowForm(false)}
        onPerguntaAdded={handlePerguntaAdded}
        pergunta={editPergunta}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        submitting={submittingDelete}
      />

      <div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
          </div>
        ) : (
          filteredPerguntas.length === 0 ? (
            <p className="text-gray-600">Nenhuma pergunta encontrada.</p>
          ) : (
            filteredPerguntas.map(pergunta => (
              <div key={pergunta.id} className="mb-6 p-4 bg-white shadow rounded-lg">
                <div className="flex justify-between">
                  <div onClick={() => handleClick(pergunta.id)} className="cursor-pointer flex-1">
                    <h2 className="text-xl font-bold text-gray-800">{pergunta.titulo}</h2>
                    <p className="text-gray-600">Categoria: {pergunta.categoria.nome}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {users[pergunta.userId] && (
                        <>
                          <Image
                            src={users[pergunta.userId].profileImageUrl}
                            alt={users[pergunta.userId].fullName}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                          <p className="text-gray-700 mr-2">{users[pergunta.userId].fullName}</p>
                        </>
                      )}
                    </div>
                  </div>
                  {user?.id === pergunta.userId && (
                    <div className="flex items-center gap-2">
                      <FaEdit onClick={() => handleEdit(pergunta)} className="text-blue-500 cursor-pointer" />
                      <FaTrash onClick={() => handleDeleteClick(pergunta.id)} className="text-red-500 cursor-pointer" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
