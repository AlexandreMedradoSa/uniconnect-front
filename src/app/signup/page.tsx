'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Limpa o erro ao alterar o campo
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação do formato do e-mail
    const emailRegex = /^[a-zA-Z0-9._%+-]+@edu\.unifor\.br$/;
    if (!emailRegex.test(formData.email)) {
      setError('O e-mail deve estar no formato xxxx@edu.unifor.br');
      return;
    }

    try {
      await apiClient.post('/register', formData);
      setSuccessMessage(
        'Conta criada com sucesso! Redirecionando para o login...',
      );
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err?.message || 'Erro ao criar conta.');
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
          Registrar-se
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {successMessage && (
          <p className="text-green-500 text-sm mb-4">{successMessage}</p>
        )}
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-600"
          >
            Nome
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
          Registrar-se
        </button>
        <p className="mt-4 text-sm text-center text-gray-600">
          Já tem uma conta?{' '}
          <span
            onClick={() => router.push('/login')}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Faça login
          </span>
        </p>
      </form>
    </div>
  );
}
