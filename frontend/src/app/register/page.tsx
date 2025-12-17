'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  async function handleRegister() {
    try {
      await api.post('/auth/register', formData);
      toast.success('Conta criada com sucesso! Faça login agora.');
      router.push('/');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar conta. Tente outro email.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Crie sua conta</CardTitle>
          <CardDescription>Comece a monitorar seus treinos hoje</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input 
              placeholder="Fulano da Silva" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              type="email" 
              placeholder="seu@email.com" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Senha</Label>
            <Input 
              type="password" 
              placeholder="******" 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <Button className="w-full" onClick={handleRegister}>
            Cadastrar
          </Button>

          <div className="text-center text-sm text-slate-500 mt-4">
            Já tem uma conta?{' '}
            <Link href="/" className="text-blue-600 hover:underline">
              Fazer Login
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}