import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getMediaUrl } from '../../utils/mediaUrl';
import { 
  calculateTotalPrisonTime, 
  formatPrisonTime, 
  calculateTimeServed 
} from "../../utils/prisonTimeCalculator";

export default function CriminalPrintExport({ criminal }) {
  // Calculate prison time information
  const getPrisonTimeInfo = (criminal) => {
    if (!criminal?.arrests || criminal.arrests.length === 0) {
      return null;
    }

    const prisonTimeData = calculateTotalPrisonTime(criminal.arrests);
    
    if (prisonTimeData.totalDays === 0) {
      return null;
    }

    // Calculate time served for arrested, in prison, and released criminals
    let timeServedInfo = null;
    if ((criminal.criminalStatus === 'arrested' || criminal.criminalStatus === 'in prison' || criminal.criminalStatus === 'released') && criminal.arrestDate) {
      timeServedInfo = calculateTimeServed(
        criminal.arrestDate, 
        prisonTimeData.totalDays, 
        criminal.releaseDate
      );
    }

    return {
      ...prisonTimeData,
      timeServed: timeServedInfo
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const buildPrintableHtml = (criminal) => {
    const arrestsRows = (criminal.arrests || []).map(a => `
        <tr>
          <td style="padding:6px;border:1px solid #e6e6e6">${a.date ? new Date(a.date).toLocaleDateString() : 'N/A'}</td>
          <td style="padding:6px;border:1px solid #e6e6e6">${a.offenseCode || 'N/A'}</td>
          <td style="padding:6px;border:1px solid #e6e6e6">${a.institution || 'N/A'}</td>
          <td style="padding:6px;border:1px solid #e6e6e6">${a.charge || 'N/A'}</td>
          <td style="padding:6px;border:1px solid #e6e6e6">${a.term || 'N/A'}</td>
        </tr>
      `).join('');

    const fingerprintsHtml = (criminal.fingerprints || []).map(fp => `
        <div class="fingerprint-item">
          <div class="fingerprint-image">
            ${fp.url ? `<img src="${getMediaUrl(fp.url)}" style="width:100%;height:100%;object-fit:cover"/>` : '<div style="line-height:80px;color:#999;text-align:center;">No Image</div>'}
          </div>
          <div style="font-size:11px;color:#444;margin-top:6px;font-weight:bold;">${fp.name || 'Fingerprint'}</div>
        </div>
      `).join('');

    // Generate prison time analysis HTML
    const prisonInfo = getPrisonTimeInfo(criminal);
    const prisonTimeHtml = prisonInfo && (criminal.criminalStatus === 'arrested' || criminal.criminalStatus === 'in prison' || criminal.criminalStatus === 'released') ? `
      <div class="section">
        <h3>Prison Time Analysis</h3>
        <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <div style="margin-bottom: 10px;">
            <strong>Total Sentence:</strong> ${formatPrisonTime(prisonInfo.totalDays)} (${prisonInfo.totalDays} days total)
          </div>
          ${prisonInfo.timeServed ? `
            <div style="margin-bottom: 10px;">
              ${criminal.criminalStatus === 'arrested' ? `
                <strong>Time Since Arrest:</strong> ${formatPrisonTime(prisonInfo.timeServed.timeServed)} (${prisonInfo.timeServed.timeServed} days since arrest)
              ` : criminal.criminalStatus === 'in prison' ? `
                <strong>Time Served:</strong> ${formatPrisonTime(prisonInfo.timeServed.timeServed)} (${prisonInfo.timeServed.timeServed} days served)
                ${prisonInfo.timeServed.timeRemaining > 0 ? `
                  <br/><strong>Time Remaining:</strong> ${formatPrisonTime(prisonInfo.timeServed.timeRemaining)}
                ` : ''}
                ${prisonInfo.timeServed.isComplete ? `
                  <br/><span style="color: green; font-weight: bold;">✓ Sentence Completed</span>
                ` : ''}
              ` : criminal.criminalStatus === 'released' ? `
                <strong>Total Time Served:</strong> ${formatPrisonTime(prisonInfo.timeServed.timeServed)} (${prisonInfo.timeServed.timeServed} days total)
                ${prisonInfo.timeServed.isComplete ? `
                  <br/><span style="color: green; font-weight: bold;">✓ Sentence Completed</span>
                ` : `
                  <br/><span style="color: orange; font-weight: bold;">⚠ Early Release</span>
                `}
              ` : ''}
            </div>
          ` : ''}
          ${prisonInfo.breakdown.length > 0 ? `
            <div>
              <strong>Sentence Breakdown:</strong>
              <ul style="margin: 5px 0 0 20px;">
                ${prisonInfo.breakdown.map(item => `
                  <li style="margin-bottom: 5px;">
                    <strong>${item.charge}</strong> - ${item.date ? formatDate(item.date) : 'No date'} • Term: ${item.term} (${formatPrisonTime(item.days)})
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    ` : '';

    return `
      <html>
        <head>
          <title>Criminal Record - ${criminal.name || ''}</title>
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
            .police-header {
              display: flex;
              align-items: center;
              gap: 20px;
              background: #0B214A;
              color: white;
              padding: 15px;
              margin: -20px -20px 20px -20px;
              border-radius: 8px 8px 0 0;
            }
            .police-logo {
              font-size: 48px;
              background: white;
              color: #0B214A;
              width: 60px;
              height: 60px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .police-info h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .police-info h2 {
              margin: 5px 0 0 0;
              font-size: 16px;
              font-weight: normal;
            }
            .police-info p {
              margin: 5px 0 0 0;
              font-size: 12px;
              opacity: 0.9;
            }
            .report-title {
              text-align: center;
              font-size: 20px;
              font-weight: bold;
              color: #0B214A;
              margin: 20px 0;
              padding: 10px;
              background: #f8f9fa;
              border-radius: 4px;
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
            table { border-collapse:collapse; width:100%; margin-top:10px; }
            th, td { text-align:left; padding:8px; border:1px solid #0B214A; }
            th { background-color: #f0f4f8; font-weight: bold; }
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
          <div class="police-header">
            <div class="police-logo">🚔</div>
            <div class="police-info">
              <h1>SRI LANKA POLICE</h1>
              <h2>Police360 Management System</h2>
              <p>Official Criminal Record Report</p>
            </div>
          </div>
          <div class="report-title">CRIMINAL RECORD REPORT</div>

          <div class="header">
            <div><img src="${getMediaUrl(criminal.photo) || '/images/PLogo.png'}" class="photo"/></div>
            <div class="meta">
              <h1>${criminal.name || 'Unknown'}</h1>
              <div><strong>Criminal ID:</strong> ${criminal.criminalId || 'N/A'}</div>
              <div><strong>NIC:</strong> ${criminal.nic || 'N/A'}</div>
              <div><strong>File Number:</strong> ${criminal.fileNumber || 'N/A'}</div>
              <div><strong>Record ID:</strong> ${criminal.recordId || 'N/A'}</div>
              <div><strong>Created By:</strong> ${criminal.createdBy || 'System'}</div>
            </div>
          </div>

          <div class="section">
            <h3>Criminal Status</h3>
            <div class="status-badge status-${criminal.criminalStatus?.replace(' ', '-') || 'unknown'}">${criminal.criminalStatus?.toUpperCase() || 'UNKNOWN'}</div>
            ${criminal.rewardPrice && criminal.criminalStatus === 'wanted' ? `<div><strong>Reward:</strong> LKR ${criminal.rewardPrice.toLocaleString()}</div>` : ''}
            ${criminal.arrestDate && (criminal.criminalStatus === 'arrested' || criminal.criminalStatus === 'in prison' || criminal.criminalStatus === 'released') ? `<div><strong>Arrest Date:</strong> ${new Date(criminal.arrestDate).toLocaleDateString()}</div>` : ''}
            ${criminal.releaseDate && criminal.criminalStatus === 'released' ? `<div><strong>Release Date:</strong> ${new Date(criminal.releaseDate).toLocaleDateString()}</div>` : ''}
          </div>

          <div class="section">
            <h3>Personal Details</h3>
            <div class="kv"><div class="k">Address:</div><div class="v">${criminal.address || 'N/A'}</div></div>
            <div class="kv"><div class="k">Aliases:</div><div class="v">${criminal.aliases || 'N/A'}</div></div>
            <div class="kv"><div class="k">Date of Birth:</div><div class="v">${(criminal.dob ? (criminal.dob.day && criminal.dob.month && criminal.dob.year ? `${criminal.dob.day}/${criminal.dob.month}/${criminal.dob.year}` : (criminal.dob.d && criminal.dob.m && criminal.dob.y ? `${criminal.dob.d}/${criminal.dob.m}/${criminal.dob.y}` : 'N/A')) : 'N/A')}</div></div>
            <div class="kv"><div class="k">Gender:</div><div class="v">${criminal.gender || 'N/A'}</div></div>
            <div class="kv"><div class="k">Citizenship:</div><div class="v">${criminal.citizen || 'N/A'}</div></div>
            <div class="kv"><div class="k">Height:</div><div class="v">${criminal.height ? criminal.height + ' cm' : 'N/A'}</div></div>
            <div class="kv"><div class="k">Weight:</div><div class="v">${criminal.weight ? criminal.weight + ' kg' : 'N/A'}</div></div>
            <div class="kv"><div class="k">Eye Color:</div><div class="v">${criminal.eyeColor || 'N/A'}</div></div>
            <div class="kv"><div class="k">Hair Color:</div><div class="v">${criminal.hairColor || 'N/A'}</div></div>
            <div class="kv"><div class="k">Marital Status:</div><div class="v">${criminal.maritalStatus || 'N/A'}</div></div>
          </div>

          ${criminal.arrests && criminal.arrests.length > 0 ? `
            <div class="section">
              <h3>Arrest & Sentencing History</h3>
              <table>
                <thead>
                  <tr><th>Date</th><th>Offense Code</th><th>Institution</th><th>Charge</th><th>Term</th></tr>
                </thead>
                <tbody>
                  ${arrestsRows}
                </tbody>
              </table>
            </div>
          ` : ''}

          ${prisonTimeHtml}

          ${criminal.fingerprints && criminal.fingerprints.length > 0 ? `
            <div class="section">
              <h3>Fingerprints</h3>
              <div class="fingerprint-container">${fingerprintsHtml}</div>
            </div>
          ` : ''}

          <div class="section">
            <h3>Other Information</h3>
            <div>${criminal.otherInfo ? `<pre style="white-space:pre-wrap;font-family:inherit;background:#f9f9f9;padding:10px;border-radius:4px;">${criminal.otherInfo}</pre>` : 'N/A'}</div>
          </div>

          <div class="section">
            <h3>Crime Information</h3>
            <div>${criminal.crimeInfo ? `<pre style="white-space:pre-wrap;font-family:inherit;background:#f9f9f9;padding:10px;border-radius:4px;">${criminal.crimeInfo}</pre>` : 'N/A'}</div>
          </div>

          <div class="footer">
            <div><strong>Record Created:</strong> ${criminal.createdAt ? new Date(criminal.createdAt).toLocaleString() : 'N/A'}</div>
            <div><strong>Last Updated:</strong> ${criminal.updatedAt ? new Date(criminal.updatedAt).toLocaleString() : 'N/A'}</div>
            <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px; text-align: center;">
              <div style="font-weight: bold; color: #0B214A; margin-bottom: 5px;">SRI LANKA POLICE</div>
              <div style="font-size: 11px; color: #666; font-style: italic;">
                This is an official criminal record document generated by Police360 Management System<br/>
                Authorized for official use only - Confidential Document
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrintRecord = (ev) => {
    ev.preventDefault();
    if (!criminal) return alert('No record to print');
    const html = buildPrintableHtml(criminal);
    const w = window.open('', '_blank', 'width=900,height=1000');
    w.document.open(); 
    w.document.write(html); 
    w.document.close();
    
    // Wait for the window to load, then trigger print
    w.onload = function() {
      setTimeout(() => {
        w.print();
        // Close the window after printing (optional)
        // w.close();
      }, 500);
    };
  };

  const generatePDF = (criminal) => {
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

      // Police Header Section
      doc.setFillColor(11, 33, 74);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('SRI LANKA POLICE', 20, 15);
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text('Police360 Management System', 20, 25);
      doc.text('Official Criminal Record Report', 20, 35);
      yPosition = 60; // Adjust starting Y position for content

      // Report Title
      doc.setTextColor(11, 33, 74);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      yPosition = addText('CRIMINAL RECORD REPORT', pageWidth/2, yPosition, pageWidth - 40, 18);
      yPosition += 10;

      // Header Section
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(11, 33, 74);
      yPosition = addText(`CRIMINAL RECORD - ${criminal.name || 'Unknown'}`, 20, yPosition, pageWidth - 40, 20);
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      yPosition = addText(`Criminal ID: ${criminal.criminalId || 'N/A'}`, 20, yPosition);
      yPosition = addText(`NIC: ${criminal.nic || 'N/A'}`, 20, yPosition);
      yPosition = addText(`File Number: ${criminal.fileNumber || 'N/A'}`, 20, yPosition);
      yPosition = addText(`Record ID: ${criminal.recordId || 'N/A'}`, 20, yPosition);
      yPosition = addText(`Created By: ${criminal.createdBy || 'System'}`, 20, yPosition);

      // Status Section
      yPosition = addSectionHeader('Criminal Status', yPosition);
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      const statusColors = {
        'wanted': [255, 0, 0],
        'arrested': [255, 165, 0],
        'in prison': [255, 140, 0],
        'released': [0, 128, 0]
      };
      const statusColor = statusColors[criminal.criminalStatus] || [128, 128, 128];
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      yPosition = addText(`${criminal.criminalStatus?.toUpperCase() || 'UNKNOWN'}`, 20, yPosition, pageWidth - 40, 14);
      
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      
      if (criminal.rewardPrice && criminal.criminalStatus === 'wanted') {
        yPosition = addText(`Reward: LKR ${criminal.rewardPrice.toLocaleString()}`, 20, yPosition);
      }
      if (criminal.arrestDate && (criminal.criminalStatus === 'arrested' || criminal.criminalStatus === 'in prison' || criminal.criminalStatus === 'released')) {
        try {
          yPosition = addText(`Arrest Date: ${new Date(criminal.arrestDate).toLocaleDateString()}`, 20, yPosition);
        } catch {
          yPosition = addText(`Arrest Date: ${criminal.arrestDate}`, 20, yPosition);
        }
      }
      if (criminal.releaseDate && criminal.criminalStatus === 'released') {
        try {
          yPosition = addText(`Release Date: ${new Date(criminal.releaseDate).toLocaleDateString()}`, 20, yPosition);
        } catch {
          yPosition = addText(`Release Date: ${criminal.releaseDate}`, 20, yPosition);
        }
      }

      // Personal Details Section
      yPosition = addSectionHeader('Personal Details', yPosition);
      
      const personalDetails = [
        ['Address', criminal.address || 'N/A'],
        ['Aliases', criminal.aliases || 'N/A'],
        ['Date of Birth', criminal.dob ? 
          (criminal.dob.day && criminal.dob.month && criminal.dob.year ? 
            `${criminal.dob.day}/${criminal.dob.month}/${criminal.dob.year}` : 
            (criminal.dob.d && criminal.dob.m && criminal.dob.y ? 
              `${criminal.dob.d}/${criminal.dob.m}/${criminal.dob.y}` : 'N/A')) : 'N/A'],
        ['Gender', criminal.gender || 'N/A'],
        ['Citizenship', criminal.citizen || 'N/A'],
        ['Height', criminal.height ? `${criminal.height} cm` : 'N/A'],
        ['Weight', criminal.weight ? `${criminal.weight} kg` : 'N/A'],
        ['Eye Color', criminal.eyeColor || 'N/A'],
        ['Hair Color', criminal.hairColor || 'N/A'],
        ['Marital Status', criminal.maritalStatus || 'N/A']
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

      // Arrest & Sentencing History Section
      if (criminal.arrests && criminal.arrests.length > 0) {
        yPosition = addSectionHeader('Arrest & Sentencing History', yPosition);
        
        const arrestData = criminal.arrests.map(arrest => [
          arrest.date ? (() => {
            try {
              return new Date(arrest.date).toLocaleDateString();
            } catch {
              return String(arrest.date);
            }
          })() : 'N/A',
          arrest.offenseCode || 'N/A',
          arrest.institution || 'N/A',
          arrest.charge || 'N/A',
          arrest.term || 'N/A'
        ]);

        try {
          autoTable(doc, {
            startY: yPosition,
            head: [['Date', 'Offense Code', 'Institution', 'Charge', 'Term']],
            body: arrestData,
            styles: {
              fontSize: 10,
              cellPadding: 3,
            },
            headStyles: {
              fillColor: [240, 244, 248],
              textColor: [11, 33, 74],
              fontStyle: 'bold'
            },
            margin: { left: 20, right: 20 }
          });

          yPosition = doc.lastAutoTable.finalY + 20;
        } catch (error) {
          // Fallback if autoTable fails
          console.warn('AutoTable failed, using simple text format:', error);
          arrestData.forEach((row, index) => {
            yPosition = addText(`Arrest ${index + 1}: ${row.join(' | ')}`, 20, yPosition);
          });
        }
      }

      // Prison Time Analysis Section
      const prisonInfo = getPrisonTimeInfo(criminal);
      if (prisonInfo && (criminal.criminalStatus === 'arrested' || criminal.criminalStatus === 'in prison' || criminal.criminalStatus === 'released')) {
        yPosition = addSectionHeader('Prison Time Analysis', yPosition);
        
        // Background box for prison time analysis
        doc.setFillColor(240, 248, 255);
        doc.rect(15, yPosition - 10, pageWidth - 30, 60, 'F');
        doc.setDrawColor(200, 220, 255);
        doc.rect(15, yPosition - 10, pageWidth - 30, 60);
        
        yPosition = addText(`Total Sentence: ${formatPrisonTime(prisonInfo.totalDays)} (${prisonInfo.totalDays} days total)`, 20, yPosition);
        
        if (prisonInfo.timeServed) {
          if (criminal.criminalStatus === 'arrested') {
            yPosition = addText(`Time Since Arrest: ${formatPrisonTime(prisonInfo.timeServed.timeServed)} (${prisonInfo.timeServed.timeServed} days since arrest)`, 20, yPosition);
          } else if (criminal.criminalStatus === 'in prison') {
            yPosition = addText(`Time Served: ${formatPrisonTime(prisonInfo.timeServed.timeServed)} (${prisonInfo.timeServed.timeServed} days served)`, 20, yPosition);
            if (prisonInfo.timeServed.timeRemaining > 0) {
              yPosition = addText(`Time Remaining: ${formatPrisonTime(prisonInfo.timeServed.timeRemaining)}`, 20, yPosition);
            }
            if (prisonInfo.timeServed.isComplete) {
              doc.setTextColor(0, 128, 0);
              yPosition = addText('✓ Sentence Completed', 20, yPosition);
              doc.setTextColor(0, 0, 0);
            }
          } else if (criminal.criminalStatus === 'released') {
            yPosition = addText(`Total Time Served: ${formatPrisonTime(prisonInfo.timeServed.timeServed)} (${prisonInfo.timeServed.timeServed} days total)`, 20, yPosition);
            if (prisonInfo.timeServed.isComplete) {
              doc.setTextColor(0, 128, 0);
              yPosition = addText('✓ Sentence Completed', 20, yPosition);
              doc.setTextColor(0, 0, 0);
            } else {
              doc.setTextColor(255, 140, 0);
              yPosition = addText('⚠ Early Release', 20, yPosition);
              doc.setTextColor(0, 0, 0);
            }
          }
        }
        
        if (prisonInfo.breakdown.length > 0) {
          yPosition += 5;
          yPosition = addText('Sentence Breakdown:', 20, yPosition);
          prisonInfo.breakdown.forEach((item, index) => {
            const breakdownText = `${index + 1}. ${item.charge} - ${item.date ? formatDate(item.date) : 'No date'} • Term: ${item.term} (${formatPrisonTime(item.days)})`;
            yPosition = addText(breakdownText, 25, yPosition, pageWidth - 45);
          });
        }
        
        yPosition += 10;
      }

      // Additional Information Sections
      if (criminal.otherInfo) {
        yPosition = addSectionHeader('Other Information', yPosition);
        yPosition = addText(criminal.otherInfo, 20, yPosition, pageWidth - 40);
      }

      if (criminal.crimeInfo) {
        yPosition = addSectionHeader('Crime Information', yPosition);
        yPosition = addText(criminal.crimeInfo, 20, yPosition, pageWidth - 40);
      }

      // Police footer branding
      yPosition += 25;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(11, 33, 74);
      doc.text('SRI LANKA POLICE', pageWidth/2, yPosition, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text('This is an official criminal record document generated by Police360 Management System', pageWidth/2, yPosition + 8, { align: 'center' });
      doc.text('Authorized for official use only - Confidential Document', pageWidth/2, yPosition + 16, { align: 'center' });

      // Footer
      yPosition = Math.max(yPosition + 20, pageHeight - 40);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      try {
        doc.text(`Record Created: ${criminal.createdAt ? new Date(criminal.createdAt).toLocaleString() : 'N/A'}`, 20, yPosition);
        doc.text(`Last Updated: ${criminal.updatedAt ? new Date(criminal.updatedAt).toLocaleDateString() : 'N/A'}`, 20, yPosition + 10);
      } catch {
        doc.text(`Record Created: ${criminal.createdAt || 'N/A'}`, 20, yPosition);
        doc.text(`Last Updated: ${criminal.updatedAt || 'N/A'}`, 20, yPosition + 10);
      }

      return doc;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  };

  const handleExportPdf = (ev) => {
    ev.preventDefault();
    if (!criminal) {
      alert('No record to export');
      return;
    }
    
    try {
      // Show loading message
      const originalText = ev.target.textContent;
      ev.target.textContent = 'Generating PDF...';
      ev.target.disabled = true;
      
      // Generate PDF synchronously to avoid async issues
      const pdf = generatePDF(criminal);
      
      // Generate filename with criminal name and current date
      const date = new Date().toISOString().split('T')[0];
      const safeName = criminal.name ? criminal.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Unknown';
      const filename = `Criminal_Record_${safeName}_${date}.pdf`;
      
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
}
