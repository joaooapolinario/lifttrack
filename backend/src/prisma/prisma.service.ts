// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Conecta ao banco assim que o módulo iniciar
  async onModuleInit() {
    await this.$connect();
  }

  // Desconecta quando o app for encerrado (limpeza)
  async onModuleDestroy() {
    await this.$disconnect();
  }
}