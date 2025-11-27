import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Play, Save, Trash2, Pencil, X, AlertCircle } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function WorkflowBuilder() {
  const navigate = useNavigate();
  const { id } = useParams(); // Ambil ID jika mode edit
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [workflowId, setWorkflowId] = useState(null);
  const [steps, setSteps] = useState([]);
  
  // Form Workflow Header
  const [wfName, setWfName] = useState('');
  const [wfDesc, setWfDesc] = useState('');

  // Form Agent
  const [isEditingAgent, setIsEditingAgent] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState(null);
  const [agentName, setAgentName] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');
  const [agentModel, setAgentModel] = useState('gemini-2.0-flash-001');
  const [agentTemp, setAgentTemp] = useState(0.7);

  // 1. Fetch Data jika Mode Edit
  const { data: existingData, isLoading, isError, error } = useQuery({
    queryKey: ['workflow', id],
    queryFn: async () => {
        // Idealnya ada endpoint GET /workflows/:id. Kita filter dari list sementara.
        const res = await api.get('/workflows'); 
        const found = res.data.data.find(w => w.id === parseInt(id));
        if (!found) throw new Error("Workflow not found");
        return found;
    },
    enabled: isEditMode,
    retry: 1
  });

  // Populate Data saat Fetch Selesai
  useEffect(() => {
    if (existingData) {
        setWorkflowId(existingData.id);
        setWfName(existingData.name);
        setWfDesc(existingData.description || '');
        // Map steps structure
        const loadedSteps = existingData.workflow_step.map(s => ({
             id: s.id, // ID step
             agent: s.agent // Data agent
        }));
        setSteps(loadedSteps);
    }
  }, [existingData]);

  // 2. Mutation: Create / Update Workflow Header
  const saveWorkflowMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditMode) {
        // Update
        return await api.put(`/workflows/${id}`, data);
      } else {
        // Create
        const res = await api.post('/workflows', data);
        return res.data.data; // Return created workflow object
      }
    },
    onSuccess: (data) => {
      if (!isEditMode) {
          setWorkflowId(data.id); // Set ID baru jika create
          navigate(`/dashboard/edit/${data.id}`, { replace: true }); // Ubah URL jadi mode edit
      }
      queryClient.invalidateQueries(['workflows']);
      toast.success(isEditMode ? "Workflow updated successfully!" : "Workflow created successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save workflow details.");
    }
  });

  // 3. Mutation: Add Agent
  const addStepMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post(`/workflows/${workflowId}/steps`, data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setSteps([...steps, { id: data.id, agent: data.agent }]); // Update UI local
      resetAgentForm();
      toast.success("New agent added to sequence.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add agent.");
    }
  });

  // 4. Mutation: Update Agent (PUT /agents/update/:id)
  const updateAgentMutation = useMutation({
    mutationFn: async (data) => {
       await api.put(`/agents/update/${editingAgentId}`, data);
    },
    onSuccess: (data, variables) => {
       // Update UI local secara manual agar tidak perlu refetch berat
       const updatedSteps = steps.map(s => {
           if (s.agent.id === editingAgentId) {
               return { ...s, agent: { ...s.agent, ...variables } };
           }
           return s;
       });
       setSteps(updatedSteps);
       resetAgentForm();
       toast.success("Agent updated successfully.");
    },
    onError: (err) => {
       toast.error(err.response?.data?.message || "Failed to update agent.");
    }
  });

  // 5. Mutation: Delete Agent (DELETE /agents/delete/:id)
  const deleteAgentMutation = useMutation({
      mutationFn: async (agentId) => {
          await api.delete(`/agents/delete/${agentId}`);
      },
      onSuccess: (_, agentId) => {
          // Hapus dari UI local
          setSteps(steps.filter(s => s.agent.id !== agentId));
          toast.success("Agent removed from sequence.");
      },
      onError: (err) => {
          toast.error(err.response?.data?.message || "Failed to delete agent.");
      }
  });

  const handleSaveWorkflow = () => {
    if (!wfName) return toast.error("Workflow name is required!");
    saveWorkflowMutation.mutate({ name: wfName, description: wfDesc });
  };

  const handleSaveAgent = () => {
    if (!agentName) return toast.error("Agent name is required!");
    if (!agentPrompt) return toast.error("System prompt is required!");

    const payload = {
        name: agentName,
        model: agentModel,
        prompt: agentPrompt,
        temperature: parseFloat(agentTemp)
    };

    if (isEditingAgent) {
        updateAgentMutation.mutate(payload);
    } else {
        addStepMutation.mutate(payload);
    }
  };

  const startEditAgent = (agent) => {
      setIsEditingAgent(true);
      setEditingAgentId(agent.id);
      setAgentName(agent.name);
      setAgentModel(agent.model);
      setAgentPrompt(agent.prompt);
      setAgentTemp(agent.Temperature || agent.temperature || 0.7);
      // Scroll ke form (opsional)
      // window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAgentForm = () => {
      setIsEditingAgent(false);
      setEditingAgentId(null);
      setAgentName('');
      setAgentPrompt('');
      setAgentTemp(0.7);
  };

  // Loading State untuk Edit Mode
  if (isEditMode && isLoading) return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
      <p className="text-slate-500">Loading workflow data...</p>
    </div>
  );

  // Error Alert jika gagal load data
  if (isEditMode && isError) {
      return (
        <div className="p-8 max-w-2xl mx-auto mt-10">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Data</AlertTitle>
                <AlertDescription>{error?.message || "Failed to load workflow data."}</AlertDescription>
            </Alert>
            <Button variant="outline" className="mt-4 w-full" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
        </div>
      );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {isEditMode ? "Edit Workflow" : "Create New Workflow"}
          </h2>
          <p className="text-slate-500">Define your AI pipeline sequence.</p>
        </div>
        {workflowId && (
           <Button onClick={() => navigate(`/dashboard/run/${workflowId}`)} className="bg-green-600 hover:bg-green-700 shadow-sm">
             <Play className="w-4 h-4 mr-2" /> Run Workflow
           </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Form Input */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Form */}
          <Card className={workflowId ? "border-green-200 bg-green-50/30" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-medium text-white">1</span>
                Workflow Details
                {workflowId && <Badge variant="outline" className="ml-auto text-green-600 border-green-600 bg-white">Saved</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input placeholder="e.g. Content Generator" value={wfName} onChange={(e) => setWfName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="What does this workflow do?" value={wfDesc} onChange={(e) => setWfDesc(e.target.value)} />
              </div>
              <Button 
                onClick={handleSaveWorkflow} 
                disabled={saveWorkflowMutation.isPending} 
                variant={workflowId ? "secondary" : "default"}
                className="w-full"
              >
                {saveWorkflowMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="mr-2 w-4 h-4"/>}
                {isEditMode || workflowId ? "Update Details" : "Save & Continue"}
              </Button>
            </CardContent>
          </Card>

          {/* Agent Form */}
          {workflowId && (
            <Card className={`border-2 shadow-sm ${isEditingAgent ? 'border-indigo-400 ring-4 ring-indigo-50' : 'border-indigo-100'}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">2</span>
                  {isEditingAgent ? "Edit Agent Configuration" : "Add New Agent"}
                </CardTitle>
                {isEditingAgent && (
                    <Button variant="ghost" size="sm" onClick={resetAgentForm} className="text-slate-500 hover:text-red-600 h-8">
                        <X className="w-4 h-4 mr-1"/> Cancel
                    </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Agent Name</Label>
                    <Input placeholder="e.g. Researcher" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={agentModel} 
                        onChange={(e) => setAgentModel(e.target.value)}
                    >
                      <option value="gemini-2.0-flash-001">gemini-2.0-flash-001</option>
                     
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>System Prompt</Label>
                  <Textarea 
                    placeholder="You are an expert copywriter. Your task is to..." 
                    className="min-h-[100px]" 
                    value={agentPrompt} 
                    onChange={(e) => setAgentPrompt(e.target.value)} 
                  />
                  <p className="text-xs text-slate-500">This prompt defines the agent's persona and task.</p>
                </div>
                <div className="space-y-3 pt-2">
                   <div className="flex justify-between">
                     <Label>Creativity (Temperature)</Label>
                     <span className="text-xs font-medium text-slate-600">{agentTemp}</span>
                   </div>
                   <input 
                     type="range" 
                     min="0" max="2" step="0.1" 
                     value={agentTemp} 
                     onChange={(e) => setAgentTemp(e.target.value)} 
                     className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                   />
                   <div className="flex justify-between text-[10px] text-slate-400 px-1">
                     <span>Precise (0.0)</span>
                     <span>Balanced (1.0)</span>
                     <span>Creative (2.0)</span>
                   </div>
                </div>

                <Button 
                    onClick={handleSaveAgent} 
                    disabled={addStepMutation.isPending || updateAgentMutation.isPending} 
                    className="w-full mt-2" 
                    variant={isEditingAgent ? "default" : "secondary"}
                >
                  {(addStepMutation.isPending || updateAgentMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditingAgent ? "Update Agent Configuration" : "Add Agent to Sequence"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: Pipeline Preview List */}
        <div className="lg:col-span-1">
          <Card className="h-full bg-slate-50 border-l-4 border-l-slate-200 shadow-inner">
             <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pipeline Sequence</CardTitle>
             </CardHeader>
             <CardContent className="space-y-0">
                {steps.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg bg-white/50">
                        <p className="text-slate-400 text-sm">No agents added yet.</p>
                        <p className="text-slate-400 text-xs mt-1">Add your first agent to start.</p>
                    </div>
                ) : (
                    steps.map((step, index) => (
                        <div key={step.agent.id} className="relative pl-6 pb-6 border-l-2 border-slate-300 last:border-0 last:pb-0">
                            {/* Step Number Node */}
                            <span className={`absolute -left-[9px] top-0 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ring-4 ring-slate-50 
                                ${isEditingAgent && editingAgentId === step.agent.id ? 'bg-indigo-600 text-white ring-indigo-100' : 'bg-slate-400 text-white'}
                            `}>
                                {index + 1}
                            </span>
                            
                            {/* Agent Card */}
                            <div className={`p-3 rounded-lg border shadow-sm transition-all duration-200 group
                                ${isEditingAgent && editingAgentId === step.agent.id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-300'}
                            `}>
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-semibold text-sm text-slate-800">{step.agent.name}</h4>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-indigo-100 hover:text-indigo-600" onClick={() => startEditAgent(step.agent)}>
                                            <Pencil className="w-3 h-3"/>
                                        </Button>
                                        
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                             <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-100 hover:text-red-600">
                                                <Trash2 className="w-3 h-3"/>
                                             </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Agent?</AlertDialogTitle>
                                                <AlertDialogDescription>This will remove {step.agent.name} from the workflow sequence.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteAgentMutation.mutate(step.agent.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-2 font-mono bg-slate-50 p-1.5 rounded">{step.agent.prompt}</p>
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-5 bg-slate-100 text-slate-600 font-normal border-slate-200">{step.agent.model}</Badge>
                                    <span className="text-[9px] text-slate-400">Temp: {step.agent.Temperature || step.agent.temperature}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}