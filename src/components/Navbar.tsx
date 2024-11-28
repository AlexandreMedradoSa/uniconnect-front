'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

export default function Navbar() {
  const [userName, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Rotas onde a Navbar não realiza consultas
  const publicRoutes = ['/', '/login', '/signup', '/setup'];

  useEffect(() => {
    if (!token || publicRoutes.includes(pathname)) {
      return; // Não realiza consultas em páginas públicas ou sem token
    }

    const fetchUserData = async () => {
      try {
        const response = await apiClient.get('/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(response.data.name || 'Usuário');
      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
        setError('Erro ao carregar dados do usuário.');
      }
    };

    fetchUserData();
  }, [token, pathname]);

  const handleProfileClick = () => {
    router.push('/perfil');
  };

  if (publicRoutes.includes(pathname)) {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold"></h1>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div
          onClick={handleProfileClick}
          className="cursor-pointer hover:underline"
        >
          {userName}
        </div>
      )}
    </nav>
  );
}
