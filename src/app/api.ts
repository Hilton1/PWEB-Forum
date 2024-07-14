export interface Categoria {
  id: string;
  nome: string;
}

export interface User {
  id: string;
  fullName: string;
  profileImageUrl: string;
}

export interface Pergunta {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: Categoria;
  userId: string;
  respostas: Resposta[];
}

export interface Resposta {
  id: string;
  conteudo: string;
  criadoEm: string;
  atualizadoEm: string;
  perguntaId: string;
  userId: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchPerguntas(): Promise<Pergunta[]> {
  const response = await fetch(`${API_URL}/perguntas`);
  if (!response.ok) {
    throw new Error('Error fetching perguntas');
  }
  const data = await response.json();
  return data;
}

export async function fetchUser(userId: string): Promise<User> {
  const response = await fetch(`${API_URL}/users/${userId}`);
  if (!response.ok) {
    throw new Error('Error fetching user');
  }
  const data = await response.json();
  return {
    id: data.id,
    fullName: `${data.firstName} ${data.lastName}`,
    profileImageUrl: data.imageUrl,
  };
}

export async function fetchPerguntaById(id: string): Promise<Pergunta> {
  const response = await fetch(`${API_URL}/perguntas/${id}`);
  if (!response.ok) {
    throw new Error('Error fetching pergunta');
  }
  const data = await response.json();
  return data;
}

export async function addResposta(perguntaId: string, conteudo: string, userId: string): Promise<void> {
  const response = await fetch(`${API_URL}/perguntas/${perguntaId}/respostas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ conteudo, userId }),
  });
  if (!response.ok) {
    throw new Error('Error adding resposta');
  }
}

export async function updateResposta(respostaId: string, conteudo: string): Promise<void> {
  const response = await fetch(`${API_URL}/respostas/${respostaId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ conteudo }),
  });
  if (!response.ok) {
    throw new Error('Error updating resposta');
  }
}

export async function deleteResposta(respostaId: string): Promise<void> {
  const response = await fetch(`${API_URL}/respostas/${respostaId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error deleting resposta');
  }
}

export async function addPergunta(pergunta: { titulo: string; conteudo: string; categoriaId: string; userId: string }): Promise<void> {
  const response = await fetch(`${API_URL}/perguntas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pergunta),
  });
  if (!response.ok) {
    throw new Error('Error adding pergunta');
  }
}

export async function fetchCategorias(): Promise<Categoria[]> {
  const response = await fetch(`${API_URL}/categorias`);
  if (!response.ok) {
    throw new Error('Error fetching categorias');
  }
  return response.json();
}

export async function updatePergunta(id: string, pergunta: Partial<Pergunta>): Promise<Pergunta> {
  const response = await fetch(`${API_URL}/perguntas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pergunta),
  });
  return response.json();
}

export async function deletePergunta(id: string): Promise<void> {
  await fetch(`${API_URL}/perguntas/${id}`, { method: 'DELETE' });
}