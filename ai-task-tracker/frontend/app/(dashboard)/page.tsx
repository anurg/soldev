'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Folder, CheckSquare, Clock } from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date?: string;
}

interface Project {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          api.get(`/api/tasks?assignee_id=${user.id}`),
          api.get(`/api/projects`) // Assuming this returns projects for the user's teams
        ]);
        
        setTasks(tasksRes.data);
        setProjects(projectsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const pendingTasks = tasks.filter(t => t.status !== 'done').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/projects">
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="text-sm text-muted-foreground">No projects found.</div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex flex-col">
                      <span className="font-medium">{project.name}</span>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/projects/${project.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : tasks.length === 0 ? (
              <div className="text-sm text-muted-foreground">No tasks found.</div>
            ) : (
              <div className="space-y-4">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex flex-col">
                      <span className="font-medium">{task.title}</span>
                      <span className="text-xs text-muted-foreground capitalize">{task.status} • {task.priority}</span>
                    </div>
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
