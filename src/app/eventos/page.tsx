/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface Evento {
  id: string;
  nome: string;
  descricao: string;
  criador_id: string;
  data: string;
  curso: string;
  localizacao: string;
  observacoes_adicionais: string;
  limite_participantes?: number;
  total_participantes: number;
  participa?: boolean; // Indica se o usuário participa do evento
  conexoesParticipando?: string[]; // IDs das conexões que estão participando
  evento_participantes?: string[]; // IDs dos participantes
}

export default function EventosList() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [historico, setHistorico] = useState<Evento[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [currentEvento, setCurrentEvento] = useState<Evento | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isViewingParticipants, setIsViewingParticipants] = useState(false);
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [newEvento, setNewEvento] = useState({
    nome: '',
    descricao: '',
    data: '',
    curso: '',
    localizacao: '',
    observacoes_adicionais: '',
    limite_participantes: 0,
  });
  const userId = localStorage.getItem('userId');

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchEventos = async () => {
    try {
      setLoading(true);

      const [eventosResponse, historicoResponse, conexoesResponse] =
        await Promise.all([
          apiClient.get('/eventos', {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
          token
            ? apiClient.get('/eventos/historico', {
                headers: { Authorization: `Bearer ${token}` },
              })
            : { data: [] },
          token
            ? apiClient.get(`/users/${userId}/conexoes`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : { data: [] },
        ]);

      const eventosParticipadosIds = historicoResponse.data.map(
        (evento: Evento) => evento.id,
      );

      const conexoes = conexoesResponse.data.map((conexao: any) => ({
        id: conexao.id,
        nome: conexao.name,
      }));

      const eventosDisponiveis = eventosResponse.data.map((evento: Evento) => {
        const participantesIds = (evento.evento_participantes || []).map(
          (participante: any) => participante.usuario_id,
        );

        const conexoesParticipandoNomes = participantesIds
          .filter((id: string) =>
            conexoes.some((conexao: { id: string }) => conexao.id === id),
          )
          .map((id: string) => {
            const conexao = conexoes.find(
              (conexao: { id: string }) => conexao.id === id,
            );
            return conexao ? conexao.nome : id;
          });

        return {
          ...evento,
          participa: eventosParticipadosIds.includes(evento.id),
          conexoesParticipando: conexoesParticipandoNomes,
        };
      });

      setEventos(eventosDisponiveis);
      setHistorico(historicoResponse.data);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
      setError('Erro ao carregar eventos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, [token]);

  const handleParticipar = async (eventoId: string) => {
    if (!eventoId) {
      console.error('ID do evento inválido.');
      alert('Erro interno: ID do evento não encontrado.');
      return;
    }

    try {
      await apiClient.post(
        `/eventos/${eventoId}/participar`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert('Participação confirmada!');
      fetchEventos();
    } catch (err) {
      console.error('Erro ao participar do evento:', err);
      setError('Erro ao participar do evento.');
    }
  };

  const handleCancelarParticipacao = async (eventoId: string) => {
    try {
      await apiClient.delete(`/eventos/${eventoId}/participar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Participação cancelada!');
      fetchEventos();
    } catch (err) {
      console.error('Erro ao cancelar participação:', err);
      setError('Erro ao cancelar participação.');
    }
  };

  const handleCreateEvento = async () => {
    if (!newEvento.data) {
      alert('A data do evento é obrigatória.');
      return;
    }

    try {
      await apiClient.post('/eventos', newEvento, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Evento criado com sucesso!');
      setIsCreating(false);
      fetchEventos();
    } catch (err) {
      console.error('Erro ao criar evento:', err);
      setError('Erro ao criar evento.');
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      setLoading(true);
      const response = await apiClient.get('/eventos', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        params: { nome: search },
      });

      const eventosParticipadosResponse = token
        ? await apiClient.get('/eventos/historico', {
            headers: { Authorization: `Bearer ${token}` },
          })
        : { data: [] };

      const eventosParticipadosIds = eventosParticipadosResponse.data.map(
        (evento: Evento) => evento.id,
      );

      const eventosFiltrados = response.data.map((evento: Evento) => ({
        ...evento,
        participa: eventosParticipadosIds.includes(evento.id),
      }));

      setEventos(eventosFiltrados);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
      setError('Erro ao buscar eventos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipantes = async (eventoId: string) => {
    try {
      const response = await apiClient.get(
        `/eventos/${eventoId}/participantes`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      console.log(response.data);
      setParticipantes(response.data); // Atualiza os participantes
    } catch (err) {
      console.error('Erro ao buscar participantes:', err);
      setError('Erro ao carregar participantes do evento.');
      setParticipantes([]); // Garante que o modal não exiba dados inconsistentes
    }
  };

  const handleVerParticipantes = async (evento: Evento) => {
    setCurrentEvento(evento);
    await fetchParticipantes(evento.id);
    setIsViewingParticipants(true);
  };

  const handleDeleteEvento = async (eventoId: string) => {
    try {
      await apiClient.delete(`/eventos/${eventoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Evento excluído com sucesso!');
      fetchEventos(); // Atualizar a lista de eventos
    } catch (err) {
      console.error('Erro ao excluir evento:', err);
      setError('Erro ao excluir evento.');
    }
  };

  const handleEditEvento = (evento: Evento) => {
    setEditingEvento({
      ...evento,
      data: evento.data.split('T')[0], // Extraindo apenas a parte da data
    });
  };

  console.log(editingEvento);

  const handleUpdateEvento = async () => {
    if (!editingEvento) return;
    try {
      await apiClient.put(
        `/eventos/${editingEvento.id}`,
        {
          ...editingEvento,
          data: `${editingEvento.data}T00:00:00`, // Adicionando horário fixo
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert('Evento atualizado com sucesso!');
      setEditingEvento(null);
      fetchEventos(); // Atualizar a lista de eventos
    } catch (err) {
      console.error('Erro ao atualizar evento:', err);
      setError('Erro ao atualizar evento.');
    }
  };

  const handleVerDetalhes = (evento: Evento) => {
    setCurrentEvento(evento);
    setIsViewingDetails(true);
  };

  const closeModal = () => {
    setCurrentEvento(null);
    setIsViewingDetails(false);
    setIsViewingParticipants(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-blue-600 text-lg font-semibold">
          Carregando eventos...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">
              Eventos Acadêmicos
            </h1>
            <p className="text-gray-700 mt-2">
              Descubra eventos acadêmicos e participe!
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
          >
            Criar Evento
          </button>
        </header>

        {error && (
          <div className="mb-6 p-4 text-red-700 bg-red-100 border border-red-200 rounded">
            {error}
          </div>
        )}

        {/* Barra de Pesquisa */}
        <div className="mb-6 flex">
          <input
            type="text"
            placeholder="Pesquisar eventos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 border rounded-md"
          />
          <button
            onClick={handleSearch}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Pesquisar
          </button>
        </div>

        {/* Lista de Eventos */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">Eventos Disponíveis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.map((evento) => (
              <div
                key={evento.id}
                className="bg-white p-4 rounded shadow hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold">{evento.nome}</h3>
                <p>{evento.descricao}</p>
                <p>
                  <strong>Data:</strong>{' '}
                  {new Date(evento.data).toLocaleDateString()}
                </p>
                <p>
                  <strong>Curso:</strong> {evento.curso}
                </p>
                <p>
                  <strong>Participantes:</strong> {evento.total_participantes} /{' '}
                  {evento.limite_participantes || 'Ilimitado'}
                </p>
                {evento.conexoesParticipando &&
                  evento.conexoesParticipando.length > 0 && (
                    <p className="text-sm text-blue-600">
                      Conexões participando:{' '}
                      {evento.conexoesParticipando.join(', ')}
                    </p>
                  )}
                {evento.participa ? (
                  <button
                    onClick={() => handleCancelarParticipacao(evento.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded mt-2 hover:bg-red-700"
                  >
                    Cancelar Participação
                  </button>
                ) : (
                  <button
                    onClick={() => handleParticipar(evento.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700"
                  >
                    Participar
                  </button>
                )}
                <button
                  onClick={() => handleVerDetalhes(evento)}
                  className="mt-2 ml-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Ver Detalhes
                </button>
                {isViewingDetails && currentEvento && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-md w-96">
                      <h3 className="text-xl font-bold mb-4">
                        {currentEvento.nome}
                      </h3>
                      <p>
                        <strong>Descrição:</strong> {currentEvento.descricao}
                      </p>
                      <p>
                        <strong>Data:</strong>{' '}
                        {new Date(currentEvento.data).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Curso:</strong> {currentEvento.curso}
                      </p>
                      <p>
                        <strong>Localização:</strong>{' '}
                        {currentEvento.localizacao || 'Não informada'}
                      </p>
                      <p>
                        <strong>Observações Adicionais:</strong>{' '}
                        {currentEvento.observacoes_adicionais || 'Nenhuma'}
                      </p>
                      <button
                        onClick={closeModal}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleVerParticipantes(evento)}
                  className="mt-2 ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Ver Participantes
                </button>
                {isViewingParticipants && currentEvento && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-md w-96">
                      <h3 className="text-xl font-bold mb-4">
                        Participantes do evento: {currentEvento.nome}
                      </h3>
                      <ul className="divide-y divide-gray-200">
                        {participantes.length > 0 ? (
                          participantes.map((p, index) => (
                            <li key={index} className="py-2 text-gray-800">
                              {p.users.name}
                            </li>
                          ))
                        ) : (
                          <p className="text-gray-500">
                            Nenhum participante encontrado.
                          </p>
                        )}
                      </ul>
                      <button
                        onClick={closeModal}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                )}
                {evento.criador_id === userId && (
                  <div className="mt-2 space-x-4">
                    <button
                      onClick={() => handleEditEvento(evento)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteEvento(evento.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                )}
                {editingEvento && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-md w-96">
                      <h3 className="text-xl font-bold mb-4">Editar Evento</h3>
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="nome"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Nome do Evento
                          </label>
                          <input
                            id="nome"
                            type="text"
                            value={editingEvento.nome}
                            onChange={(e) =>
                              setEditingEvento({
                                ...editingEvento,
                                nome: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="descricao"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Descrição
                          </label>
                          <textarea
                            id="descricao"
                            value={editingEvento.descricao}
                            onChange={(e) =>
                              setEditingEvento({
                                ...editingEvento,
                                descricao: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="data"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Data
                          </label>
                          <input
                            id="data"
                            type="date"
                            value={editingEvento.data}
                            onChange={(e) =>
                              setEditingEvento({
                                ...editingEvento,
                                data: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="curso"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Curso
                          </label>
                          <input
                            id="curso"
                            type="text"
                            value={editingEvento.curso}
                            onChange={(e) =>
                              setEditingEvento({
                                ...editingEvento,
                                curso: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="localizacao"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Localização
                          </label>
                          <input
                            id="localizacao"
                            type="text"
                            value={editingEvento.localizacao || ''}
                            onChange={(e) =>
                              setEditingEvento({
                                ...editingEvento,
                                localizacao: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="observacoes"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Observações Adicionais
                          </label>
                          <textarea
                            id="observacoes"
                            value={editingEvento.observacoes_adicionais || ''}
                            onChange={(e) =>
                              setEditingEvento({
                                ...editingEvento,
                                observacoes_adicionais: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="limite"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Limite de Participantes
                          </label>
                          <input
                            id="limite"
                            type="number"
                            value={editingEvento.limite_participantes || 0}
                            onChange={(e) =>
                              setEditingEvento({
                                ...editingEvento,
                                limite_participantes: parseInt(
                                  e.target.value,
                                  10,
                                ),
                              })
                            }
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-4 mt-6">
                        <button
                          onClick={() => setEditingEvento(null)}
                          className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-md"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleUpdateEvento}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Histórico de Participação */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">Histórico de Participação</h2>
          <ul>
            {historico.map((evento) => (
              <li key={evento.id}>
                <p>
                  <strong>{evento.nome}</strong> -{' '}
                  {new Date(evento.data).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Modal de Criação */}
        {isCreating && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
              <h2 className="text-xl font-bold mb-4">Criar Novo Evento</h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="nome"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nome do Evento
                  </label>
                  <input
                    id="nome"
                    type="text"
                    value={newEvento.nome}
                    onChange={(e) =>
                      setNewEvento({ ...newEvento, nome: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="descricao"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    value={newEvento.descricao}
                    onChange={(e) =>
                      setNewEvento({ ...newEvento, descricao: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="data"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Data
                  </label>
                  <input
                    id="data"
                    type="date"
                    value={newEvento.data}
                    onChange={(e) =>
                      setNewEvento({ ...newEvento, data: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="curso"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Curso
                  </label>
                  <input
                    id="curso"
                    type="text"
                    value={newEvento.curso}
                    onChange={(e) =>
                      setNewEvento({ ...newEvento, curso: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="localizacao"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Localização
                  </label>
                  <input
                    id="localizacao"
                    type="text"
                    value={newEvento.localizacao || ''}
                    onChange={(e) =>
                      setNewEvento({
                        ...newEvento,
                        localizacao: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="observacoes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Observações Adicionais
                  </label>
                  <textarea
                    id="observacoes"
                    value={newEvento.observacoes_adicionais || ''}
                    onChange={(e) =>
                      setNewEvento({
                        ...newEvento,
                        observacoes_adicionais: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="limite"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Limite de Participantes
                  </label>
                  <input
                    id="limite"
                    type="number"
                    value={newEvento.limite_participantes || 0}
                    onChange={(e) =>
                      setNewEvento({
                        ...newEvento,
                        limite_participantes: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border rounded-md text-gray-500 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateEvento}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Criar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
