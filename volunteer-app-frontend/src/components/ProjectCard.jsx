import { Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Typography variant="h6">
          {project.title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {project.description}
        </Typography>

        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          {project.startDate} — {project.endDate}
        </Typography>
      </CardContent>
    </Card>
  );
}
