/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

export default function HomePage() {
  const router = useRouter();
  const [eventosAtivos, setEventosAtivos] = useState([]);
  const [gruposDestaque, setGruposDestaque] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventosResponse, gruposResponse] = await Promise.all([
        apiClient.get('/eventos', {
          params: { limit: 3 },
        }),
        apiClient.get('/grupos', {
          params: { limit: 3 },
        }),
      ]);

      setEventosAtivos(eventosResponse.data);
      setGruposDestaque(gruposResponse.data);
    } catch (err) {
      console.error('Erro ao carregar informações:', err);
      setError('Não foi possível carregar as informações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-50">
        <p className="text-blue-600 text-lg font-bold">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 via-white to-blue-50 text-gray-800">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">
            Conecte-se. Aprenda. Cresça.
          </h1>
          <p className="mt-4 text-lg md:text-xl">
            Descubra grupos de estudo, participe de eventos acadêmicos e faça
            parte de uma comunidade vibrante de alunos!
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => router.push('/signup')}
              className="px-6 py-3 bg-white text-blue-600 font-bold rounded shadow hover:bg-gray-100 transition"
            >
              Registrar-se
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-blue-700 font-bold rounded shadow hover:bg-blue-800 transition"
            >
              Entrar
            </button>
          </div>
        </div>
      </section>

      {/* Eventos Ativos */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Eventos Acadêmicos Ativos
          </h2>
          <p className="text-center text-gray-600 mt-4">
            Explore eventos e participe para ampliar seus conhecimentos.
          </p>
          {error && <p className="text-center text-red-500 mt-4">{error}</p>}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosAtivos.map((evento: any) => (
              <div
                key={evento.id}
                className="bg-white p-4 rounded shadow hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold">{evento.nome}</h3>
                <p className="text-gray-600">{evento.descricao}</p>
                <p className="text-gray-600 mt-2">
                  <strong>Data:</strong>{' '}
                  {new Date(evento.data).toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  <strong>Curso:</strong> {evento.curso}
                </p>
                <p className="text-gray-600">
                  <strong>Participantes:</strong> {evento.total_participantes}
                </p>
                <button
                  onClick={() => router.push('/signup')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Saiba Mais
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grupos de Estudo em Destaque */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Grupos de Estudo em Destaque
          </h2>
          <p className="text-center text-gray-600 mt-4">
            Junte-se a grupos com interesses em comum.
          </p>
          {error && <p className="text-center text-red-500 mt-4">{error}</p>}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gruposDestaque.map((grupo: any) => (
              <div
                key={grupo.id}
                className="bg-white p-4 rounded shadow hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold">{grupo.nome}</h3>
                <p className="text-gray-600">{grupo.descricao}</p>
                <p className="text-gray-600 mt-2">
                  <strong>Curso:</strong> {grupo.curso}
                </p>
                <p className="text-gray-600">
                  <strong>Semestre:</strong> {grupo.semestre}
                </p>
                <button
                  onClick={() => router.push('/signup')}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Saiba Mais
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Junte-se à nossa comunidade
          </h2>
          <p className="text-center text-gray-600 mt-4">
            Veja o impacto que já causamos!
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-blue-600">200+</h3>
              <p className="mt-2 text-gray-600">Grupos Criados</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-green-600">1,500+</h3>
              <p className="mt-2 text-gray-600">Conexões Formadas</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-red-600">300+</h3>
              <p className="mt-2 text-gray-600">Eventos Realizados</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
