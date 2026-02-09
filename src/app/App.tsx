import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from '@/app/components/sidebar';
import { Dashboard } from '@/app/components/dashboard';
import { BiblicalStudy } from '@/app/components/biblical-study';
import { TextualCriticism } from '@/app/components/textual-criticism';
import { Homiletics } from '@/app/components/homiletics';
import { CuradoriaAcademica } from '@/app/components/curadoria-academica';
import { Settings } from '@/app/components/settings';
import { StudySessionProvider } from '@/app/study-session-context';

export default function App() {
  return (
    <StudySessionProvider>
      <BrowserRouter>
      <div className="flex h-screen w-screen bg-background overflow-hidden">
        {/* Fixed Left Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/biblical-study" element={<BiblicalStudy />} />
            <Route path="/textual-criticism" element={<TextualCriticism />} />
            <Route path="/homiletics" element={<Homiletics />} />
            <Route path="/curadoria" element={<CuradoriaAcademica />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
      </BrowserRouter>
    </StudySessionProvider>
  );
}