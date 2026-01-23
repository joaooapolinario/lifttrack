'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Search } from 'lucide-react'; // Ícones

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface ExercisePickerProps {
  exercises: Exercise[];
  onSelect: (exerciseId: string) => void;
  triggerButton?: React.ReactNode; // Botão customizado para abrir
}

export function ExercisePicker({ exercises, onSelect, triggerButton }: ExercisePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // 1. Extrair grupos musculares únicos para criar os botões de filtro
  const muscleGroups = useMemo(() => {
    const groups = exercises.map(ex => ex.muscleGroup);
    return Array.from(new Set(groups)); // Remove duplicados
  }, [exercises]);

  // 2. Filtrar a lista (Lógica principal)
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = selectedGroup ? ex.muscleGroup === selectedGroup : true;
    return matchesSearch && matchesGroup;
  });

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false); // Fecha o modal ao selecionar
    setSearch('');  // Limpa busca
    setSelectedGroup(null); // Limpa filtro
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || <Button variant="outline">Selecionar Exercício</Button>}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Escolher Exercício</DialogTitle>
        </DialogHeader>

        {/* ÁREA DE BUSCA E FILTROS */}
        <div className="space-y-4 py-2">
          {/* Input de Busca */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar exercício..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Filtros (Badges clicáveis) */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedGroup === null ? "default" : "outline"}
              className="cursor-pointer hover:bg-slate-900 hover:text-white"
              onClick={() => setSelectedGroup(null)}
            >
              Todos
            </Badge>
            {muscleGroups.map(group => (
              <Badge
                key={group}
                variant={selectedGroup === group ? "default" : "outline"}
                className="cursor-pointer hover:bg-slate-900 hover:text-white"
                onClick={() => setSelectedGroup(group)}
              >
                {group}
              </Badge>
            ))}
          </div>
        </div>

        {/* LISTA DE RESULTADOS */}
        <ScrollArea className="flex-1 border rounded-md p-2">
          <div className="space-y-1">
            {filteredExercises.length === 0 ? (
              <p className="text-center text-slate-500 py-4 text-sm">Nenhum exercício encontrado.</p>
            ) : (
              filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleSelect(ex.id)}
                  className="flex items-center justify-between p-3 hover:bg-primary/10 rounded-md cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-medium text-primary">{ex.name}</div>
                    <div className="text-xs text-slate-500">{ex.muscleGroup}</div>
                  </div>
                  {/* Seta ou ícone de + */}
                  <div className="text-slate-400 text-sm">Selecionar →</div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

      </DialogContent>
    </Dialog>
  );
}