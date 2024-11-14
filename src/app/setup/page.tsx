'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

interface SetupFormData {
  name: string;
  descricao: string;
  curso: string;
  idade: number;
  semestre: number;
  interesses: string;
}

export default function SetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SetupFormData>({
    name: '',
    descricao: '',
    curso: '',
    idade: 0,
    semestre: 0,
    interesses: '',
  });
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      router.push('/login'); // Redireciona se o token ou userId estiver ausente
      return;
    }

    try {
      await apiClient.put(`/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      router.push('/dashboard'); // Redireciona para o Dashboard após a configuração inicial
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err?.message || 'Erro ao salvar suas informações.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 text-gray-800">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-6 bg-white rounded shadow-md"
      >
        <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">
          Configuração Inicial
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-600"
          >
            Nome Completo
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="descricao"
            className="block text-sm font-medium text-gray-600"
          >
            Descrição
          </label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        {/* Campos para curso, idade, semestre, interesses */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition"
        >
          Salvar e Continuar
        </button>
      </form>
    </div>
  );
}
