import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import PoliceHeader from "../PoliceHeader/PoliceHeader";
import { getMediaUrl } from '../../utils/mediaUrl';
import axiosInstance from "../../utils/axiosInstance";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CriminalProfile() {
  const [criminal, setCriminal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const { id: paramId } = useParams();
  const location = useLocation();

  // Get criminal ID from multiple sources
  const criminalId = paramId || 
                     new URLSearchParams(location.search).get('id') || 
                     localStorage.getItem('selectedCriminalId');

  useEffect(() => {
    if (criminalId) {
      fetchCriminalDetails(criminalId);
    } else {
      setError("No criminal ID provided");
      setLoading(false);
    }
  }, [criminalId]);

  const fetchCriminalDetails = async (id) => {
    try {
      const response = await axiosInstance.get(`/criminals/${id}`);
      setCriminal(response.data);
    } catch (err) {
      console.error('Error fetching criminal:', err);
      if (err.response) {
        setError(err.response.data?.message || "Failed to fetch criminal details");
      } else if (err.request) {
        setError("Network error. Please check if the server is running.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
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

    return `
      <html>
        <head>
          <title>Criminal Record - ${criminal.name || ''}</title>
          </br>
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
          <div class="header">
            <div><img src="${getMediaUrl(criminal.photo) || '/images/placeholder.png'}" class="photo"/></div>
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
            ${criminal.arrestDate && criminal.criminalStatus === 'arrested' ? `<div><strong>Arrest Date:</strong> ${new Date(criminal.arrestDate).toLocaleDateString()}</div>` : ''}
            ${criminal.prisonDays && criminal.criminalStatus === 'in prison' ? `<div><strong>Prison Time:</strong> ${criminal.prisonDays} days</div>` : ''}
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
            <div style="margin-top: 10px; text-align: center; font-style: italic;">
              This is an official criminal record document generated by Police360 System
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
        } catch (error) {
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
      if (criminal.arrestDate && criminal.criminalStatus === 'arrested') {
        try {
          yPosition = addText(`Arrest Date: ${new Date(criminal.arrestDate).toLocaleDateString()}`, 20, yPosition);
        } catch (error) {
          yPosition = addText(`Arrest Date: ${criminal.arrestDate}`, 20, yPosition);
        }
      }
      if (criminal.prisonDays && criminal.criminalStatus === 'in prison') {
        yPosition = addText(`Prison Time: ${criminal.prisonDays} days`, 20, yPosition);
      }
      if (criminal.releaseDate && criminal.criminalStatus === 'released') {
        try {
          yPosition = addText(`Release Date: ${new Date(criminal.releaseDate).toLocaleDateString()}`, 20, yPosition);
        } catch (error) {
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
            } catch (error) {
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

      // Additional Information Sections
      if (criminal.otherInfo) {
        yPosition = addSectionHeader('Other Information', yPosition);
        yPosition = addText(criminal.otherInfo, 20, yPosition, pageWidth - 40);
      }

      if (criminal.crimeInfo) {
        yPosition = addSectionHeader('Crime Information', yPosition);
        yPosition = addText(criminal.crimeInfo, 20, yPosition, pageWidth - 40);
      }

      // Footer
      yPosition = Math.max(yPosition + 20, pageHeight - 40);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      try {
        doc.text(`Record Created: ${criminal.createdAt ? new Date(criminal.createdAt).toLocaleString() : 'N/A'}`, 20, yPosition);
        doc.text(`Last Updated: ${criminal.updatedAt ? new Date(criminal.updatedAt).toLocaleString() : 'N/A'}`, 20, yPosition + 10);
      } catch (error) {
        doc.text(`Record Created: ${criminal.createdAt || 'N/A'}`, 20, yPosition);
        doc.text(`Last Updated: ${criminal.updatedAt || 'N/A'}`, 20, yPosition + 10);
      }
      doc.text('This is an official criminal record document generated by Police360 System', pageWidth - 20, yPosition + 10, { align: 'right' });

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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDOB = (dob) => {
    if (!dob) return "N/A";
    
    // Handle both old format (d, m, y) and new format (day, month, year)
    if (dob.day && dob.month && dob.year) {
      return `${dob.day}/${dob.month}/${dob.year}`;
    } else if (dob.d && dob.m && dob.y) {
      return `${dob.d}/${dob.m}/${dob.y}`;
    }
    
    return "N/A";
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'wanted': 'bg-red-100 text-red-800 border-red-200',
      'arrested': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in prison': 'bg-orange-100 text-orange-800 border-orange-200',
      'released': 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC]">
        <PoliceHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B214A] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading criminal details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !criminal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC]">
        <PoliceHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600">{error || "Criminal not found"}</p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-[#0B214A] text-white rounded hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              {/* Photo */}
              <div className="w-32 h-40 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                {criminal.photo ? (
                  <img 
                    src={getMediaUrl(criminal.photo)} 
                    alt="Criminal Photo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-sm">NO PHOTO</span>
                  </div>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-3xl font-bold text-[#0B214A]">{criminal.name || "Unknown"}</h1>
                  {getStatusBadge(criminal.criminalStatus)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-600">Criminal ID:</span>
                    <span className="ml-2 font-mono">#{criminal.criminalId || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">NIC:</span>
                    <span className="ml-2">{criminal.nic || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">File Number:</span>
                    <span className="ml-2 font-mono text-xs">{criminal.fileNumber || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Record ID:</span>
                    <span className="ml-2 font-mono text-xs">{criminal.recordId || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => navigate(`/CriminalManage/Criminal?edit=${criminal._id}`)}
                className="px-4 py-2 bg-[#0B214A] text-white rounded hover:bg-blue-700 text-sm"
              >
                Edit Record
              </button>
              <button onClick={handlePrintRecord} className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                Print Record
              </button>
              <button onClick={handleExportPdf} className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                Export PDF
              </button>
              <button 
                onClick={() => navigate('/CriminalManage/CriminalManage')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-600">Full Name:</span>
                    <p className="text-gray-800">{criminal.name || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Aliases:</span>
                    <p className="text-gray-800">{criminal.aliases || "None"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Date of Birth:</span>
                    <p className="text-gray-800">{formatDOB(criminal.dob)}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Gender:</span>
                    <p className="text-gray-800 capitalize">{criminal.gender || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Citizenship:</span>
                    <p className="text-gray-800">{criminal.citizen || "N/A"}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-600">Height:</span>
                    <p className="text-gray-800">{criminal.height ? `${criminal.height} cm` : "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Weight:</span>
                    <p className="text-gray-800">{criminal.weight ? `${criminal.weight} kg` : "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Eye Color:</span>
                    <p className="text-gray-800 capitalize">{criminal.eyeColor || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Hair Color:</span>
                    <p className="text-gray-800 capitalize">{criminal.hairColor || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Marital Status:</span>
                    <p className="text-gray-800 capitalize">{criminal.maritalStatus || "N/A"}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <span className="font-semibold text-gray-600">Address:</span>
                <p className="text-gray-800 mt-1">{criminal.address || "N/A"}</p>
              </div>
            </div>

            {/* Criminal Status Details */}
            {criminal.criminalStatus && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">
                  Status Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {criminal.criminalStatus === 'wanted' && criminal.rewardPrice && (
                    <div>
                      <span className="font-semibold text-gray-600">Reward Amount:</span>
                      <p className="text-red-600 font-bold text-lg">LKR {criminal.rewardPrice.toLocaleString()}</p>
                    </div>
                  )}
                  
                  {criminal.criminalStatus === 'arrested' && criminal.arrestDate && (
                    <div>
                      <span className="font-semibold text-gray-600">Arrest Date:</span>
                      <p className="text-gray-800">{formatDate(criminal.arrestDate)}</p>
                    </div>
                  )}
                  
                  {criminal.criminalStatus === 'in prison' && criminal.prisonDays && (
                    <div>
                      <span className="font-semibold text-gray-600">Prison Time:</span>
                      <p className="text-gray-800">{criminal.prisonDays} days</p>
                    </div>
                  )}
                  
                  {criminal.criminalStatus === 'released' && criminal.releaseDate && (
                    <div>
                      <span className="font-semibold text-gray-600">Release Date:</span>
                      <p className="text-gray-800">{formatDate(criminal.releaseDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Arrest & Sentencing History */}
            {criminal.arrests && criminal.arrests.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">
                  Arrest & Sentencing History
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Date</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Offense Code</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Institution</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Charge</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Term</th>
                      </tr>
                    </thead>
                    <tbody>
                      {criminal.arrests.map((arrest, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="px-3 py-2">{formatDate(arrest.date)}</td>
                          <td className="px-3 py-2 font-mono">{arrest.offenseCode || "N/A"}</td>
                          <td className="px-3 py-2">{arrest.institution || "N/A"}</td>
                          <td className="px-3 py-2">{arrest.charge || "N/A"}</td>
                          <td className="px-3 py-2">{arrest.term || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">
                Additional Information
              </h2>
              
              <div className="space-y-4">
                {criminal.otherInfo && (
                  <div>
                    <span className="font-semibold text-gray-600">Other Information:</span>
                    <p className="text-gray-800 mt-1 whitespace-pre-wrap">{criminal.otherInfo}</p>
                  </div>
                )}
                
                {criminal.crimeInfo && (
                  <div>
                    <span className="font-semibold text-gray-600">Crime Information:</span>
                    <p className="text-gray-800 mt-1 whitespace-pre-wrap">{criminal.crimeInfo}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fingerprints */}
            {criminal.fingerprints && criminal.fingerprints.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">
                  Fingerprints
                </h2>
                
                <div className="grid grid-cols-2 gap-3">
                        {criminal.fingerprints.map((print, index) => (
                    <div key={index} className="border border-gray-300 rounded p-2 text-center">
                      <div className="h-20 bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                        {print?.url ? (
                          <img src={getMediaUrl(print.url)} alt={`fp-${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-500">Print #{index + 1}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{print?.name || print?.url || `#${index + 1}`}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">Update Status</button>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Add New Arrest</button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">View Full History</button>
                </div>
              </div>
            )}

            {/* Record Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">
                Record Information
              </h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-600">Created By:</span>
                  <p className="text-gray-800">{criminal.createdBy || "System"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Last Updated:</span>
                  <p className="text-gray-800">{formatDate(criminal.updatedAt)}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Record Status:</span>
                  <p className="text-gray-800">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
