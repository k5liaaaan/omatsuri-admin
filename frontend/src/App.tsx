import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import RegionMasterContainer from './components/RegionMasterContainer';
import FestivalForm from './components/FestivalForm';
import FestivalList from './components/FestivalList';
import FestivalDetail from './components/FestivalDetail';
import TestFestival from './components/TestFestival';
import SimpleFestivalForm from './components/SimpleFestivalForm';
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
         <Route path="/festival/new" element={
           <ProtectedRoute>
             <FestivalForm />
           </ProtectedRoute>
         } />
         <Route path="/festival/test" element={
           <ProtectedRoute>
             <TestFestival />
           </ProtectedRoute>
         } />
         <Route path="/festival/simple" element={
           <ProtectedRoute>
             <SimpleFestivalForm />
           </ProtectedRoute>
         } />
         <Route path="/festivals" element={
           <ProtectedRoute>
             <FestivalList />
           </ProtectedRoute>
         } />
         <Route path="/festivals/:id" element={
           <ProtectedRoute>
             <FestivalDetail />
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
