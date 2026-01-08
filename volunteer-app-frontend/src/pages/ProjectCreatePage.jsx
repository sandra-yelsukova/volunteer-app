import { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Stack, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../api/api';

function getCurrentUserId() {
  const raw = localStorage.getItem('userId');
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const organizerId = getCurrentUserId();

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!organizerId) {
      setError('Не удалось определить организатора');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await createProject({
        title,
        shortDescription,
        description,
        organizer: {
          id: organizerId,
        },
      });

      navigate('/projects');
    } catch (e) {
      setError(e.message || 'Ошибка создания проекта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', px: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 900, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Создание проекта
        </Typography>

        <Card>
          <CardContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField label="Название проекта" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth/>

                <TextField label="Краткое описание" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required fullWidth/>

                <TextField label="Описание" value={description} onChange={(e) => setDescription(e.target.value)} multiline minRows={4} fullWidth/>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="text" onClick={() => navigate('/projects')} disabled={loading}>
                    Отмена
                  </Button>

                  <Button type="submit" variant="contained" disabled={loading}>
                    Создать проект
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
