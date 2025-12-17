"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Routine {
  id: string;
  name: string;
  items: any[];
}

export default function Dashboard() {
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    // buscamos /routines
    api
      .get("/routines", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setRoutines(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao carregar as fichas:", error);
        // Se der erro 401 (token inválido), volta pro login.
        // Se for outro erro (ex: backend desligado), apenas avisa no console.
        if (error.response?.status === 401) {
          router.push("/");
        } else {
          setLoading(false); // Para de carregar mesmo com erro (mostra lista vazia)
        }
      });
  }, [router]);

  if (loading)
    return (
      <div className="p-8 flex justify-center">Carregando suas fichas...</div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800">Minhas Fichas</h1>

          {/* Botão que leva para a tela de CRIAÇÃO COMPLETA*/}
          <Button onClick={() => router.push("/dashboard/routines/create")}>
            + Nova Ficha
          </Button>
        </div>

        {/* Lista de Fichas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {routines.length === 0 ? (
            <p className="text-slate-500 col-span-full text-center py-10 bg-white rounded-lg border border-dashed">
              Você não tem nenhuma ficha de treino.
              <br />
              Clique em "+ Nova Ficha" para criar a primeira.
            </p>
          ) : (
            routines.map((routine) => (
              <Card
                key={routine.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-600"
                onClick={() => router.push(`/dashboard/routines/${routine.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{routine.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500">
                    {routine.items?.length || 0} exercícios
                  </p>
                  <p className="text-xs text-blue-500 mt-2 font-medium">
                    Clique para ver detalhes →
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
