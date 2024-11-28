import GrupoDetails from '@/components/grupoDetails';

export default function GrupoPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div>
      <GrupoDetails grupoId={id} />
    </div>
  );
}
