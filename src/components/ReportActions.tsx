'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, CalendarCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ReportActionsProps {
  uuid: string;
  isHighSavings: boolean;
}

export function ReportActions({ uuid, isHighSavings }: ReportActionsProps) {
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadPDF = async () => {
    try {
      setIsExporting(true);
      const response = await fetch(`/api/audit/${uuid}/export`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Audit_Report_${uuid.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to generate PDF. Please try again or contact support.');
    } finally {
      setIsExporting(false);
    }
  };


  const handleBookConsultation = () => {
    // You can redirect to a calendly link or mailto
    window.location.href = 'mailto:hello@credex.rocks?subject=Credex Consultation Request';
  };

  if (!mounted) return null;

  return (
    <Card className="shadow-md print:hidden">
      <CardHeader>
        <CardTitle className="text-lg">Next Steps</CardTitle>
        <CardDescription>
          Save this report for your records or share it with your team.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={handleDownloadPDF} 
          disabled={isExporting}
          variant="outline" 
          className="flex-1 gap-2 border-white/10 text-white hover:bg-white/5"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Download as PDF'}
        </Button>

        
        {isHighSavings && (
          <Button onClick={handleBookConsultation} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-500 text-white">
            <CalendarCheck className="h-4 w-4" />
            Book Free Consultation
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
