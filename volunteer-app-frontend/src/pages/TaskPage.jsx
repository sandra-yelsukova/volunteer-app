import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, CircularProgress, Card, CardContent, Divider, Chip, Grid, Link as MuiLink } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import { getTaskById } from '../api/api';

export default function TaskPage() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const STATUS_LABELS = {
    OPEN: 'ОЖИДАЕТ',
    IN_PROGRESS: 'В ПРОЦЕССЕ',
    DONE: 'ЗАВЕРШЕНО',
  };

  const PRIORITY_LABELS = {
    HIGH: 'ВЫСОКИЙ',
    MEDIUM: 'СРЕДНИЙ',
    LOW: 'НИЗКИЙ',
  };

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
            <Typography variant="h4" gutterBottom>
              Детали задачи №{task.id}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Приоритет
                  </Typography>

                  {task.priority ? (
                    <Chip label={PRIORITY_LABELS[task.priority] ?? task.priority}
                      color={
                        task.priority === 'HIGH'
                          ? 'error'
                          : task.priority === 'MEDIUM'
                          ? 'warning'
                          : 'default'
                      }
                      size="small"
                    />
                  ) : (
                    <Typography color="text.secondary">
                      Не указан
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Статус
                  </Typography>

                  <Chip label={STATUS_LABELS[task.status] ?? task.status}
                    color={
                      task.status === 'DONE'
                        ? 'success'
                        : task.status === 'IN_PROGRESS'
                        ? 'info'
                        : 'default'
                    }
                    size="small"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Исполнитель
              </Typography>

              {task.assigneeType === 'USER' && task.assigneeUser ? (
                <Typography>
                  <MuiLink component={RouterLink} to={`/users/${task.assigneeUser.id}`} underline="hover">
                    {task.assigneeUser.surname} {task.assigneeUser.name}
                    {task.assigneeUser.patronymic
                      ? ` ${task.assigneeUser.patronymic}`
                      : ''}
                  </MuiLink>
                </Typography>
              ) : task.assigneeType === 'GROUP' && task.assigneeGroup ? (
                <Typography>
                  <MuiLink component={RouterLink} to={`/groups/${task.assigneeGroup.id}`} underline="hover">
                    {task.assigneeGroup.name}
                  </MuiLink>
                </Typography>
              ) : (
                <Typography color="text.secondary">
                  Не назначен
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Тип задачи
              </Typography>

              <Typography>
                {task.taskType || 'Не указан'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Проект
              </Typography>

              <Typography>
                <MuiLink component={RouterLink} to={`/projects/${task.project.id}`} underline="hover">
                  {task.project.title}
                </MuiLink>
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Дата создания
              </Typography>

              <Typography>
                {new Date(task.createdAt).toLocaleString()}
              </Typography>
            </Box>
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
