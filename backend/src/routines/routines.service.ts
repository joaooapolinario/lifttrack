import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoutinesService {
  constructor(private prisma: PrismaService) {}

  // Criar uma ficha completa
  // O DTO vai receber: { name: "Treino A", exercises: [{id: "...", sets: 4, reps: 10}] }
  async create(userId: string, data: any) {
    return this.prisma.routine.create({
      data: {
        name: data.name,
        userId: userId,
        items: {
          create: data.exercises.map((ex: any) => ({
            exerciseId: ex.exerciseId,
            sets: Number(ex.sets),
            reps: Number(ex.reps),
          })),
        },
      },
      include: { items: { include: { exercise: true } } },
    });
  }

 async update(id: string, userId: string, data: any) {
    // 1. Verifica se a rotina existe
    const existing = await this.prisma.routine.findFirst({ where: { id, userId } });
    if (!existing) throw new Error('Rotina não encontrada ou acesso negado.');

    // 2. Transação
    return this.prisma.$transaction(async (tx) => {
      await tx.routine.update({
        where: { id },
        data: { name: data.name },
      });

      await tx.routineItem.deleteMany({
        where: { routineId: id },
      });

      if (data.exercises && data.exercises.length > 0) {
        await tx.routineItem.createMany({
          data: data.exercises.map((ex: any) => ({
            routineId: id,
            exerciseId: ex.exerciseId,
            sets: Number(ex.sets),
            reps: Number(ex.reps),
          })),
        });
      }

      return tx.routine.findUnique({
        where: { id },
        include: { items: { include: { exercise: true } } },
      });
    });
  }
  // Listar todas as fichas do usuário
  findAll(userId: string) {
    return this.prisma.routine.findMany({
      where: { userId },
      include: {
        items: {
          include: { exercise: true }, // Traz os nomes dos exercícios
        },
      },
    });
  }
  
  findOne(id: string) {
    return this.prisma.routine.findUnique({
      where: { id },
      include: { items: { include: { exercise: true } } },
    });
  }

  async remove(id: string, userId: string) {
    const result = await this.prisma.routine.deleteMany({
      where: {
        id, userId
      },
    });
    
    return { deleted: result.count > 0 };
  }

}