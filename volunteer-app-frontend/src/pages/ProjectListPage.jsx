import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, CircularProgress, Stack, Pagination, Grid, Button, Alert } from '@mui/material';
import { getProjects, getProjectsByOrganizerId, getProjectsByParticipantId, getProjectsByNonParticipantId } from '../api/api';
import ProjectCard from '../components/ProjectCard';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 5;

export default function ProjectListPage() {
  const { auth } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [otherProjects, setOtherProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [otherPage, setOtherPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        setLoading(true);
        setError(null);

        if (auth?.role === 'ORGANIZER') {
          const data = await getProjectsByOrganizerId(auth.userId);
          if (!cancelled) {
            setMyProjects(data || []);
            setOtherProjects([]);
          }
        } else if (auth?.role === 'VOLUNTEER') {
          const [participantProjects, nonParticipantProjects] = await Promise.all([
            getProjectsByParticipantId(auth.userId),
            getProjectsByNonParticipantId(auth.userId),
          ]);

          if (!cancelled) {
            setMyProjects(participantProjects || []);
            setOtherProjects(nonParticipantProjects || []);
          }
        } else {
          const data = await getProjects();
          if (!cancelled) {
            setMyProjects(data || []);
            setOtherProjects([]);
          }
        }

        if (!cancelled) {
          setPage(1);
          setOtherPage(1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (auth?.userId) {
      loadProjects();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [auth]);

  const sortedMyProjects = useMemo(() => {
    return [...myProjects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [myProjects]);

  const sortedOtherProjects = useMemo(() => {
    return [...otherProjects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [otherProjects]);

  const paginatedMyProjects = sortedMyProjects.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const paginatedOtherProjects = sortedOtherProjects.slice(
    (otherPage - 1) * ITEMS_PER_PAGE,
    otherPage * ITEMS_PER_PAGE
  );

  const totalMyPages = Math.ceil(sortedMyProjects.length / ITEMS_PER_PAGE);
  const totalOtherPages = Math.ceil(sortedOtherProjects.length / ITEMS_PER_PAGE);

  const isVolunteer = auth?.role === 'VOLUNTEER';
  const isOrganizer = auth?.role === 'ORGANIZER';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', px: 2, }}>
      <Box sx={{ width: '100%', maxWidth: 1100 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Ошибка загрузки проектов: {error}
          </Alert>
        )}

        {isVolunteer ? (
          <Grid container spacing={4} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Мои проекты
              </Typography>
              <Stack spacing={2} alignItems="center">
                {paginatedMyProjects.map(project => (
                  <Box key={project.id} sx={{ width: '100%', maxWidth: 500 }}>
                    <ProjectCard project={project} />
                  </Box>
                ))}
              </Stack>

              {totalMyPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination count={totalMyPages} page={page} onChange={(_, value) => setPage(value)} color="primary"/>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Другие проекты
              </Typography>
              <Stack spacing={2} alignItems="center">
                {paginatedOtherProjects.map(project => (
                  <Box key={project.id} sx={{ width: '100%', maxWidth: 500 }}>
                    <ProjectCard project={project} />
                  </Box>
                ))}
              </Stack>

              {totalOtherPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination count={totalOtherPages} page={otherPage} onChange={(_, value) => setOtherPage(value)} color="primary"/>
                </Box>
              )}
            </Grid>
          </Grid>
        ) : (
          <>
            <Box sx={{ width: '100%', maxWidth: 900, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, mb: 3, mx: 'auto' }}>
              <Typography variant="h4">
                Мои проекты
              </Typography>

              {isOrganizer && (
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/projects/create')}>
                  Добавить проект
                </Button>
              )}
            </Box>

            <Stack spacing={2} alignItems="center">
              {paginatedMyProjects.map(project => (
                <Box key={project.id} sx={{ width: '100%', maxWidth: 900 }}>
                  <ProjectCard project={project} />
                </Box>
              ))}
            </Stack>

            {totalMyPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination count={totalMyPages} page={page} onChange={(_, value) => setPage(value)} color="primary"/>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
