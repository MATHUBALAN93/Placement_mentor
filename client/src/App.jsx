import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import StudentLayout from './layouts/StudentLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Problems from './pages/Problems.jsx';
import ProblemDetails from './pages/ProblemDetails.jsx';
import Assessment from './pages/Assessment.jsx';
import Roadmap from './pages/Roadmap.jsx';
import ResumeAnalysis from './pages/ResumeAnalysis.jsx';
import JobMatching from './pages/JobMatching.jsx';
import Companies from './pages/Companies.jsx';
import AIMentor from './pages/AIMentor.jsx';
import MockInterview from './pages/MockInterview.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routing */}
          <Route path="/" element={<Landing />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Core Protected Routes - Student Workspace */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />

            <Route element={<StudentLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/problems" element={<Problems />} />
              <Route path="/problems/:id" element={<ProblemDetails />} />
              <Route path="/assessments" element={<Assessment />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/resume" element={<ResumeAnalysis />} />
              <Route path="/jobs" element={<JobMatching />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/mentor" element={<AIMentor />} />
              <Route path="/interviews" element={<MockInterview />} />
            </Route>
          </Route>

          {/* Administrators Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
