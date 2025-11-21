'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';

interface AddHistoryDialogProps {
  taskId: string;
  onHistoryAdded?: () => void;
}

export function AddHistoryDialog({ taskId, onHistoryAdded }: AddHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Adding history with completion:', completionPercentage);
      
      // Add history entry
      await api.post(`/api/tasks/${taskId}/history`, {
        comment,
        completion_percentage: completionPercentage,
      });
      console.log('History added successfully');

      // Update task progress_percent
      const taskRes = await api.get(`/api/tasks/${taskId}`);
      const currentTask = taskRes.data;
      console.log('Current task before update:', currentTask.progress_percent);
      
      await api.put(`/api/tasks/${taskId}`, {
        ...currentTask,
        progress_percent: completionPercentage,
      });
      console.log('Task updated with progress:', completionPercentage);

      // Reset form state
      setComment('');
      setCompletionPercentage(0);
      setIsLoading(false);
      
      // Close dialog
      setOpen(false);
      
      // Call callback to refresh parent component
      if (onHistoryAdded) {
        console.log('Calling onHistoryAdded callback');
        onHistoryAdded();
      }
    } catch (error) {
      console.error('Failed to add history', error);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Update
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Task Update</DialogTitle>
          <DialogDescription>
            Add a comment and update the completion percentage for this task.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                placeholder="Describe what you've done or any updates..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="completion">
                Completion Percentage: {completionPercentage}%
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="completion"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={completionPercentage}
                  onChange={(e) => setCompletionPercentage(parseInt(e.target.value))}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={completionPercentage}
                  onChange={(e) => setCompletionPercentage(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-20"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Update'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
