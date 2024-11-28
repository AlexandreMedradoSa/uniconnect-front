'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

interface Interesse {
  id: string;
  nome: string;
}

interface Curso {
  id: string;
  nome: string;
}

interface UserProfile {
  name: string;
  descricao: string;
  curso: string;
  idade: string;
  semestre: string;
  interesses: string[]; // Nomes dos interesses do usuário
}

export default function ProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    descricao: '',
    curso: '',
    idade: '',
    semestre: '',
    interesses: [], // Nomes dos interesses do usuário
  });
  const [interesses, setInteresses] = useState<Interesse[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [profileResponse, interessesResponse, cursosResponse] =
          await Promise.all([
            apiClient.get('/profile', {
              headers: { Authorization: `Bearer ${token}` },
            }),
            apiClient.get('/interesses', {
              headers: { Authorization: `Bearer ${token}` },
            }),
            apiClient.get('/cursos', {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        const profile = profileResponse.data;

        setFormData({
          name: profile.name || '',
          descricao: profile.descricao || '',
          curso: profile.curso || '', // Salva o nome do curso
          idade: profile.idade?.toString() || '',
          semestre: profile.semestre?.toString() || '',
          interesses: profile.interesses.map(String) || [],
        });

        setInteresses(interessesResponse.data);
        setCursos(cursosResponse.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCursoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCursoName = e.target.value; // Obtém o nome do curso
    setFormData({ ...formData, curso: selectedCursoName }); // Atualiza com o nome
  };

  const toggleInteresse = (nome: string) => {
    setFormData((prev) => ({
      ...prev,
      interesses: prev.interesses.includes(nome)
        ? prev.interesses.filter((interesse) => interesse !== nome)
        : [...prev.interesses, nome],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        idade: parseInt(formData.idade, 10),
        semestre: parseInt(formData.semestre, 10),
      };
      await apiClient.put('/profile', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-blue-600 text-lg font-semibold">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-white p-6 rounded shadow-md"
      >
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          Perfil do Usuário
        </h1>

        {/* Nome */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">
            Nome
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Descrição */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">
            Descrição
          </label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Curso */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">
            Curso
          </label>
          <select
            className="w-full px-3 py-2 border rounded"
            value={formData.curso}
            onChange={handleCursoChange}
            required
          >
            <option value="">Selecione um curso</option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.nome}>
                {curso.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Idade */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">
            Idade
          </label>
          <input
            type="number"
            name="idade"
            value={formData.idade}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Semestre */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">
            Semestre
          </label>
          <input
            type="number"
            name="semestre"
            value={formData.semestre}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Interesses */}
        <div className="mb-4">
          <label
            htmlFor="interesses"
            className="block text-sm font-medium text-gray-600"
          >
            Interesses
          </label>
          <div className="grid grid-cols-2 gap-2">
            {interesses.map((interesse) => (
              <div
                key={interesse.id}
                className={`p-2 border rounded cursor-pointer ${
                  formData.interesses.includes(interesse.nome)
                    ? 'bg-blue-200 border-blue-600'
                    : 'bg-white border-gray-300'
                }`}
                onClick={() => toggleInteresse(interesse.nome)}
              >
                {interesse.nome}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}
