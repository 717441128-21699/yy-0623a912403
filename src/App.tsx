import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TasksPage from "@/pages/TasksPage";
import TemperaturePage from "@/pages/TemperaturePage";
import PortGuidePage from "@/pages/PortGuidePage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/temperature" element={<TemperaturePage />} />
        <Route path="/port-guide" element={<PortGuidePage />} />
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </Router>
  );
}
