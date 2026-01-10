import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Card, CardContent, CircularProgress, Divider, Grid, IconButton, List, ListItem, ListItemText, Typography, Button, Link as MuiLink, TextField, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { addGroupMember, deleteGroup, getGroupById, getGroupMembers, getOrganizerParticipants, getTasks, removeGroupMember, updateGroup } from '../api/api';

function getUserFullName(user) {
  if (!user) return '';
  return [user.surname, user.name, user.patronymic].filter(Boolean).join(' ');
}

export default function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [removingMemberIds, setRemovingMemberIds] = useState([]);
  const [memberActionError, setMemberActionError] = useState('');
  const [taskWarningCount, setTaskWarningCount] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const organizerId = useMemo(() => {
    const raw = localStorage.getItem('userId');
    const id = Number(raw);
    return Number.isFinite(id) ? id : null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');

        const groupData = await getGroupById(groupId);
        if (cancelled) return;
        setGroup(groupData);
        setFormName(groupData.name || '');

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

  useEffect(() => {
    if (!organizerId) {
      setParticipants([]);
      return;
    }

    let cancelled = false;
    setParticipantsLoading(true);
    setParticipantsError('');

    getOrganizerParticipants(organizerId)
      .then((data) => {
        if (!cancelled) {
          setParticipants(Array.isArray(data) ? data : []);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setParticipants([]);
          setParticipantsError(e.message || 'Ошибка загрузки участников проектов');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setParticipantsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [organizerId]);

  useEffect(() => {
    if (!group?.id) {
      setTaskWarningCount(0);
      return;
    }

    let cancelled = false;

    getTasks()
      .then((tasks) => {
        if (cancelled) return;
        const assignedCount = Array.isArray(tasks)
          ? tasks.filter((task) => task.assigneeGroup?.id === group.id).length
          : 0;
        setTaskWarningCount(assignedCount);
      })
      .catch(() => {
        if (!cancelled) {
          setTaskWarningCount(0);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [group?.id]);

  const availableParticipants = useMemo(() => {
    const memberIds = new Set(members.map((member) => member.id));
    return participants.filter((participant) => !memberIds.has(participant.id));
  }, [members, participants]);

  const handleDeleteGroup = async () => {
    setDeleteError('');

    if (taskWarningCount > 0) {
      const confirmed = window.confirm(
        `Группа назначена исполнителем задач: ${taskWarningCount}. Удалить группу?`
      );
      if (!confirmed) {
        return;
      }
    } else {
      const confirmed = window.confirm('Удалить группу?');
      if (!confirmed) {
        return;
      }
    }

    try {
      setDeleteLoading(true);
      await Promise.all(members.map((member) => removeGroupMember(group.id, member.id)));
      await deleteGroup(group.id);
      navigate('/participants', { replace: true });
    } catch (e) {
      setDeleteError(e.message || 'Ошибка удаления группы');
    } finally {
      setDeleteLoading(false);
    }
  };

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
        <Grid container spacing={3} alignItems="stretch" >
          <Grid item xs={12} md={6}>
            <Typography variant="h4">
              {group.name}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }} >
            <Button variant="outlined" color="error" startIcon={<DeleteOutlineIcon />} onClick={handleDeleteGroup} disabled={deleteLoading} >
              Удалить группу
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }} >
                  <Typography variant="h6" gutterBottom>
                    Информация о группе
                  </Typography>

                  {!editMode ? (
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditMode(true)}>
                      Редактировать
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="contained" startIcon={<SaveIcon />} disabled={saving}
                        onClick={async () => {
                          try {
                            setSaving(true);
                            const updated = await updateGroup(group.id, { name: formName });
                            setGroup(updated);
                            setEditMode(false);
                          } catch (e) {
                            setMemberActionError(e.message || 'Ошибка сохранения группы');
                          } finally {
                            setSaving(false);
                          }
                        }}
                      >
                        Сохранить
                      </Button>

                      <Button variant="outlined" startIcon={<CloseIcon />}
                        onClick={() => {
                          setFormName(group.name || '');
                          setEditMode(false);
                        }}
                      >
                        Отмена
                      </Button>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="body2" color="text.secondary">
                  Название
                </Typography>
                {!editMode ? (
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {group.name}
                  </Typography>
                ) : (
                  <TextField value={formName} onChange={(e) => setFormName(e.target.value)} fullWidth size="small" sx={{ mb: 1.5 }} /> )}

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
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} >
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
                      <ListItem key={user.id} divider disableGutters secondaryAction={(
                          <IconButton edge="end" aria-label="Удалить участника" onClick={async () => {
                              try {
                                setMemberActionError('');
                                setRemovingMemberIds((prev) => [...prev, user.id]);
                                await removeGroupMember(group.id, user.id);
                                setMembers((prev) => prev.filter((member) => member.id !== user.id));
                              } catch (e) {
                                setMemberActionError(e.message || 'Ошибка удаления участника');
                              } finally {
                                setRemovingMemberIds((prev) => prev.filter((id) => id !== user.id));
                              }
                            }}
                            disabled={removingMemberIds.includes(user.id)}
                          >
                            <CloseIcon />
                          </IconButton>
                        )}
                      >
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

                <Divider sx={{ my: 2 }} />

                {taskWarningCount > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Группа назначена исполнителем задач: {taskWarningCount}
                  </Alert>
                )}

                {(participantsError || memberActionError || deleteError) && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {participantsError || memberActionError || deleteError}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField select size="small" label="Участники проектов" value={selectedParticipantId}
                    onChange={(e) => setSelectedParticipantId(e.target.value)} fullWidth disabled={participantsLoading}
                  >
                    <MenuItem value="">
                      Не выбран
                    </MenuItem>

                    {participantsLoading ? (
                      <MenuItem disabled>Загрузка...</MenuItem>
                    ) : availableParticipants.length === 0 ? (
                      <MenuItem disabled>Нет доступных участников</MenuItem>
                    ) : (
                      availableParticipants.map((participant) => (
                        <MenuItem key={participant.id} value={participant.id}>
                          {getUserFullName(participant)}
                        </MenuItem>
                      ))
                    )}
                  </TextField>

                  <Button variant="outlined"
                    onClick={async () => {
                      if (!selectedParticipantId) return;
                      try {
                        setAddingMember(true);
                        await addGroupMember(group.id, selectedParticipantId);
                        const added = participants.find((p) => String(p.id) === String(selectedParticipantId));
                        if (added) {
                          setMembers((prev) => [...prev, added]);
                        }
                        setSelectedParticipantId('');
                      } catch (e) {
                        setParticipantsError(e.message || 'Ошибка добавления участника');
                      } finally {
                        setAddingMember(false);
                      }
                    }}
                    disabled={!selectedParticipantId || addingMember}
                  >
                    Добавить участника
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
