import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createGroup } from '../api/api';

function getCurrentUserId() {
  const raw = localStorage.getItem('userId');
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export default function GroupCreatePage() {
  const navigate = useNavigate();
  const organizerId = getCurrentUserId();
  const [name, setName] = useState('');
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

      const createdGroup = await createGroup({
        name,
        organizer: {
          id: organizerId,
        },
      });

      navigate(`/groups/${createdGroup.id}`);
    } catch (e) {
      setError(e.message || 'Ошибка создания группы');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', px: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 900, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Создание группы
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
                <TextField
                  label="Название группы"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="text" onClick={() => navigate('/participants')} disabled={loading}>
                    Отмена
                  </Button>

                  <Button type="submit" variant="contained" disabled={loading}>
                    Создать группу
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
