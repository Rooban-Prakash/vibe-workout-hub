
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Weight, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const WeightTracker = () => {
  const [weight, setWeight] = useState('');
  const [recentWeights, setRecentWeights] = useState([
    { date: '2024-06-24', weight: 75.1 },
    { date: '2024-06-23', weight: 75.3 },
    { date: '2024-06-22', weight: 75.4 },
  ]);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    const newEntry = {
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(weight)
    };

    setRecentWeights([newEntry, ...recentWeights.slice(0, 6)]);
    setWeight('');
    
    toast({
      title: "Weight logged!",
      description: `${weight} kg recorded for today`,
    });

    console.log('Weight entry:', newEntry);
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Weight className="h-5 w-5 text-blue-600" />
          Weight Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="weight">Today's Weight (kg)</Label>
            <div className="flex gap-2">
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight"
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Recent Entries</h4>
          <div className="space-y-1">
            {recentWeights.map((entry, index) => (
              <div key={index} className="flex justify-between text-sm py-1 px-2 bg-gray-50 rounded">
                <span>{new Date(entry.date).toLocaleDateString()}</span>
                <span className="font-medium">{entry.weight} kg</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
