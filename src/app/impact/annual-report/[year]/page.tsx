'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import dynamic from 'next/dynamic';

// Dynamically import the PDF viewer to avoid SSR issues
const PDFViewer = dynamic(() => import('@/components/pdf/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading PDF viewer...</p>
      </div>
    </div>
  ),
});

// Map years to report filenames
const reportFiles: Record<string, string> = {
  '2024': 'Masinyusane Annual Report 2024 (R).pdf',
  '2023': '2023 Masinyusane Annual Report (RSA).pdf',
  '2022': '2022 Masinyusane Annual Report (R).pdf',
};

export default function AnnualReportViewerPage() {
  const params = useParams();
  const year = params.year as string;

  const reportFile = reportFiles[year];
  const pdfUrl = reportFile ? `/reports/${reportFile}` : null;

  if (!reportFile) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Report Not Found</h1>
            <p className="text-gray-600 mb-8">
              The annual report for {year} is not available yet.
            </p>
            <Link
              href="/impact/reports"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Reports
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/impact/reports"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Reports
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">
                {year} Annual Report
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <PDFViewer pdfUrl={pdfUrl!} />
        </div>
      </div>

      <Footer />
    </div>
  );
}