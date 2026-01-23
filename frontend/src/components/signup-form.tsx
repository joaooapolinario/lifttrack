'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "sonner";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleRegister} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Crie sua conta</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Comece agora e monitore seus treinos
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="name">Nome</FieldLabel>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Fulano da Silva" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required 
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Field>
              <Field>
                <Field >
                  <Field>
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="******" 
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required 
                    />
                  </Field>
                </Field>
              </Field>
              <Field>
                <Button type="submit">Cadastrar</Button>
              </Field>
              <FieldDescription className="text-center">
                Já tem uma conta? <a href="/login">Fazer Login</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="gym-cad.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover "
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
