'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Rotas onde a Sidebar não deve aparecer
  const hideSidebarRoutes = ['/', '/login', '/signup', '/setup'];

  useEffect(() => {
    const fetchAdminStatus = async () => {
      setIsLoading(true); // Inicia o carregamento

      if (!token) {
        setIsAdmin(false); // Usuário não autenticado não é admin
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Garante que o estado seja atualizado corretamente
        setIsAdmin(response.data?.is_admin || false);
      } catch (error) {
        console.error('Erro ao verificar status de administrador:', error);
        setIsAdmin(false); // Define como não admin em caso de erro
      } finally {
        setIsLoading(false); // Finaliza o carregamento
      }
    };

    fetchAdminStatus();
  }, [token]);

  if (hideSidebarRoutes.includes(pathname)) {
    return null;
  }

  // Links gerais e administrativos
  const generalLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Grupos de Estudo', path: '/grupos' },
    { name: 'Eventos Acadêmicos', path: '/eventos' },
    { name: 'Conexões', path: '/conexoes' },
    { name: 'Bate-Papo', path: '/chat' },
  ];

  const adminLinks = [
    { name: 'Interesses', path: '/interesses' },
    { name: 'Cursos', path: '/cursos' },
    { name: 'Gerenciar Administradores', path: '/admins' },
  ];

  const handleLogout = () => {
    // Limpa o token e redireciona para a página de login
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  // Evita exibir a sidebar enquanto verifica o status do admin
  if (isLoading) {
    return null;
  }

  return (
    <aside className="w-64 bg-blue-600 text-white flex flex-col justify-between flex-shrink-0">
      {/* Parte Superior */}
      <div>
        <div className="p-4">
          <h2 className="text-xl font-bold">UniConnect</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-3">
            {generalLinks
              .filter((link) => link.path !== pathname) // Remove o link da página atual
              .map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="block py-2 px-4 rounded hover:bg-gray-700 transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            {isAdmin &&
              adminLinks
                .filter((link) => link.path !== pathname) // Remove o link da página atual
                .map((link) => (
                  <li key={link.path}>
                    <Link
                      href={link.path}
                      className="block py-2 px-4 rounded hover:bg-gray-700 transition"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
          </ul>
        </nav>
      </div>

      {/* Botão de Logout */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
