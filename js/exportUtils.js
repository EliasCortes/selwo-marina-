/* ============================================================
   EXPORT UTILS - Módulo universal de Exportación e Impresión
   ============================================================ */
window.App = window.App || {};

App.ExportUtils = (() => {
  'use strict';

  /**
   * Helper genérico para descargar archivos Blob en el navegador.
   */
  function downloadBlob(content, mimeType, filename) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Limpia y formatea cualquier número flotante en un texto para que no supere 2 decimales.
   */
  function cleanDecimalsInText(text) {
    if (typeof text !== 'string' && typeof text !== 'number') return text;
    let str = String(text);
    return str.replace(/(\d+\.\d{3,})/g, (match) => {
      const num = parseFloat(match);
      if (isNaN(num)) return match;
      return String(Math.round((num + Number.EPSILON) * 100) / 100);
    });
  }

  /**
   * Procesa y sanitiza el valor de una celda.
   */
  function formatCellValue(row, col) {
    if (!row || !col) return '—';
    let val;
    if (typeof col.formatFn === 'function') {
      val = col.formatFn(row[col.key], row);
    } else {
      val = row[col.key];
    }
    if (val === null || val === undefined || val === '') return '—';
    if (Array.isArray(val)) return cleanDecimalsInText(val.join(', '));
    return cleanDecimalsInText(val);
  }

  /**
   * Genera y descarga un archivo en formato CSV, XLSX o TXT.
   * @param {Object} config
   * @param {Array<Object>} config.data - Arreglo de registros a exportar
   * @param {Array<Object>} config.columns - Arreglo de { key, label, formatFn }
   * @param {string} config.fileName - Nombre base del archivo
   * @param {string} config.format - 'csv' | 'xlsx' | 'txt'
   * @param {string} [config.title] - Título del reporte
   */
  function exportData({ data = [], columns = [], fileName = 'Reporte_Selwo', format = 'csv', title = 'Reporte Selwo Marina', subtitle = '' }) {
    const UI = window.App.UI || {};
    if (!data || data.length === 0) {
      if (UI.showToast) UI.showToast('No hay datos disponibles para exportar con los filtros seleccionados.', 'warning');
      else alert('No hay datos disponibles para exportar.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const fullFileName = `${fileName}_${todayStr}.${format}`;

    switch (format) {
      case 'csv':
        exportCSV(data, columns, fullFileName, title, subtitle);
        break;
      case 'xlsx':
        exportExcel(data, columns, fullFileName, title, subtitle);
        break;
      case 'txt':
        exportText(data, columns, fullFileName, title, subtitle);
        break;
      default:
        console.error('Formato no soportado:', format);
    }
  }

  /**
   * Exporta datos en formato CSV con BOM UTF-8 y escape seguro.
   */
  function exportCSV(data, columns, filename, title, subtitle = '') {
    const UI = window.App.UI || {};
    let csvStr = `"${title.replace(/"/g, '""')}"\n`;
    if (subtitle) csvStr += `"${subtitle.replace(/"/g, '""')}"\n`;
    csvStr += `"Fecha del Reporte: ${new Date().toLocaleString()}"\n\n`;

    // Encabezados
    csvStr += columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',') + '\n';

    // Filas
    data.forEach(row => {
      const line = columns.map(c => {
        const val = formatCellValue(row, c);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
      csvStr += line + '\n';
    });

    downloadBlob('\uFEFF' + csvStr, 'text/csv;charset=utf-8;', filename);
    if (UI.showToast) UI.showToast(`📋 CSV (${filename}) exportado correctamente`, 'success');
  }

  /**
   * Exporta datos en formato Excel (.xlsx / HTML Table Excel).
   */
  function exportExcel(data, columns, filename, title, subtitle = '') {
    const UI = window.App.UI || {};
    const H = window.App.Helpers || {};
    const escape = H.escapeHtml || (s => s);

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
        <x:Name>${escape(title)}</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
        </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin:0; padding:10px; }
          .header-title { font-size: 16px; font-weight: bold; background-color: #0a2647; color: #ffffff; padding: 10px; }
          .meta-info { font-size: 12px; color: #475569; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #0077b6; color: #ffffff; font-weight: bold; border: 1px solid #023e8a; padding: 8px; text-align: left; }
          td { padding: 8px; border: 1px solid #cbd5e1; font-size: 13px; text-align: left; }
          tr:nth-child(even) { background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <div class="header-title">CONTROL ANIMAL SELWO MARINA — ${escape(title)}</div>
        <div class="meta-info">Fecha: ${new Date().toLocaleString()} | Registros: ${data.length}${subtitle ? ' | ' + escape(subtitle) : ''}</div>
        <table>
          <thead>
            <tr>
              ${columns.map(c => `<th>${escape(c.label)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${columns.map(c => `<td>${escape(formatCellValue(row, c))}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    downloadBlob('\uFEFF' + excelHtml, 'application/vnd.ms-excel;charset=utf-8;', filename);
    if (UI.showToast) UI.showToast(`📊 Excel (.xlsx) exportado correctamente`, 'success');
  }

  /**
   * Exporta datos en formato de texto estético (.txt).
   */
  function exportText(data, columns, filename, title, subtitle = '') {
    const UI = window.App.UI || {};
    let txt = `================================================================================\n`;
    txt += `CONTROL ANIMAL SELWO MARINA - ${title.toUpperCase()}\n`;
    txt += `================================================================================\n`;
    txt += `Fecha del Reporte: ${new Date().toLocaleString()}\n`;
    txt += `Total Registros:   ${data.length}\n`;
    if (subtitle) txt += `Filtros:           ${subtitle}\n`;
    txt += `--------------------------------------------------------------------------------\n\n`;

    data.forEach((row, idx) => {
      txt += `[#${idx + 1}]\n`;
      columns.forEach(c => {
        const val = formatCellValue(row, c);
        txt += `  • ${c.label.padEnd(25, ' ')}: ${val}\n`;
      });
      txt += `\n`;
    });

    txt += `================================================================================\n`;
    txt += `FIN DEL REPORTE\n`;
    txt += `================================================================================\n`;

    downloadBlob('\uFEFF' + txt, 'text/plain;charset=utf-8;', filename);
    if (UI.showToast) UI.showToast(`📄 Documento de texto (.txt) exportado correctamente`, 'success');
  }

  /**
   * Genera una vista de impresión limpia y profesional.
   */
  function printReport({ title = 'Reporte Selwo Marina', subtitle = '', columns = [], data = [] }) {
    const UI = window.App.UI || {};
    const H = window.App.Helpers || {};
    const escape = H.escapeHtml || (s => s);

    if (!data || data.length === 0) {
      if (UI.showToast) UI.showToast('No hay datos para imprimir.', 'warning');
      else alert('No hay datos para imprimir.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      if (UI.showToast) UI.showToast('Permite la apertura de ventanas emergentes para imprimir.', 'warning');
      return;
    }

    const rowsHtml = data.map(row => `
      <tr>
        ${columns.map(c => `<td>${escape(formatCellValue(row, c))}</td>`).join('')}
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${escape(title)}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; margin: 0; padding: 20px; font-size: 12px; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0a2647; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 700; color: #0a2647; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
          .meta { font-size: 11px; color: #475569; text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background-color: #f1f5f9; color: #0f172a; font-weight: 600; text-align: left; padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 11px; text-transform: uppercase; }
          td { padding: 8px 10px; border: 1px solid #e2e8f0; font-size: 11px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; font-size: 10px; color: #94a3b8; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">🦭 ${escape(title)}</h1>
            ${subtitle ? `<div class="subtitle">${escape(subtitle)}</div>` : ''}
          </div>
          <div class="meta">
            <div><strong>Selwo Marina</strong></div>
            <div>Fecha: ${new Date().toLocaleDateString()}</div>
            <div>Registros: ${data.length}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              ${columns.map(c => `<th>${escape(c.label)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Documento oficial generado por Control Animal Selwo — ${new Date().toLocaleString()}
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  return {
    exportData,
    printReport,
    downloadBlob
  };
})();
