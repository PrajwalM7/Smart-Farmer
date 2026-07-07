import React from 'react';
import html2canvas from 'html2canvas/dist/html2canvas.min.js';
import { jsPDF } from 'jspdf/dist/jspdf.es.min.js';
import { FiDownload } from 'react-icons/fi';
import '../../styles/DashboardCards.css';

/**
 * ExportButton
 * A premium‑styled button that captures the dashboard (or any provided element) and exports it as a PDF.
 * Utilises html2canvas for DOM rendering and jsPDF for PDF generation.
 *
 * Props:
 *   - targetId (string): DOM id of the element to capture. Defaults to "dashboard".
 *   - fileName (string): Desired name for the generated PDF (without extension).
 */
const ExportButton = ({ targetId = 'dashboard', fileName = 'Smart_Farmer_Dashboard' }) => {
  const handleExport = async () => {
    try {
      const element = document.getElementById(targetId);
      if (!element) {
        console.error(`ExportButton: No element found with id '${targetId}'.`);
        return;
      }
      // Render the element to canvas
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      console.error('ExportButton error:', err);
    }
  };

  return (
    <button className="export-btn" onClick={handleExport} title="Export dashboard as PDF">
      <FiDownload size={16} style={{ marginRight: '6px' }} /> Export PDF
    </button>
  );
};

export default ExportButton;
