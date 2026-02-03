'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Dumbbell, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(response.data);
      } catch (err) {
        console.error("Erro ao carregar histórico", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando histórico...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Meu Histórico</h1>
      </div>

      {/* Lista de Treinos */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p>Nenhum treino finalizado ainda.</p>
          </div>
        ) : (
          history.map((item) => (
            <Card key={item.id} className="border-l-4 border-l-primary/50">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {item.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar size={12} />
                      {format(new Date(item.endedAt), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                  
                  {/* Duração (Cálculo simples) */}
                  <div className="bg-secondary px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
                    <Clock size={12} />
                    {Math.round((new Date(item.endedAt).getTime() - new Date(item.startedAt).getTime()) / 60000)} min
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {item.items.map((exerciseItem: any) => (
                    <span 
                      key={exerciseItem.id} 
                      className="text-xs bg-muted px-2 py-1 rounded-md border"
                    >
                      {exerciseItem.sets}x {exerciseItem.exercise.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}