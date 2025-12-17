// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // Importamos nosso service do banco
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  // AQUI A MÁGICA: Injeção de Dependência via construtor
  // O NestJS percebe que pedimos o PrismaService e nos entrega ele pronto.
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // 1. Criptografar a senha (10 rodadas de sal)
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 2. Criar no banco de dados usando o Prisma
    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword, // Salva a senha criptografada
      },
    });

    // 3. Retornar o usuário (mas sem a senha para segurança!)
    const { password, ...result } = user;
    return result;
  }

  // Busca todos os usuários
  findAll() {
    return this.prisma.user.findMany();
  }

  // Busca um usuário pelo ID
  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // As outras funções (update, remove) deixaremos para depois
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}