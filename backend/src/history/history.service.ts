import { Injectable } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateHistoryDto) {
    return this.prisma.workoutHistory.create({
      data: {
        userId,
        routineId: dto.routineId,
        name: dto.name,
        startedAt: dto.startedAt,
        endedAt: dto.endedAt,
        items: {
          create: dto.items.map((item) => ({
            exerciseId: item.exerciseId,
            sets: item.sets,
            reps: item.reps,
            weight: item.weight || 0,
          })),
        },
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.workoutHistory.findMany({
      where: { userId },
      orderBy: { endedAt: 'desc' }, 
      include: {
        items: {
          include: { exercise: true },
        },
      },
    });
  }

}
