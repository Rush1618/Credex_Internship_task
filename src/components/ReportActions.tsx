'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, CalendarCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ReportActionsProps {
  isHighSavings: boolean;
}

export function ReportActions({ isHighSavings }: ReportActionsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownloadPDF = () => {
    if (typeof window !== 'undefined') {
      window.print();
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
        <Button onClick={handleDownloadPDF} variant="outline" className="flex-1 gap-2 border-white/10 text-white hover:bg-white/5">
          <Download className="h-4 w-4" />
          Download as PDF
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
