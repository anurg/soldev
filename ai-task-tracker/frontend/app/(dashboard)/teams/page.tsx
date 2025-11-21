'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateTeamDialog } from '@/components/features/teams/create-team-dialog';
import { AddMemberDialog } from '@/components/features/teams/add-member-dialog';
import { EditTeamDialog } from '@/components/features/teams/edit-team-dialog';
import { Users, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TeamMember {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
}

interface Team {
  id: string;
  name: string;
  members?: TeamMember[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/api/teams');
      const teamsData = response.data;
      
      const teamsWithMembers = await Promise.all(teamsData.map(async (team: Team) => {
        try {
          const membersRes = await api.get(`/api/teams/${team.id}/members`);
          return { ...team, members: membersRes.data };
        } catch {
          return { ...team, members: [] };
        }
      }));

      setTeams(teamsWithMembers);
    } catch (error) {
      console.error('Failed to fetch teams', error);
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (e: React.MouseEvent, teamId: string, userId: string) => {
    e.stopPropagation(); // Prevent opening edit dialog
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/api/teams/${teamId}/members/${userId}`);
      fetchTeams();
    } catch (error) {
      console.error('Failed to remove member', error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">Manage your teams and members.</p>
        </div>
        <CreateTeamDialog onTeamCreated={fetchTeams} />
      </div>

      {loading ? (
        <div className="text-center py-10">Loading teams...</div>
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border rounded-lg border-dashed">
          <Users className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No teams found</h3>
          <p className="text-muted-foreground mb-4">Create a team to start collaborating.</p>
          <CreateTeamDialog onTeamCreated={fetchTeams} />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card 
              key={team.id} 
              className="flex flex-col h-full cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setEditingTeam(team)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="mt-4 space-y-3 flex-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Members</h4>
                  <div className="flex flex-col gap-2">
                    {team.members && team.members.length > 0 ? (
                      team.members.map((member) => (
                        <div key={member.user_id} className="flex items-center gap-2 justify-between group p-2 hover:bg-slate-50 rounded-md transition-colors">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {member.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium leading-none">{member.full_name}</span>
                              <span className="text-[10px] text-muted-foreground">{member.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground capitalize">{member.role}</span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={(e) => removeMember(e, team.id, member.user_id)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No members yet.</span>
                    )}
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <AddMemberDialog teamId={team.id} onMemberAdded={fetchTeams} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingTeam && (
        <EditTeamDialog 
          team={editingTeam} 
          open={!!editingTeam} 
          onOpenChange={(open) => !open && setEditingTeam(null)}
          onTeamUpdated={fetchTeams}
        />
      )}
    </div>
  );
}
