import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Card, CardContent, CircularProgress, Divider, Grid, List, ListItem, ListItemText, Typography, Button, Link as MuiLink } from '@mui/material';
import { getGroupById, getGroupMembers } from '../api/api';

function getUserFullName(user) {
  if (!user) return '';
  return [user.surname, user.name, user.patronymic].filter(Boolean).join(' ');
}

export default function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');

        const groupData = await getGroupById(groupId);
        if (cancelled) return;
        setGroup(groupData);

        const membersData = await getGroupMembers(groupId);
        if (cancelled) return;
        setMembers(membersData);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Ошибка загрузки группы');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={22} />
        <Typography>Загрузка группы...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!group) {
    return <Alert severity="warning">Группа не найдена</Alert>;
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', px: 2, }}>
      <Box sx={{ width: '100%', maxWidth: 1100 }}>
        <Box sx={{ mb: 4, mt: 4, textAlign: 'center' }}>
          <Typography variant="h4">
            {group.name}
          </Typography>
        </Box>

        <Grid container spacing={3} alignItems="stretch" justifyContent="center">
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Информация о группе
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="body2" color="text.secondary">
                  Название
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {group.name}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Организатор
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  <MuiLink component={RouterLink} to={`/users/${group.organizer.id}`} underline="hover">
                    {getUserFullName(group.organizer)}
                  </MuiLink>
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Дата создания
                </Typography>
                <Typography variant="body1">
                  {new Date(group.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Typography variant="h6" gutterBottom>
                  Участники группы ({members.length})
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {members.length === 0 ? (
                  <Typography color="text.secondary">
                    В группе пока нет участников.
                  </Typography>
                ) : (
                  <List sx={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                    {members.map((user) => (
                      <ListItem key={user.id} divider disableGutters>
                        <ListItemText
                          primary={
                            <MuiLink component={RouterLink} to={`/users/${user.id}`} underline="hover">
                              {getUserFullName(user)}
                            </MuiLink>
                          }
                          secondary={user.email}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
