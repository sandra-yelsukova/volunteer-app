import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Stack, Pagination, } from '@mui/material';
import { getProjects } from '../api/api';
import ProjectCard from '../components/ProjectCard';

const ITEMS_PER_PAGE = 5;

export default function ProjectListPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

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

  const paginatedProjects = projects.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', px: 2, }}>
      <Box sx={{ width: '100%', maxWidth: 1000 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mt: 2, mb: 3 }}>
          Проекты
        </Typography>

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
