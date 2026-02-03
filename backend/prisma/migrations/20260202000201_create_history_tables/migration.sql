-- CreateTable
CREATE TABLE "workout_histories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "routineId" TEXT,
    "name" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_history_items" (
    "id" TEXT NOT NULL,
    "workoutHistoryId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,

    CONSTRAINT "workout_history_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "workout_histories" ADD CONSTRAINT "workout_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_histories" ADD CONSTRAINT "workout_histories_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_history_items" ADD CONSTRAINT "workout_history_items_workoutHistoryId_fkey" FOREIGN KEY ("workoutHistoryId") REFERENCES "workout_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_history_items" ADD CONSTRAINT "workout_history_items_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
