'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ExercisePicker } from '@/components/exercise-picker';
import { Exercise, RoutineItem } from '@/types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';

export default function EditRoutinePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const routineId = resolvedParams.id;
  const router = useRouter();

  const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
  const [routineName, setRoutineName] = useState('');
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token) { router.push('/'); return; }

    Promise.all([
      api.get('/exercises', { headers: { Authorization: `Bearer ${token}` } }),
      api.get(`/routines/${routineId}`, { headers: { Authorization: `Bearer ${token}` } })
    ]).then(([resEx, resRoutine]) => {
      setExercisesList(resEx.data);
      const r = resRoutine.data;
      setRoutineName(r.name);
      
      const formattedItems = r.items.map((item: any) => ({
        tempId: Math.random(), 
        exerciseId: item.exerciseId,
        sets: item.sets,
        reps: item.reps
      }));
      setItems(formattedItems);
    }).finally(() => setLoading(false));
  }, [routineId, router]);

  // --- ARRASTAR E SOLTAR ---
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
  };

  function addNewLine() {
    setItems([...items, { tempId: Math.random(), exerciseId: '', sets: 3, reps: 10 }]);
  }

  function removeLine(tempId: number) {
    if (items.length === 1) return alert("A ficha precisa ter pelo menos 1 exercício.");
    setItems(items.filter(i => i.tempId !== tempId));
  }

  function updateLine(tempId: number, field: string, value: any) {
    setItems(items.map(i => i.tempId === tempId ? { ...i, [field]: value } : i));
  }

  async function handleUpdate() {
    if (!routineName.trim() || items.some(i => !i.exerciseId)) return alert('Preencha tudo!');

    try {
      const token = localStorage.getItem('token');
      // O backend já vai salvar a posição baseada na ordem deste array
      const cleanExercises = items.map(item => ({
        exerciseId: item.exerciseId,
        sets: Number(item.sets),
        reps: Number(item.reps)
      }));

      await api.patch(`/routines/${routineId}`, {
        name: routineName,
        exercises: cleanExercises
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Ficha atualizada!');
      router.refresh();
      router.push(`/dashboard/routines/${routineId}`);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar.');
    }
  }

  if (loading) return <div className="p-8">A carregar...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Editar Ficha</h1>
            <Button variant="outline" onClick={() => router.push(`/dashboard/routines/${routineId}`)}>Cancelar</Button>
        </div>

        <Card><CardContent className="pt-6">
            <Label>Nome da Rotina</Label>
            <Input value={routineName} onChange={e => setRoutineName(e.target.value)} className="mt-2 text-lg font-medium"/>
        </CardContent></Card>

        {/* ÁREA DE DRAG AND DROP */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="exercises-list">
            {(provided) => (
              <div 
                className="space-y-3"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {items.map((item, index) => (
                  <Draggable key={item.tempId} draggableId={String(item.tempId)} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <Card className="relative group bg-white">
                          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
                            
                            {/* GRIP HANDLE */}
                            <div 
                              {...provided.dragHandleProps}
                              className="flex items-center justify-center h-10 cursor-grab text-slate-300 hover:text-slate-600"
                            >
                              <GripVertical />
                            </div>
                            
                            <div className="font-bold text-slate-300 text-xl w-6">#{index+1}</div>
                            
                            <div className="flex-1 w-full">
                              <Label className="text-xs text-slate-500 mb-1 block">Exercício</Label>
                              {item.exerciseId ? (
                                <div className="flex items-center justify-between border p-2 rounded-md bg-white">
                                  <span className="font-medium">
                                    {exercisesList.find(e => e.id === item.exerciseId)?.name || 'Desconhecido'}
                                  </span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 text-xs text-blue-600 hover:text-blue-800"
                                    onClick={() => updateLine(item.tempId!, 'exerciseId', '')}
                                  >
                                    Trocar
                                  </Button>
                                </div>
                              ) : (
                                <ExercisePicker 
                                  exercises={exercisesList} 
                                  onSelect={(id) => updateLine(item.tempId!, 'exerciseId', id)}
                                  triggerButton={
                                    <Button variant="outline" className="w-full justify-start text-slate-500 font-normal">
                                      🔍 Clique para buscar...
                                    </Button>
                                  }
                                />
                              )}
                            </div>

                            <div className="w-24">
                              <Label className="text-xs text-slate-500 mb-1 block">Séries</Label>
                              <Input type="number" value={item.sets} onChange={e => updateLine(item.tempId!, 'sets', Number(e.target.value))} />
                            </div>
                            
                            <div className="w-24">
                              <Label className="text-xs text-slate-500 mb-1 block">Reps</Label>
                              <Input type="number" value={item.reps} onChange={e => updateLine(item.tempId!, 'reps', Number(e.target.value))} />
                            </div>
                            
                            <Button variant="destructive" size="icon" onClick={() => removeLine(item.tempId!)} className="shrink-0">X</Button>
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

        <div className="flex flex-col gap-4">
            <Button variant="outline" className="w-full border-dashed border-2 py-6 text-slate-500" onClick={addNewLine}>+ Adicionar Exercício</Button>
            <Button className="w-full py-6 text-lg bg-amber-600 hover:bg-amber-700" onClick={handleUpdate}>Salvar Alterações</Button>
        </div>
      </div>
    </div>
  );
}