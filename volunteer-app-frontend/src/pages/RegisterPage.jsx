import { useState } from 'react';
import { TextField, Button, Typography, Box, Paper, Checkbox, FormControlLabel } from '@mui/material';
import { register } from '../api/api';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    passwordHash: '',
    name: '',
    surname: '',
  });

  const [isOrganizer, setIsOrganizer] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await register({
        ...form,
        role: isOrganizer ? 'ORGANIZER' : 'VOLUNTEER',
      });
      navigate('/login');
    } catch (e) {
      setError(e.message || 'Ошибка регистрации');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fa', }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 420, }}>
        <Typography variant="h4" align="center" gutterBottom>
          Регистрация
        </Typography>

        <TextField label="Email" fullWidth margin="normal" value={form.email} onChange={handleChange('email')}/>

        <TextField label="Пароль" type="password" fullWidth margin="normal" value={form.passwordHash} onChange={handleChange('passwordHash')}/>

        <TextField label="Имя" fullWidth margin="normal" value={form.name} onChange={handleChange('name')}/>

        <TextField label="Фамилия" fullWidth margin="normal" value={form.surname} onChange={handleChange('surname')}/>

        <FormControlLabel sx={{ mt: 1 }}
          control={
            <Checkbox checked={isOrganizer} onChange={(e) => setIsOrganizer(e.target.checked)}/>
          }
          label="Я организатор"
        />

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={handleSubmit}>
          Зарегистрироваться
        </Button>

        <Typography sx={{ mt: 2 }} align="center">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
