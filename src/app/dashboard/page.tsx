/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { FaUsers, FaChalkboardTeacher, FaCalendarAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

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
          apiClient.get(`/users/${userId}/grupos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiClient.get(`/users/${userId}/eventos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(userResponse.data);
        setConnections(connectionsResponse.data);
        setGroups(groupsResponse.data);
        setEvents(eventsResponse.data);
        setLoading(false);
      } catch (error: unknown) {
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
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="px-6 pt-2 flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {user ? `Olá, ${user.name}!` : 'Bem-vindo(a)!'}
        </h1>
      </header>

      <main className="p-6 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-700">Resumo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded shadow p-4 flex items-center">
              <FaUsers className="text-blue-600 text-3xl mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Conexões</h3>
                <p>{connections.length} Conexões</p>
              </div>
            </div>
            <div className="bg-white rounded shadow p-4 flex items-center">
              <FaChalkboardTeacher className="text-green-600 text-3xl mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Grupos</h3>
                <p>{groups.length} Grupos de Estudo</p>
              </div>
            </div>
            <div className="bg-white rounded shadow p-4 flex items-center">
              <FaCalendarAlt className="text-red-600 text-3xl mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Eventos</h3>
                <p>{events.length} Eventos Acadêmicos</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-700">
            Conexões Recentes
          </h2>
          {connections.length === 0 ? (
            <p className="text-gray-500">Você ainda não possui conexões.</p>
          ) : (
            <Carousel
              showThumbs={false}
              showStatus={false}
              autoPlay
              infiniteLoop
            >
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="p-8 bg-white shadow rounded space-y-4"
                >
                  <h3 className="text-lg font-bold text-blue-600">
                    {connection.name}
                  </h3>
                  <p>
                    <span className="font-semibold">Curso:</span>{' '}
                    {connection.curso || 'Não informado'}
                  </p>
                  <p>
                    <span className="font-semibold">Semestre:</span>{' '}
                    {connection.semestre || 'Não informado'}
                  </p>
                  <p>
                    <span className="font-semibold">Interesses:</span>{' '}
                    {connection.interesses && connection.interesses.length > 0
                      ? connection.interesses.join(', ')
                      : 'Nenhum interesse registrado'}
                  </p>
                </div>
              ))}
            </Carousel>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-700">Grupos de Estudo</h2>
          {groups.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-500">
                Você ainda não participa de nenhum grupo.
              </p>
              <button
                onClick={() => router.push('/grupos')}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Conheça os Grupos de Estudo
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <li key={group.id} className="p-4 bg-white rounded shadow">
                  <h3 className="text-lg font-bold text-green-600">
                    {group.nome}
                  </h3>
                  <p>{group.descricao}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-700">
            Eventos Acadêmicos
          </h2>
          {events.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-500">
                Você ainda não participa de nenhum evento.
              </p>
              <button
                onClick={() => router.push('/eventos')}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Conheça os Eventos Acadêmicos
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <li key={event.id} className="p-4 bg-white rounded shadow">
                  <h3 className="text-lg font-bold text-red-600">
                    {event.nome}
                  </h3>
                  <p>{new Date(event.data).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
