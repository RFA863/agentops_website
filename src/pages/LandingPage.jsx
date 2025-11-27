import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Cpu, Workflow } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
    
      <nav className="border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
       
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Bot className="text-white w-6 h-6" />
          </div>
         
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
            AgentOps
          </span>

        </div>

        <div className="flex gap-4">
          <Link to="/login">
            <Button variant="ghost" className="font-medium">Log In</Button>
          </Link>
          <Link to="/register">
            <Button className="bg-indigo-600 hover:bg-indigo-700 font-medium">
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        
      </nav>

      <div className="px-6 md:px-12 pt-20 pb-32 max-w-7xl mx-auto text-center">
     
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
          Orchestrate AI Agents <br />
          <span className="text-indigo-600">into Powerful Workflows</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10">
          Build, chain, and monitor AI agents efficiently. The centralized dashboard for your AI operations team.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link to="/login">
            <Button size="lg" className="w-full md:w-auto text-lg h-12 px-8 bg-slate-900 hover:bg-slate-800">
              Start Building 
            </Button>
          </Link>
        </div>
      </div>

      <footer className="border-t border-slate-100 py-12 text-center text-slate-400">
        <p>© 2025 AgentOps. Built by Rafi Fajrul Ariyadi.</p>
      </footer>
    </div>
  );
}