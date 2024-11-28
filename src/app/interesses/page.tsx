'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

interface Interesse {
  id: string;
  nome: string;
}

export default function InteressesPage() {
  const [interesses, setInteresses] = useState<Interesse[]>([]);
  const [selectedInteresses, setSelectedInteresses] = useState<string[]>([]);
  const [newInteresse, setNewInteresse] = useState('');
  const [editingInteresse, setEditingInteresse] = useState<Interesse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!token || !userId) {
      setError('Usuário não autenticado.');
      router.push('/login');
      return;
    }

    const fetchInteresses = async () => {
      try {
        setLoading(true);

        const [allInteressesResponse, userInteressesResponse] =
          await Promise.all([
            apiClient.get('/interesses', {
              headers: { Authorization: `Bearer ${token}` },
            }),
            apiClient.get(`/users/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        setInteresses(allInteressesResponse.data);
        setSelectedInteresses(userInteressesResponse.data.interesses || []);
      } catch (err) {
        console.error('Erro ao carregar interesses:', err);
        setError('Erro ao carregar interesses.');
      } finally {
        setLoading(false);
      }
    };

    fetchInteresses();
  }, [token, userId, router]);

  const handleToggleInteresse = (id: string) => {
    setSelectedInteresses((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleAddInteresse = async () => {
    try {
      if (!newInteresse.trim()) {
        alert('Por favor, insira um nome válido.');
        return;
      }

      const response = await apiClient.post(
        '/interesses',
        { nome: newInteresse },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const addedInteresse = response.data;

      if (!addedInteresse || !addedInteresse.id) {
        throw new Error('Interesse retornado sem ID.');
      }

      setInteresses((prev) => [...prev, addedInteresse]);
      setNewInteresse('');
      alert('Interesse adicionado com sucesso!');
    } catch (err) {
      console.error('Erro ao adicionar interesse:', err);
      setError('Erro ao adicionar interesse.');
    }
  };

  const handleEditInteresse = async () => {
    if (!editingInteresse?.nome.trim()) {
      alert('Por favor, insira um nome válido.');
      return;
    }

    try {
      await apiClient.put(
        `/interesses/${editingInteresse.id}`,
        { nome: editingInteresse.nome },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setInteresses((prev) =>
        prev.map((item) =>
          item.id === editingInteresse.id
            ? { ...item, nome: editingInteresse.nome }
            : item,
        ),
      );
      setEditingInteresse(null);
      alert('Interesse atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao editar interesse:', err);
      setError('Erro ao editar interesse.');
    }
  };

  const handleDeleteInteresse = async (id: string) => {
    try {
      await apiClient.delete(`/interesses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInteresses((prev) => prev.filter((item) => item.id !== id));
      alert('Interesse excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir interesse:', err);
      setError('Erro ao excluir interesse.');
    }
  };

  if (loading) {
    return <p className="text-center text-blue-600">Carregando...</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      <main className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Gerenciamento de Interesses
          </h1>
        </header>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">Adicionar Interesse</h2>
          <div className="flex space-x-4">
            <input
              type="text"
              value={newInteresse}
              onChange={(e) => setNewInteresse(e.target.value)}
              placeholder="Nome do Interesse"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleAddInteresse}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Adicionar
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {interesses.map((interesse) => {
            if (!interesse.id) {
              console.error(`Interesse sem ID:`, interesse);
              return null; // Ignora itens sem ID
            }

            return (
              <div
                key={interesse.id}
                className={`p-4 border rounded-lg cursor-pointer transition ${
                  selectedInteresses.includes(interesse.id)
                    ? 'bg-blue-200 border-blue-600'
                    : 'bg-white border-gray-300'
                }`}
                onClick={() => handleToggleInteresse(interesse.id)}
              >
                <p className="text-center">{interesse.nome}</p>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingInteresse(interesse);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteInteresse(interesse.id);
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {editingInteresse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Editar Interesse</h2>
            <input
              type="text"
              value={editingInteresse.nome}
              onChange={(e) =>
                setEditingInteresse({
                  ...editingInteresse,
                  nome: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setEditingInteresse(null)}
                className="px-4 py-2 text-gray-500 hover:underline"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditInteresse}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
