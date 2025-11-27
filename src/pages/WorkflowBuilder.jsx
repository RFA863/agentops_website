import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Play, ArrowRight, Save } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function WorkflowBuilder() {
  const navigate = useNavigate();
  const [workflowId, setWorkflowId] = useState(null);
  const [steps, setSteps] = useState([]);
  
  // State Form Workflow Header
  const [wfName, setWfName] = useState('');
  const [wfDesc, setWfDesc] = useState('');

  // State Form Agent (Step)
  const [agentName, setAgentName] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');
  const [agentModel, setAgentModel] = useState('gemini-1.5-flash');
  const [agentTemp, setAgentTemp] = useState(0.7);

  // 1. Mutation: Create Workflow Header
  const createWorkflowMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/workflows', data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setWorkflowId(data.id); // Simpan ID untuk step selanjutnya
    }
  });

  // 2. Mutation: Add Step (Agent)
  const addStepMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post(`/workflows/${workflowId}/steps`, data);
      return res.data.data;
    },
    onSuccess: (data) => {
      // Update UI List Step
      setSteps([...steps, data.agent]);
      // Reset Form Agent
      setAgentName('');
      setAgentPrompt('');
      setAgentTemp(0.7);
    }
  });

  const handleCreateWorkflow = () => {
    // 1. VALIDASI: Jangan kirim request jika nama kosong
    if (!wfName || wfName.trim() === "") {
      alert("Workflow name cannot be empty!"); // Atau gunakan Toast error jika ada
      return; 
    }

    createWorkflowMutation.mutate({ name: wfName, description: wfDesc });
  };

  const handleAddStep = () => {
    addStepMutation.mutate({
      name: agentName,
      model: agentModel,
      prompt: agentPrompt,
      temperature: parseFloat(agentTemp)
    });
  };

  const handleFinish = () => {
    navigate(`/workflows/run/${workflowId}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create New Workflow</h2>
          <p className="text-slate-500">Define your AI pipeline sequence.</p>
        </div>
        {workflowId && steps.length > 0 && (
          <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" />
            Finish & Run
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Builder */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Workflow Details */}
          <Card className={workflowId ? "border-green-200 bg-green-50/30" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-medium text-white">1</span>
                Workflow Details
                {workflowId && <Badge variant="outline" className="ml-auto text-green-600 border-green-600">Saved</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input 
                  placeholder="e.g., Content Generator" 
                  value={wfName} 
                  onChange={(e) => setWfName(e.target.value)} 
                  disabled={!!workflowId} 
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="What does this workflow do?" 
                  value={wfDesc} 
                  onChange={(e) => setWfDesc(e.target.value)} 
                  disabled={!!workflowId}
                />
              </div>
              {!workflowId && (
                <Button onClick={handleCreateWorkflow} disabled={createWorkflowMutation.isPending}>
                  {createWorkflowMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Workflow
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Add Agents (Only visible after workflow creation) */}
          {workflowId && (
            <Card className="border-blue-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">2</span>
                  Add Agent (Step {steps.length + 1})
                </CardTitle>
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={agentModel}
                      onChange={(e) => setAgentModel(e.target.value)}
                    >
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>System Prompt / Instruction</Label>
                  <Textarea 
                    placeholder="You are an expert copywriter..." 
                    className="min-h-[100px]"
                    value={agentPrompt}
                    onChange={(e) => setAgentPrompt(e.target.value)}
                  />
                  <p className="text-xs text-slate-500">The output of the previous step will be appended to this prompt automatically.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Temperature (Creativity): {agentTemp}</Label>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="2" step="0.1" 
                    value={agentTemp} 
                    onChange={(e) => setAgentTemp(e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <Button onClick={handleAddStep} disabled={addStepMutation.isPending} className="w-full" variant="secondary">
                  {addStepMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Add Step to Workflow
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Preview Pipeline */}
        <div className="lg:col-span-1">
          <Card className="h-full bg-slate-50">
            <CardHeader>
              <CardTitle>Pipeline Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-8">
                {/* User Input Node */}
                <div className="relative pl-8">
                  <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-slate-400 ring-4 ring-white" />
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Trigger</p>
                    <p className="font-medium">User Input</p>
                  </div>
                </div>

                {/* Agent Steps */}
                {steps.map((step, index) => (
                  <div key={index} className="relative pl-8">
                    <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="rounded-lg border border-blue-100 bg-white p-3 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <Badge variant="outline">Step {index + 1}</Badge>
                        <span className="text-xs text-slate-400">{step.model}</span>
                      </div>
                      <p className="font-bold text-slate-800">{step.name}</p>
                      <p className="text-xs text-slate-500 truncate mt-1">{step.prompt}</p>
                    </div>
                    {/* Arrow down */}
                    {index < steps.length - 1 && (
                         <div className="absolute left-3.5 top-full h-8 w-0.5 bg-slate-200"></div>
                    )}
                  </div>
                ))}

                {steps.length === 0 && (
                  <div className="relative pl-8 opacity-50">
                    <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center">
                      <p className="text-sm text-slate-500">No agents added yet</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}