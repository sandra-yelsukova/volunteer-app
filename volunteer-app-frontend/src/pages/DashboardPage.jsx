import { useEffect, useState } from 'react';
import { Typography, Box, Alert } from '@mui/material';
import { getTasks, getTasksByOrganizerId, getTasksByParticipantId } from '../api/api';
import TasksTable from '../components/TasksTable';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { auth } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      if (!auth?.userId) {
        setTasks([]);
        return;
      }

      try {
        setError('');
        let data;

        if (auth.role === 'ORGANIZER') {
          data = await getTasksByOrganizerId(auth.userId);
        } else if (auth.role === 'VOLUNTEER') {
          data = await getTasksByParticipantId(auth.userId);
        } else {
          data = await getTasks();
        }

        if (!cancelled) {
          setTasks(data || []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Ошибка загрузки задач');
          setTasks([]);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [auth]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Задачи</Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TasksTable tasks={tasks} />
    </Box>
  );
}
