'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageSquare, TrendingUp } from 'lucide-react';

interface TaskHistoryEntry {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  completion_percentage: number;
  created_at: string;
  user_name: string;
  user_email: string;
}

interface TaskHistoryProps {
  history: TaskHistoryEntry[];
}

export function TaskHistory({ history }: TaskHistoryProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Task History
          </CardTitle>
          <CardDescription>No history entries yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Task History
        </CardTitle>
        <CardDescription>Activity timeline for this task</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {history.map((entry, index) => (
            <div key={entry.id} className="relative flex gap-4">
              {/* Timeline line */}
              {index !== history.length - 1 && (
                <div className="absolute left-5 top-12 h-full w-0.5 bg-slate-200 dark:bg-slate-700" />
              )}
              
              {/* Avatar */}
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {entry.user_name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{entry.user_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {entry.completion_percentage}%
                  </Badge>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border">
                  <p className="text-sm whitespace-pre-wrap">{entry.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
