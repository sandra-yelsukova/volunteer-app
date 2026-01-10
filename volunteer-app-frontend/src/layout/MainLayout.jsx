import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { auth } = useAuth();
  const isAuth = Boolean(auth);
  const isOrganizer = auth?.role === 'ORGANIZER';

  return (
    <>
      <AppBar position="static" sx={{ borderRadius: 3, overflow: 'hidden', height: 72 }}>
        <Toolbar sx={{ height: '100%', display: 'flex', alignItems: 'center', }}>

          <Typography variant="h5" component={Link} to="/" sx={{ textDecoration: 'none', color: 'white', mr: 4 }}>
            Дашборд
          </Typography>

          <Button color="inherit" sx={{ fontSize: '1rem' }} component={Link} to="/projects">
            Проекты
          </Button>
          {isOrganizer && (
            <Button color="inherit" sx={{ fontSize: '1rem' }} component={Link} to="/participants">
              Участники
            </Button>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {isAuth ? (
            <Button color="inherit" component={Link} to="/profile" sx={{ fontSize: '1rem' }}>
              Профиль
            </Button>
          ) : (
            <Button color="inherit" component={Link} to="/login" sx={{ fontSize: '1rem' }}>
              Вход
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </>
  );
}
