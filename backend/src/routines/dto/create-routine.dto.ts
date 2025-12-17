export class CreateRoutineDto {
    name: string;
    exercises: {
        exerciseId: string;
        sets: number;
        reps: number;
    }[];
}
