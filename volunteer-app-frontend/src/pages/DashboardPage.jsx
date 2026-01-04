import { useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';
import { getTasks } from '../api/api';
import TasksTable from '../components/TasksTable';

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getTasks().then(setTasks);
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Дашборд</Typography>
      <TasksTable tasks={tasks} />
    </Box>
  );
}
