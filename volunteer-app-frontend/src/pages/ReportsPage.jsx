import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import { getReportHtml, getReports } from '../api/api';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeReportId, setActiveReportId] = useState(null);
  const [reportHtml, setReportHtml] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      try {
        setLoading(true);
        setError(null);
        const data = await getReports();
        if (!cancelled) {
          setReports(data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Не удалось загрузить список отчетов');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRenderReport = async (reportId) => {
    setActiveReportId(reportId);
    setReportLoading(true);
    setReportError(null);
    setReportHtml('');

    try {
      const html = await getReportHtml(reportId);
      setReportHtml(html || '');
    } catch (err) {
      setReportError(err.message || 'Не удалось сформировать отчет');
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', px: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 900 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Отчеты
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Ошибка загрузки отчетов: {error}
          </Alert>
        )}

        {reports.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Отчеты пока не добавлены.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {reports.map(report => (
              <Card key={report.id}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {report.name}
                  </Typography>
                  {report.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {report.description}
                    </Typography>
                  )}
                  <Button variant="outlined" size="small" onClick={() => handleRenderReport(report.id)} disabled={reportLoading && activeReportId === report.id} >
                    {reportLoading && activeReportId === report.id ? 'Формирование...' : 'Сформировать отчет'}
                  </Button>
                </CardContent>
              </Card>
            ))}
        </Stack>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Результат отчета
          </Typography>
          {reportError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Ошибка формирования: {reportError}
            </Alert>
          )}
          {reportLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Формируем отчет...
              </Typography>
            </Box>
          )}
          {!reportLoading && !reportHtml && (
            <Typography variant="body2" color="text.secondary">
              Выберите отчет из списка, чтобы сформировать его.
            </Typography>
          )}
          {reportHtml && !reportLoading && (
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
              <Box component="iframe" title="BIRT report" sx={{ width: '100%', border: 'none', minHeight: 420, display: 'block' }} srcDoc={reportHtml} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}