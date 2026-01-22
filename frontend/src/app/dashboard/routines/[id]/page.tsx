'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Play } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* CABEÇALHO DE AÇÕES */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
          <div>
            <Button variant="ghost" className="mb-1 pl-0 hover:bg-transparent" onClick={() => router.push('/dashboard')}>
              ← Voltar para Fichas
            </Button>
            <h1 className="text-2xl font-bold">{routine.name}</h1>
          </div>

          <div className="flex gap-2 mb-6">
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700 h-12 text-lg font-bold gap-2 shadow-md"
              onClick={() => router.push(`/dashboard/routines/${routineId}/active`)}
            >
              <Play fill="currentColor" size={20} /> INICIAR TREINO
            </Button>
          </div>

          <div className="flex gap-2 justify-end mb-4">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/dashboard/routines/${routineId}/edit`)}
            >
              Editar ✎
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
            >
              Excluir 🗑️
            </Button>
          </div>
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
                <div className="text-right bg-slate-100 px-4 py-2 rounded-lg">
                  <div className="font-mono text-lg font-bold text-slate-800">
                    {item.sets} <span className="text-xs font-normal text-slate-500">SETS</span>
                  </div>
                  <div className="font-mono text-lg font-bold text-slate-800">
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