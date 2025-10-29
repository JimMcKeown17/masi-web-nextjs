'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, FileText } from 'lucide-react';

// Dynamic imports for PDF.js to avoid SSR issues
let Document: any;
let Page: any;
let pdfjs: any;

interface PDFViewerProps {
  pdfUrl: string;
  onLoadSuccess?: (info: { numPages: number }) => void;
  onLoadError?: (error: Error) => void;
}

export default function PDFViewer({ pdfUrl, onLoadSuccess, onLoadError }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [pdfLoaded, setPdfLoaded] = useState<boolean>(false);

  // Load PDF.js dynamically on client side
  useEffect(() => {
    const loadPdfJs = async () => {
      try {
        if (typeof window !== 'undefined') {
          const reactPdf = await import('react-pdf');
          Document = reactPdf.Document;
          Page = reactPdf.Page;
          pdfjs = reactPdf.pdfjs;

          // Configure PDF.js worker
          pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

          setPdfLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load PDF.js:', err);
        setError('Failed to load PDF viewer. Please refresh the page.');
        setLoading(false);
      }
    };

    loadPdfJs();
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    onLoadSuccess?.({ numPages });
  }

  function onDocumentLoadError(error: Error) {
    const errorMessage = 'Failed to load the annual report. Please try again later.';
    setError(errorMessage);
    setLoading(false);
    onLoadError?.(error);
    console.error('PDF load error:', error);
  }

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  if (!pdfLoaded || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!pdfLoaded ? 'Loading PDF viewer...' : 'Loading annual report...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Report</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Controls Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-4">
          {/* Download Button */}
          <a
            href={pdfUrl}
            download
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>

        <div className="flex items-center gap-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              className="p-2 text-gray-600 hover:text-blue-600 transition rounded hover:bg-gray-100"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-[4rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-2 text-gray-600 hover:text-blue-600 transition rounded hover:bg-gray-100"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2 text-gray-600 hover:text-blue-600 disabled:text-gray-300 transition rounded hover:bg-gray-100 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-[5rem] text-center">
              {numPages > 0 ? `${pageNumber} of ${numPages}` : ''}
            </span>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-2 text-gray-600 hover:text-blue-600 disabled:text-gray-300 transition rounded hover:bg-gray-100 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex justify-center bg-gray-100 p-4 min-h-[600px]">
        {pdfLoaded && Document && Page && (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading=""
            error=""
            className="max-w-full"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              className="shadow-lg border border-gray-200 bg-white"
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        )}
      </div>
    </>
  );
}