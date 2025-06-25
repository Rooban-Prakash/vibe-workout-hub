
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export const WorkoutLogger = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const { toast } = useToast();

  const exerciseOptions = [
    'Bench Press', 'Squats', 'Deadlift', 'Pull-ups', 'Push-ups', 
    'Shoulder Press', 'Bicep Curls', 'Tricep Dips', 'Lunges', 'Planks'
  ];

  const handleAddExercise = () => {
    if (!currentExercise || !sets || !reps) return;

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: currentExercise,
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: parseFloat(weight) || 0
    };

    setExercises([...exercises, newExercise]);
    setCurrentExercise('');
    setSets('');
    setReps('');
    setWeight('');

    toast({
      title: "Exercise added!",
      description: `${newExercise.name} - ${newExercise.sets}x${newExercise.reps}`,
    });

    console.log('Exercise added:', newExercise);
  };

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
    setExercises([]);
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
          Workout Logger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
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
            <Label htmlFor="exercise-weight">Weight (lbs) - Optional</Label>
            <Input
              id="exercise-weight"
              type="number"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="135"
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
                  <span className="font-medium">{exercise.name}</span>
                  <div className="text-sm text-gray-600">
                    {exercise.sets}x{exercise.reps}
                    {exercise.weight > 0 && ` @ ${exercise.weight}lbs`}
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
