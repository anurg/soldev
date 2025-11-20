'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { CreateTaskDialog } from '@/components/features/tasks/create-task-dialog';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
        api.get(`/projects/${projectId}`),
        api.get(`/tasks?project_id=${projectId}`)
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

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <CreateTaskDialog projectId={projectId} onTaskCreated={fetchData} />
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
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-medium leading-none flex justify-between items-start gap-2">
          <span>{task.title}</span>
        </CardTitle>
        <div className="pt-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColor} capitalize`}>
            {task.priority}
          </span>
        </div>
      </CardHeader>
    </Card>
  );
}
