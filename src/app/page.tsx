'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { Evento, Grupo } from '@/types/apiTypes';

export default function HomePage() {
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [loadingGrupos, setLoadingGrupos] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventosResponse = await apiClient.get<Evento[]>('/eventos');
        const gruposResponse = await apiClient.get<Grupo[]>('/grupos');
        setEventos(eventosResponse.data.slice(0, 3));
        setGrupos(gruposResponse.data.slice(0, 3));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoadingEventos(false);
        setLoadingGrupos(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 text-gray-800">
      {/* Header */}
      <header className="bg-blue-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">UniConnect</h1>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-white text-blue-600 font-semibold rounded hover:bg-gray-100 transition"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="px-4 py-2 bg-white text-blue-600 font-semibold rounded hover:bg-gray-100 transition"
            >
              Registrar-se
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Conectando Universitários em Todo Lugar
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Explore grupos de estudo, participe de eventos acadêmicos e crie
            conexões significativas para o seu futuro.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            Explorar Agora
          </button>
        </div>
      </section>

      {/* Destaques */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-xl font-bold mb-6 text-blue-600">
          Eventos em Destaque
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loadingEventos ? (
            <p className="text-gray-600">Carregando eventos...</p>
          ) : eventos.length > 0 ? (
            eventos.map((evento) => (
              <div key={evento.id} className="p-4 bg-white shadow-md rounded">
                <h4 className="text-lg font-bold text-blue-600">
                  {evento.nome}
                </h4>
                <p className="text-sm text-gray-600">{evento.descricao}</p>
                <button
                  onClick={() => router.push(`/eventos/${evento.id}`)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Saber Mais
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600">
              Nenhum evento disponível no momento.
            </p>
          )}
        </div>
      </section>

      {/* Grupos Recomendados */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-xl font-bold mb-6 text-blue-600">
          Grupos Recomendados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loadingGrupos ? (
            <p className="text-gray-600">Carregando grupos...</p>
          ) : grupos.length > 0 ? (
            grupos.map((grupo) => (
              <div key={grupo.id} className="p-4 bg-white shadow-md rounded">
                <h4 className="text-lg font-bold text-blue-600">
                  {grupo.nome}
                </h4>
                <p className="text-sm text-gray-600">{grupo.descricao}</p>
                <button
                  onClick={() => router.push(`/grupos/${grupo.id}`)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Participar
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600">Nenhum grupo disponível no momento.</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-600 text-white py-6 text-center">
        <p>
          &copy; {new Date().getFullYear()} UniConnect. Todos os direitos
          reservados.
        </p>
      </footer>
    </div>
  );
}
