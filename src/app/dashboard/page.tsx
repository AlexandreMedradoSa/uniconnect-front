'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

interface User {
  name: string;
}

interface Connection {
  amigo_id: string;
  name: string;
}

interface Group {
  id: string;
  nome: string;
  descricao: string;
}

interface Event {
  id: string;
  nome: string;
  descricao: string;
  data: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (!token || !userId) return;

        const [
          userResponse,
          connectionsResponse,
          groupsResponse,
          eventsResponse,
        ] = await Promise.all([
          apiClient.get(`/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiClient.get(`/users/${userId}/conexoes`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiClient.get(`/grupos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiClient.get(`/eventos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(userResponse.data);
        setConnections(connectionsResponse.data);
        setGroups(groupsResponse.data);
        setEvents(eventsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar o Dashboard:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, userId]);

  if (loading) {
    return <div className="text-center text-blue-600">Carregando...</div>;
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
          <h1 className="text-3xl font-bold text-gray-800">
            {user ? `Bem-vindo(a), ${user.name}!` : 'Bem-vindo(a)!'}
          </h1>
        </header>

        {/* Resumo em Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Conexões */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-semibold text-blue-600 mb-2">
              Suas Conexões
            </h2>
            {connections.length === 0 ? (
              <p className="text-gray-500">Você ainda não possui conexões.</p>
            ) : (
              <ul className="space-y-2">
                {connections.slice(0, 3).map((connection) => (
                  <li key={connection.amigo_id} className="text-gray-700">
                    {connection.name}
                  </li>
                ))}
              </ul>
            )}
            {connections.length > 3 && (
              <button
                className="mt-3 text-blue-600 hover:underline"
                onClick={() => router.push('/conexoes')}
              >
                Ver todas as conexões
              </button>
            )}
          </div>

          {/* Card Grupos */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-semibold text-blue-600 mb-2">
              Grupos de Estudo
            </h2>
            {groups.length === 0 ? (
              <p className="text-gray-500">Nenhum grupo disponível.</p>
            ) : (
              <ul className="space-y-2">
                {groups.slice(0, 3).map((group) => (
                  <li key={group.id} className="text-gray-700">
                    {group.nome}
                  </li>
                ))}
              </ul>
            )}
            {groups.length > 3 && (
              <button
                className="mt-3 text-blue-600 hover:underline"
                onClick={() => router.push('/grupos')}
              >
                Ver todos os grupos
              </button>
            )}
          </div>

          {/* Card Eventos */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-semibold text-blue-600 mb-2">
              Eventos Acadêmicos
            </h2>
            {events.length === 0 ? (
              <p className="text-gray-500">Nenhum evento disponível.</p>
            ) : (
              <ul className="space-y-2">
                {events.slice(0, 3).map((event) => (
                  <li key={event.id} className="text-gray-700">
                    {event.nome}
                  </li>
                ))}
              </ul>
            )}
            {events.length > 3 && (
              <button
                className="mt-3 text-blue-600 hover:underline"
                onClick={() => router.push('/eventos')}
              >
                Ver todos os eventos
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
