'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, CheckCircle2, Circle, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EditTaskDialog } from '@/components/features/tasks/edit-task-dialog';
import { CreateTaskDialog } from '@/components/features/tasks/create-task-dialog';
import { TaskHistory } from '@/components/features/tasks/task-history';
import { AddHistoryDialog } from '@/components/features/tasks/add-history-dialog';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  project_id: string;
  progress_percent: number;
  assignee_id?: string | null;
}



interface User {
  id: string;
  full_name: string;
  email: string;
}

export default function TaskDetailsPage() {
  const params = useParams();
  const taskId = params.id as string;
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  const fetchData = useCallback(async () => {
    try {
      console.log('fetchData called - fetching task data...');
      // Fetch task, subtasks, and history with cache-busting
      const timestamp = Date.now();
      const [taskRes, subtasksRes, historyRes] = await Promise.all([
        api.get(`/api/tasks/${taskId}?t=${timestamp}`),
        api.get(`/api/tasks?parent_task_id=${taskId}&t=${timestamp}`),
        api.get(`/api/tasks/${taskId}/history?t=${timestamp}`)
      ]);
      
      const taskData = taskRes.data;
      console.log('Fetched task data - progress_percent:', taskData.progress_percent);
      setTask(taskData);
      setSubtasks(subtasksRes.data);
      setHistory(historyRes.data);

      // Fetch project to get team_id, then fetch members
      if (taskData.project_id) {
        const projectRes = await api.get(`/api/projects/${taskData.project_id}`);
        const teamId = projectRes.data.team_id;
        
        if (teamId) {
          const membersRes = await api.get(`/api/teams/${teamId}/members`);
          setMembers(membersRes.data);
        }
      }
      console.log('fetchData complete - task state updated');
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

  const updateTask = async (updates: Partial<Task>) => {
    if (!task) return;
    
    try {
      // Auto-set progress to 100% when status is set to 'done'
      if (updates.status === 'done' && updates.progress_percent === undefined) {
        updates.progress_percent = 100;
      }
      
      const updatedTask = { ...task, ...updates };
      // Handle unassigned case for API
      if (updatedTask.assignee_id === 'unassigned') {
        updatedTask.assignee_id = null;
      }
      
      await api.put(`/api/tasks/${taskId}`, updatedTask);
      setTask(updatedTask);
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };



  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-10">
      <Button variant="ghost" className="w-fit pl-0 hover:pl-2 transition-all" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{task.title}</h1>
            <EditTaskDialog task={task} onTaskUpdated={updateTask} />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">{task.priority} Priority</Badge>
            <Badge className="capitalize" variant={task.status === 'done' ? 'default' : 'secondary'}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-[250px]">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <Select value={task.status} onValueChange={(val) => updateTask({ status: val })}>
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
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Assignee</label>
            <Select 
              value={task.assignee_id || "unassigned"} 
              onValueChange={(val) => updateTask({ assignee_id: val === "unassigned" ? null : val })}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <SelectValue placeholder="Unassigned" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {members.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Subtasks</CardTitle>
              <CreateTaskDialog 
                projectId={task.project_id} 
                parentTaskId={task.id}
                onTaskCreated={fetchData}
              />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {subtasks.map(subtask => (
                  <Link key={subtask.id} href={`/tasks/${subtask.id}`} className="block">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <div className="flex items-center gap-3">
                          {subtask.status === 'done' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                          <span className={subtask.status === 'done' ? 'line-through text-muted-foreground' : 'font-medium'}>
                            {subtask.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">{subtask.status.replace('_', ' ')}</Badge>
                          <Badge variant="outline" className="text-xs capitalize">{subtask.priority}</Badge>
                        </div>
                    </div>
                  </Link>
                ))}
                {subtasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No subtasks yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{task.progress_percent}%</span>
                  <span className="text-xs text-muted-foreground">Completed</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={task.progress_percent}
                  onChange={(e) => updateTask({ progress_percent: parseInt(e.target.value) })}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Priority</span>
                <Select value={task.priority} onValueChange={(val) => updateTask({ priority: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task History Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Updates & Progress</h2>
          <AddHistoryDialog taskId={taskId} onHistoryAdded={fetchData} />
        </div>
        <TaskHistory history={history} />
      </div>
    </div>
  );
}
