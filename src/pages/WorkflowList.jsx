import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Play, ArrowRight, Layers, Calendar } from "lucide-react";

export default function WorkflowList() {
  const navigate = useNavigate();

  // Fetch Data Workflows
  const { data: workflows, isLoading, isError } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const res = await api.get('/workflows');
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-[200px] flex flex-col justify-between">
            <CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2 mt-2" /></CardHeader>
            <CardContent><Skeleton className="h-10 w-full" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500 py-10">Failed to load workflows.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">My Workflows</h2>
          <p className="text-slate-500 mt-1">Manage and run your AI automation pipelines.</p>
        </div>
        <Link to="/dashboard/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
            <Plus className="w-4 h-4 mr-2" /> Create New Workflow
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      {workflows?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-300 rounded-xl">
          <div className="bg-indigo-50 p-4 rounded-full mb-4">
            <Layers className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No workflows yet</h3>
          <p className="text-slate-500 max-w-sm text-center mt-2 mb-6">
            Start by creating your first sequence of AI agents to automate your tasks.
          </p>
          <Link to="/dashboard/create">
            <Button variant="outline">Create Workflow</Button>
          </Link>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {workflows?.map((wf) => (
          <Card key={wf.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {wf.name}
                  </CardTitle>
                  <div className="flex items-center text-xs text-slate-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(wf.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                  {wf.workflow_step?.length || 0} Steps
                </Badge>
              </div>
              <CardDescription className="line-clamp-2 min-h-[40px]">
                {wf.description || "No description provided."}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              {/* Visualisasi Step/Chain */}
              <div className="mt-2 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline Sequence</p>
                <div className="flex flex-wrap items-center gap-2">
                  {wf.workflow_step?.map((step, idx) => (
                    <div key={step.id} className="flex items-center">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md text-xs font-medium text-slate-700 whitespace-nowrap max-w-[120px] truncate">
                        <span className="w-4 h-4 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full text-[10px] flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate" title={step.agent.name}>{step.agent.name}</span>
                      </div>
                      {/* Panah antar agent */}
                      {idx < wf.workflow_step.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-slate-300 mx-1 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                  
                  {(!wf.workflow_step || wf.workflow_step.length === 0) && (
                    <span className="text-xs text-slate-400 italic">No agents configured</span>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-4 border-t border-slate-100">
              <Button 
                className="w-full bg-slate-900 hover:bg-indigo-600 transition-colors" 
                onClick={() => navigate(`/dashboard/run/${wf.id}`)}
              >
                <Play className="w-4 h-4 mr-2" /> Run Workflow
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}