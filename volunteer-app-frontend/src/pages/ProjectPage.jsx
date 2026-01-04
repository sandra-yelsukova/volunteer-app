import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { getProjectById } from '../api/api';

export default function ProjectPage() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProjectById(id)
      .then(data => {
        setProject(data);
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
    return (
      <Typography color="error">
        Ошибка загрузки проекта: {error}
      </Typography>
    );
  }

  if (!project) {
    return (
      <Typography>
        Проект не найден
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {project.title}
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        {project.description}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Период: {project.startDate} — {project.endDate}
      </Typography>
    </Box>
  );
}
