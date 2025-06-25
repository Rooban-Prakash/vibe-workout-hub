
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Target, Plus, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  lastCompleted: string | null;
}

export const HabitTracker = () => {
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', name: 'Drink 8 glasses of water', streak: 5, completedToday: false, lastCompleted: '2024-06-23' },
    { id: '2', name: 'Read for 30 minutes', streak: 12, completedToday: true, lastCompleted: '2024-06-25' },
    { id: '3', name: 'Meditate for 10 minutes', streak: 3, completedToday: false, lastCompleted: '2024-06-23' },
    { id: '4', name: 'Take vitamins', streak: 8, completedToday: true, lastCompleted: '2024-06-25' },
    { id: '5', name: 'Walk 10,000 steps', streak: 0, completedToday: false, lastCompleted: null },
  ]);
  const [newHabit, setNewHabit] = useState('');
  const { toast } = useToast();

  const toggleHabit = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const wasCompletedToday = habit.completedToday;
        const newCompletedToday = !wasCompletedToday;
        
        let newStreak = habit.streak;
        if (newCompletedToday) {
          // If completing today and wasn't completed before
          if (!wasCompletedToday) {
            newStreak = habit.streak + 1;
          }
        } else {
          // If unchecking today's completion
          newStreak = Math.max(0, habit.streak - 1);
        }

        if (newCompletedToday && !wasCompletedToday) {
          toast({
            title: "Habit completed!",
            description: `${habit.name} - ${newStreak} day streak! 🔥`,
          });
        }

        return {
          ...habit,
          completedToday: newCompletedToday,
          streak: newStreak,
          lastCompleted: newCompletedToday ? today : habit.lastCompleted
        };
      }
      return habit;
    }));

    console.log('Habit toggled:', habitId);
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.trim(),
      streak: 0,
      completedToday: false,
      lastCompleted: null
    };

    setHabits([...habits, habit]);
    setNewHabit('');

    toast({
      title: "New habit added!",
      description: `${habit.name} is now being tracked`,
    });

    console.log('New habit added:', habit);
  };

  const completedToday = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-600" />
          Habit Tracker
          <span className="ml-auto text-sm font-normal bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
            {completedToday}/{totalHabits}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={addHabit} className="flex gap-2">
          <Input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Add new habit..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        <div className="space-y-3">
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id={habit.id}
                checked={habit.completedToday}
                onCheckedChange={() => toggleHabit(habit.id)}
              />
              <div className="flex-1">
                <label
                  htmlFor={habit.id}
                  className={`text-sm font-medium cursor-pointer ${
                    habit.completedToday ? 'line-through text-gray-500' : ''
                  }`}
                >
                  {habit.name}
                </label>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">
                  {habit.streak}
                </span>
              </div>
            </div>
          ))}
        </div>

        {totalHabits > 0 && (
          <div className="text-center text-sm text-gray-600 mt-4">
            Keep it up! You've completed {completedToday} out of {totalHabits} habits today.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
