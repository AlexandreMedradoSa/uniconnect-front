/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface Conexao {
  id: string; // ID do amigo (usuário conectado)
  conexaoId: string; // ID da conexão na tabela 'conexoes'
  name: string; // Nome do amigo
  curso?: string; // Curso do amigo (opcional)
  semestre?: string; // Semestre do amigo (opcional)
  interesses?: string[]; // Interesses do amigo (opcional)
}

interface Mensagem {
  id: string; // ID da mensagem
  conteudo: string; // Conteúdo da mensagem
  remetente_id: string; // ID do remetente
  criado_em: string; // Timestamp da mensagem
}

export default function Chat() {
  const [conexoes, setConexoes] = useState<Conexao[]>([]); // Lista de conexões
  const [mensagens, setMensagens] = useState<Mensagem[]>([]); // Lista de mensagens
  const [mensagem, setMensagem] = useState<string>(''); // Nova mensagem
  const [conexaoSelecionada, setConexaoSelecionada] = useState<Conexao | null>(
    null,
  );

  const fetchConexoes = async () => {
    try {
      const response = await apiClient.get<Conexao[]>(
        `/users/${localStorage.getItem('userId')}/conexoes`,
      );

      setConexoes(
        response.data.map((conexao) => ({
          id: conexao.id, // ID do amigo
          conexaoId: conexao.conexaoId, // ID da conexão
          name: conexao.name,
          curso: conexao.curso,
          semestre: conexao.semestre,
          interesses: conexao.interesses,
        })),
      );
    } catch (err) {
      console.error('Erro ao buscar conexões:', err);
    }
  };

  const fetchMensagens = async (conexaoId: string) => {
    try {
      const response = await apiClient.get<Mensagem[]>(
        `/conexoes/${conexaoId}/mensagens`,
      );
      setMensagens(response.data);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
    }
  };

  const enviarMensagem = async () => {
    if (!mensagem.trim() || !conexaoSelecionada) return;

    try {
      await apiClient.post(
        `/conexoes/${conexaoSelecionada.conexaoId}/mensagens`,
        {
          conteudo: mensagem,
        },
      );
      setMensagem('');
      fetchMensagens(conexaoSelecionada.conexaoId); // Usa o ID da conexão
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };
  useEffect(() => {
    fetchConexoes();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar com conexões */}
      <div className="w-1/3 bg-gray-100 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Conexões</h2>
        <ul>
          {conexoes.map((conexao) => (
            <li
              key={conexao.id}
              onClick={() => {
                setConexaoSelecionada(conexao); // Seleciona a conexão correta
                fetchMensagens(conexao.conexaoId); // Usa o ID da conexão
              }}
              className={`p-2 cursor-pointer rounded ${
                conexaoSelecionada?.id === conexao.id
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200'
              }`}
            >
              {conexao.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Tela de chat */}
      <div className="w-2/3 p-4">
        {conexaoSelecionada && (
          <>
            <h2 className="text-xl font-bold mb-4">
              Conversa com {conexaoSelecionada.name}
            </h2>
            <div className="h-4/5 overflow-y-scroll border p-4 bg-gray-50 rounded">
              {mensagens.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 ${
                    msg.remetente_id === localStorage.getItem('userId')
                      ? 'text-right'
                      : 'text-left'
                  }`}
                >
                  <p className="inline-block p-2 rounded bg-blue-100">
                    {msg.conteudo}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex">
              <input
                type="text"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Digite sua mensagem..."
              />
              <button
                onClick={enviarMensagem}
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Enviar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
