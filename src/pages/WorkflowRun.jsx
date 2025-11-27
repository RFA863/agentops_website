import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; // Import Alert
import { toast } from "sonner"; // Import Toast
import { Loader2, PlayCircle, Clock, AlertCircle } from "lucide-react";

export default function WorkflowRun() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [executionId, setExecutionId] = useState(null);

  // 1. Mutation: Execute Workflow
  const executeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/workflows/${id}/execute`, { input });
      return res.data.data;
    },
    onSuccess: (data) => {
      setExecutionId(data.executionId); 
      toast.success("Workflow execution started!"); // Toast Sukses
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to start execution."); // Toast Gagal
    }
  });

  // 2. Query: Polling History
  const { data: history, isLoading, isError, error } = useQuery({
    queryKey: ['execution', executionId],
    queryFn: async () => {
      const res = await api.get(`/workflows/executions/${executionId}`);
      return res.data.data;
    },
    enabled: !!executionId, 
    refetchInterval: (data) => {
      const status = data?.status?.toLowerCase();
      if (status === 'completed' || status === 'failed') {
        return false; // Stop polling
      }
      return 1000; // Poll tiap 1 detik
    }
  });

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'completed': return 'bg-green-500 hover:bg-green-600';
      case 'running': return 'bg-blue-500 hover:bg-blue-600';
      case 'failed': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-slate-400';
    }
  };

  // TAMPILKAN ALERT JIKA ERROR LOAD HISTORY (Misal ID eksekusi salah)
  if (isError) return (
    <div className="p-8 max-w-2xl mx-auto">
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error?.message || "Failed to load execution logs."}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Input Section */}
      <Card className="border-t-4 border-t-indigo-600 shadow-lg">
        <CardHeader>
          <CardTitle>Run Workflow</CardTitle>
          <CardDescription>Enter the initial input to trigger the agent chain.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="Enter your topic or input here..." 
            className="min-h-[120px] text-lg p-4"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={executeMutation.isPending || (history && history.status === 'Running')}
          />
          <Button 
            size="lg" 
            className="w-full text-md font-semibold" 
            onClick={() => executeMutation.mutate()}
            disabled={!input || executeMutation.isPending || (history && history.status === 'Running')}
          >
            {executeMutation.isPending ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
            ) : (
              <><PlayCircle className="mr-2 h-5 w-5" /> Start Execution</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Logs / Results Section */}
      {executionId && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Execution Logs</h3>
            {history && (
              <Badge className={`${getStatusColor(history.status)} text-white px-3 py-1 capitalize`}>
                {history.status}
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            {/* Input Awal */}
            <Card className="bg-slate-50 border-slate-200 opacity-80">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> Initial Trigger
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{input}</p>
              </CardContent>
            </Card>

            {/* List Steps Logs */}
            {history?.execution_log?.map((log, idx) => (
              <Card key={log.id} className={`transition-all duration-300 ${log.status === 'Running' ? 'ring-2 ring-blue-400 shadow-blue-100' : ''}`}>
                <CardHeader className="py-4 border-b border-slate-100 bg-white rounded-t-lg flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                      ${log.status === 'Completed' ? 'bg-green-500' : log.status === 'Failed' ? 'bg-red-500' : 'bg-blue-500'}
                    `}>
                      {idx + 1}
                    </div>
                    <div>
                      <CardTitle className="text-base">{log.workflow_step?.agent?.name}</CardTitle>
                      <CardDescription className="text-xs">{log.workflow_step?.agent?.model}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">{log.status}</Badge>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="p-4 bg-slate-50/50">
                      <p className="text-xs font-semibold text-slate-400 mb-2 uppercase">Input</p>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{log.input_data}</p>
                    </div>
                    <div className="p-4 bg-white">
                      <p className="text-xs font-semibold text-slate-400 mb-2 uppercase">Output (AI Response)</p>
                      {log.status === 'Running' ? (
                        <div className="flex items-center text-blue-600 text-sm animate-pulse">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                        </div>
                      ) : log.output_data ? (
                        <p className="text-sm text-slate-800 whitespace-pre-wrap">{log.output_data}</p>
                      ) : (
                        <p className="text-sm text-red-500 italic">{log.error_message || 'No output'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}