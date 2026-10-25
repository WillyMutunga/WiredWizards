import { api, extractErrorMessage } from './client';

export async function openAuthenticatedPdf(endpoint: string, filename = 'document.pdf') {
  try {
    const response = await api.get(endpoint, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  } catch (err) {
    alert(extractErrorMessage(err));
  }
}
