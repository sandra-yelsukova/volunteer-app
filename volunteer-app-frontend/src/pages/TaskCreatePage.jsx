import { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Stack, Alert, MenuItem } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { createTask } from '../api/api';

const PRIORITIES = [
  { value: 'HIGH', label: 'Высокий' },
  { value: 'MEDIUM', label: 'Средний' },
  { value: 'LOW', label: 'Низкий' },
];

export default function TaskCreatePage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const createdTask = await createTask({
        title,
        description,
        taskType,
        priority,
        status: 'OPEN',
        project: {
          id: Number(projectId),
        },
      });

      navigate(`/tasks/${createdTask.id}`);
    } catch (e) {
      setError(e.message || 'Ошибка создания задачи');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', px: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 900, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Создание задачи
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
                <TextField label="Название задачи" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />

                <TextField label="Описание" value={description} onChange={(e) => setDescription(e.target.value)} multiline minRows={4} fullWidth />

                <TextField label="Тип задачи" value={taskType} onChange={(e) => setTaskType(e.target.value)} placeholder="Например: Донорство, Помощь, Организация события" fullWidth />

                <TextField select label="Приоритет" value={priority} onChange={(e) => setPriority(e.target.value)} fullWidth >
                  {PRIORITIES.map((p) => (
                    <MenuItem key={p.value} value={p.value}>
                      {p.label}
                    </MenuItem>
                  ))}
                </TextField>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="text" onClick={() => navigate(-1)} disabled={loading} >
                    Отмена
                  </Button>

                  <Button type="submit" variant="contained" disabled={loading} >
                    Создать задачу
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
