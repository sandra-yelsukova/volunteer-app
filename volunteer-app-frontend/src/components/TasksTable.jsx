import { DataGrid } from '@mui/x-data-grid';
import { Box, Chip, Link } from '@mui/material';
import { ruRU } from '@mui/x-data-grid/locales';


export default function TasksTable({ tasks }) {
  const PRIORITY_LABELS = {
    HIGH: 'ВЫСОКИЙ',
    MEDIUM: 'СРЕДНИЙ',
    LOW: 'НИЗКИЙ',
  };

  const PRIORITY_ORDER = {
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

  const STATUS_LABELS = {
    OPEN: 'ОЖИДАЕТ',
    IN_PROGRESS: 'В ПРОЦЕССЕ',
    DONE: 'ЗАВЕРШЕНО',
  };

  const formatDateDDMMYYYYHHMM = (value) => {
    if (!value) return '—';

    const date = new Date(value);
    if (isNaN(date)) return '—';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
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

      valueGetter: (_value, row) => {
        return row?.project?.title ?? '';
      },

      renderCell: (params) => {
        const project = params.row?.project;
        if (!project) return '—';

        return (
          <Link href={`/projects/${project.id}`}>
            {project.title}
          </Link>
        );
      },

      sortComparator: (a, b) => (a ?? '').localeCompare(b ?? '', 'ru'),
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

      sortComparator: (v1, v2) =>
        (PRIORITY_ORDER[v1] ?? 0) - (PRIORITY_ORDER[v2] ?? 0),

      renderCell: (params) => {
        const priority = params.value;
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
      },
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
      width: 170,
      sortable: true,

      renderCell: (params) => formatDateDDMMYYYYHHMM(params.row?.updatedAt),

      sortComparator: (v1, v2) => {
        const toTime = (v) => {
          if (!v) return -Infinity;
          const t = new Date(v).getTime();
          return Number.isFinite(t) ? t : -Infinity;
        };

        return toTime(v1) - toTime(v2);
      },
    },

    {
      field: 'assignee',
      headerName: 'Исполнитель',
      width: 220,
      sortable: true,

      valueGetter: (_value, row) => {
        if (!row) return '';

        if (row.assigneeType === 'USER' && row.assigneeUser) {
          return `${row.assigneeUser.name ?? ''} ${row.assigneeUser.surname ?? ''}`.trim();
        }

        if (row.assigneeType === 'GROUP' && row.assigneeGroup) {
          return row.assigneeGroup.name ?? '';
        }

        return '';
      },

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

      sortComparator: (a, b) => (a ?? '').localeCompare(b ?? '', 'ru'),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={tasks ?? []}
        columns={columns}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 20, 50]}
        sortingMode="client"
        localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}

        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
              page: 0,
            },
          },
          sorting: {
            sortModel: [
              { field: 'updatedAt', sort: 'desc' },
            ],
          },
        }}
      />
    </Box>
  );
}
