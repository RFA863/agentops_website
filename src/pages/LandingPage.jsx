import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Cpu, Workflow } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
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

      {/* Hero Section */}
      <header className="px-6 md:px-12 pt-20 pb-32 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-8 border border-indigo-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          New: Gemini 1.5 Flash Support
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
          Orchestrate AI Agents <br />
          <span className="text-indigo-600">into Powerful Workflows</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10">
          Build, chain, and monitor AI agents efficiently. The centralized dashboard for your AI operations team.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" className="w-full md:w-auto text-lg h-12 px-8 bg-slate-900 hover:bg-slate-800">
              Start Building for Free
            </Button>
          </Link>
          <Link to="/login">
             <Button size="lg" variant="outline" className="w-full md:w-auto text-lg h-12 px-8">
               View Demo
             </Button>
          </Link>
        </div>
      </header>

      {/* Features Grid */}
      <section className="bg-slate-50 py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Custom AI Agents</h3>
              <p className="text-slate-500">Define specialized personas. From Researchers to Copywriters, configure them with specific models and temperatures.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                <Workflow className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Sequential Workflows</h3>
              <p className="text-slate-500">Chain agents together seamlessly. The output of one agent becomes the context for the next automatically.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 text-green-600">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Execution</h3>
              <p className="text-slate-500">Monitor your workflows as they run. View inputs, outputs, and status logs in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 text-center text-slate-400">
        <p>© 2025 AgentOps. Built by Rafi.</p>
      </footer>
    </div>
  );
}