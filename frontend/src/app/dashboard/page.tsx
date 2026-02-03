"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Plus, GripVertical, Menu, Flame, Trophy, Timer } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const [stats, setStats] = useState({
    total: 0,
    weekCount: 0,
    lastWorkout: null as any,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Carregar Rotinas
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    api
      .get("/routines", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setRoutines(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    async function loadStats() {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/history", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const history = response.data;

        const total = history.length;

        const lastWorkout = history[0] || null;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weekCount = history.filter(
          (h: any) => new Date(h.endedAt) >= sevenDaysAgo,
        ).length;

        setStats({ total, weekCount, lastWorkout });
      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

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
      const token = localStorage.getItem("token");

      // Monta o payload com a nova posição de cada item
      const updates = newRoutines.map((routine, index) => ({
        id: routine.id,
        position: index,
      }));

      await api.patch(
        "/routines/reorder",
        { items: updates },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (error) {
      console.error("Erro ao salvar ordem", error);
      // Se der erro, o ideal seria recarregar a lista original
    }
  };

  if (loading)
    return <div className="p-8 text-center">Carregando seus treinos...</div>;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Meus Treinos</h1>

          <div className="flex gap-2">
            {/* Botão Novo: Histórico */}
            <Link href="/dashboard/history">
              <Button variant="outline">📜 Histórico</Button>
            </Link>
            <Link href="/dashboard/routines/create">
              <Button size="lg" className="bg-primary hover:bg-primary/80">
              + Novo Treino</Button>
            </Link>
          </div>
        </div>

        {/* --- BARRA DE GAMIFICAÇÃO --- */}
        {!loadingStats && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {/* Card 1: Frequência Semanal (O "Foguinho") */}
            <Card className="bg-card border-none shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Flame
                  className={`w-6 h-6 mb-1 ${stats.weekCount > 0 ? "text-orange-500 fill-orange-500" : "text-muted-foreground"}`}
                />
                <span className="text-2xl font-black">{stats.weekCount}</span>
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                  Na Semana
                </span>
              </CardContent>
            </Card>

            {/* Card 2: Total de Treinos (O Troféu) */}
            <Card className="bg-card border-none shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Trophy className="w-6 h-6 mb-1 text-primary" />
                <span className="text-2xl font-black">{stats.total}</span>
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                  Total
                </span>
              </CardContent>
            </Card>

            {/* Card 3: Último Treino */}
            <Card className="bg-card border-none shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Timer className="w-6 h-6 mb-1 text-emerald-500" />
                <span className="text-sm font-black line-clamp-1 mt-1 leading-none">
                  {stats.lastWorkout ? stats.lastWorkout.name : "-"}
                </span>
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mt-1.5">
                  {stats.lastWorkout
                    ? format(new Date(stats.lastWorkout.endedAt), "d MMM", {
                        locale: ptBR,
                      })
                    : "Último"}
                </span>
              </CardContent>
            </Card>
          </div>
        )}

        {routines.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed">
            <p className="text-slate-500 mb-4">
              Você ainda não tem nenhuma ficha de treino.
            </p>
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
                    <Draggable
                      key={routine.id}
                      draggableId={routine.id}
                      index={index}
                    >
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
                                  ? routine.items
                                      .slice(0, 3)
                                      .map((i) => i.exercise.name)
                                      .join(", ")
                                  : "Nenhum exercício ainda."}
                                {routine.items.length > 3 && "..."}
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
