'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateProjectDialog } from '@/components/features/projects/create-project-dialog';
import { Folder, ArrowRight } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and tasks.</p>
        </div>
        <CreateProjectDialog onProjectCreated={fetchProjects} />
      </div>

      {loading ? (
        <div className="text-center py-10">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border rounded-lg border-dashed">
          <Folder className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first project.</p>
          <CreateProjectDialog onProjectCreated={fetchProjects} />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-xs text-muted-foreground">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full justify-between group">
                  <Link href={`/projects/${project.id}`}>
                    View Tasks
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
