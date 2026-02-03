'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { Trophy, PartyPopper } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const QUOTES = [
  "Sem dor, sem ganho!",
  "A única repetição ruim é a que você não fez.",
  "Foco na execução!",
  "Hoje você está mais forte que ontem.",
  "Respeite o processo.",
  "O corpo alcança o que a mente acredita.",
  "Descanse, mas não desista."
];
const MOTIVATIONAL_QUOTES = [
  "O corpo alcança o que a mente acredita. Excelente treino!",
  "Não é sobre perfeição, é sobre consistência. Parabéns!",
  "Mais um tijolo na construção da sua melhor versão.",
  "O treino de hoje é a força de amanhã. Mandou bem!",
  "Você não está apenas suando, está brilhando. Bom trabalho!",
  "A dor que você sente hoje será a força que você sentirá amanhã."
];

export default function ActiveWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [startedAt] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);


  const [routine, setRoutine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true); // Começa rodando
  
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

  const handleFinish = async () => {
    const confirm = window.confirm("Deseja finalizar e salvar o treino?");
    if (!confirm) return;

    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      const itemsToSend = routine.items
        .filter((item: any) => completedItems.includes(item.id))
        .map((item: any) => ({
          exerciseId: item.exerciseId,
          sets: Number(item.sets),
          reps: Number(item.reps),
          weight: 0 // Futuramente colocaremos um input de peso aqui
        }));

      if (itemsToSend.length === 0) {
        alert("Você precisa marcar pelo menos um exercício como feito!");
        setIsSaving(false);
        return;
      }

      await api.post('/history', {
        routineId: routine.id,
        name: routine.name,
        startedAt: startedAt.toISOString(),
        endedAt: new Date().toISOString(), 
        items: itemsToSend
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
      setQuote(randomQuote);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar o treino.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando treino...</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <div className="px-4 pt-6 pb-2 bg-background">
        <h1 className="text-2xl font-black text-primary leading-tight">
            {routine.name}
        </h1>
        <p className="text-sm text-slate-500 italic mt-1 font-medium">
            "{quote}"
        </p>
      </div>

      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b shadow-sm px-4 py-3 flex items-center justify-between">
        
        <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tempo</span>
            <span className="text-3xl font-mono font-bold text-primary tracking-tighter">
                {formatTime(seconds)}
            </span>
        </div>

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
                disabled={isSaving}
            >
                {isSaving ? "SALVANDO..." : "FIM"}
            </Button>
        </div>
      </div>


      <div className="flex-1 p-4 space-y-3 pb-20">
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
                            ? 'bg-background border-green-200 opacity-50' // Estilo quando feito
                            : 'bg-background border-primary/10 shadow-sm '// Estilo normal
                        }
                    `}
                >
                    {/* Infos do Exercício */}
                    <div className="flex-1 pr-4">
                        <h3 className={`font-bold text-lg ${isDone ? 'text-green-800 line-through' : 'text-slate-200'}`}>
                            {item.exercise.name}
                        </h3>
                        <div className="flex gap-4 mt-1">
                            <span className="text-sm font-medium text-slate-200 bg-primary/10 px-2 py-0.5 rounded">
                                {item.sets} Séries
                            </span>
                            <span className="text-sm font-medium text-slate-200 bg-primary/10 px-2 py-0.5 rounded">
                                {item.reps} Reps
                            </span>
                        </div>
                    </div>

                    {/* O Checkbox Gigante Visual */}
                    <div className={`${isDone ? 'text-green-500' : 'text-primary'}`}>
                        {isDone ? (
                            <CheckCircle2 size={40} fill="currentColor" className="text-green-200" />
                        ) : (
                            <Circle size={40} />
                        )}
                    </div>
                </div>
            );
        })}
      </div>

      

        {/* MODAL DE SUCESSO (Aparece ao terminar) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-sm bg-card border-primary/50 shadow-2xl shadow-primary/20 animate-in zoom-in-95 duration-300">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-primary/20 p-4 rounded-full mb-4 ring-2 ring-primary/50">
                <Trophy className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-2xl font-black text-primary flex items-center justify-center gap-2">
                <PartyPopper size={24} />
                TREINO CONCLUÍDO!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
                "{quote}"
              </p>
              <Button 
                className="w-full h-12 text-lg font-bold shadow-lg"
                onClick={() => router.push('/dashboard')}
              >
                Ver meu Progresso
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}