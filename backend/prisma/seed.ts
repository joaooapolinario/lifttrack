// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o seed...');

  // Lista de exercícios básicos para popular o banco
  const exercises = [
    { name: 'Supino Reto', muscleGroup: 'Peito' },
    { name: 'Supino Inclinado', muscleGroup: 'Peito' },
    { name: 'Crucifixo', muscleGroup: 'Peito' },
    { name: 'Flexão de Braço', muscleGroup: 'Peito' },
    { name: 'Agachamento Livre', muscleGroup: 'Pernas' },
    { name: 'Leg Press 45', muscleGroup: 'Pernas' },
    { name: 'Cadeira Extensora', muscleGroup: 'Pernas' },
    { name: 'Puxada Frontal', muscleGroup: 'Costas' },
    { name: 'Remada Curvada', muscleGroup: 'Costas' },
    { name: 'Levantamento Terra', muscleGroup: 'Costas' },
    { name: 'Rosca Direta', muscleGroup: 'Bíceps' },
    { name: 'Rosca Martelo', muscleGroup: 'Bíceps' },
    { name: 'Tríceps Pulley', muscleGroup: 'Tríceps' },
    { name: 'Tríceps Testa', muscleGroup: 'Tríceps' },
    { name: 'Elevação Lateral', muscleGroup: 'Ombros' },
    { name: 'Desenvolvimento', muscleGroup: 'Ombros' },
  ];

  for (const ex of exercises) {
    // Cria o exercício se ele não existir
    await prisma.exercise.create({
      data: ex,
    });
  }

  console.log('✅ Banco populado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });