'use client'

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchPerguntaById, fetchUser, Pergunta, User, addResposta, updateResposta, deleteResposta } from '../../api';
import { useUser } from '@clerk/nextjs';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { Toaster, toast } from 'react-hot-toast';

export default function PerguntaDetalhe() {
  const params = useParams();
  const { id } = params;
  const { user } = useUser();
  const [pergunta, setPergunta] = useState<Pergunta | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [respostaUsers, setRespostaUsers] = useState<{ [key: string]: User }>({});
  const [newResposta, setNewResposta] = useState('');
  const [submittingNew, setSubmittingNew] = useState(false);
  const [editingRespostaId, setEditingRespostaId] = useState<string | null>(null);
  const [editingConteudo, setEditingConteudo] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [deletingRespostaId, setDeletingRespostaId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPerguntaById(id as string)
        .then(async (data) => {
          setPergunta(data);
          const user = await fetchUser(data.userId);
          setUserInfo(user);

          // Fetch user info for each response
          const userPromises = data.respostas.map(resposta => fetchUser(resposta.userId));
          const usersArray = await Promise.all(userPromises);
          const usersMap = usersArray.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {} as { [key: string]: User });
          setRespostaUsers(usersMap);

          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching pergunta:', error);
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('Você precisa estar logado para enviar uma resposta.');
      return;
    }
    if (!newResposta) return;

    setSubmittingNew(true);
    try {
      await addResposta(id as string, newResposta, user.id);
      const updatedPergunta = await fetchPerguntaById(id as string);
      setPergunta(updatedPergunta);

      // Update user info for new responses
      const userPromises = updatedPergunta.respostas.map(resposta => fetchUser(resposta.userId));
      const usersArray = await Promise.all(userPromises);
      const usersMap = usersArray.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as { [key: string]: User });
      setRespostaUsers(usersMap);

      setNewResposta('');
    } catch (error) {
      console.error('Error adding resposta:', error);
    } finally {
      setSubmittingNew(false);
    }
  };

  const handleEdit = (respostaId: string, conteudo: string) => {
    setEditingRespostaId(respostaId);
    setEditingConteudo(conteudo);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConteudo || !editingRespostaId) return;

    setSubmittingEdit(true);
    try {
      await updateResposta(editingRespostaId, editingConteudo);
      const updatedPergunta = await fetchPerguntaById(id as string);
      setPergunta(updatedPergunta);
      setEditingRespostaId(null);
      setEditingConteudo('');
    } catch (error) {
      console.error('Error updating resposta:', error);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = async (respostaId: string) => {
    if (!user?.id) return;

    setDeletingRespostaId(respostaId);
    try {
      await deleteResposta(respostaId);
      const updatedPergunta = await fetchPerguntaById(id as string);
      setPergunta(updatedPergunta);

      // Update user info for remaining responses
      const userPromises = updatedPergunta.respostas.map(resposta => fetchUser(resposta.userId));
      const usersArray = await Promise.all(userPromises);
      const usersMap = usersArray.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as { [key: string]: User });
      setRespostaUsers(usersMap);
    } catch (error) {
      console.error('Error deleting resposta:', error);
    } finally {
      setDeletingRespostaId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!pergunta || !userInfo) {
    return <p className="text-gray-600">Pergunta não encontrada.</p>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Toaster />
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <Image
            src={userInfo.profileImageUrl}
            alt={userInfo.fullName}
            width={40}
            height={40}
            className="rounded-full"
          />
          <p className="ml-4 text-gray-800">{userInfo.fullName}</p>
        </div>
        <h1 className="text-2xl font-bold">{pergunta.titulo}</h1>
        <p className="text-gray-600 mb-4">Categoria: {pergunta.categoria.nome}</p>
        <p className="text-gray-700 mb-4">{pergunta.conteudo}</p>
        <h2 className="text-xl font-semibold mt-8 mb-4">Respostas</h2>
        {pergunta.respostas.length === 0 ? (
          <p className="text-gray-600">Nenhuma resposta encontrada.</p>
        ) : (
          pergunta.respostas.map(resposta => (
            <div key={resposta.id} className="bg-gray-100 p-4 rounded-lg mb-4">
              <div className="flex items-center mb-2">
                {respostaUsers[resposta.userId] && (
                  <>
                    <Image
                      src={respostaUsers[resposta.userId].profileImageUrl}
                      alt={respostaUsers[resposta.userId].fullName}
                      width={30}
                      height={30}
                      className="rounded-full mr-2"
                    />
                    <p className="text-gray-700">{respostaUsers[resposta.userId].fullName}</p>
                  </>
                )}
                {resposta.userId === user?.id && (
                  <>
                    <button
                      onClick={() => handleEdit(resposta.id, resposta.conteudo)}
                      className="ml-auto text-blue-500 hover:underline flex items-center"
                      disabled={submittingEdit || deletingRespostaId === resposta.id}
                    >
                      {submittingEdit && editingRespostaId === resposta.id ? (
                        <ClipLoader size={20} color="#0000ff" />
                      ) : (
                        <FaEdit />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(resposta.id)}
                      className="ml-2 text-red-500 hover:underline flex items-center"
                      disabled={deletingRespostaId === resposta.id}
                    >
                      {deletingRespostaId === resposta.id ? (
                        <ClipLoader size={20} color="#ff0000" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </>
                )}
              </div>
              {editingRespostaId === resposta.id ? (
                <form onSubmit={handleSubmitEdit} className="mt-2">
                  <textarea
                    value={editingConteudo}
                    onChange={(e) => setEditingConteudo(e.target.value)}
                    className="w-full p-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    rows={3}
                  />
                  <button
                    type="submit"
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    disabled={submittingEdit}
                  >
                    {submittingEdit ? <ClipLoader size={20} color="#ffffff" /> : 'Atualizar Resposta'}
                  </button>
                </form>
              ) : (
                <p className="text-gray-800">{resposta.conteudo}</p>
              )}
            </div>
          ))
        )}
        <form onSubmit={handleSubmitNew} className="mt-8">
          <textarea
            value={newResposta}
            onChange={(e) => setNewResposta(e.target.value)}
            placeholder="Digite sua resposta"
            className="w-full p-4 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            rows={4}
          />
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            disabled={submittingNew}
          >
            {submittingNew ? <ClipLoader size={20} color="#ffffff" /> : 'Enviar Resposta'}
          </button>
        </form>
      </div>
    </div>
  );
}
