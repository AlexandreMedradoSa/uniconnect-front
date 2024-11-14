'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

interface Conexao {
  id: string;
  name: string;
}

export default function ConexoesPage() {
  const [conexoes, setConexoes] = useState<Conexao[]>([]);
  const [searchResults, setSearchResults] = useState<Conexao[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const router = useRouter();

  useEffect(() => {
    const fetchConexoes = async () => {
      try {
        setLoading(true);
        if (!token || !userId) {
          setError('Usuário não autenticado.');
          return;
        }

        const response = await apiClient.get(`/users/${userId}/conexoes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setConexoes(response.data);
      } catch (err) {
        setError('Erro ao carregar conexões.');
        console.error('Erro ao buscar conexões:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConexoes();
  }, [token, userId]);

  const handleSearch = async () => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get('/users/search', {
        headers: { Authorization: `Bearer ${token}` },
        params: { nome: search },
      });

      setSearchResults(
        response.data.map((result: Conexao, index: number) => ({
          ...result,
          id: result.id || `search-${index}`, // Garantir chave única
        })),
      );
    } catch (err) {
      setError('Erro ao buscar usuários.');
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  const enviarSolicitacao = async (amigoId: string) => {
    try {
      setLoading(true);
      await apiClient.post(
        `/users/${amigoId}/conexoes`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert('Solicitação enviada com sucesso!');
    } catch (err) {
      setError('Erro ao enviar solicitação.');
      console.error('Erro ao enviar solicitação:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center text-blue-600">Carregando...</p>;
  }

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
        </ul>
      </nav>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Minhas Conexões
          </h1>
        </header>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Busca */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded w-full"
            placeholder="Buscar usuários por nome"
          />
          <button
            className="mt-2 w-full py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
            onClick={handleSearch}
          >
            Buscar
          </button>
        </div>

        {/* Resultados da Busca */}
        {searchResults.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-700">Resultados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="p-4 border rounded-lg bg-white shadow flex flex-col items-center"
                >
                  <p className="font-medium text-gray-800 text-center">
                    {result.name}
                  </p>
                  <button
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => enviarSolicitacao(result.id)}
                  >
                    Conectar
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Conexões Aceitas */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-700">Conexões Aceitas</h2>
          {conexoes.length === 0 ? (
            <p className="text-gray-500">
              Você ainda não tem conexões aceitas.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {conexoes.map((conexao) => (
                <div
                  key={conexao.id}
                  className="p-4 border rounded-lg bg-white shadow"
                >
                  <p className="font-medium text-gray-800">{conexao.name}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
