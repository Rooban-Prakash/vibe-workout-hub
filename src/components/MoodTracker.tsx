
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Heart, Smile, Meh, Frown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [recentMoods, setRecentMoods] = useState([
    { date: '2024-06-24', mood: 4, notes: 'Great workout today!' },
    { date: '2024-06-23', mood: 3, notes: 'Feeling good overall' },
    { date: '2024-06-22', mood: 5, notes: 'Amazing day!' },
  ]);
  const { toast } = useToast();

  const moods = [
    { value: 1, icon: Frown, label: 'Terrible', color: 'text-red-500' },
    { value: 2, icon: Frown, label: 'Bad', color: 'text-orange-500' },
    { value: 3, icon: Meh, label: 'Okay', color: 'text-yellow-500' },
    { value: 4, icon: Smile, label: 'Good', color: 'text-blue-500' },
    { value: 5, icon: Smile, label: 'Excellent', color: 'text-green-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMood === null) return;

    const newMoodEntry = {
      date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      notes: notes
    };

    setRecentMoods([newMoodEntry, ...recentMoods.slice(0, 6)]);
    setSelectedMood(null);
    setNotes('');

    const moodLabel = moods.find(m => m.value === selectedMood)?.label;
    toast({
      title: "Mood logged!",
      description: `Feeling ${moodLabel?.toLowerCase()} today`,
    });

    console.log('Mood entry:', newMoodEntry);
  };

  const getMoodIcon = (moodValue: number) => {
    const mood = moods.find(m => m.value === moodValue);
    if (!mood) return null;
    const Icon = mood.icon;
    return <Icon className={`h-4 w-4 ${mood.color}`} />;
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-purple-600" />
          Mood Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>How are you feeling today?</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {moods.map((mood) => {
                const Icon = mood.icon;
                return (
                  <Button
                    key={mood.value}
                    type="button"
                    variant={selectedMood === mood.value ? "default" : "outline"}
                    className="p-3 h-auto flex flex-col gap-1"
                    onClick={() => setSelectedMood(mood.value)}
                  >
                    <Icon className={`h-5 w-5 ${mood.color}`} />
                    <span className="text-xs">{mood.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="mood-notes">Notes (Optional)</Label>
            <Textarea
              id="mood-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's on your mind?"
              className="resize-none"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={selectedMood === null}>
            Log Mood
          </Button>
        </form>

        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Recent Moods</h4>
          <div className="space-y-1">
            {recentMoods.map((entry, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{new Date(entry.date).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    {getMoodIcon(entry.mood)}
                    <span className="text-sm font-medium">
                      {moods.find(m => m.value === entry.mood)?.label}
                    </span>
                  </div>
                </div>
                {entry.notes && (
                  <p className="text-xs text-gray-600 mt-1">{entry.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
