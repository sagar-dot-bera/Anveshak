import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import Dashboard from '@/pages/Dashboard';
import ComparePapers from '@/pages/ComparePapers';
import UploadPaper from '@/pages/UploadPaper';
import TalkToPaper from '@/pages/TalkToPaper';
import SemanticSearch from '@/pages/SemanticSearch';
import LiteratureReview from '@/pages/LiteratureReview';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import './App.css';

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Authenticated routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-papers" element={<Dashboard />} />
              <Route path="/upload" element={<UploadPaper />} />
              <Route path="/semantic-search" element={<SemanticSearch />} />
              <Route path="/talk-to-paper" element={<TalkToPaper />} />
              <Route path="/compare" element={<ComparePapers />} />
              <Route path="/literature-reviews" element={<LiteratureReview />} />
              <Route path="/citation-graph" element={<Dashboard />} />
              <Route path="/research-roadmaps" element={<Dashboard />} />
              <Route path="/settings" element={<Dashboard />} />
              <Route path="/support" element={<Dashboard />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
