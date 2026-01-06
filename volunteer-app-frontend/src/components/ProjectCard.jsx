import { Card, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ProjectCard({ project }) {
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
            {organizer.surname} {organizer.name} {organizer.patronymic}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Создан: {new Date(project.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
