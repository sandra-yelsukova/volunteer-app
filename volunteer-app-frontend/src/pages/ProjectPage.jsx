import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, CircularProgress, Card, CardContent, Divider, List, ListItem, ListItemText, Link as MuiLink } from '@mui/material';
import { getProjectById, getTasksByProjectId, getProjectParticipants } from '../api/api';
import TasksTable from '../components/TasksTable';

export default function ProjectPage() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTasksLoading(true);
    setParticipantsLoading(true);

    getProjectById(id)
      .then(data => {
        setProject(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    getTasksByProjectId(id)
      .then(data => {
        setTasks(data);
        setTasksLoading(false);
      })
      .catch(err => {
        console.error(err);
        setTasks([]);
        setTasksLoading(false);
      });

    getProjectParticipants(id)
      .then(data => {
        setParticipants(data);
        setParticipantsLoading(false);
      })
      .catch(() => {
        setParticipants([]);
        setParticipantsLoading(false);
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
    return <Typography color="error">Ошибка загрузки проекта: {error}</Typography>;
  }

  if (!project) {
    return <Typography>Проект не найден</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, mb: 3, alignItems: 'stretch', }}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {project.title}
            </Typography>

            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {project.shortDescription}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" sx={{ mb: 2 }}>
              {project.description}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>Организатор:</strong>{' '}
              <MuiLink component={RouterLink} to={`/users/${project.organizer.id}`} underline="hover">
                {project.organizer.surname} {project.organizer.name}{' '}
                {project.organizer.patronymic}
              </MuiLink>
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>Создан:</strong>{' '}
              {new Date(project.createdAt).toLocaleDateString()}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ height: 420, display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Typography variant="h6" gutterBottom>
              Участники проекта
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} >
              Всего участников: {participants.length}
            </Typography>

            <Divider sx={{ mb: 1.5 }} />

            {participantsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <CircularProgress size={20} />
              </Box>
            ) : participants.length === 0 ? (
              <Typography color="text.secondary">
                Участники отсутствуют
              </Typography>
            ) : (
              <List disablePadding sx={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                {participants.map((user) => (
                  <ListItem key={user.id} divider disableGutters>
                    <ListItemText
                      primary={
                        <MuiLink component={RouterLink} to={`/users/${user.id}`} underline="hover">
                          {user.surname} {user.name}
                          {user.patronymic ? ` ${user.patronymic}` : ''}
                        </MuiLink>
                      }
                      secondary={user.email || ''}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box>
        <Typography variant="h5" gutterBottom>
          Задачи проекта
        </Typography>

        {tasksLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <TasksTable tasks={tasks} />
        )}

      </Box>
    </Box>
  );
}
