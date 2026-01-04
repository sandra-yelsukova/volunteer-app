import { DataGrid } from '@mui/x-data-grid';
import { Box, Chip, Link } from '@mui/material';

export default function TasksTable({ tasks }) {
  const PRIORITY_LABELS = {
    HIGH: 'ВЫСОКИЙ',
    MEDIUM: 'СРЕДНИЙ',
    LOW: 'НИЗКИЙ',
  };

  const STATUS_LABELS = {
    OPEN: 'ОЖИДАЕТ',
    IN_PROGRESS: 'В ПРОЦЕССЕ',
    DONE: 'ЗАВЕРШЕНО',
  };

  const formatDateDDMMYYYY = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (isNaN(date)) return '—';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  };

  const renderPriorityChip = (priority) => {
    if (!priority) return '—';

    const color =
      priority === 'HIGH'
        ? 'error'
        : priority === 'MEDIUM'
        ? 'warning'
        : 'default';

    return (
      <Chip
        label={PRIORITY_LABELS[priority] ?? priority}
        color={color}
        size="small"
      />
    );
  };

  const renderStatusChip = (status) => {
    if (!status) return '—';

    const color =
      status === 'DONE'
        ? 'success'
        : status === 'IN_PROGRESS'
        ? 'info'
        : status === 'OPEN'
        ? 'default'
        : 'default';

    return (
      <Chip
        label={STATUS_LABELS[status] ?? status}
        color={color}
        size="small"
        variant="outlined"
      />
    );
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
      renderCell: (params) => {
        const id = params.row?.id;
        if (!id) return '—';
        return <Link href={`/tasks/${id}`}>{id}</Link>;
      },
    },

    {
      field: 'project',
      headerName: 'Проект',
      width: 220,
      sortable: true,
      renderCell: (params) => {
        const project = params.row?.project;
        if (!project) return '—';
        return <Link href={`/projects/${project.id}`}>{project.title}</Link>;
      },
      sortComparator: (v1, v2, param1, param2) => {
        const a = param1?.row?.project?.title ?? '';
        const b = param2?.row?.project?.title ?? '';
        return a.localeCompare(b, 'ru');
      },
    },

    {
      field: 'taskType',
      headerName: 'Тип',
      width: 160,
      sortable: true,
      renderCell: (params) => params.row?.taskType ?? '—',
    },

    {
      field: 'status',
      headerName: 'Статус',
      width: 160,
      sortable: true,
      renderCell: (params) => renderStatusChip(params.row?.status),
    },

    {
      field: 'priority',
      headerName: 'Приоритет',
      width: 140,
      sortable: true,
      renderCell: (params) => renderPriorityChip(params.row?.priority),
    },

    {
      field: 'title',
      headerName: 'Тема',
      flex: 1,
      sortable: true,
      renderCell: (params) => {
        const title = params.row?.title;
        const id = params.row?.id;
        if (!title || !id) return '—';
        return <Link href={`/tasks/${id}`}>{title}</Link>;
      },
    },

    {
      field: 'updatedAt',
      headerName: 'Обновлено',
      width: 140,
      sortable: true,
      renderCell: (params) => formatDateDDMMYYYY(params.row?.updatedAt),
      sortComparator: (v1, v2, param1, param2) => {
        const a = new Date(param1?.row?.updatedAt ?? 0).getTime();
        const b = new Date(param2?.row?.updatedAt ?? 0).getTime();
        return a - b;
      },
    },

    {
      field: 'assignee',
      headerName: 'Исполнитель',
      width: 220,
      sortable: true,
      renderCell: (params) => {
        const row = params.row;
        if (!row) return '—';

        if (row.assigneeType === 'USER' && row.assigneeUser) {
          const u = row.assigneeUser;
          const label = `${u.name ?? ''} ${u.surname ?? ''}`.trim() || `User #${u.id}`;
          return <Link href={`/users/${u.id}`}>{label}</Link>;
        }

        if (row.assigneeType === 'GROUP' && row.assigneeGroup) {
          const g = row.assigneeGroup;
          return <Link href={`/groups/${g.id}`}>{g.name ?? `Group #${g.id}`}</Link>;
        }

        return '—';
      },
      sortComparator: (v1, v2, param1, param2) => {
        const r1 = param1?.row;
        const r2 = param2?.row;

        const a =
          r1?.assigneeType === 'USER'
            ? `${r1?.assigneeUser?.name ?? ''} ${r1?.assigneeUser?.surname ?? ''}`.trim()
            : r1?.assigneeType === 'GROUP'
            ? r1?.assigneeGroup?.name ?? ''
            : '';

        const b =
          r2?.assigneeType === 'USER'
            ? `${r2?.assigneeUser?.name ?? ''} ${r2?.assigneeUser?.surname ?? ''}`.trim()
            : r2?.assigneeType === 'GROUP'
            ? r2?.assigneeGroup?.name ?? ''
            : '';

        return a.localeCompare(b, 'ru');
      },
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={tasks ?? []}
        columns={columns}
        getRowId={(row) => row.id}
        pageSizeOptions={[10, 20, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 100, page: 0 } },
          sorting: { sortModel: [{ field: 'updatedAt', sort: 'desc' }] },
        }}
        disableRowSelectionOnClick
      />
    </Box>
  );
}
