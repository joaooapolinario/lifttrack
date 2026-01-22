import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoutinesService {
  constructor(private prisma: PrismaService) {}

  // Criar uma ficha completa
  // O DTO vai receber: { name: "Treino A", exercises: [{id: "...", sets: 4, reps: 10}] }
  async create(userId: string, data: any) {
    const lastRoutine = await this.prisma.routine.findFirst({
      where: { userId },
      orderBy: { position: 'desc' },
    });

    const nextPosition = lastRoutine ? lastRoutine.position + 1 : 0;
    
    return this.prisma.routine.create({
      data: {
        name: data.name,
        userId: userId,
        position: nextPosition,
        items: {
          create: data.exercises.map((ex: any, index: number) => ({
            exerciseId: ex.exerciseId,
            sets: Number(ex.sets),
            reps: Number(ex.reps),
            position: index,
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
          data: data.exercises.map((ex: any, index: number) => ({
            routineId: id,
            exerciseId: ex.exerciseId,
            sets: Number(ex.sets),
            reps: Number(ex.reps),
            position: index,
          })),
        });
      }

      return tx.routine.findUnique({
        where: { id },
        include: { items: { include: { exercise: true },
        orderBy: { position: 'asc' }, } },
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
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { position: 'asc' },
    });
  }
  
  findOne(id: string) {
    return this.prisma.routine.findUnique({
      where: { id },
      include: { items: { include: { exercise: true },
        orderBy: { position: 'asc' }, } },
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

  async reorder(userId: string, items: { id: string; position: number }[]) {
    return this.prisma.$transaction(
      items.map((item) =>
        this.prisma.routine.updateMany({
          where: { id: item.id, userId },
          data: { position: item.position },
        }),
      ),
    );
  }

}