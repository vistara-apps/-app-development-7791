import React, { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, FileText, Loader, AlertCircle } from 'lucide-react';
import { exportClaimToJson, exportClaimToCsv, exportClaimToPdf } from '../services/export';
import { useAuth } from '../hooks/useAuth';

const ExportOptions = ({ claimId, claimNumber }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const { hasAccess } = useAuth();

  const handleExport = async (format) => {
    // Check if user has access to export feature
    if (!hasAccess('exportData')) {
      alert('Export functionality is only available on Pro and Business plans. Please upgrade to access this feature.');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      let exportResult;

      switch (format) {
        case 'json':
          exportResult = await exportClaimToJson(claimId);
          break;
        case 'csv':
          exportResult = await exportClaimToCsv(claimId);
          break;
        case 'pdf':
          exportResult = await exportClaimToPdf(claimId);
          break;
        default:
          throw new Error('Invalid export format');
      }

      if (!exportResult.success) {
        throw new Error(exportResult.error);
      }

      // Create a download link and trigger the download
      const a = document.createElement('a');
      a.href = exportResult.url;
      a.download = exportResult.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up the URL object
      if (exportResult.cleanup) {
        exportResult.cleanup();
      }
    } catch (err) {
      setError(err.message || `Failed to export claim data as ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="glass-effect rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Export Claim Data</h3>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <p className="text-gray-400 mb-4">
        Export claim {claimNumber} data in your preferred format for integration with other systems.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleExport('json')}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <FileJson className="w-5 h-5" />
          )}
          Export as JSON
        </button>
        
        <button
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-5 h-5" />
          )}
          Export as CSV
        </button>
        
        <button
          onClick={() => handleExport('pdf')}
          disabled={isExporting || true} // PDF export is disabled in this demo
          className="flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <FileText className="w-5 h-5" />
          )}
          Export as PDF
          <span className="text-xs">(Coming Soon)</span>
        </button>
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        <p>
          <span className="font-medium">Note:</span> Exported data includes all photo analysis results and metadata.
        </p>
      </div>
    </div>
  );
};

export default ExportOptions;
