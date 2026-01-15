import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress, Divider, Button, TextField, } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserById, updateUser } from '../api/api';

function getRoleLabel(role) {
  if (role === 'ORGANIZER') return 'Организатор';
  if (role === 'VOLUNTEER') return 'Волонтер';
  return role;
}

export default function ProfilePage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        setForm({
          surname: data.surname || '',
          name: data.name || '',
          patronymic: data.patronymic || '',
          phone: data.phone || '',
        });
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

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateUser(user.id, form);

      setUser(prev => ({ ...prev, ...form }));
      setEditMode(false);
    } catch (e) {
      alert(e.message || 'Ошибка сохранения профиля');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      surname: user.surname || '',
      name: user.name || '',
      patronymic: user.patronymic || '',
      phone: user.phone || '',
    });
    setEditMode(false);
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
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', px: 2, mt: 9 }}>
      <Box sx={{ width: '100%', maxWidth: 700 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" >
            Профиль
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {!editMode ? (
              <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditMode(true)}>
                Редактировать
              </Button>
            ) : (
              <>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
                  Сохранить
                </Button>
                <Button variant="outlined" startIcon={<CloseIcon />} onClick={handleCancel}>
                  Отмена
                </Button>
              </>
            )}

            <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>
              Выйти
            </Button>
          </Box>
        </Box>

        <Card>
          <CardContent>
            {!editMode ? (
              <>
                <Typography variant="h6">
                  {user.surname} {user.name} {user.patronymic}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {getRoleLabel(user.role)}
                </Typography>
              </>
            ) : (
              <>
                <TextField label="Фамилия" fullWidth sx={{ mb: 2 }} value={form.surname} onChange={handleChange('surname')}/>

                <TextField label="Имя" fullWidth sx={{ mb: 2 }} value={form.name} onChange={handleChange('name')}/>

                <TextField label="Отчество" fullWidth sx={{ mb: 2 }} value={form.patronymic} onChange={handleChange('patronymic')}/>
              </>
            )}

            <Divider sx={{ my: 2 }} />

            {editMode ? (
              <TextField label="Телефон" fullWidth sx={{ mb: 2 }} value={form.phone} onChange={handleChange('phone')}/>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary">
                  Телефон
                </Typography>
                <Typography sx={{ mb: 2 }}>
                  {user.phone || 'Не указан'}
                </Typography>
              </>
            )}

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
