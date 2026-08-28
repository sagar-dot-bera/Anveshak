import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from '@/pages/LandingPage';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import VerifyEmail from '@/pages/VerifyEmail';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import MyPapers from '@/pages/MyPapers';
import ComparePapers from '@/pages/ComparePapers';
import UploadPaper from '@/pages/UploadPaper';
import TalkToPaper from '@/pages/TalkToPaper';
import SemanticSearch from '@/pages/SemanticSearch';
import LiteratureReview from '@/pages/LiteratureReview';
import ResearchRoadmaps from '@/pages/ResearchRoadmaps';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import './App.css';

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '999262474988-r0thqdtq1nbp3sdhvkktek8pds9pfaoa.apps.googleusercontent.com';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />

          {/* Authenticated routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-papers" element={<MyPapers />} />
              <Route path="/upload" element={<UploadPaper />} />
              <Route path="/semantic-search" element={<SemanticSearch />} />
              <Route path="/talk-to-paper" element={<TalkToPaper />} />
              <Route path="/compare" element={<ComparePapers />} />
              <Route path="/literature-reviews" element={<LiteratureReview />} />
              <Route path="/citation-graph" element={<Dashboard />} />
              <Route path="/research-roadmaps" element={<ResearchRoadmaps />} />
              <Route path="/settings" element={<Dashboard />} />
              <Route path="/support" element={<Dashboard />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </GoogleOAuthProvider>
  );
}

export default App;
