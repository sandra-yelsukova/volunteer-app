import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Outlet, Link } from 'react-router-dom';

export default function MainLayout() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>

          <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'white', mr: 4 }}>
            Дашборд
          </Typography>

          <Button color="inherit" component={Link} to="/projects">
            Проекты
          </Button>
          <Button color="inherit" component={Link} to="/participants">
            Участники
          </Button>
          <Button color="inherit" component={Link} to="/reports">
            Отчёты
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Button color="inherit" component={Link} to="/profile">
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
