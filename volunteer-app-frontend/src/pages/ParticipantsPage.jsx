import { useEffect, useState } from 'react';
import { Alert, Box, Card, CardContent, CircularProgress, Divider, Grid, List, ListItem, ListItemText, Typography, Link as MuiLink } from '@mui/material';
import { getGroupsByOrganizer, getGroupMembers, getOrganizerParticipants } from '../api/api';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

function getCurrentUserId() {
  const raw = localStorage.getItem('userId');
  if (!raw) return null;

  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

function getUserFullName(user) {
  if (!user) return '';

  const parts = [
    user.surname,
    user.name,
    user.patronymic,
  ].filter(Boolean);

  return parts.join(' ');
}

export default function ParticipantsPage() {
  const organizerId = getCurrentUserId();

  const [groups, setGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState({});
  const [participants, setParticipants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (!organizerId) {
      setError('Пользователь не найден.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const groupsData = await getGroupsByOrganizer(organizerId);
        if (cancelled) return;
        setGroups(groupsData);

        const participantsData = await getOrganizerParticipants(organizerId);
        if (cancelled) return;
        setParticipants(participantsData);

        const membersEntries = await Promise.all(
          groupsData.map(async (group) => {
            const members = await getGroupMembers(group.id);
            return [group.id, members];
          })
        );

        if (cancelled) return;
        setGroupMembers(Object.fromEntries(membersEntries));
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Ошибка загрузки данных');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [organizerId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={22} />
        <Typography>Загрузка участников...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ width: '100%', px: 3 }}>
      <Grid container spacing={3} wrap="nowrap" alignItems="flex-start">
        <Grid item xs>
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            Группы волонтёров
          </Typography>

          {groups.length === 0 ? (
            <Card>
              <CardContent>
                <Typography color="text.secondary">
                  У вас пока нет групп.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ height: 620, overflowY: 'auto', pr: 1, }}>
              <Grid container spacing={4}>
                {groups.map((group) => {
                  const members = groupMembers[group.id] || [];

                  return (
                    <Grid item key={group.id}>
                      <Card onClick={() => navigate(`/groups/${group.id}`)}
                        sx={{
                          width: 320,
                          height: 290,
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                          '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                        }}
                      >
                        <CardContent
                          sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, }}>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {group.name}
                          </Typography>

                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Участников: {members.length}
                          </Typography>

                          <Divider sx={{ my: 1 }} />

                          <List dense disablePadding sx={{ overflowY: 'auto', flex: 1, minHeight: 0, }}>
                            {members.length === 0 ? (
                              <ListItem disableGutters>
                                <ListItemText primary="Нет участников" />
                              </ListItem>
                            ) : (
                              members.map((user) => (
                                <ListItem key={user.id} disableGutters>
                                  <ListItemText
                                    primary={
                                      <MuiLink component={RouterLink} to={`/users/${user.id}`} underline="hover" onClick={(e) => e.stopPropagation()}>
                                        {getUserFullName(user)}
                                      </MuiLink>
                                    }
                                    secondary={user.email || ''}
                                  />
                                </ListItem>
                              ))
                            )}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </Grid>

        <Grid item sx={{ width: 420, flexShrink: 0 }}>
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            Участники проектов
          </Typography>

          <Card sx={{ height: 640, display: 'flex', flexDirection: 'column', }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Всего участников: {participants.length}
              </Typography>

              <Divider sx={{ mb: 1.5 }} />

              {participants.length === 0 ? (
                <Typography color="text.secondary">
                  Участники отсутствуют.
                </Typography>
              ) : (
                <List disablePadding sx={{ overflowY: 'auto', flex: 1, minHeight: 0, }}>
                  {participants.map((user) => (
                    <ListItem key={user.id} divider disableGutters>
                      <ListItemText
                        primary={
                          <MuiLink component={RouterLink} to={`/users/${user.id}`} underline="hover">
                            {getUserFullName(user)}
                          </MuiLink>
                        }
                        secondary={user.email || ''}
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
  );
}
