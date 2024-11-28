import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import apiClient from '@/lib/apiClient';

// Rotas protegidas para administradores
const adminRoutes = ['/admins', '/cursos', '/interesses'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Verifica se a rota atual é uma rota protegida
  if (adminRoutes.includes(pathname)) {
    // Obtém o token dos cookies
    const token = req.cookies.get('token')?.value;

    // Se o token não for encontrado, redireciona para a página inicial
    if (!token) {
      console.error('Token ausente ou inválido.');
      return NextResponse.redirect(new URL('/', req.url));
    }

    try {
      // Faz a consulta para verificar se o usuário é admin
      const response = await apiClient.get('/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = response.data;

      // Verifica se o usuário é admin
      if (!user.is_admin) {
        console.error('Acesso negado: Usuário não é administrador.');
        return NextResponse.redirect(new URL('/', req.url));
      }
    } catch (err) {
      console.error('Erro ao verificar status de administrador:', err);
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Continua para a próxima rota se não for protegida
  return NextResponse.next();
}

// Configuração das rotas onde o middleware será aplicado
export const config = {
  matcher: ['/admins', '/cursos', '/interesses'], // Rotas protegidas
};
