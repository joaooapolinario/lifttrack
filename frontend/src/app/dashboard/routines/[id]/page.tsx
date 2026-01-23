'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Play, Edit, Trash2, ArrowLeft } from 'lucide-react';

interface Exercise { name: string; muscleGroup: string; }
interface RoutineItem { id: string; sets: number; reps: number; exercise: Exercise; }
interface RoutineDetail { id: string; name: string; items: RoutineItem[]; }

export default function ViewRoutinePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const routineId = resolvedParams.id;
  const router = useRouter();
  const [routine, setRoutine] = useState<RoutineDetail | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/');

    api.get(`/routines/${routineId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setRoutine(res.data))
      .catch(() => router.push('/dashboard'));
  }, [routineId, router]);

  // Função para Deletar
  async function handleDelete() {
    if (!confirm('Tem certeza que deseja apagar esta ficha permanentemente?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/routines/${routineId}`, { headers: { Authorization: `Bearer ${token}` } });
      router.push('/dashboard');
    } catch (error) {
      toast.error('Erro ao apagar.');
    }
  }

  if (!routine) return <div className="p-8">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="space-y-6 mb-8">

          <div className="flex items-start justify-between gap-4">

            <div>
              <Button variant="outline" className="mb-1 pl-0 hover:bg-slate-800 hover:text-white" onClick={() => router.push('/dashboard')}>
              <ArrowLeft size={18} />
              Voltar
            </Button>
              <h1 className="text-3xl font-bold tracking-tight">{routine.name}</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {routine.items.length} exercícios planejados
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push(`/dashboard/routines/${routineId}/edit`)}
              >
                <Edit size={18} />
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold shadow-md uppercase tracking-wide"
            onClick={() => router.push(`/dashboard/routines/${routineId}/active`)}
          >
            <Play fill="currentColor" className="mr-2" size={20} />
            Iniciar Treino
          </Button>

        </div>

        {/* LISTA DE EXERCÍCIOS */}
        <div className="space-y-3">
          {routine.items.map((item, index) => (
            <Card key={item.id} className="border-l-4 border-l-slate-800">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">#{index + 1}</div>
                  <div className="text-lg font-bold">{item.exercise?.name}</div>
                  <div className="text-sm text-slate-500">{item.exercise?.muscleGroup}</div>
                </div>
                <div className="text-right bg-primary/10 px-4 py-2 rounded-lg">
                  <div className="font-mono text-lg font-bold text-primary">
                    {item.sets} <span className="text-xs font-normal text-slate-500">SETS</span>
                  </div>
                  <div className="font-mono text-lg font-bold text-primary">
                    {item.reps} <span className="text-xs font-normal text-slate-500">REPS</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}