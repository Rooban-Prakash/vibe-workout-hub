
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

export const StatsChart = () => {
  const [activeChart, setActiveChart] = useState<'weight' | 'mood' | 'workouts'>('weight');

  // Sample data - in a real app, this would come from your data store
  const weightData = [
    { date: '6/20', weight: 167.2 },
    { date: '6/21', weight: 166.8 },
    { date: '6/22', weight: 166.2 },
    { date: '6/23', weight: 166.0 },
    { date: '6/24', weight: 165.5 },
    { date: '6/25', weight: 165.3 },
  ];

  const moodData = [
    { date: '6/20', mood: 3 },
    { date: '6/21', mood: 4 },
    { date: '6/22', mood: 5 },
    { date: '6/23', mood: 3 },
    { date: '6/24', mood: 4 },
    { date: '6/25', mood: 5 },
  ];

  const workoutData = [
    { date: '6/20', exercises: 0 },
    { date: '6/21', exercises: 5 },
    { date: '6/22', exercises: 3 },
    { date: '6/23', exercises: 4 },
    { date: '6/24', exercises: 6 },
    { date: '6/25', exercises: 0 },
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'weight':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Weight (lbs)"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'mood':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[1, 5]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                name="Mood (1-5)"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'workouts':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workoutData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="exercises" 
                fill="#10B981" 
                name="Exercises Completed"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  const getChartTitle = () => {
    switch (activeChart) {
      case 'weight': return 'Weight Trend (Past 7 Days)';
      case 'mood': return 'Mood Tracking (Past 7 Days)';
      case 'workouts': return 'Workout Activity (Past 7 Days)';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            {getChartTitle()}
          </span>
          <div className="flex gap-2">
            <Button
              variant={activeChart === 'weight' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('weight')}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Weight
            </Button>
            <Button
              variant={activeChart === 'mood' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('mood')}
            >
              <Activity className="h-4 w-4 mr-1" />
              Mood
            </Button>
            <Button
              variant={activeChart === 'workouts' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('workouts')}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Workouts
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
        
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>📊 Track your progress over time and identify patterns in your fitness journey!</p>
        </div>
      </CardContent>
    </Card>
  );
};
