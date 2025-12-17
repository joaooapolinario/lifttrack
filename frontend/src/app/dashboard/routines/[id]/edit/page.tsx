'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface RoutineItem {
  tempId: number; 
  exerciseId: string;
  sets: number;
  reps: number;
}

export default function EditRoutinePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const routineId = resolvedParams.id;
  const router = useRouter();

  const [exercisesList, setExercisesList] = useState<any[]>([]);
  const [routineName, setRoutineName] = useState('');
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega dados iniciais
  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token) return router.push('/');

    Promise.all([
      api.get('/exercises', { headers: { Authorization: `Bearer ${token}` } }),
      api.get(`/routines/${routineId}`, { headers: { Authorization: `Bearer ${token}` } })
    ]).then(([resEx, resRoutine]) => {
      setExercisesList(resEx.data);
      
      // Popula o formulário com os dados que vieram do banco
      const r = resRoutine.data;
      setRoutineName(r.name);
      
      // Transforma os itens do banco no formato do nosso formulário
      const formattedItems = r.items.map((item: any) => ({
        tempId: Math.random(),
        exerciseId: item.exerciseId,
        sets: item.sets,
        reps: item.reps
      }));
      setItems(formattedItems);
    }).finally(() => setLoading(false));
  }, [routineId, router]);

  // --- MÉTODOS DE MANIPULAÇÃO (IGUAIS AO CREATE) ---
  function addNewLine() {
    setItems([...items, { tempId: Math.random(), exerciseId: '', sets: 3, reps: 10 }]);
  }

  function removeLine(tempId: number) {
    if (items.length === 1) return toast.error("A ficha precisa ter pelo menos 1 exercício.");
    setItems(items.filter(i => i.tempId !== tempId));
  }

  function updateLine(tempId: number, field: string, value: any) {
    setItems(items.map(i => i.tempId === tempId ? { ...i, [field]: value } : i));
  }

  async function handleUpdate() {
    if (!routineName.trim() || items.some(i => !i.exerciseId)) return alert('Preencha tudo!');

    try {
      const token = localStorage.getItem('token');
      
      // CONVERSÃO FORÇADA: Garante que sets e reps sejam números
      const cleanExercises = items.map(item => ({
        exerciseId: item.exerciseId,
        sets: Number(item.sets), // <--- Transforma "3" em 3
        reps: Number(item.reps)  // <--- Transforma "10" em 10
      }));

      

      await api.patch(`/routines/${routineId}`, {
        name: routineName,
        exercises: cleanExercises
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Ficha atualizada com sucesso!');
      
      // Força o roteador a atualizar os dados antes de navegar
      router.refresh(); 
      router.push(`/dashboard/routines/${routineId}`); // Volta para a visualização da ficha
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar alterações.');
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between">
            <h1 className="text-2xl font-bold">Editar Ficha</h1>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>Cancelar</Button>
        </div>

        <Card><CardContent className="pt-6">
            <Label>Nome da Rotina</Label>
            <Input value={routineName} onChange={e => setRoutineName(e.target.value)} />
        </CardContent></Card>

        <div className="space-y-3">
          {items.map((item, index) => (
            <Card key={item.tempId}>
              <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
                <div className="font-bold text-slate-300">#{index+1}</div>
                <div className="flex-1 w-full">
                  <Label>Exercício</Label>
                  <Select value={item.exerciseId} onValueChange={(v) => updateLine(item.tempId, 'exerciseId', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {exercisesList.map(ex => <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24"><Label>Séries</Label><Input type="number" value={item.sets} onChange={e => updateLine(item.tempId, 'sets', e.target.value)} /></div>
                <div className="w-24"><Label>Reps</Label><Input type="number" value={item.reps} onChange={e => updateLine(item.tempId, 'reps', e.target.value)} /></div>
                <Button variant="destructive" onClick={() => removeLine(item.tempId)}>X</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button variant="outline" className="w-full py-4" onClick={addNewLine}>+ Adicionar Exercício</Button>
        <Button className="w-full py-6 text-lg bg-amber-600 hover:bg-amber-700" onClick={handleUpdate}>Salvar Alterações</Button>
      </div>
    </div>
  );
}