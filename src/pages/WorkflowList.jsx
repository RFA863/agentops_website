import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Tambah useMutation & Client
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Plus, Play, ArrowRight, Calendar, Pencil, Trash2, Loader2 } from "lucide-react"; // Import icon baru

export default function WorkflowList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Untuk refresh data otomatis

  const { data: workflows, isLoading, isError } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const res = await api.get('/workflows');
      return res.data.data;
    }
  });

  // Mutation Delete Workflow
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/workflows/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']); // Refresh list setelah delete
    }
  });

  if (isLoading) return <div className="grid gap-6 md:grid-cols-3">{/* Skeleton... */}</div>;
  if (isError) return <div className="text-red-500">Error loading workflows</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header sama seperti sebelumnya */}
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

      {/* List Workflows */}
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
                <div className="flex gap-2">
                   {/* Tombol Edit */}
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => navigate(`/dashboard/edit/${wf.id}`)}>
                     <Pencil className="w-4 h-4" />
                   </Button>
                   
                   {/* Tombol Delete dengan Konfirmasi */}
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600">
                          {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the workflow "{wf.name}" and all its agents.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteMutation.mutate(wf.id)}>
                            Delete
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

            {/* Content Pipeline Visualization (Sama seperti sebelumnya) */}
            <CardContent className="flex-1">
               <div className="mt-2 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline Sequence</p>
                <div className="flex flex-wrap items-center gap-2">
                  {wf.workflow_step?.map((step, idx) => (
                    <div key={step.id} className="flex items-center">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md text-xs font-medium text-slate-700 whitespace-nowrap max-w-[120px] truncate">
                        <span className="w-4 h-4 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full text-[10px] flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate">{step.agent.name}</span>
                      </div>
                      {idx < wf.workflow_step.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-slate-300 mx-1 flex-shrink-0" />
                      )}
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