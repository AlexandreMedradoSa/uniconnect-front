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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId'); // Obter o ID do usuário logado

  useEffect(() => {
    if (!token || !userId) {
      setError('Usuário não autenticado.');
      router.push('/login'); // Redireciona para login caso não tenha token ou ID
      return;
    }

    const fetchInteresses = async () => {
      try {
        setLoading(true);

        // Requisições para listar interesses e perfil do usuário
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
        setError('Erro ao carregar interesses.');
        console.error('Erro:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInteresses();
  }, [token, userId, router]);

  const toggleInteresse = (id: string) => {
    if (selectedInteresses.includes(id)) {
      setSelectedInteresses(selectedInteresses.filter((item) => item !== id));
    } else {
      setSelectedInteresses([...selectedInteresses, id]);
    }
  };

  const saveInteresses = async () => {
    if (!token || !userId) {
      setError('Usuário não autenticado.');
      return;
    }

    try {
      setLoading(true);
      await apiClient.put(
        `/users/${userId}`,
        { interesses: selectedInteresses },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert('Interesses salvos com sucesso!');
    } catch (err) {
      setError('Erro ao salvar interesses.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <p className="text-center text-blue-600">Carregando...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* Menu Lateral */}
      <nav className="w-64 bg-blue-600 text-white p-4">
        <h2 className="text-2xl font-bold mb-4">UniConnect</h2>
        <ul className="space-y-3">
          <li>
            <button
              className="block w-full text-left py-2 px-3 hover:bg-blue-500 rounded"
              onClick={() => router.push('/dashboard')}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              className="block w-full text-left py-2 px-3 hover:bg-blue-500 rounded"
              onClick={() => router.push('/conexoes')}
            >
              Conexões
            </button>
          </li>
          <li>
            <button
              className="block w-full text-left py-2 px-3 hover:bg-blue-500 rounded"
              onClick={() => router.push('/grupos')}
            >
              Grupos de Estudo
            </button>
          </li>
          <li>
            <button
              className="block w-full text-left py-2 px-3 hover:bg-blue-500 rounded"
              onClick={() => router.push('/eventos')}
            >
              Eventos Acadêmicos
            </button>
          </li>
          <li>
            <button
              className="block w-full text-left py-2 px-3 hover:bg-blue-500 rounded"
              onClick={() => router.push('/interesses')}
            >
              Interesses
            </button>
          </li>
        </ul>
      </nav>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Meus Interesses
          </h1>
        </header>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Listagem de Interesses */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {interesses.map((interesse) => (
            <div
              key={interesse.id}
              className={`p-4 border rounded-lg cursor-pointer transition ${
                selectedInteresses.includes(interesse.id)
                  ? 'bg-blue-200 border-blue-600'
                  : 'bg-white border-gray-300'
              }`}
              onClick={() => toggleInteresse(interesse.id)}
            >
              <p className="text-center font-medium text-gray-800">
                {interesse.nome}
              </p>
            </div>
          ))}
        </section>

        <button
          className="mt-6 w-full py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition"
          onClick={saveInteresses}
        >
          Salvar Interesses
        </button>
      </main>
    </div>
  );
}
