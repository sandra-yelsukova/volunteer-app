import { useState } from 'react';
import { TextField, Button, Typography, Box, Paper } from '@mui/material';
import { login as loginApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const data = await loginApi(email, password);
      login(data);
      navigate('/dashboard');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fa', }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, }}>
        <Typography variant="h4" align="center" gutterBottom>
          Вход
        </Typography>

        <TextField label="Email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)}/>

        <TextField label="Пароль" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)}/>

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={handleSubmit}>
          Войти
        </Button>

        <Typography sx={{ mt: 2 }} align="center">
          Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
