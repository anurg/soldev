'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, User as UserIcon } from 'lucide-react';
import { AddMemberDialog } from '@/components/features/members/add-member-dialog';
import { EditMemberDialog } from '@/components/features/members/edit-member-dialog';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function MembersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">Manage system users and team members.</p>
        </div>
        <AddMemberDialog onMemberAdded={fetchUsers} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card 
            key={user.id} 
            className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            onClick={() => handleUserClick(user)}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{user.full_name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <CardTitle className="text-base">{user.full_name}</CardTitle>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EditMemberDialog 
        user={selectedUser} 
        open={editOpen} 
        onOpenChange={setEditOpen} 
        onMemberUpdated={fetchUsers} 
      />
    </div>
  );
}
