import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { UploadPage } from './pages/Upload';
import { Analytics } from './pages/Analytics';
import { AnalysisLog } from './pages/AnalysisLog';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { Settings } from './pages/Settings';
import { AudienceBuilder } from './pages/AudienceBuilder';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'dark';
    const root = window.document.documentElement;
    root.classList.add(`theme-${savedTheme}`);
    if (savedTheme === 'dark' || savedTheme === 'medium') {
      root.classList.add('dark');
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/analysis-log" element={<AnalysisLog />} />
        <Route path="/library" element={<Library />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/audience-builder" element={<AudienceBuilder />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
