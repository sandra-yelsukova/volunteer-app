import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Stack, Pagination, Grid, Button } from '@mui/material';
import { getProjects } from '../api/api';
import ProjectCard from '../components/ProjectCard';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 5;

export default function ProjectListPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    getProjects()
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        Ошибка загрузки проектов: {error}
      </Typography>
    );
  }

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);

  const sortedProjects = [...projects].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    return dateB - dateA;
  });

  const paginatedProjects = sortedProjects.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', px: 2, }}>
      <Box sx={{ width: '100%', maxWidth: 1000 }}>
        <Box sx={{ width: '100%', maxWidth: 900, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, mb: 3, mx: 'auto' }}>
          <Typography variant="h4">
            Проекты
          </Typography>

          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/projects/create')}>
            Добавить проект
          </Button>
        </Box>

        <Stack spacing={2} alignItems="center">
          {paginatedProjects.map(project => (
            <Box key={project.id} sx={{ width: '100%', maxWidth: 900 }}>
              <ProjectCard project={project} />
            </Box>
          ))}
        </Stack>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary"/>
          </Box>
        )}
      </Box>
    </Box>
  );
}
