'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';

// Frases motivacionais aleatórias
const QUOTES = [
  "Sem dor, sem ganho!",
  "A única repetição ruim é a que você não fez.",
  "Foco na execução!",
  "Hoje você está mais forte que ontem.",
  "Respeite o processo.",
  "O corpo alcança o que a mente acredita.",
  "Descanse, mas não desista."
];

export default function ActiveWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [routine, setRoutine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true); // Começa rodando
  
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    const token = localStorage.getItem('token');
    if (!token) return;

    api.get(`/routines/${resolvedParams.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setRoutine(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  // 2. Lógica do Relógio (O Coração do Cronômetro)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1); // Soma +1 segundo
      }, 1000);
    }

    // Limpeza: Se pausar ou sair da tela, para o relógio para não travar o PC
    return () => clearInterval(interval);
  }, [isRunning]);

  // Função para formatar segundos em MM:SS (ex: 90s -> 01:30)
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Função para Marcar/Desmarcar exercício
  const toggleExercise = (itemId: string) => {
    if (completedItems.includes(itemId)) {
      setCompletedItems(completedItems.filter(id => id !== itemId)); // Remove
    } else {
      setCompletedItems([...completedItems, itemId]); // Adiciona
    }
  };

  const handleFinish = () => {
    // Aqui no futuro vamos salvar o log do treino
    const confirm = window.confirm("Deseja finalizar o treino?");
    if (confirm) {
        toast.success(`Treino finalizado em ${formatTime(seconds)}!`);
        router.push('/dashboard');
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando treino...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* --- CABEÇALHO (Título e Frase) --- */}
      <div className="px-4 pt-6 pb-2 bg-white">
        <h1 className="text-2xl font-black text-slate-900 leading-tight">
            {routine.name}
        </h1>
        <p className="text-sm text-slate-500 italic mt-1 font-medium">
            "{quote}"
        </p>
      </div>

      {/* --- BARRA FIXA (Cronômetro e Ações) --- */}
      {/* 'sticky top-0' faz ele colar no teto. z-50 garante que fique por cima de tudo */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b shadow-sm px-4 py-3 flex items-center justify-between">
        
        {/* Lado Esquerdo: O Tempo */}
        <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tempo</span>
            <span className="text-3xl font-mono font-bold text-blue-600 tracking-tighter">
                {formatTime(seconds)}
            </span>
        </div>

        {/* Lado Direito: Botões de Controle */}
        <div className="flex gap-2">
            <Button 
                size="icon" 
                variant={isRunning ? "outline" : "default"} 
                className="h-12 w-12 rounded-full"
                onClick={() => setIsRunning(!isRunning)}
            >
                {isRunning ? <Pause /> : <Play fill="currentColor" />}
            </Button>
            
            <Button 
                variant="destructive" 
                className="h-12 px-6 rounded-full font-bold"
                onClick={handleFinish}
            >
                FIM
            </Button>
        </div>
      </div>

      {/* --- LISTA DE EXERCÍCIOS --- */}
      <div className="flex-1 p-4 space-y-3 pb-20"> {/* pb-20 para dar espaço no final */}
        {routine.items.map((item: any) => {
            const isDone = completedItems.includes(item.id);

            return (
                <div 
                    key={item.id}
                    onClick={() => toggleExercise(item.id)}
                    className={`
                        cursor-pointer transition-all duration-200
                        flex items-center justify-between p-4 rounded-xl border-2
                        ${isDone 
                            ? 'bg-green-50 border-green-200 opacity-60' // Estilo quando feito
                            : 'bg-white border-transparent shadow-sm hover:border-blue-200' // Estilo normal
                        }
                    `}
                >
                    {/* Infos do Exercício */}
                    <div className="flex-1 pr-4">
                        <h3 className={`font-bold text-lg ${isDone ? 'text-green-800 line-through' : 'text-slate-900'}`}>
                            {item.exercise.name}
                        </h3>
                        <div className="flex gap-4 mt-1">
                            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {item.sets} Séries
                            </span>
                            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {item.reps} Reps
                            </span>
                        </div>
                    </div>

                    {/* O Checkbox Gigante Visual */}
                    <div className={`${isDone ? 'text-green-500' : 'text-slate-200'}`}>
                        {isDone ? (
                            <CheckCircle2 size={40} fill="currentColor" className="text-green-100" />
                        ) : (
                            <Circle size={40} />
                        )}
                    </div>
                </div>
            );
        })}
      </div>

    </div>
  );
}