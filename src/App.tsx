
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { DeveloperProvider } from './contexts/DeveloperContext';
import { DialogProvider } from './hooks/useDialog';
import Index from './pages/Index';
import Pricing from './pages/Pricing';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import AgentPage from './pages/AgentPage';
import DeveloperTools from './pages/DeveloperTools';
import PaymentSuccess from './pages/PaymentSuccess';
import TrialSuccess from './pages/TrialSuccess';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/toaster"
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DeveloperProvider>
          <DialogProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/agents/:agentId" element={<AgentPage />} />
              <Route path="/developer" element={<DeveloperTools />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/trial-success" element={<TrialSuccess />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </DialogProvider>
        </DeveloperProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
