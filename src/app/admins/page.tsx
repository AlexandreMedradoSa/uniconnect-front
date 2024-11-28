'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface User {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
}

export default function ManageAdminsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchUsers = async () => {
    if (!token) {
      setError('Usuário não autenticado.');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError('Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await apiClient.post(
        '/admins',
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert('Administrador adicionado com sucesso!');
      fetchUsers();
    } catch (err) {
      console.error('Erro ao adicionar administrador:', err);
      setError('Erro ao adicionar administrador.');
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await apiClient.delete(`/admins/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Administrador removido com sucesso!');
      fetchUsers();
    } catch (err) {
      console.error('Erro ao remover administrador:', err);
      setError('Erro ao remover administrador.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Gerenciar Administradores
      </h1>
      {error && <p className="text-red-500">{error}</p>}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-blue-600 font-bold">Carregando...</p>
        </div>
      ) : (
        <table className="w-full bg-white rounded shadow-md">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-2 px-4 text-left">Nome</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-center">Administrador</th>
              <th className="py-2 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="py-2 px-4">{user.name}</td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4 text-center">
                  {user.is_admin ? 'Sim' : 'Não'}
                </td>
                <td className="py-2 px-4 text-center space-x-2">
                  {user.is_admin ? (
                    <button
                      onClick={() => handleRemoveAdmin(user.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Remover
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddAdmin(user.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Adicionar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
