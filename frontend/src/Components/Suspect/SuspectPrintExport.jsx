import React from 'react';
import { getMediaUrl } from '../../utils/mediaUrl';
import jsPDF from 'jspdf';

const SuspectPrintExport = ({ suspect }) => {
  const formatDOB = (dob) => {
    if (!dob) return 'N/A';
    if (dob.day && dob.month && dob.year) return `${dob.day}/${dob.month}/${dob.year}`;
    if (dob.d && dob.m && dob.y) return `${dob.d}/${dob.m}/${dob.y}`;
    return 'N/A';
  };

  const buildPrintableHtml = (suspect) => {
    const fingerprintsHtml = (suspect.fingerprints || []).map(fp => `
        <div class="fingerprint-item">
          <div class="fingerprint-image">
            ${fp.url ? `<img src="${getMediaUrl(fp.url)}" style="width:100%;height:100%;object-fit:cover"/>` : '<div style="line-height:80px;color:#999;text-align:center;">No Image</div>'}
          </div>
          <div style="font-size:11px;color:#444;margin-top:6px;font-weight:bold;">${fp.name || 'Fingerprint'}</div>
        </div>
      `).join('');

    return `
      <html>
        <head>
          <title>Suspect Record - ${suspect.name || ''}</title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <style>
            @media print {
              body { font-family: Arial, sans-serif; color: #0B214A; padding: 20px; margin: 0; }
              .no-print { display: none !important; }
              .page-break { page-break-before: always; }
              .avoid-break { page-break-inside: avoid; }
            }
            @media screen {
              body { font-family: Arial, sans-serif; color: #0B214A; padding: 20px; background: white; }
            }
            .header { display:flex; gap:16px; align-items:flex-start; margin-bottom: 20px; }
            .photo { width:140px; height:180px; object-fit:cover; border:2px solid #0B214A; border-radius: 8px; }
            .meta h1 { margin:0; font-size:24px; font-weight: bold; }
            .meta div { margin: 4px 0; font-size: 14px; }
            .section { margin-top:20px; page-break-inside: avoid; }
            .section h3 { margin:0 0 10px 0; font-size:18px; font-weight: bold; border-bottom: 2px solid #0B214A; padding-bottom: 5px; }
            .kv { display:flex; gap:8px; margin-top:8px; }
            .k { width:180px; font-weight:600; min-width: 180px; }
            .v { flex: 1; }
            .fingerprint-container { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
            .fingerprint-item { width: 120px; text-align: center; }
            .fingerprint-image { width: 100px; height: 80px; border: 1px solid #0B214A; margin: 0 auto; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
            .status-badge { 
              display: inline-block; 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 12px; 
              font-weight: bold; 
              text-transform: uppercase;
              margin-bottom: 10px;
            }
            .status-wanted { background-color: #fee; color: #c00; border: 1px solid #c00; }
            .status-arrested { background-color: #ffc; color: #c60; border: 1px solid #c60; }
            .status-prison { background-color: #ffe; color: #c90; border: 1px solid #c90; }
            .status-released { background-color: #efe; color: #060; border: 1px solid #060; }
          </style>
        </head>
        <body>
          <div class="header">
            <div><img src="${getMediaUrl(suspect.photo) || '/images/PLogo.png'}" class="photo"/></div>
            <div class="meta">
              <h1>${suspect.name || 'Unknown'}</h1>
              <div><strong>Suspect ID:</strong> ${suspect.suspectId || 'N/A'}</div>
              <div><strong>NIC:</strong> ${suspect.nic || 'N/A'}</div>
              <div><strong>File Number:</strong> ${suspect.fileNumber || 'N/A'}</div>
              <div><strong>Record ID:</strong> ${suspect.recordId || 'N/A'}</div>
              <div><strong>Created By:</strong> ${suspect.createdBy || 'System'}</div>
            </div>
          </div>

          <div class="section">
            <h3>Suspect Status</h3>
            <div class="status-badge status-${suspect.suspectStatus?.replace(' ', '-') || 'unknown'}">${suspect.suspectStatus?.toUpperCase() || 'UNKNOWN'}</div>
            ${suspect.rewardPrice && suspect.suspectStatus === 'wanted' ? `<div><strong>Reward:</strong> LKR ${suspect.rewardPrice.toLocaleString()}</div>` : ''}
            ${suspect.arrestDate && suspect.suspectStatus === 'arrested' ? `<div><strong>Arrest Date:</strong> ${new Date(suspect.arrestDate).toLocaleDateString()}</div>` : ''}
            ${suspect.prisonDays && suspect.suspectStatus === 'in prison' ? `<div><strong>Prison Time:</strong> ${suspect.prisonDays} days</div>` : ''}
            ${suspect.releaseDate && suspect.suspectStatus === 'released' ? `<div><strong>Release Date:</strong> ${new Date(suspect.releaseDate).toLocaleDateString()}</div>` : ''}
          </div>

          <div class="section">
            <h3>Personal Details</h3>
            <div class="kv"><div class="k">Address:</div><div class="v">${suspect.address || 'N/A'}</div></div>
            <div class="kv"><div class="k">Date of Birth:</div><div class="v">${formatDOB(suspect.dob)}</div></div>
            <div class="kv"><div class="k">Gender:</div><div class="v">${suspect.gender || 'N/A'}</div></div>
            <div class="kv"><div class="k">Citizenship:</div><div class="v">${suspect.citizen || 'N/A'}</div></div>
          </div>

          ${suspect.fingerprints && suspect.fingerprints.length > 0 ? `
            <div class="section">
              <h3>Fingerprints</h3>
              <div class="fingerprint-container">${fingerprintsHtml}</div>
            </div>
          ` : ''}

          <div class="section">
            <h3>Crime Information</h3>
            <div>${suspect.crimeInfo ? `<pre style="white-space:pre-wrap;font-family:inherit;background:#f9f9f9;padding:10px;border-radius:4px;">${suspect.crimeInfo}</pre>` : 'N/A'}</div>
          </div>

          <div class="footer">
            <div><strong>Record Created:</strong> ${suspect.createdAt ? new Date(suspect.createdAt).toLocaleString() : 'N/A'}</div>
            <div><strong>Last Updated:</strong> ${suspect.updatedAt ? new Date(suspect.updatedAt).toLocaleString() : 'N/A'}</div>
            <div style="margin-top: 10px; text-align: center; font-style: italic;">
              This is an official suspect record document generated by Police360 System
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrintRecord = (ev) => {
    ev.preventDefault();
    if (!suspect) return alert('No record to print');
    const html = buildPrintableHtml(suspect);
    const w = window.open('', '_blank', 'width=900,height=1000');
    w.document.open(); 
    w.document.write(html); 
    w.document.close();
    
    // Wait for the window to load, then trigger print
    w.onload = function() {
      setTimeout(() => {
        w.print();
      }, 500);
    };
  };

  const generatePDF = (suspect) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to safely add text with line wrapping
      const addText = (text, x, y, maxWidth = pageWidth - 40, fontSize = 12) => {
        if (!text) text = 'N/A';
        doc.setFontSize(fontSize);
        try {
          const lines = doc.splitTextToSize(String(text), maxWidth);
          doc.text(lines, x, y);
          return y + (lines.length * fontSize * 0.4) + 5;
        } catch {
          // Fallback for text that can't be split
          doc.text(String(text).substring(0, 50), x, y);
          return y + fontSize + 5;
        }
      };

      // Helper function to add a section header
      const addSectionHeader = (title, y) => {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(11, 33, 74);
        y = addText(title, 20, y, pageWidth - 40, 16);
        doc.setDrawColor(11, 33, 74);
        doc.line(20, y - 5, pageWidth - 20, y - 5);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        return y + 10;
      };

      // Header Section
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(11, 33, 74);
      yPosition = addText(`SUSPECT RECORD - ${suspect.name || 'Unknown'}`, 20, yPosition, pageWidth - 40, 20);
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      yPosition = addText(`Suspect ID: ${suspect.suspectId || 'N/A'}`, 20, yPosition);
      yPosition = addText(`NIC: ${suspect.nic || 'N/A'}`, 20, yPosition);
      yPosition = addText(`File Number: ${suspect.fileNumber || 'N/A'}`, 20, yPosition);
      yPosition = addText(`Record ID: ${suspect.recordId || 'N/A'}`, 20, yPosition);
      yPosition = addText(`Created By: ${suspect.createdBy || 'System'}`, 20, yPosition);

      // Status Section
      yPosition = addSectionHeader('Suspect Status', yPosition);
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      const statusColors = {
        'wanted': [255, 0, 0],
        'arrested': [255, 165, 0],
        'in prison': [255, 140, 0],
        'released': [0, 128, 0]
      };
      const statusColor = statusColors[suspect.suspectStatus] || [128, 128, 128];
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      yPosition = addText(`${suspect.suspectStatus?.toUpperCase() || 'UNKNOWN'}`, 20, yPosition, pageWidth - 40, 14);
      
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      
      if (suspect.rewardPrice && suspect.suspectStatus === 'wanted') {
        yPosition = addText(`Reward: LKR ${suspect.rewardPrice.toLocaleString()}`, 20, yPosition);
      }
      if (suspect.arrestDate && suspect.suspectStatus === 'arrested') {
        try {
          yPosition = addText(`Arrest Date: ${new Date(suspect.arrestDate).toLocaleDateString()}`, 20, yPosition);
        } catch {
          yPosition = addText(`Arrest Date: ${suspect.arrestDate}`, 20, yPosition);
        }
      }
      if (suspect.prisonDays && suspect.suspectStatus === 'in prison') {
        yPosition = addText(`Prison Time: ${suspect.prisonDays} days`, 20, yPosition);
      }
      if (suspect.releaseDate && suspect.suspectStatus === 'released') {
        try {
          yPosition = addText(`Release Date: ${new Date(suspect.releaseDate).toLocaleDateString()}`, 20, yPosition);
        } catch {
          yPosition = addText(`Release Date: ${suspect.releaseDate}`, 20, yPosition);
        }
      }

      // Personal Details Section
      yPosition = addSectionHeader('Personal Details', yPosition);
      
      const personalDetails = [
        ['Address', suspect.address || 'N/A'],
        ['Date of Birth', formatDOB(suspect.dob)],
        ['Gender', suspect.gender || 'N/A'],
        ['Citizenship', suspect.citizen || 'N/A']
      ];

      personalDetails.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold');
        yPosition = addText(`${label}:`, 20, yPosition);
        doc.setFont(undefined, 'normal');
        yPosition = addText(value, 60, yPosition - 5, pageWidth - 80);
        
        // Check if we need a new page
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
      });

      // Additional Information Sections
      if (suspect.crimeInfo) {
        yPosition = addSectionHeader('Crime Information', yPosition);
        yPosition = addText(suspect.crimeInfo, 20, yPosition, pageWidth - 40);
      }

      // Footer
      yPosition = Math.max(yPosition + 20, pageHeight - 40);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      try {
        doc.text(`Record Created: ${suspect.createdAt ? new Date(suspect.createdAt).toLocaleString() : 'N/A'}`, 20, yPosition);
        doc.text(`Last Updated: ${suspect.updatedAt ? new Date(suspect.updatedAt).toLocaleString() : 'N/A'}`, 20, yPosition + 10);
      } catch {
        doc.text(`Record Created: ${suspect.createdAt || 'N/A'}`, 20, yPosition);
        doc.text(`Last Updated: ${suspect.updatedAt || 'N/A'}`, 20, yPosition + 10);
      }
      doc.text('This is an official suspect record document generated by Police360 System', pageWidth - 20, yPosition + 10, { align: 'right' });

      return doc;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  };

  const handleExportPdf = (ev) => {
    ev.preventDefault();
    if (!suspect) {
      alert('No record to export');
      return;
    }
    
    try {
      // Show loading message
      const originalText = ev.target.textContent;
      ev.target.textContent = 'Generating PDF...';
      ev.target.disabled = true;
      
      // Generate PDF synchronously to avoid async issues
      const pdf = generatePDF(suspect);
      
      // Generate filename with suspect name and current date
      const date = new Date().toISOString().split('T')[0];
      const safeName = suspect.name ? suspect.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Unknown';
      const filename = `Suspect_Record_${safeName}_${date}.pdf`;
      
      // Save the PDF
      pdf.save(filename);
      
      // Reset button
      ev.target.textContent = originalText;
      ev.target.disabled = false;
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
      
      // Reset button
      ev.target.textContent = 'Export PDF';
      ev.target.disabled = false;
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <button onClick={handlePrintRecord} className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
        Print Record
      </button>
      <button onClick={handleExportPdf} className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
        Export PDF
      </button>
    </div>
  );
};

export default SuspectPrintExport;
