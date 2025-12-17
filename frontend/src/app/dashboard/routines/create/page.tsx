'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Tipos
interface Exercise {
  id: string;
  name: string;
}

// Estrutura de um item da lista temporária
interface RoutineItem {
  tempId: number; // Um ID falso só para o React organizar a lista na tela
  exerciseId: string;
  sets: number;
  reps: number;
}

export default function CreateRoutinePage() {
  const router = useRouter();
  const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
  
  // ESTADOS DO FORMULÁRIO
  const [routineName, setRoutineName] = useState('');
  const [items, setItems] = useState<RoutineItem[]>([
    { tempId: 1, exerciseId: '', sets: 3, reps: 10 } // Já começa com 1 item vazio
  ]);

  // Carregar lista de exercícios disponíveis ao abrir a página
  useEffect(() => {
    const token = localStorage.getItem('token');
    api.get('/exercises', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setExercisesList(res.data))
      .catch(err => console.error(err));
  }, []);

  // --- FUNÇÕES DE MANIPULAÇÃO DO ARRAY ---

  // 1. Adicionar nova linha em branco
  function addNewLine() {
    const newId = items.length + 1 + Math.random(); // ID aleatório simples
    setItems([...items, { tempId: newId, exerciseId: '', sets: 3, reps: 10 }]);
  }

  // 2. Remover uma linha específica
  function removeLine(tempIdToRemove: number) {
    if (items.length === 1) return; // Não deixa apagar o último, pra não ficar vazio
    setItems(items.filter(item => item.tempId !== tempIdToRemove));
  }

  // 3. Atualizar um campo de uma linha específica
  function updateLine(tempId: number, field: keyof RoutineItem, value: any) {
    const newItems = items.map(item => {
      if (item.tempId === tempId) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(newItems);
  }

  // --- SALVAR TUDO ---
  async function handleSave() {
    if (!routineName.trim()) return toast.error('Dê um nome para o treino!');
    
    // Filtra se tem algum exercício não selecionado
    if (items.some(i => !i.exerciseId)) return toast.error('Selecione todos os exercícios!');

    try {
      const token = localStorage.getItem('token');
      await api.post('/routines', {
        name: routineName,
        exercises: items // Envia o array montado
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Rotina criada com sucesso!');
       await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar rotina.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Nova Ficha de Treino</h1>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>Cancelar</Button>
        </div>

  
        <Card>
          <CardContent className="pt-6">
            <Label>Nome da Rotina</Label>
            <Input 
              placeholder="Ex: Treino A - Peito (Hipertrofia)" 
              value={routineName}
              onChange={e => setRoutineName(e.target.value)}
              className="mt-2 text-lg font-medium"
            />
          </CardContent>
        </Card>

        
        <div className="space-y-3">
          <Label className="text-lg">Exercícios</Label>
          
          {items.map((item, index) => (
            <Card key={item.tempId} className="relative group">
              <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
                
                
                <div className="font-bold text-slate-300 text-xl w-6">
                  #{index + 1}
                </div>

                
                <div className="flex-1 w-full">
                  <Label className="text-xs text-slate-500 mb-1 block">Exercício</Label>
                  <Select 
                    value={item.exerciseId} 
                    onValueChange={(val) => updateLine(item.tempId, 'exerciseId', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {exercisesList.map(ex => (
                        <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                
                <div className="w-24">
                  <Label className="text-xs text-slate-500 mb-1 block">Séries</Label>
                  <Input 
                    type="number" 
                    value={item.sets} 
                    onChange={e => updateLine(item.tempId, 'sets', Number(e.target.value))} 
                  />
                </div>

                <div className="w-24">
                  <Label className="text-xs text-slate-500 mb-1 block">Reps</Label>
                  <Input 
                    type="number" 
                    value={item.reps} 
                    onChange={e => updateLine(item.tempId, 'reps', Number(e.target.value))} 
                  />
                </div>

                
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => removeLine(item.tempId)}
                  className="shrink-0"
                >
                  X
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        
        <div className="flex flex-col gap-4">
          <Button 
            variant="outline" 
            className="w-full border-dashed border-2 py-6 text-slate-500 hover:text-slate-800"
            onClick={addNewLine}
          >
            + Adicionar Exercício
          </Button>

          <Button 
            className="w-full py-6 text-lg" 
            onClick={handleSave}
          >
            Salvar Ficha Completa
          </Button>
        </div>

      </div>
    </div>
  );
}