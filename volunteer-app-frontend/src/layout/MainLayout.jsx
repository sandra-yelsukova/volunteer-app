import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Outlet, Link } from 'react-router-dom';

export default function MainLayout() {
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
          <Button color="inherit" sx={{ fontSize: '1rem' }} component={Link} to="/participants">
            Участники
          </Button>
          <Button color="inherit" sx={{ fontSize: '1rem' }} component={Link} to="/reports">
            Отчёты
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Button color="inherit" component={Link} sx={{ fontSize: '1rem' }} to="/profile">
            Профиль
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </>
  );
}
