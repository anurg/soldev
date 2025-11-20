'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTeamDialog } from '@/components/features/teams/create-team-dialog';
import { Users } from 'lucide-react';
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
  members?: TeamMember[]; // Assuming API returns members or we fetch them separately
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      const teamsData = response.data;
      
      // Fetch members for each team (if not included in list response)
      // For now, let's assume we need to fetch members separately or the API includes them.
      // Based on API docs, GET /teams/:id/members lists members.
      // We'll fetch members for each team to display them.
      const teamsWithMembers = await Promise.all(teamsData.map(async (team: Team) => {
        try {
          const membersRes = await api.get(`/teams/${team.id}/members`);
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
            <Card key={team.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Members</h4>
                  <div className="flex flex-col gap-2">
                    {team.members && team.members.length > 0 ? (
                      team.members.map((member) => (
                        <div key={member.user_id} className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {member.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{member.full_name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{member.role}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No members yet.</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
