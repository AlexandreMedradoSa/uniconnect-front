/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
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

interface Usuario {
  id: string;
  nome: string;
  funcao: string; // admin ou membro
}

interface Option {
  value: string | number;
  label: string;
}

interface Objetivo {
  id: string;
  descricao: string;
  status: 'pendente' | 'em progresso' | 'concluido';
}

export default function GrupoDetails({ grupoId }: { grupoId: string }) {
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [participa, setParticipa] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Controle para determinar se o usuário é admin
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false); // Controle para modo de edição
  const [editData, setEditData] = useState({
    nome: '',
    descricao: '',
    curso: '',
    semestre: 1,
    interesses: [] as Option[],
    notas: '',
  });

  const [cursos, setCursos] = useState<Option[]>([]);
  const [interesses, setInteresses] = useState<Option[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [novoObjetivo, setNovoObjetivo] = useState('');
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const fetchGrupoDetails = async () => {
    if (!token) {
      setError('Usuário não autenticado.');
      return;
    }

    try {
      const [grupoResponse, usuariosResponse] = await Promise.all([
        apiClient.get(`/grupos/${grupoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiClient.get(`/grupos/${grupoId}/usuarios`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setGrupo(grupoResponse.data);
      setEditData({
        nome: grupoResponse.data.nome,
        descricao: grupoResponse.data.descricao,
        curso: grupoResponse.data.curso,
        semestre: grupoResponse.data.semestre,
        interesses: grupoResponse.data.interesses.map((i: string) => ({
          value: i,
          label: i,
        })),
        notas: grupoResponse.data.notas || '',
      });

      setUsuarios(usuariosResponse.data);

      // Verificar se o usuário logado é admin
      const currentUser = usuariosResponse.data.find(
        (usuario: Usuario) => usuario.id === userId,
      );

      if (currentUser) {
        setParticipa(true);
        setIsAdmin(currentUser.funcao === 'admin'); // Define isAdmin se o usuário for administrador
      }
    } catch (err) {
      console.error('Erro ao carregar detalhes do grupo:', err);
      setError('Erro ao carregar detalhes do grupo.');
    }
  };

  const fetchCursosEInteresses = async () => {
    if (!token) return;

    try {
      const [cursosResponse, interessesResponse] = await Promise.all([
        apiClient.get('/cursos', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiClient.get('/interesses', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setCursos(
        cursosResponse.data.map((curso: any) => ({
          value: curso.id,
          label: curso.nome,
        })),
      );

      setInteresses(
        interessesResponse.data.map((interesse: any) => ({
          value: interesse.id,
          label: interesse.nome,
        })),
      );
    } catch (err) {
      console.error('Erro ao carregar cursos e interesses:', err);
      setError('Erro ao carregar dados para edição.');
    }
  };

  const fetchObjetivos = async () => {
    try {
      const response = await apiClient.get(`/grupos/${grupoId}/objetivos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setObjetivos(response.data); // O backend deve retornar objetos no formato da interface Objetivo
    } catch (err) {
      console.error('Erro ao buscar objetivos:', err);
      setError('Erro ao buscar objetivos.');
    }
  };

  const addObjetivo = async (descricao: string) => {
    try {
      await apiClient.post(
        `/grupos/${grupoId}/objetivos`,
        { descricao },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert('Objetivo adicionado com sucesso!');
      fetchObjetivos(); // Atualiza a lista de objetivos
    } catch (err) {
      console.error('Erro ao adicionar objetivo:', err);
      setError('Erro ao adicionar objetivo.');
    }
  };

  const updateObjetivoStatus = async (objetivoId: string, status: string) => {
    try {
      await apiClient.put(
        `/objetivos/${objetivoId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert('Status do objetivo atualizado com sucesso!');
      fetchObjetivos(); // Atualiza a lista de objetivos
    } catch (err) {
      console.error('Erro ao atualizar status do objetivo:', err);
      setError('Erro ao atualizar status.');
    }
  };

  const deleteObjetivo = async (objetivoId: string) => {
    try {
      await apiClient.delete(`/objetivos/${objetivoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Objetivo excluído com sucesso!');
      fetchObjetivos(); // Atualiza a lista de objetivos
    } catch (err) {
      console.error('Erro ao excluir objetivo:', err);
      setError('Erro ao excluir objetivo.');
    }
  };

  useEffect(() => {
    fetchGrupoDetails();
    fetchObjetivos();
  }, [grupoId, token]);

  useEffect(() => {
    if (editing) {
      fetchCursosEInteresses();
    }
  }, [editing]);

  const handleEntrarNoGrupo = async () => {
    if (!token) {
      setError('Usuário não autenticado.');
      return;
    }

    try {
      await apiClient.post(
        `/grupos/${grupoId}/usuarios`,
        { funcao: 'membro' },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert('Você entrou no grupo.');
      setError(null); // Limpar erro se a ação for bem-sucedida
      fetchGrupoDetails(); // Recarregar detalhes do grupo
    } catch (err) {
      console.error('Erro ao entrar no grupo:', err);
      setError('Erro ao entrar no grupo.');
    }
  };

  const handleSairDoGrupo = async () => {
    if (!token) {
      setError('Usuário não autenticado.');
      return;
    }

    try {
      await apiClient.delete(`/grupos/${grupoId}/usuarios/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Você saiu do grupo.');
      setError(null); // Limpar erro se a ação for bem-sucedida
      setParticipa(false);
      fetchGrupoDetails();
    } catch (err) {
      console.error('Erro ao sair do grupo:', err);
      setError('Erro ao sair do grupo.');
    }
  };

  const handleExcluirGrupo = async () => {
    if (!token) {
      setError('Usuário não autenticado.');
      return;
    }

    try {
      await apiClient.delete(`/grupos/${grupoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Grupo excluído com sucesso.');
      window.location.href = '/grupos'; // Redirecionar para a lista de grupos
    } catch (err) {
      console.error('Erro ao excluir grupo:', err);
      setError('Erro ao excluir grupo.');
    }
  };

  const handleRemoverMembro = async (usuarioId: string) => {
    if (!token) {
      setError('Usuário não autenticado.');
      return;
    }

    try {
      await apiClient.delete(`/grupos/${grupoId}/usuarios/${usuarioId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Membro removido com sucesso.');
      fetchGrupoDetails(); // Atualizar a lista de membros
    } catch (err) {
      console.error('Erro ao remover membro:', err);
      setError('Erro ao remover membro.');
    }
  };

  const handleSalvarEdicao = async () => {
    if (!token) {
      setError('Usuário não autenticado.');
      return;
    }

    try {
      await apiClient.put(
        `/grupos/${grupoId}`,
        {
          nome: editData.nome,
          descricao: editData.descricao,
          curso: editData.curso,
          semestre: editData.semestre,
          interesses: editData.interesses.map((i) => i.label),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert('Grupo atualizado com sucesso.');
      setEditing(false);
      fetchGrupoDetails(); // Atualizar os detalhes do grupo
    } catch (err) {
      console.error('Erro ao salvar edição:', err);
      setError('Erro ao salvar edição do grupo.');
    }
  };

  const fetchNotas = async () => {
    try {
      const response = await apiClient.get(`/grupos/${grupoId}/notas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditData((prev) => ({ ...prev, notas: response.data }));
    } catch (err) {
      console.error('Erro ao carregar notas:', err);
      setError('Erro ao carregar notas.');
    }
  };

  const salvarNotas = async () => {
    try {
      await apiClient.put(
        `/grupos/${grupoId}/notas`,
        { notas: editData.notas },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert('Notas salvas com sucesso!');
      fetchNotas();
    } catch (err) {
      console.error('Erro ao salvar notas:', err);
      setError('Erro ao salvar notas.');
    }
  };

  if (!grupo) {
    return (
      <p className="text-center text-blue-600">
        Carregando detalhes do grupo...
      </p>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {editing ? (
              <input
                type="text"
                value={editData.nome}
                onChange={(e) =>
                  setEditData({ ...editData, nome: e.target.value })
                }
                className="w-full p-2 border rounded-md"
              />
            ) : (
              grupo.nome
            )}
          </h1>
          <p className="text-gray-600 mt-2">
            {editing ? (
              <textarea
                value={editData.descricao}
                onChange={(e) =>
                  setEditData({ ...editData, descricao: e.target.value })
                }
                className="w-full p-2 border rounded-md"
              />
            ) : (
              grupo.descricao
            )}
          </p>
        </header>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Informações do Grupo
          </h2>
          <div>
            <strong>Curso:</strong>{' '}
            {editing ? (
              <Select
                options={cursos}
                value={cursos.find((c) => c.label === editData.curso)} // Preenche com o curso atual
                onChange={(selected) =>
                  setEditData({ ...editData, curso: selected?.label || '' })
                }
                placeholder="Selecione um Curso"
              />
            ) : (
              grupo.curso
            )}
          </div>
          <p>
            <strong>Semestre:</strong>{' '}
            {editing ? (
              <input
                type="number"
                value={editData.semestre}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    semestre: parseInt(e.target.value, 10),
                  })
                }
                className="w-full p-2 border rounded-md"
              />
            ) : (
              grupo.semestre
            )}
          </p>
          <div>
            <strong>Interesses:</strong>{' '}
            {editing ? (
              <Select
                options={interesses}
                isMulti
                value={editData.interesses}
                onChange={(selected) =>
                  setEditData({
                    ...editData,
                    interesses: selected ? [...selected] : [], // Converte para um array mutável
                  })
                }
                placeholder="Selecione Interesses"
              />
            ) : (
              grupo.interesses.join(', ')
            )}
          </div>
        </div>
        {participa ? (
          <section className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Notas do Grupo
            </h2>
            <textarea
              value={editData.notas}
              onChange={(e) =>
                setEditData({ ...editData, notas: e.target.value })
              }
              disabled={!editing}
              className="w-full p-2 border rounded-md"
            />
            {editing && (
              <button
                onClick={salvarNotas}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Salvar Notas
              </button>
            )}
          </section>
        ) : (
          <section className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Notas do Grupo
            </h2>
            <p className="text-gray-500">
              Torne-se um membro para acessar as notas do grupo.
            </p>
          </section>
        )}
        {participa ? (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Objetivos do Grupo
            </h2>

            {objetivos.length === 0 ? (
              <p className="text-gray-500">Nenhum objetivo definido ainda.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {objetivos.map((objetivo) => (
                  <li
                    key={objetivo.id}
                    className="py-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-gray-800">{objetivo.descricao}</p>
                      <p className="text-sm text-gray-600">
                        Status: {objetivo.status}
                      </p>
                    </div>
                    {isAdmin && (
                      <div className="flex space-x-4">
                        <select
                          value={objetivo.status}
                          onChange={(e) =>
                            updateObjetivoStatus(objetivo.id, e.target.value)
                          }
                          className="p-2 border rounded"
                        >
                          <option value="pendente">Pendente</option>
                          <option value="em progresso">Em Progresso</option>
                          <option value="concluido">Concluído</option>
                        </select>
                        <button
                          onClick={() => deleteObjetivo(objetivo.id)}
                          className="text-red-600 hover:underline"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {isAdmin && (
              <div className="mt-4">
                <textarea
                  placeholder="Descrição do objetivo"
                  value={novoObjetivo}
                  onChange={(e) => setNovoObjetivo(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
                <button
                  onClick={() => addObjetivo(novoObjetivo)}
                  className="w-full mt-2 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Adicionar Objetivo
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Objetivos do Grupo
            </h2>
            <p className="text-gray-500">
              Torne-se um membro para acessar os objetivos do grupo.
            </p>
          </div>
        )}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Membros</h2>
          {usuarios.length === 0 ? (
            <p className="text-gray-500">Nenhum membro encontrado.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <li
                  key={usuario.id}
                  className="py-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-800">{usuario.nome}</p>
                    <p className="text-gray-600 text-sm">
                      {usuario.funcao === 'admin' ? 'Administrador' : 'Membro'}
                    </p>
                  </div>
                  {isAdmin && usuario.funcao !== 'admin' && (
                    <button
                      onClick={() => handleRemoverMembro(usuario.id)}
                      className="text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}

        {isAdmin && (
          <div className="mt-6 space-y-4">
            <button
              onClick={() => {
                if (editing) {
                  handleSalvarEdicao(); // Chama a função de salvar alterações
                } else {
                  setEditing(true); // Entra no modo de edição
                }
              }}
              className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {editing ? 'Salvar Alterações' : 'Editar Grupo'}
            </button>
            <button
              onClick={handleExcluirGrupo}
              className="w-full py-3 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Excluir Grupo
            </button>
          </div>
        )}

        {!isAdmin && participa && (
          <button
            onClick={handleSairDoGrupo}
            className="mt-6 w-full py-3 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Sair do Grupo
          </button>
        )}

        {!participa && (
          <button
            onClick={handleEntrarNoGrupo}
            className="mt-6 w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Entrar no Grupo
          </button>
        )}
      </main>
    </div>
  );
}
