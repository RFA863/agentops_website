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
import { Loader2, Plus, Play, Save, Trash2, Pencil, X } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

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
  const { data: existingData, isLoading } = useQuery({
    queryKey: ['workflow', id],
    queryFn: async () => {
        const res = await api.get('/workflows'); // Sayangnya API getById belum ada, kita filter manual dari getAll sementara atau buat API getById
        // *Catatan*: Idealnya buat endpoint GET /workflows/:id. Tapi untuk cepat, kita filter di frontend.
        return res.data.data.find(w => w.id === parseInt(id));
    },
    enabled: isEditMode
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
      alert("Workflow details saved!");
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
      }
  });

  const handleSaveWorkflow = () => {
    if (!wfName) return alert("Name is required");
    saveWorkflowMutation.mutate({ name: wfName, description: wfDesc });
  };

  const handleSaveAgent = () => {
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
      // Scroll ke form
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAgentForm = () => {
      setIsEditingAgent(false);
      setEditingAgentId(null);
      setAgentName('');
      setAgentPrompt('');
      setAgentTemp(0.7);
  };

  if (isEditMode && isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{isEditMode ? "Edit Workflow" : "Create New Workflow"}</h2>
          <p className="text-slate-500">Define your AI pipeline sequence.</p>
        </div>
        {workflowId && (
           <Button onClick={() => navigate(`/dashboard/run/${workflowId}`)} className="bg-green-600 hover:bg-green-700">
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
                1. Workflow Details
                {workflowId && <Badge variant="outline" className="ml-auto text-green-600 border-green-600">Saved</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input value={wfName} onChange={(e) => setWfName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={wfDesc} onChange={(e) => setWfDesc(e.target.value)} />
              </div>
              <Button onClick={handleSaveWorkflow} disabled={saveWorkflowMutation.isPending} variant="outline" className="w-full border-slate-300">
                {saveWorkflowMutation.isPending ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2 w-4 h-4"/>}
                {isEditMode ? "Update Details" : "Save & Continue"}
              </Button>
            </CardContent>
          </Card>

          {/* Agent Form */}
          {workflowId && (
            <Card className={`border-2 shadow-md ${isEditingAgent ? 'border-yellow-400' : 'border-blue-100'}`}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  2. {isEditingAgent ? "Edit Agent" : "Add New Agent"}
                </CardTitle>
                {isEditingAgent && (
                    <Button variant="ghost" size="sm" onClick={resetAgentForm} className="text-slate-500">
                        <X className="w-4 h-4 mr-1"/> Cancel Edit
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
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={agentModel} onChange={(e) => setAgentModel(e.target.value)}>
                   
                      <option value="gemini-2.0-flash-001">gemini-2.0-flash-001</option>
                    
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>System Prompt</Label>
                  <Textarea placeholder="You are an expert..." className="min-h-[100px]" value={agentPrompt} onChange={(e) => setAgentPrompt(e.target.value)} />
                </div>
                <div className="space-y-2">
                   <Label>Temperature: {agentTemp}</Label>
                   <input type="range" min="0" max="2" step="0.1" value={agentTemp} onChange={(e) => setAgentTemp(e.target.value)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                </div>

                <Button onClick={handleSaveAgent} disabled={addStepMutation.isPending || updateAgentMutation.isPending} className="w-full" variant={isEditingAgent ? "default" : "secondary"}>
                  {isEditingAgent ? "Update Agent" : "Add to Sequence"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: Pipeline Preview List */}
        <div className="lg:col-span-1">
          <Card className="h-full bg-slate-50 border-l-4 border-l-slate-200">
             <CardHeader><CardTitle>Pipeline Steps</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                {steps.map((step, index) => (
                    <div key={step.agent.id} className="relative pl-6 pb-6 border-l-2 border-slate-300 last:border-0">
                        <span className="absolute -left-[9px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-[10px] text-white font-bold ring-4 ring-slate-50">
                            {index + 1}
                        </span>
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm group hover:border-indigo-300 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800">{step.agent.name}</h4>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEditAgent(step.agent)}>
                                        <Pencil className="w-3 h-3 text-slate-400 hover:text-blue-600"/>
                                    </Button>
                                    
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                         <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-600"/>
                                         </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Delete Agent?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteAgentMutation.mutate(step.agent.id)} className="bg-red-600">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">{step.agent.prompt}</p>
                            <Badge variant="secondary" className="mt-2 text-[10px]">{step.agent.model}</Badge>
                        </div>
                    </div>
                ))}
                {steps.length === 0 && <div className="text-center text-slate-400 text-sm italic py-10">No agents added yet.</div>}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}