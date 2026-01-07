import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, CircularProgress, Card, CardContent, Divider, Chip, Grid } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import { getTaskById } from '../api/api';

export default function TaskPage() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    getTaskById(id)
      .then(data => {
        setTask(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Ошибка загрузки задачи: {error}</Typography>;
  }

  if (!task) {
    return <Typography>Задача не найдена</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, mb: 3, alignItems: 'stretch', }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AssignmentIcon sx={{ mr: 1 }} color="primary" />
              <Typography variant="h4">
                {task.title}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1">
              {task.description || 'Описание отсутствует'}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Детали задачи
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Статус</Typography>
                <Chip
                  label={task.status}
                  color={ task.status === 'DONE' ? 'success' : task.status === 'IN_PROGRESS' ? 'warning' : 'default' }
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2">Исполнитель</Typography>
                <Typography>
                  {task.assigneeType === 'USER' && task.assigneeUser
                    ? `${task.assigneeUser.surname} ${task.assigneeUser.name}`
                    : task.assigneeType === 'GROUP' && task.assigneeGroup
                    ? task.assigneeGroup.name
                    : 'Не назначен'}
                </Typography>

              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2">
                  <EventIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Дедлайн
                </Typography>
                <Typography>
                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Не установлен'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2">
                  Проект
                </Typography>
                <Typography>
                  <Link to={`/projects/${task.project.id}`}>
                    {task.project.title}
                  </Link>
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2">
                  Создана
                </Typography>
                <Typography>
                  {new Date(task.createdAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Комментарии и заметки
          </Typography>

          <Typography variant="body2" color="text.secondary">

          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
