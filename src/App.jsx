import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Toolkit from '@/pages/Toolkit';
import Pipeline from '@/pages/Pipeline';
import Analysis from '@/pages/Analysis';
import Hashing from '@/pages/Hashing';
import AdvancedAnalysis from '@/pages/AdvancedAnalysis';
import QuantumCrypto from '@/pages/QuantumCrypto';

import RSATool from '@/pages/RSATool';
import RSAVisualizer from '@/pages/RSAVisualizer';
import RSAToolkit from '@/pages/RSAToolkit';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AIAssistant from '@/pages/AIAssistant';
import AdminPanel from '@/pages/AdminPanel';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Navigate } from 'react-router-dom';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle user_not_registered error (this is a hard block)
  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Render the main app (public routes always accessible)
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Landing />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/toolkit" element={<Toolkit />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/hashing" element={<Hashing />} />
          <Route path="/advanced-analysis" element={<AdvancedAnalysis />} />
          <Route path="/quantum-crypto" element={<QuantumCrypto />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />

          <Route path="/rsa-tool" element={<RSATool />} />
          <Route path="/rsa-visualizer" element={<RSAVisualizer />} />
          <Route path="/rsa-toolkit" element={<RSAToolkit />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App