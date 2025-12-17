"use client";

import { useRouter } from "next/navigation";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from 'next/link'

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Envia os dados
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // pega o token.
      // O "?." evita que quebre se for nulo
      const token = response.data?.access_token;

      if (!token) {
        // alert('Falha no login.');
        toast.error("Falha no login.");
      }

      localStorage.setItem("token", token);

      //alert('Login realizado com sucesso!');
      toast.success("Login realizado com sucesso!");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/dashboard");
    } catch (error: any) {
      // Adicione o type any para evitar erro de TS temporário
      // console.error('Erro total:', error);
      toast.error(error.response.data.message || "Falha no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse seus treinos e rotinas.</CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col pt-6">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Acessar"}
            </Button>
            <div className="text-center text-sm text-slate-500 mt-4">
              Não tem conta?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Criar conta grátis
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
