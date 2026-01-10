import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import PrivateRoute from './routes/PrivateRoute';
import DashboardPage from './pages/DashboardPage';
import ProjectListPage from './pages/ProjectListPage';
import ProjectPage from './pages/ProjectPage';
import TaskPage from './pages/TaskPage';
import ParticipantsPage from './pages/ParticipantsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GroupPage from './pages/GroupPage';
import UserPage from './pages/UserPage';
import ProjectCreatePage from './pages/ProjectCreatePage';
import TaskCreatePage from './pages/TaskCreatePage';
import GroupCreatePage from './pages/GroupCreatePage';

function App() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/:id" element={<ProjectPage />} />
          <Route path="/tasks/:id" element={<TaskPage />} />
          <Route path="/participants" element={<ParticipantsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/groups/:groupId" element={<GroupPage />} />
          <Route path="/groups/create" element={<GroupCreatePage />} />
          <Route path="/users/:id" element={<UserPage />} />
          <Route path="/projects/create" element={<ProjectCreatePage />} />
          <Route path="/projects/:projectId/tasks/create" element={<TaskCreatePage />} />
        </Route>
      </Route>

    </Routes>
  );
}

export default App;
