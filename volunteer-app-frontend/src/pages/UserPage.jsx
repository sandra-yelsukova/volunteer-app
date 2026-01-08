import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Box, Card, CardContent, CircularProgress, Divider, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { getUserById } from '../api/api';

function getUserFullName(user) {
  if (!user) return '';
  return [user.surname, user.name, user.patronymic].filter(Boolean).join(' ');
}

function getRoleLabel(role) {
  if (role === 'ORGANIZER') return 'Организатор';
  if (role === 'VOLUNTEER') return 'Волонтёр';
  return role;
}

export default function UserPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');

        const data = await getUserById(id);
        if (!cancelled) setUser(data);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Ошибка загрузки пользователя');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!user) {
    return <Alert severity="warning">Пользователь не найден</Alert>;
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', px: 2, mt: 6 }}>
      <Box sx={{ width: '100%', maxWidth: 700 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Профиль пользователя
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {getUserFullName(user)}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {getRoleLabel(user.role)}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              Телефон
            </Typography>
            <Typography sx={{ mb: 2 }}>
              {user.phone || 'Не указан'}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Typography sx={{ mb: 2 }}>
              {user.email}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Дата регистрации
            </Typography>
            <Typography>
              {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
