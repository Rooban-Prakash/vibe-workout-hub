
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Plus, Trash2, CheckCircle2, CircleDashed, Dumbbell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weight: number;
}

export const WorkoutLogger = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [workoutDone, setWorkoutDone] = useState(false);
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const { toast } = useToast();

  const exerciseOptions = [
    'Bench Press', 'Squats', 'Deadlift', 'Pull-ups', 'Push-ups', 
    'Shoulder Press', 'Bicep Curls', 'Tricep Dips', 'Lunges', 'Planks'
  ];

  const muscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body', 'Cardio'
  ];

  const handleAddExercise = () => {
    if (!currentExercise || !muscleGroup || !sets || !reps) return;

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: currentExercise,
      muscleGroup,
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: parseFloat(weight) || 0
    };

    setExercises([...exercises, newExercise]);
    setCurrentExercise('');
    setMuscleGroup('');
    setSets('');
    setReps('');
    setWeight('');

    toast({
      title: "Exercise added!",
      description: `${newExercise.name} (${newExercise.muscleGroup}) - ${newExercise.sets}x${newExercise.reps}`,
    });

    console.log('Exercise added:', newExercise);
  };

  const muscleGroupsTrained = Array.from(new Set(exercises.map((ex) => ex.muscleGroup)));

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const finishWorkout = () => {
    if (exercises.length === 0) return;

    const workout = {
      date: new Date().toISOString(),
      exercises: exercises
    };

    toast({
      title: "Workout completed!",
      description: `Great job! ${exercises.length} exercises logged.`,
    });

    console.log('Workout completed:', workout);
    setWorkoutDone(true);
    setExercises([]);
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Workout Logger
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`flex items-center justify-between rounded-lg border p-3 ${
            workoutDone ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
          }`}
        >
          <div className="flex items-center gap-2">
            {workoutDone ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <CircleDashed className="h-5 w-5 text-amber-600" />
            )}
            <div>
              <p className="text-sm font-medium">
                {workoutDone ? "Today's workout: Done" : "Today's workout: Not done yet"}
              </p>
              <p className="text-xs text-gray-600">
                {muscleGroupsTrained.length > 0
                  ? `Muscle groups: ${muscleGroupsTrained.join(', ')}`
                  : 'Log exercises to mark today complete'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setWorkoutDone(!workoutDone)}>
            {workoutDone ? 'Undo' : 'Mark done'}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Muscle Group</Label>
            <Select value={muscleGroup} onValueChange={setMuscleGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select muscle group" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label>Exercise</Label>
            <Select value={currentExercise} onValueChange={setCurrentExercise}>
              <SelectTrigger>
                <SelectValue placeholder="Select exercise" />
              </SelectTrigger>
              <SelectContent>
                {exerciseOptions.map((exercise) => (
                  <SelectItem key={exercise} value={exercise}>
                    {exercise}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="sets">Sets</Label>
            <Input
              id="sets"
              type="number"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              placeholder="3"
            />
          </div>
          
          <div>
            <Label htmlFor="reps">Reps</Label>
            <Input
              id="reps"
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="12"
            />
          </div>
          
          <div className="col-span-2">
            <Label htmlFor="exercise-weight">Weight (kg) - Optional</Label>
            <Input
              id="exercise-weight"
              type="number"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="60"
            />
          </div>
        </div>

        <Button onClick={handleAddExercise} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>

        {exercises.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Today's Workout</h4>
            {exercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{exercise.name}</span>
                    <Badge variant="secondary" className="gap-1">
                      <Dumbbell className="h-3 w-3" />
                      {exercise.muscleGroup}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {exercise.sets}x{exercise.reps}
                    {exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExercise(exercise.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            
            <Button onClick={finishWorkout} className="w-full mt-3">
              Complete Workout
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
