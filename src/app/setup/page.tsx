'use client';

import { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

interface SetupFormData {
  name: string;
  descricao: string;
  curso: string;
  idade: number;
  semestre: number;
  interesses: string[];
}

interface Interesse {
  id: string;
  nome: string;
}

interface Curso {
  id: string;
  nome: string;
}

export default function SetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SetupFormData>({
    name: '',
    descricao: '',
    curso: '',
    idade: 0,
    semestre: 0,
    interesses: [],
  });
  const [interesses, setInteresses] = useState<Interesse[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  // Fetch interesses e cursos ao carregar a página
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [interessesResponse, cursosResponse] = await Promise.all([
          apiClient.get('/interesses', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiClient.get('/cursos', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setInteresses(interessesResponse.data);
        setCursos(cursosResponse.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar interesses e cursos.');
      }
    };

    fetchData();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleInteresse = (nome: string) => {
    if (formData.interesses.includes(nome)) {
      setFormData((prev) => ({
        ...prev,
        interesses: prev.interesses.filter((interesse) => interesse !== nome),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        interesses: [...prev.interesses, nome],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica se todos os campos obrigatórios estão preenchidos
    if (
      !formData.name ||
      !formData.descricao ||
      !selectedCurso ||
      !formData.idade ||
      !formData.semestre ||
      formData.interesses.length === 0
    ) {
      setError(
        'Todos os campos são obrigatórios, incluindo curso e interesses.',
      );
      return;
    }

    if (!token) {
      router.push('/login'); // Redireciona se o token estiver ausente
      return;
    }

    try {
      const payload = {
        ...formData,
        curso: selectedCurso.nome, // Salva o nome do curso
        idade: Number(formData.idade),
        semestre: Number(formData.semestre),
      };

      await apiClient.put('/profile', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      router.push('/dashboard'); // Redireciona para o Dashboard após a configuração inicial
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setError('Erro ao salvar suas informações.');
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

        {/* Nome */}
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

        {/* Descrição */}
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

        {/* Idade */}
        <div className="mb-4">
          <label
            htmlFor="idade"
            className="block text-sm font-medium text-gray-600"
          >
            Idade
          </label>
          <input
            type="number"
            id="idade"
            name="idade"
            value={formData.idade}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Semestre */}
        <div className="mb-4">
          <label
            htmlFor="semestre"
            className="block text-sm font-medium text-gray-600"
          >
            Semestre
          </label>
          <input
            type="number"
            id="semestre"
            name="semestre"
            value={formData.semestre}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Curso */}
        <div className="mb-4 relative">
          <label
            htmlFor="curso"
            className="block text-sm font-medium text-gray-600"
          >
            Curso
          </label>
          <Combobox value={selectedCurso} onChange={setSelectedCurso}>
            <div className="relative">
              <Combobox.Input
                id="curso"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Selecione um curso"
                displayValue={(curso: Curso | null) => curso?.nome || ''}
                required
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Combobox.Button>
            </div>
            <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto focus:outline-none">
              {cursos.map((curso) => (
                <Combobox.Option
                  key={curso.id}
                  value={curso}
                  className={({ active }) =>
                    `px-3 py-2 cursor-pointer ${
                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                    }`
                  }
                >
                  {curso.nome}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox>
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

        {/* Salvar */}
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
