'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpa erros anteriores
    try {
      const response = await apiClient.post('/login', formData);
      const { token, userId, primeiro_login } = response.data;

      // Verifica se o token foi retornado
      if (!token) {
        throw new Error('Token inválido. Por favor, tente novamente.');
      }

      // Armazena o token e o userId no LocalStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);

      // Armazena o token nos cookies
      document.cookie = `token=${token}; path=/; samesite=lax`;

      // Redireciona com base no status do primeiro login
      if (primeiro_login) {
        router.push('/setup'); // Redireciona para a tela de configuração inicial
      } else {
        router.push('/dashboard'); // Redireciona para o Dashboard
      }
    } catch (err: unknown) {
      // Tratamento de erros detalhado
      if (err instanceof Error) {
        console.error('Erro ao fazer login:', err.message);
        setError(
          err.message || 'Erro ao fazer login. Verifique suas credenciais.',
        );
      } else {
        setError('Erro desconhecido. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 text-gray-800">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-6 bg-white rounded shadow-md"
      >
        <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">
          Login
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-600"
          >
            E-mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-600"
          >
            Senha
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
