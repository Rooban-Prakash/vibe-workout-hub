
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeightTracker } from './WeightTracker';
import { WorkoutLogger } from './WorkoutLogger';
import { MoodTracker } from './MoodTracker';
import { HabitTracker } from './HabitTracker';
import { StatsChart } from './StatsChart';
import { TrendingUp, Calendar, Heart, Target } from 'lucide-react';

export const Dashboard = () => {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Vibe Workout Hub</h1>
          <p className="text-lg text-gray-600">{today}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Weight Streak</p>
                  <p className="text-2xl font-bold">7 days</p>
                </div>
                <TrendingUp className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Workout Streak</p>
                  <p className="text-2xl font-bold">5 days</p>
                </div>
                <Calendar className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Mood Streak</p>
                  <p className="text-2xl font-bold">12 days</p>
                </div>
                <Heart className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Habits</p>
                  <p className="text-2xl font-bold">3/5</p>
                </div>
                <Target className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <WeightTracker />
            <WorkoutLogger />
          </div>
          <div className="space-y-6">
            <MoodTracker />
            <HabitTracker />
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-8">
          <StatsChart />
        </div>
      </div>
    </div>
  );
};
