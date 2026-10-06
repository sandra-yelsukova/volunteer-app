import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Card, CardContent, Divider, Chip, Grid, Button, TextField, MenuItem, Link as MuiLink, IconButton } from '@mui/material';
import { getTaskById, updateTask, deleteTask, getGroupsByOrganizer, getProjectParticipants, getTaskComments, createTaskComment, updateTaskComment, deleteTaskComment } from '../api/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

export default function TaskPage() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editDetails, setEditDetails] = useState(false);
  const [groups, setGroups] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  const [addCommentMode, setAddCommentMode] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [updatingCommentId, setUpdatingCommentId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const navigate = useNavigate();

  const STATUS_LABELS = {
    OPEN: 'ОЖИДАЕТ',
    IN_PROGRESS: 'В ПРОЦЕССЕ',
    DONE: 'ЗАВЕРШЕНО',
  };

  const PRIORITY_LABELS = {
    HIGH: 'ВЫСОКИЙ',
    MEDIUM: 'СРЕДНИЙ',
    LOW: 'НИЗКИЙ',
  };

  function getCurrentUserId() {
    const raw = localStorage.getItem('userId');
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  useEffect(() => {
    setLoading(true);

    getTaskById(id)
      .then(async (data) => {
        setTask(data);

        const organizerId = getCurrentUserId();

        if (organizerId) {
          getGroupsByOrganizer(organizerId)
            .then(setGroups)
            .catch(() => setGroups([]));
        } else {
          setGroups([]);
        }

        setForm({
          title: data.title || '',
          description: data.description || '',
          priority: data.priority || '',
          status: data.status || '',
          taskType: data.taskType || '',
          assigneeType: data.assigneeType ?? 'NONE',
          assigneeId:
            data.assigneeType === 'USER'
              ? (data.assigneeUser?.id ?? '')
              : data.assigneeType === 'GROUP'
              ? (data.assigneeGroup?.id ?? '')
              : '',
        });

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
      const projectId = task?.project?.id;
      if (!projectId) {
        setParticipants([]);
        return;
      }

      let cancelled = false;
      setParticipantsLoading(true);

      getProjectParticipants(projectId)
        .then((res) => {
          if (cancelled) return;

          if (Array.isArray(res)) {
            setParticipants(res);
          } else if (Array.isArray(res.participants)) {
            setParticipants(res.participants);
          } else if (Array.isArray(res.content)) {
            setParticipants(res.content);
          } else {
            setParticipants([]);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setParticipants([]);
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
    }, [task?.project?.id]);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;
    setCommentsLoading(true);
    setCommentsError('');

    getTaskComments(id)
      .then((data) => {
        if (!cancelled) {
          setComments(Array.isArray(data) ? data : []);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setCommentsError(e.message || 'Ошибка загрузки комментариев');
          setComments([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCommentsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updated = await updateTask(task.id, {
        title: form.title,
        description: form.description,
      });

      setTask(updated);
      setEditMode(false);
    } catch (e) {
      alert(e.message || 'Ошибка сохранения задачи');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      title: task.title || '',
      description: task.description || '',
    });
    setEditMode(false);
  };


  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text || '');
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const submitEditComment = async (commentId) => {
    try {
      setUpdatingCommentId(commentId);
      const updatedComment = await updateTaskComment(task.id, commentId, {
        text: editingCommentText,
      });

      setComments((prev) => prev.map((comment) => (
        comment.id === commentId ? updatedComment : comment
      )));
      cancelEditComment();
    } catch (e) {
      alert(e.message || 'Ошибка редактирования комментария');
    } finally {
      setUpdatingCommentId(null);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Удалить комментарий?')) {
      return;
    }

    try {
      setDeletingCommentId(commentId);
      await deleteTaskComment(task.id, commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));

      if (editingCommentId === commentId) {
        cancelEditComment();
      }
    } catch (e) {
      alert(e.message || 'Ошибка удаления комментария');
    } finally {
      setDeletingCommentId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Ошибка загрузки задачи: {error}</Typography>;
  }

  if (!task) {
    return <Typography>Задача не найдена</Typography>;
  }

  const currentUserId = getCurrentUserId();
  const isProjectOrganizer = currentUserId !== null && task?.project?.organizer?.id === currentUserId;

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, mb: 3, alignItems: 'stretch', }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }} >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: '100%' }} >
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Chip label={`#${task.id}`} color="primary" sx={{ mr: 1.5, fontWeight: 600, height: 32 }} />

                  {!editMode ? (
                    <Typography variant="h4">
                      {task.title}
                    </Typography>
                  ) : (
                    <TextField value={form.title} onChange={handleChange('title')} fullWidth label="Название задачи" sx={{ mr: 2 }} />
                  )}
                </Box>

                {isProjectOrganizer && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!editMode ? (
                      <>
                        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditMode(true)} sx={{ mr: 1 }}>
                          Редактировать
                        </Button>
                        <Button variant="outlined" color="error" startIcon={<DeleteIcon />}
                          onClick={async () => {
                            if (!window.confirm('Удалить задачу?')) {
                              return;
                            }

                            try {
                              setDeleting(true);
                              await deleteTask(task.id);
                              navigate(`/projects/${task.project.id}`);
                            } catch (e) {
                              alert(e.message || 'Ошибка удаления задачи');
                            } finally {
                              setDeleting(false);
                            }
                          }}
                          disabled={deleting}
                        >
                          Удалить
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} >
                          Сохранить
                        </Button>

                        <Button variant="outlined" startIcon={<CloseIcon />} onClick={handleCancel} >
                          Отмена
                        </Button>
                      </>
                    )}
                  </Box>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {!editMode ? (
              <Typography variant="body1">
                {task.description || 'Описание отсутствует'}
              </Typography>
            ) : (
              <TextField value={form.description} onChange={handleChange('description')} fullWidth multiline minRows={4} label="Описание" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }} >
              <Typography variant="h4">
                Детали задачи
              </Typography>

              {!editDetails ? (
                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditDetails(true)} >
                  Редактировать
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" startIcon={<SaveIcon />}
                    onClick={async () => {
                      try {
                        setSaving(true);
                        const assigneeId = form.assigneeId ? Number(form.assigneeId) : null;
                        const assigneePayload = {
                          assigneeType: form.assigneeType || 'NONE',
                        };

                        if (form.assigneeType === 'USER' && assigneeId) {
                          assigneePayload.assigneeUser = { id: assigneeId };
                        }

                        if (form.assigneeType === 'GROUP' && assigneeId) {
                          assigneePayload.assigneeGroup = { id: assigneeId };
                        }
                        const updated = await updateTask(task.id, {
                          priority: form.priority,
                          status: form.status,
                          taskType: form.taskType,
                          ...assigneePayload,
                        });
                        setTask(updated);
                        setEditDetails(false);
                      } catch (e) {
                        alert(e.message || 'Ошибка сохранения');
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                  >
                    Сохранить
                  </Button>

                  <Button variant="outlined" startIcon={<CloseIcon />}
                    onClick={() => {
                      setForm({
                        ...form,
                        priority: task.priority,
                        status: task.status,
                        taskType: task.taskType,
                        assigneeType: task.assigneeType ?? 'NONE',
                        assigneeId:
                          task.assigneeType === 'USER'
                            ? (task.assigneeUser?.id ?? '')
                            : task.assigneeType === 'GROUP'
                            ? (task.assigneeGroup?.id ?? '')
                            : '',
                      });
                      setEditDetails(false);
                    }}
                  >
                    Отмена
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Grid container spacing={5}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Приоритет
                  </Typography>

                  {!editDetails ? (
                    task.priority ? (
                      <Chip label={PRIORITY_LABELS[task.priority] ?? task.priority}
                        color={
                          task.priority === 'HIGH'
                            ? 'error'
                            : task.priority === 'MEDIUM'
                            ? 'warning'
                            : 'default'
                        }
                        size="small"
                      />
                    ) : (
                      <Typography color="text.secondary">
                        Не указан
                      </Typography>
                    )
                  ) : (
                    <TextField select value={form.priority} onChange={handleChange('priority')} fullWidth size="small" >
                      <MenuItem value="HIGH">Высокий</MenuItem>
                      <MenuItem value="MEDIUM">Средний</MenuItem>
                      <MenuItem value="LOW">Низкий</MenuItem>
                    </TextField>
                  )}
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Статус
                  </Typography>

                  {!editDetails ? (
                    <Chip label={STATUS_LABELS[task.status] ?? task.status}
                      color={
                        task.status === 'DONE'
                          ? 'success'
                          : task.status === 'IN_PROGRESS'
                          ? 'info'
                          : 'default'
                      }
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    <TextField select value={form.status} onChange={handleChange('status')} fullWidth size="small" >
                      <MenuItem value="OPEN">Ожидает</MenuItem>
                      <MenuItem value="IN_PROGRESS">В процессе</MenuItem>
                      <MenuItem value="DONE">Завершено</MenuItem>
                    </TextField>
                  )}
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Исполнитель
              </Typography>

              {!editDetails ? (
                task.assigneeType === 'USER' && task.assigneeUser ? (
                  <Typography>
                    <MuiLink component={RouterLink} to={`/users/${task.assigneeUser.id}`} underline="hover" >
                      {task.assigneeUser.surname} {task.assigneeUser.name}
                    </MuiLink>
                  </Typography>
                ) : task.assigneeType === 'GROUP' && task.assigneeGroup ? (
                  <Typography>
                    <MuiLink component={RouterLink} to={`/groups/${task.assigneeGroup.id}`} underline="hover" >
                      {task.assigneeGroup.name}
                    </MuiLink>
                  </Typography>
                ) : (
                  <Typography color="text.secondary">
                    Не назначен
                  </Typography>
                )
              ) : (
                <TextField select fullWidth size="small"
                  value={
                    form?.assigneeType && form?.assigneeId
                      ? `${form.assigneeType}:${form.assigneeId}`
                      : ''
                  }
                  onChange={(e) => {
                    const raw = e.target.value;

                    if (!raw) {
                      setForm(prev => ({
                        ...prev,
                        assigneeType: '',
                        assigneeId: '',
                      }));
                      return;
                    }

                    const [type, id] = raw.split(':');
                    setForm(prev => ({
                      ...prev,
                      assigneeType: type,
                      assigneeId: id,
                    }));
                  }}
                >
                  <MenuItem value="">
                    Не назначен
                  </MenuItem>

                  <Divider />

                  <MenuItem disabled>
                    Группы
                  </MenuItem>

                  {groups.map(group => (
                    <MenuItem key={`GROUP-${group.id}`} value={`GROUP:${group.id}`} >
                      🧑‍🤝‍🧑 {group.name}
                    </MenuItem>
                  ))}

                  <Divider />

                  <MenuItem disabled>
                    Участники проекта
                  </MenuItem>

                  {participantsLoading ? (
                    <MenuItem disabled>Загрузка...</MenuItem>
                  ) : participants.length === 0 ? (
                    <MenuItem disabled>Участники не найдены</MenuItem>
                  ) : (
                    participants.map(user => (
                      <MenuItem key={`USER-${user.id}`} value={`USER:${user.id}`} >
                        👤 {user.surname} {user.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Тип задачи
              </Typography>

              {!editDetails ? (
                <Typography>
                  {task.taskType || 'Не указан'}
                </Typography>
              ) : (
                <TextField value={form.taskType} onChange={handleChange('taskType')} fullWidth size="small" />
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Проект
              </Typography>

              <Typography>
                <MuiLink component={RouterLink} to={`/projects/${task.project.id}`} underline="hover">
                  {task.project.title}
                </MuiLink>
              </Typography>
            </Box>

            <Grid container spacing={5}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Создано
                </Typography>

                <Typography>
                  {new Date(task.createdAt).toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Обновлено
                </Typography>

                <Typography>
                  {task.updatedAt ? new Date(task.updatedAt).toLocaleString() : '—'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Комментарии и заметки
            </Typography>

            {!addCommentMode ? (
              <Button variant="outlined" onClick={() => setAddCommentMode(true)}>
                Добавить комментарий
              </Button>
            ) : null}
          </Box>

          {addCommentMode ? (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Комментарий"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              />

              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <Button
                  variant="contained"
                  disabled={submittingComment}
                  onClick={async () => {
                    const authorId = getCurrentUserId();

                    if (!authorId) {
                      alert('Не удалось определить пользователя');
                      return;
                    }

                    try {
                      setSubmittingComment(true);
                      const createdComment = await createTaskComment(task.id, {
                        authorId,
                        text: newCommentText,
                      });
                      setComments(prev => [createdComment, ...prev]);
                      setNewCommentText('');
                      setAddCommentMode(false);
                    } catch (e) {
                      alert(e.message || 'Ошибка добавления комментария');
                    } finally {
                      setSubmittingComment(false);
                    }
                  }}
                >
                  Отправить
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => {
                    setAddCommentMode(false);
                    setNewCommentText('');
                  }}
                >
                  Отмена
                </Button>
              </Box>
            </Box>
          ) : null}

          {commentsLoading ? (
            <Typography color="text.secondary">Загрузка комментариев...</Typography>
          ) : commentsError ? (
            <Typography color="error">{commentsError}</Typography>
          ) : comments.length === 0 ? (
            <Typography color="text.secondary">Комментариев пока нет.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {comments.map((comment) => (
                <Box key={comment.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.5, alignItems: 'center' }}>
                    <MuiLink component={RouterLink} to={`/users/${comment.author?.id}`} underline="hover" variant="subtitle2">
                      {comment.author?.surname} {comment.author?.name}
                    </MuiLink>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                      </Typography>

                      <IconButton
                        edge="end"
                        aria-label="Редактировать комментарий"
                        onClick={() => startEditComment(comment)}
                        disabled={updatingCommentId === comment.id || deletingCommentId === comment.id}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        edge="end"
                        aria-label="Удалить комментарий"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id || updatingCommentId === comment.id}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {editingCommentId === comment.id ? (
                    <Box sx={{ mt: 1 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Комментарий"
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                      />

                      <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                        <Button
                          variant="contained"
                          disabled={updatingCommentId === comment.id}
                          onClick={() => submitEditComment(comment.id)}
                        >
                          Отправить
                        </Button>

                        <Button
                          variant="outlined"
                          onClick={cancelEditComment}
                          disabled={updatingCommentId === comment.id}
                        >
                          Отмена
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2">
                      {comment.text}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
