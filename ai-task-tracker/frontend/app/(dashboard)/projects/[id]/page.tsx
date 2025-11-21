'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { CreateTaskDialog } from '@/components/features/tasks/create-task-dialog';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  parent_task_id?: string | null;
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/api/projects/${projectId}?t=${Date.now()}`),
        api.get(`/api/tasks?project_id=${projectId}&t=${Date.now()}`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Failed to fetch project details', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId, fetchData]);

  // Refetch when the tab becomes visible (e.g., after navigating back)
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchData]);

// Refetch when the window gains focus (e.g., after navigating back from a task page)
useEffect(() => {
  const handleFocus = () => {
    fetchData();
  };
  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, [fetchData]);

// Periodic polling to keep dashboard up-to-date
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 5000);
  return () => clearInterval(interval);
}, [fetchData]);

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  // Robust status matching (includes keywords)
  // Consider only top‑level tasks (exclude subtasks) for dashboard counts
  const topLevelTasks = tasks.filter(t => t.parent_task_id == null);
  const normalize = (s: string | null | undefined) => (s ?? '').toLowerCase();
  const todoTasks = topLevelTasks.filter(t => {
    const s = normalize(t.status);
    return s.includes('todo') || s.includes('pending');
  });
  const inProgressTasks = topLevelTasks.filter(t => {
    const s = normalize(t.status);
    return s.includes('in_progress') || s.includes('in progress') || s.includes('ongoing');
  });
  const doneTasks = topLevelTasks.filter(t => {
    const s = normalize(t.status);
    return s.includes('done') || s.includes('completed');
  });

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
            <div className="text-sm text-gray-500">Total tasks: {tasks.length}</div>
          </div>
            <div className="flex items-center gap-2">
              <CreateTaskDialog projectId={projectId} onTaskCreated={fetchData} />
              <Button variant="outline" onClick={fetchData}>Refresh</Button>
            </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Todo Column */}
        <div className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">To Do</h3>
            <Badge variant="secondary">{todoTasks.length}</Badge>
          </div>
          <div className="flex flex-col gap-3">
            {todoTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">In Progress</h3>
            <Badge variant="secondary">{inProgressTasks.length}</Badge>
          </div>
          <div className="flex flex-col gap-3">
            {inProgressTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Done</h3>
            <Badge variant="secondary">{doneTasks.length}</Badge>
          </div>
          <div className="flex flex-col gap-3">
            {doneTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        {/* Debug output removed */}
      </div>
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const priorityColor = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  }[task.priority] || 'bg-slate-100';

  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium leading-none flex justify-between items-start gap-2">
            <span>{task.title}</span>
            <span className="text-xs text-gray-500">{task.status}</span>
          </CardTitle>
          <div className="pt-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColor} capitalize`}>
              {task.priority}
            </span>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
