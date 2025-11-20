'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  project_id: string;
}

interface Subtask {
  id: string;
  title: string;
  is_completed: boolean;
}

export default function TaskDetailsPage() {
  const params = useParams();
  const taskId = params.id as string;
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubtask, setNewSubtask] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [taskRes, subtasksRes] = await Promise.all([
        api.get(`/tasks/${taskId}`),
        api.get(`/tasks/${taskId}/subtasks`)
      ]);
      setTask(taskRes.data);
      setSubtasks(subtasksRes.data);
    } catch (error) {
      console.error('Failed to fetch task details', error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      fetchData();
    }
  }, [taskId, fetchData]);

  const updateStatus = async (status: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { ...task, status });
      setTask(prev => prev ? { ...prev, status } : null);
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const addSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;

    try {
      await api.post(`/tasks/${taskId}/subtasks`, { title: newSubtask });
      setNewSubtask('');
      fetchData(); // Refresh subtasks
    } catch (error) {
      console.error('Failed to add subtask', error);
    }
  };

  const toggleSubtask = async (subtask: Subtask) => {
    try {
      await api.put(`/subtasks/${subtask.id}`, { 
        title: subtask.title,
        is_completed: !subtask.is_completed 
      });
      setSubtasks(prev => prev.map(s => s.id === subtask.id ? { ...s, is_completed: !s.is_completed } : s));
    } catch (error) {
      console.error('Failed to update subtask', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <Button variant="ghost" className="w-fit pl-0 hover:pl-2 transition-all" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{task.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">{task.priority} Priority</Badge>
            <Badge className="capitalize">{task.status.replace('_', ' ')}</Badge>
          </div>
        </div>
        <div className="w-[200px]">
          <Select value={task.status} onValueChange={updateStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {task.description || 'No description provided.'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subtasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={addSubtask} className="flex gap-2">
            <Input 
              placeholder="Add a subtask..." 
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
            />
            <Button type="submit" size="sm">Add</Button>
          </form>

          <div className="space-y-2">
            {subtasks.map(subtask => (
              <div key={subtask.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md group">
                <button onClick={() => toggleSubtask(subtask)} className="text-muted-foreground hover:text-primary">
                  {subtask.is_completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <span className={subtask.is_completed ? 'line-through text-muted-foreground' : ''}>
                  {subtask.title}
                </span>
              </div>
            ))}
            {subtasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No subtasks yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
