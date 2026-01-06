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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Проекты
      </Typography>

      <Stack spacing={2}>
        {paginatedProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </Stack>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary"/>
        </Box>
      )}
    </Box>
  );
}
