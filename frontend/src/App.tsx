import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import RegionMasterContainer from './components/RegionMasterContainer';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/region" element={
              <ProtectedRoute>
                <RegionMasterContainer />
              </ProtectedRoute>
            } />
                     <Route path="/region/:prefectureId" element={
           <ProtectedRoute>
             <RegionMasterContainer />
           </ProtectedRoute>
         } />
         <Route path="/region/:prefectureId/municipalities/new" element={
           <ProtectedRoute>
             <RegionMasterContainer />
           </ProtectedRoute>
         } />
         <Route path="/region/:prefectureId/municipalities/:municipalityId/edit" element={
           <ProtectedRoute>
             <RegionMasterContainer />
           </ProtectedRoute>
         } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
