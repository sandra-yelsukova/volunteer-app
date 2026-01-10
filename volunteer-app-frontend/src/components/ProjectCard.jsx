import { Card, CardContent, Typography, Box, Link as MuiLink } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

function getUserFullName(user) {
  if (!user) return '';

  const parts = [
    user.surname,
    user.name,
    user.patronymic,
  ].filter(Boolean);

  return parts.join(' ');
}

export default function ProjectCard({ project, action }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  const organizer = project.organizer;

  return (
    <Card onClick={handleClick} sx={{ cursor: 'pointer', borderRadius: 3, '&:hover': { boxShadow: 6, }, }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, }}>
          <Typography variant="h6">
            {project.title}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            ID: {project.id}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {project.shortDescription}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, }}>
          <Typography variant="body2">
            <strong>Организатор:</strong>{' '}
            <MuiLink component={RouterLink} to={`/users/${organizer.id}`} underline="hover" onClick={(e) => e.stopPropagation()}>
              {getUserFullName(organizer)}
            </MuiLink>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 18 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Создан: {new Date(project.createdAt).toLocaleDateString()}
          </Typography>
            {action && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }} onClick={(e) => e.stopPropagation()}>
                {action}
              </Box>
            )}
        </Box>
      </CardContent>
    </Card>
  );
}
