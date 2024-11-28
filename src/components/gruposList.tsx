/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import Select from 'react-select';

interface Grupo {
  id: string;
  nome: string;
  descricao: string;
  curso: string;
  semestre: number;
  interesses: string[];
  status: string;
}

interface Option {
  value: string | number;
  label: string;
}

export default function GruposList() {
  const [gruposParticipa, setGruposParticipa] = useState<Grupo[]>([]);
  const [gruposNaoParticipa, setGruposNaoParticipa] = useState<Grupo[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newGrupo, setNewGrupo] = useState({
    nome: '',
    descricao: '',
    curso: '',
    semestre: 1,
    interesses: [] as Option[],
  });
  const [cursos, setCursos] = useState<Option[]>([]);
  const [interesses, setInteresses] = useState<Option[]>([]);

  const router = useRouter(); // Mantendo o router para redirecionamentos
  const token = localStorage.getItem('token');
  const usuarioId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        setLoading(true);
        if (!token || !usuarioId) {
          console.log(usuarioId);
          setError('Usuário não autenticado.');
          return;
        }

        const response = await apiClient.get('/grupos', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const todosGrupos = response.data;

        const gruposClassificados = await Promise.all(
          todosGrupos.map(async (grupo: Grupo) => {
            try {
              const usuariosResponse = await apiClient.get(
                `/grupos/${grupo.id}/usuarios`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              );

              const membros = usuariosResponse.data;
              const participa = membros.some(
                (membro: { id: string }) => membro.id === usuarioId,
              );

              return { grupo, participa };
            } catch (err) {
              console.error(
                `Erro ao verificar membros do grupo ${grupo.id}:`,
                err,
              );
              return { grupo, participa: false };
            }
          }),
        );

        const participa = gruposClassificados
          .filter((resultado) => resultado.participa)
          .map((resultado) => resultado.grupo);

        const naoParticipa = gruposClassificados
          .filter((resultado) => !resultado.participa)
          .map((resultado) => resultado.grupo);

        setGruposParticipa(participa);
        setGruposNaoParticipa(naoParticipa);
      } catch (err) {
        console.error('Erro ao buscar grupos:', err);
        setError('Erro ao carregar grupos.');
      } finally {
        setLoading(false);
      }
    };

    fetchGrupos();
  }, [token, usuarioId]);

  const handleSearch = async () => {
    if (!search.trim()) {
      return;
    }

    try {
      setLoading(true);
      if (!token || !usuarioId) {
        console.log(usuarioId);
        setError('Usuário não autenticado.');
        return;
      }

      const response = await apiClient.get('/grupos/search', {
        headers: { Authorization: `Bearer ${token}` },
        params: { nome: search },
      });

      const resultadoBusca = response.data;

      const gruposClassificados = await Promise.all(
        resultadoBusca.map(async (grupo: Grupo) => {
          try {
            const usuariosResponse = await apiClient.get(
              `/grupos/${grupo.id}/usuarios`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );

            const membros = usuariosResponse.data;
            const participa = membros.some(
              (membro: { id: string }) => membro.id === usuarioId,
            );

            return { grupo, participa };
          } catch (err) {
            console.error(
              `Erro ao verificar membros do grupo ${grupo.id}:`,
              err,
            );
            return { grupo, participa: false };
          }
        }),
      );

      const participa = gruposClassificados
        .filter((resultado) => resultado.participa)
        .map((resultado) => resultado.grupo);

      const naoParticipa = gruposClassificados
        .filter((resultado) => !resultado.participa)
        .map((resultado) => resultado.grupo);

      setGruposParticipa(participa);
      setGruposNaoParticipa(naoParticipa);
    } catch (err) {
      console.error('Erro na pesquisa:', err);
      setError('Erro ao buscar grupos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCreating) {
      const fetchCursosEInteresses = async () => {
        try {
          const cursosResponse = await apiClient.get('/cursos', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCursos(
            cursosResponse.data.map((curso: any) => ({
              value: curso.id,
              label: curso.nome,
            })),
          );

          const interessesResponse = await apiClient.get('/interesses', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setInteresses(
            interessesResponse.data.map((interesse: any) => ({
              value: interesse.id,
              label: interesse.nome,
            })),
          );
        } catch (err) {
          console.error('Erro ao carregar cursos e interesses:', err);
          setError('Erro ao carregar dados para criação de grupo.');
        }
      };

      fetchCursosEInteresses();
    }
  }, [isCreating, token]);

  const handleCreateGrupo = async () => {
    try {
      if (!token || !usuarioId) {
        setError('Usuário não autenticado.');
        return;
      }

      const response = await apiClient.post(
        '/grupos',
        {
          ...newGrupo,
          curso: newGrupo.curso,
          interesses: newGrupo.interesses.map((i) => i.label),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status === 201) {
        const novoGrupo = response.data;
        console.log(novoGrupo);
        // Adicionando o usuário como administrador e membro do grupo
        await apiClient.post(
          `/grupos/${novoGrupo.grupoId}/usuarios`,
          { funcao: 'admin' },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        alert(
          'Grupo criado com sucesso e você foi adicionado como administrador!',
        );
        setIsCreating(false);
        setNewGrupo({
          nome: '',
          descricao: '',
          curso: '',
          semestre: 1,
          interesses: [],
        });

        const gruposResponse = await apiClient.get('/grupos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const todosGrupos = gruposResponse.data;

        const gruposClassificados = await Promise.all(
          todosGrupos.map(async (grupo: Grupo) => {
            try {
              const usuariosResponse = await apiClient.get(
                `/grupos/${grupo.id}/usuarios`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              );

              const membros = usuariosResponse.data;
              const participa = membros.some(
                (membro: { id: string }) => membro.id === usuarioId,
              );

              return { grupo, participa };
            } catch (err) {
              console.error(
                `Erro ao verificar membros do grupo ${grupo.id}:`,
                err,
              );
              return { grupo, participa: false };
            }
          }),
        );

        const participa = gruposClassificados
          .filter((resultado) => resultado.participa)
          .map((resultado) => resultado.grupo);

        const naoParticipa = gruposClassificados
          .filter((resultado) => !resultado.participa)
          .map((resultado) => resultado.grupo);

        setGruposParticipa(participa);
        setGruposNaoParticipa(naoParticipa);
      }
    } catch (err) {
      console.error('Erro ao criar grupo:', err);
      setError('Erro ao criar grupo de estudo.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-blue-600 text-lg font-semibold">
          Carregando grupos...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-6">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">
              Grupos de Estudo
            </h1>
            <p className="text-gray-700 mt-2">
              Explore e participe de grupos de estudo baseados nos seus
              interesses e curso!
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
          >
            Criar Grupo
          </button>
        </header>

        {error && (
          <div className="mb-6 p-4 text-red-700 bg-red-100 border border-red-200 rounded">
            {error}
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar grupos..."
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Pesquisar
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-blue-600">
            Grupos que você participa
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gruposParticipa.map((grupo) => (
              <div
                key={grupo.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:bg-blue-50 cursor-pointer transition"
                onClick={() => router.push(`/grupos/${grupo.id}`)}
              >
                <h2 className="text-lg font-semibold text-blue-600">
                  {grupo.nome}
                </h2>
                <p className="text-gray-700 mt-2 line-clamp-3">
                  {grupo.descricao}
                </p>
                <div className="text-gray-700 mt-2 line-clamp-3">
                  <p>Curso: {grupo.curso}</p>
                </div>
                <div className="text-gray-700 mt-2 line-clamp-3">
                  <p>Interesses: {grupo.interesses.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-blue-600">
            Grupos que você não participa
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gruposNaoParticipa.map((grupo) => (
              <div
                key={grupo.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:bg-blue-50 cursor-pointer transition"
                onClick={() => router.push(`/grupos/${grupo.id}`)}
              >
                <h2 className="text-lg font-semibold text-blue-600">
                  {grupo.nome}
                </h2>
                <p className="text-gray-700 mt-2 line-clamp-3">
                  {grupo.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>

        {gruposParticipa.length === 0 && gruposNaoParticipa.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            Nenhum grupo encontrado.
          </p>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Criar Novo Grupo</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome do Grupo"
                value={newGrupo.nome}
                onChange={(e) =>
                  setNewGrupo({ ...newGrupo, nome: e.target.value })
                }
                className="w-full p-2 border rounded-md"
              />
              <textarea
                placeholder="Descrição"
                value={newGrupo.descricao}
                onChange={(e) =>
                  setNewGrupo({ ...newGrupo, descricao: e.target.value })
                }
                className="w-full p-2 border rounded-md"
              />
              <Select
                options={cursos}
                placeholder="Selecione um Curso"
                value={cursos.find((c) => c.value === newGrupo.curso)}
                onChange={(selected) =>
                  setNewGrupo({ ...newGrupo, curso: selected?.label || '' })
                }
              />
              <input
                type="number"
                placeholder="Semestre"
                value={newGrupo.semestre}
                onChange={(e) => {
                  if (e.target.value) {
                    setNewGrupo({
                      ...newGrupo,
                      semestre: parseInt(e.target.value),
                    });
                  }
                }}
                className="w-full p-2 border rounded-md"
              />
              <Select
                options={interesses}
                isMulti
                placeholder="Selecione os Interesses"
                value={newGrupo.interesses}
                onChange={(selected) => {
                  setNewGrupo({
                    ...newGrupo,
                    interesses: selected ? [...selected] : [], // Converte para um array mutável
                  });
                }}
              />
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 border rounded-md text-gray-500 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateGrupo}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
