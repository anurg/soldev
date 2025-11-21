'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, UserPlus, Search, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AddMemberDialogProps {
  teamId: string;
  onMemberAdded: () => void;
}

interface User {
  id: string;
  email: string;
  full_name: string;
}

export function AddMemberDialog({ teamId, onMemberAdded }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchUsers();
      setSearchQuery('');
      setSelectedUser(null);
      setError('');
    }
  }, [open]);

  const fetchUsers = async () => {
    setIsFetchingUsers(true);
    try {
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
      setError('Failed to load users.');
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    setError('');

    try {
      await api.post(`/api/teams/${teamId}/members`, { email: selectedUser.email });
      setOpen(false);
      onMemberAdded();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 404) {
        setError('User not found.');
      } else {
        setError('Failed to add member. User might already be in the team.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-2">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Search and select a user to add to this team.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {isFetchingUsers ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[200px] rounded-md border p-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No users found.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent ${
                        selectedUser?.id === user.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.full_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user.full_name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                      {selectedUser?.id === user.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </div>

        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !selectedUser}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Member'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
