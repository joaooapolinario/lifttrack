'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Menu } from 'lucide-react';

interface Routine {
  id: string;
  name: string;
  items: any[];
  position: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar Rotinas
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    api.get('/routines', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setRoutines(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  // Função que roda quando solta o item
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return; // Soltou fora da lista

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return; // Não mudou de lugar

    // 1. Reordenar VISUALMENTE (Optimistic UI)
    const newRoutines = Array.from(routines);
    const [reorderedItem] = newRoutines.splice(sourceIndex, 1);
    newRoutines.splice(destinationIndex, 0, reorderedItem);

    setRoutines(newRoutines);

    // 2. Enviar para o Backend
    try {
      const token = localStorage.getItem('token');

      // Monta o payload com a nova posição de cada item
      const updates = newRoutines.map((routine, index) => ({
        id: routine.id,
        position: index,
      }));

      await api.patch('/routines/reorder', { items: updates }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Erro ao salvar ordem", error);
      // Se der erro, o ideal seria recarregar a lista original
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando seus treinos...</div>;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Meus Treinos</h1>
          <Link href="/dashboard/routines/create">
            <Button size="lg" className="bg-primary hover:bg-primary/80">
              + Novo Treino
            </Button>
          </Link>
        </div>

        {routines.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed">
            <p className="text-slate-500 mb-4">Você ainda não tem nenhuma ficha de treino.</p>
            <Link href="/dashboard/routines/create">
              <Button variant="outline">Criar meu primeiro treino</Button>
            </Link>
          </div>
        ) : (
          /* ÁREA DE DRAG AND DROP */
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="routines-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid gap-4"
                >
                  {routines.map((routine, index) => (
                    <Draggable key={routine.id} draggableId={routine.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className=""
                        >
                          <Card className="hover:shadow-md transition-shadow group border-l-4 border-l-transparent hover:border-l-primary/50">

                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

                              <div className="flex flex-col gap-1">
                                <CardTitle className="text-xl">
                                  <Link
                                    href={`/dashboard/routines/${routine.id}`}
                                    className="hover:underline decoration-primary underline-offset-4"
                                  >
                                    {routine.name}
                                  </Link>
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                  {routine.items.length} exercícios
                                </p>
                              </div>

                              <div
                                {...provided.dragHandleProps}
                                className="p-2 -mr-2 cursor-grab text-muted-foreground/20 hover:text-foreground transition-colors touch-none"
                                title="Arraste para reordenar"
                              >
                                <Menu size={20} />
                              </div>

                            </CardHeader>

                            <CardContent>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {routine.items.length > 0
                                  ? routine.items.slice(0, 3).map(i => i.exercise.name).join(', ')
                                  : 'Nenhum exercício ainda.'}
                                {routine.items.length > 3 && '...'}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}