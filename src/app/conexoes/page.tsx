/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface Conexao {
  id: string;
  name: string;
  curso: string;
  semestre: number;
  interesses: string[];
}

export default function ConexoesPage() {
  const [conexoes, setConexoes] = useState<Conexao[]>([]);
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState<Conexao[]>(
    [],
  );
  const [solicitacoesEnviadas, setSolicitacoesEnviadas] = useState<Conexao[]>(
    [],
  );
  const [searchResults, setSearchResults] = useState<Conexao[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sugestoes, setSugestoes] = useState<Conexao[]>([]);
  const [cursoFilter, setCursoFilter] = useState('');
  const [interessesFilter, setInteressesFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const fetchSugestoes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/users/${userId}/sugestoes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSugestoes(response.data);
      setError(null); // Limpa erros após busca bem-sucedida
    } catch (err) {
      console.error('Erro ao buscar sugestões:', err);
      setError('Erro ao buscar sugestões de conexões.');
    } finally {
      setLoading(false);
    }
  };
  const fetchFilteredConexoes = async () => {
    try {
      // Validação para impedir a execução se nenhum filtro for preenchido
      if (!cursoFilter && !interessesFilter) {
        setError('Por favor, preencha pelo menos um filtro antes de buscar.');
        return; // Interrompe a execução
      }

      setLoading(true);

      const params = {
        curso: cursoFilter || undefined, // Envia o filtro de curso apenas se preenchido
        interesses: interessesFilter || undefined, // Envia o filtro de interesses apenas se preenchido
      };

      // Remove propriedades undefined dos parâmetros para evitar erros na URL
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined),
      );

      const response = await apiClient.get('/users/search', {
        headers: { Authorization: `Bearer ${token}` },
        params: filteredParams,
      });

      setConexoes(response.data); // Atualiza o estado com as conexões filtradas
      setError(null); // Limpa erros após busca bem-sucedida
    } catch (err) {
      console.error('Erro ao buscar conexões filtradas:', err);
      setError('Erro ao buscar conexões filtradas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !userId) {
      setError('Usuário não autenticado.');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const [conexoesResponse, solicitacoesResponse, enviadasResponse] =
          await Promise.all([
            apiClient.get(`/users/${userId}/conexoes`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            apiClient.get(`/users/${userId}/conexoes/pendentes`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            apiClient.get(`/users/${userId}/conexoes/enviadas`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
        await fetchSugestoes();
        setConexoes(conexoesResponse.data);
        setSolicitacoesPendentes(solicitacoesResponse.data);
        setSolicitacoesEnviadas(enviadasResponse.data);
        setError(null); // Limpa erros após carregamento bem-sucedido
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar conexões.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

      const filteredResults = response.data.filter(
        (user: Conexao) => user.id !== userId,
      );
      setSearchResults(filteredResults);
      setError(null); // Limpa erros após busca bem-sucedida
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError('Erro ao buscar usuários.');
    } finally {
      setLoading(false);
    }
  };

  const handleAceitarConexao = async (amigoId: string) => {
    try {
      setLoading(true);
      await apiClient.put(
        `/users/${amigoId}/conexoes/aceitar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSolicitacoesPendentes((prev) =>
        prev.filter((solicitacao) => solicitacao.id !== amigoId),
      );

      const solicitacaoAceita = solicitacoesPendentes.find(
        (solicitacao) => solicitacao.id === amigoId,
      );

      if (solicitacaoAceita) {
        setConexoes((prev) => [...prev, solicitacaoAceita]);
      }

      alert('Conexão aceita com sucesso!');
    } catch (err) {
      console.error('Erro ao aceitar a conexão:', err);
      setError('Erro ao aceitar a conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecusarConexao = async (amigoId: string) => {
    try {
      setLoading(true);
      await apiClient.put(
        `/users/${amigoId}/conexoes/recusar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSolicitacoesPendentes((prev) =>
        prev.filter((solicitacao) => solicitacao.id !== amigoId),
      );

      alert('Conexão recusada com sucesso!');
    } catch (err) {
      console.error('Erro ao recusar a conexão:', err);
      setError('Erro ao recusar a conexão.');
    } finally {
      setLoading(false);
    }
  };

  const enviarSolicitacao = async (amigoId: string) => {
    try {
      setLoading(true);

      // Enviar solicitação de conexão
      const response = await apiClient.post(
        `/users/${amigoId}/conexoes`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Atualizar a lista de sugestões
      setSugestoes((prev) =>
        prev.filter((sugestao) => sugestao.id !== amigoId),
      );

      // Adicionar à lista de solicitações enviadas
      const usuarioSolicitado = sugestoes.find(
        (sugestao) => sugestao.id === amigoId,
      );

      if (usuarioSolicitado) {
        setSolicitacoesEnviadas((prev) => [...prev, usuarioSolicitado]);
      }

      alert(response.data.message || 'Solicitação enviada com sucesso!');
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
        // Exibe a mensagem de erro retornada pelo backend
        setError(err.response.data.message || 'Erro ao enviar solicitação.');
      } else {
        console.error('Erro ao enviar solicitação:', err);
        setError('Erro ao enviar solicitação.');
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelarSolicitacao = async (amigoId: string) => {
    try {
      setLoading(true);
      await apiClient.delete(`/users/${amigoId}/conexoes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Atualiza a lista de solicitações enviadas
      setSolicitacoesEnviadas((prev) =>
        prev.filter((solicitacao) => solicitacao.id !== amigoId),
      );

      alert('Solicitação de conexão cancelada com sucesso!');
    } catch (err) {
      console.error('Erro ao cancelar a solicitação:', err);
      setError('Erro ao cancelar a solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const desfazerConexao = async (amigoId: string) => {
    console.log('Desfazendo conexão com amigoId:', amigoId); // Adicionado log
    try {
      setLoading(true);
      await apiClient.delete(`/users/${amigoId}/conexoes/desfazer`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Atualiza a lista de conexões
      setConexoes((prev) => prev.filter((conexao) => conexao.id !== amigoId));

      alert('Conexão desfeita com sucesso!');
    } catch (err) {
      console.error('Erro ao desfazer a conexão:', err);
      setError('Erro ao desfazer a conexão.');
    } finally {
      setLoading(false);
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
            Minhas Conexões
          </h1>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </header>

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

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-2">
            Filtrar Conexões
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={cursoFilter}
              onChange={(e) => setCursoFilter(e.target.value)}
              className="p-2 border rounded w-full"
              placeholder="Filtrar por curso"
            />
            <input
              type="text"
              value={interessesFilter}
              onChange={(e) => setInteressesFilter(e.target.value)}
              className="p-2 border rounded w-full"
              placeholder="Filtrar por interesses (separados por vírgula)"
            />
          </div>
          <button
            className="py-2 px-4 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
            onClick={fetchFilteredConexoes}
          >
            Aplicar Filtros
          </button>
        </div>

        {searchResults.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-700">Resultados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="p-4 border rounded-lg bg-white shadow"
                >
                  <p className="font-medium text-gray-800">{result.name}</p>
                  <p className="text-sm text-gray-600">Curso: {result.curso}</p>
                  <p className="text-sm text-gray-600">
                    Semestre: {result.semestre}
                  </p>
                  <p className="text-sm text-gray-600">
                    Interesses:{' '}
                    {result.interesses.join(', ') || 'Nenhum interesse'}
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

        {sugestoes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-700">
              Sugestões de Conexões
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sugestoes.map((sugestao) => (
                <div
                  key={sugestao.id}
                  className="p-4 border rounded-lg bg-white shadow"
                >
                  <p className="font-medium text-gray-800">{sugestao.name}</p>
                  <p className="text-sm text-gray-600">
                    Curso: {sugestao.curso}
                  </p>
                  <p className="text-sm text-gray-600">
                    Semestre: {sugestao.semestre}
                  </p>
                  <p className="text-sm text-gray-600">
                    Interesses:{' '}
                    {sugestao.interesses.join(', ') || 'Nenhum interesse'}
                  </p>
                  <button
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => enviarSolicitacao(sugestao.id)}
                  >
                    Conectar
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {solicitacoesPendentes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-700">
              Solicitações Pendentes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {solicitacoesPendentes.map((solicitacao) => (
                <div
                  key={solicitacao.id}
                  className="p-4 border rounded-lg bg-white shadow"
                >
                  <p className="font-bold text-xl text-gray-800">
                    {solicitacao.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Curso: {solicitacao.curso}
                  </p>
                  <p className="text-sm text-gray-600">
                    Semestre: {solicitacao.semestre}
                  </p>
                  <p className="text-sm text-gray-600">
                    Interesses:{' '}
                    {solicitacao.interesses.join(', ') || 'Nenhum interesse'}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => handleAceitarConexao(solicitacao.id)}
                    >
                      Aceitar
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => handleRecusarConexao(solicitacao.id)}
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {solicitacoesEnviadas.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-700">
              Solicitações Enviadas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {solicitacoesEnviadas.map((solicitacao) => (
                <div
                  key={solicitacao.id}
                  className="p-4 border rounded-lg bg-white shadow"
                >
                  <p className="font-medium text-gray-800">
                    {solicitacao.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Curso: {solicitacao.curso}
                  </p>
                  <p className="text-sm text-gray-600">
                    Semestre: {solicitacao.semestre}
                  </p>
                  <p className="text-sm text-gray-600">
                    Interesses:{' '}
                    {solicitacao.interesses.join(', ') || 'Nenhum interesse'}
                  </p>
                  <button
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => cancelarSolicitacao(solicitacao.id)}
                  >
                    Cancelar
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-700">Conexões</h2>
          {conexoes.length === 0 ? (
            <p className="text-gray-500">Você ainda não tem Conexões.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {conexoes.map((conexao) => (
                <div
                  key={conexao.id}
                  className="p-4 border rounded-lg bg-white shadow"
                >
                  <p className="font-bold text-xl text-gray-800">
                    {conexao.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Curso: {conexao.curso}
                  </p>
                  <p className="text-sm text-gray-600">
                    Semestre: {conexao.semestre}
                  </p>
                  <p className="text-sm text-gray-600">
                    Interesses:{' '}
                    {conexao.interesses.join(', ') || 'Nenhum interesse'}
                  </p>
                  <button
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => desfazerConexao(conexao.id)}
                  >
                    Desfazer
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
