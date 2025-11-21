'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Lock, Mail, Shield } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put(`/api/users/${user?.id}`, { password });
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to update password', error);
      setMessage({ type: 'error', text: 'Failed to update password' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account information and security settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        {/* Left Column - Profile Identity */}
        <Card className="h-fit">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-90" />
            <div className="relative p-8 text-white">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarFallback className="text-3xl bg-white text-slate-900">
                    {user.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user.full_name}</h2>
                  <p className="text-sm opacity-90 mt-1 flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3" />
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="font-medium">Email</span>
              </div>
              <p className="text-sm pl-6 break-all">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Account Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details are managed by your organization administrator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">Full Name</Label>
                  <p className="text-sm font-medium">{user.full_name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">Role</Label>
                  <p className="text-sm font-medium capitalize">{user.role}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase">Email Address</Label>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {message.text && (
                  <div className={`text-sm font-medium ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                    {message.text}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
