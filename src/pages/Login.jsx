import api from '../lib/axios';

import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Login() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      const res = await api.post('/auth/login', { username, password });
      const tokenData = res.data?.data?.token; 
      const actualToken = tokenData?.token; 

      if (!actualToken) throw new Error("Token not found");

      localStorage.setItem('token', actualToken);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login Error:", err);
    
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">

      <Card className="w-full max-w-md shadow-lg border-slate-200">

        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-slate-900">Welcome Back</CardTitle>
          <CardDescription className="text-center">Sign in to your AgentOps account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
        
          {successMsg && (
            <Alert className="border-green-500/50 text-green-600 bg-green-50 [&>svg]:text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{successMsg}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            
            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Signing in...</> : "Sign In"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-500">
            Don't have an account? <Link to="/register" className="text-indigo-600 hover:underline font-medium">Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}