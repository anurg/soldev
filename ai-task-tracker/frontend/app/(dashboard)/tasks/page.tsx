'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  project_id: string;
  due_date?: string;
}

export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.id) return;
      try {
        const response = await api.get(`/api/tasks?assignee_id=${user.id}`);
        setTasks(response.data);
      } catch (error) {
        console.error('Failed to fetch tasks', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user?.id]);

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">You have no tasks assigned.</div>
        ) : (
          tasks.map((task) => (
            <Link key={task.id} href={`/tasks/${task.id}`}>
              <Card className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{task.title}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="capitalize">{task.status}</Badge>
                      <Badge variant="outline" className="capitalize">{task.priority}</Badge>
                      {task.due_date && (
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
