import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
// Import komponen feedback
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Play, ArrowRight, Calendar, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";

export default function WorkflowList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch Data
  const { data: workflows, isLoading, isError, error } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const res = await api.get('/workflows');
      return res.data.data;
    }
  });

  // Mutation Delete
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/workflows/${id}`);
    },
    onSuccess: () => {
      toast.success("Workflow deleted successfully"); // Toast Sukses
      queryClient.invalidateQueries(['workflows']);
    },
    onError: (err) => {
      // Toast Gagal dengan pesan dari backend
      toast.error(err.response?.data?.message || "Failed to delete workflow");
    }
  });

  if (isLoading) return (
    <div className="grid gap-6 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-[200px] p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full mt-4" />
        </Card>
      ))}
    </div>
  );

  // TAMPILKAN ALERT JIKA GAGAL LOAD DATA
  if (isError) return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error Loading Data</AlertTitle>
      <AlertDescription>
        {error?.response?.data?.message || error?.message || "Could not fetch workflows. Please try again later."}
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
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
        <div className="text-center py-20 border border-dashed border-slate-300 rounded-xl">
          <p className="text-slate-500 mb-4">No workflows created yet.</p>
          <Link to="/dashboard/create"><Button variant="outline">Create your first workflow</Button></Link>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {workflows?.map((wf) => (
          <Card key={wf.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold text-slate-800 line-clamp-1" title={wf.name}>
                    {wf.name}
                  </CardTitle>
                  <div className="flex items-center text-xs text-slate-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(wf.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-1">
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => navigate(`/dashboard/edit/${wf.id}`)}>
                     <Pencil className="w-4 h-4" />
                   </Button>
                   
                   {/* ALERT DIALOG UNTUK DELETE */}
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600">
                          {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Workflow?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete "{wf.name}" and all its configured agents.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-600 hover:bg-red-700" 
                            onClick={() => deleteMutation.mutate(wf.id)}
                          >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                   </AlertDialog>
                </div>
              </div>
              <CardDescription className="line-clamp-2 min-h-[40px]">
                {wf.description || "No description provided."}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
               <div className="mt-2 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sequence</p>
                <div className="flex flex-wrap items-center gap-2">
                  {wf.workflow_step?.map((step, idx) => (
                    <div key={step.id} className="flex items-center">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md text-xs font-medium text-slate-700 whitespace-nowrap max-w-[120px] truncate">
                        <span className="w-4 h-4 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full text-[10px] flex-shrink-0">{idx + 1}</span>
                        <span className="truncate">{step.agent.name}</span>
                      </div>
                      {idx < wf.workflow_step.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300 mx-1 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-4 border-t border-slate-100">
              <Button className="w-full bg-slate-900 hover:bg-indigo-600 transition-colors" onClick={() => navigate(`/dashboard/run/${wf.id}`)}>
                <Play className="w-4 h-4 mr-2" /> Run Workflow
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}