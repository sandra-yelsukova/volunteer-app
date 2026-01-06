import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress, Divider, Grid, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserById } from '../api/api';

export default function ProfilePage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth?.userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    getUserById(auth.userId)
      .then(data => {
        setUser(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message || 'Ошибка загрузки профиля');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [auth?.userId]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Ошибка: {error}</Typography>;
  }

  if (!user) {
    return <Typography>Пользователь не найден</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, }}>
        <Typography variant="h4">Профиль</Typography>

        <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>
          Выйти
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {user.surname} {user.name}
            {user.patronymic ? ` ${user.patronymic}` : ''}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Роль: {user.role}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Email</Typography>
              <Typography>{user.email}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Телефон</Typography>
              <Typography>{user.phone || 'Не указан'}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Дата регистрации</Typography>
              <Typography>
                {new Date(user.createdAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
