import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import { downloadReport, getReportHtml, getReports } from '../api/api';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeReportId, setActiveReportId] = useState(null);
  const [reportHtml, setReportHtml] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const reportFrameRef = useRef(null);

  const updateReportFrameLayout = () => {
    const frame = reportFrameRef.current;
    if (!frame) {
      return;
    }

    const doc = frame.contentDocument;
    if (!doc || !doc.body) {
      return;
    }

    doc.body.style.margin = '0';
    doc.body.style.display = 'flex';
    doc.body.style.justifyContent = 'center';
    doc.body.style.alignItems = 'flex-start';
    doc.body.style.padding = '16px 0';
    doc.body.style.fontSize = '16px';

    const height = doc.documentElement.scrollHeight;
    frame.style.height = `${height}px`;
  };

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

  const handleExportReport = async (format) => {
    if (!activeReportId) {
      return;
    }

    setExportLoading(true);
    setReportError(null);

    try {
      const fileBlob = await downloadReport(activeReportId, format);
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      const extension = format === 'pdf' ? 'pdf' : 'xls';
      link.href = url;
      link.download = `report-${activeReportId}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setReportError(err.message || 'Не удалось скачать отчет');
    } finally {
      setExportLoading(false);
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
          <Box sx={{ width: '100%', maxWidth: 900, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, mx: 'auto' }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Результат отчета
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }} alignItems="flex-start">
              <Button variant="outlined" size="small" onClick={() => handleExportReport('pdf')} disabled={!reportHtml || reportLoading || exportLoading} >
                Скачать PDF
              </Button>
              <Button variant="outlined" size="small" onClick={() => handleExportReport('xls')} disabled={!reportHtml || reportLoading || exportLoading} >
                Скачать Excel
              </Button>
            </Stack>
          </Box>
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
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
              <Box component="iframe" title="BIRT report" ref={reportFrameRef} onLoad={updateReportFrameLayout}
                sx={{ width: '100%', border: 'none', display: 'block' }} srcDoc={reportHtml}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}