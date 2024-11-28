/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface Curso {
  id: number | null; // Altere para permitir números ou null
  nome: string;
  interesses: Interesse[];
}

interface Interesse {
  id: number;
  nome: string;
}

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [interesses, setInteresses] = useState<Interesse[]>([]);
  const [formData, setFormData] = useState<Curso>({
    id: null,
    nome: '',
    interesses: [],
  });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [cursosResponse, interessesResponse] = await Promise.all([
          apiClient.get('/cursos', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiClient.get('/interesses', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cursosFormatados = cursosResponse.data.map((curso: any) => ({
          ...curso,
          interesses:
            curso.curso_interesses?.map((ci: any) => {
              const interesse = interessesResponse.data.find(
                (i: Interesse) => i.id === ci.interesse_id,
              );
              return interesse || { id: ci.interesse_id, nome: 'Desconhecido' };
            }) || [],
        }));

        setCursos(cursosFormatados);
        setInteresses(interessesResponse.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar cursos ou interesses.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleInteresse = (id: number) => {
    const exists = formData.interesses.some((i) => i.id === id);
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        interesses: prev.interesses.filter((i) => i.id !== id),
      }));
    } else {
      const interesse = interesses.find((i) => i.id === id);
      if (interesse) {
        setFormData((prev) => ({
          ...prev,
          interesses: [...prev.interesses, interesse],
        }));
      }
    }
  };

  const handleSave = async () => {
    if (formData.interesses.length === 0) {
      alert('É obrigatório selecionar pelo menos um interesse associado.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        nome: formData.nome,
        curso_interesses: formData.interesses.map((i) => ({
          interesse_id: i.id,
        })),
      };

      if (editing) {
        await apiClient.put(`/cursos/${formData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await apiClient.post('/cursos', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setFormData({ id: null, nome: '', interesses: [] });
      setEditing(false);

      const response = await apiClient.get('/cursos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cursosAtualizados = response.data.map((curso: any) => ({
        ...curso,
        interesses:
          curso.curso_interesses?.map((ci: any) => {
            const interesse = interesses.find((i) => i.id === ci.interesse_id);
            return interesse || { id: ci.interesse_id, nome: 'Desconhecido' };
          }) || [],
      }));
      setCursos(cursosAtualizados);
    } catch (err) {
      console.error('Erro ao salvar curso:', err);
      setError('Erro ao salvar curso.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (curso: Curso) => {
    setFormData(curso);
    setEditing(true);
  };

  const handleDelete = async (id: number | null) => {
    if (id === null) {
      alert('Curso inválido para exclusão.');
      return;
    }

    try {
      setLoading(true);
      await apiClient.delete(`/cursos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCursos((prev) => prev.filter((curso) => curso.id !== id));
    } catch (err) {
      console.error('Erro ao excluir curso:', err);
      setError('Erro ao excluir curso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <p className="text-white text-xl font-bold">Carregando...</p>
        </div>
      )}

      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Gerenciar Cursos
      </h1>
      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">
          {editing ? 'Editar Curso' : 'Novo Curso'}
        </h2>
        <div className="mb-4">
          <label
            htmlFor="nome"
            className="block text-sm font-medium text-gray-600"
          >
            Nome do Curso
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">
            Interesses Associados
          </label>
          <div className="grid grid-cols-2 gap-2">
            {interesses.map((interesse) => (
              <div
                key={interesse.id}
                className={`p-2 border rounded cursor-pointer ${
                  formData.interesses.some((i) => i.id === interesse.id)
                    ? 'bg-blue-200 border-blue-600'
                    : 'bg-white border-gray-300'
                }`}
                onClick={() => toggleInteresse(interesse.id)}
              >
                {interesse.nome}
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {editing ? 'Atualizar Curso' : 'Adicionar Curso'}
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4">Cursos Cadastrados</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cursos.map((curso) => (
          <div key={curso.id} className="p-4 bg-white border rounded shadow">
            <h3 className="text-lg font-bold">{curso.nome}</h3>
            <p className="text-sm text-gray-600">
              Interesses:{' '}
              {curso.interesses.length > 0
                ? curso.interesses.map((i) => i.nome).join(', ')
                : 'Nenhum interesse associado'}
            </p>
            <div className="mt-4 space-x-2">
              <button
                onClick={() => handleEdit(curso)}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(curso.id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
