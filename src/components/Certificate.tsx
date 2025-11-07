import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface CertificateProps {
  courseTitle: string;
  userName: string;
  completedAt: string;
  courseLevel: string;
  durationHours: number;
}

export const Certificate = ({
  courseTitle,
  userName,
  completedAt,
  courseLevel,
  durationHours,
}: CertificateProps) => {
  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 print:hidden">
        <Button onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download Certificate
        </Button>
      </div>

      <Card className="certificate-container p-12 bg-background border-2 border-primary/20 relative overflow-hidden">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-primary/30" />
        <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-primary/30" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-primary/30" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-primary/30" />

        <div className="text-center space-y-8">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Certificate of Completion</h1>
            <p className="text-muted-foreground">This is to certify that</p>
          </div>

          {/* User Name */}
          <div className="py-4 border-b-2 border-primary/30">
            <h2 className="text-3xl font-bold text-primary">{userName}</h2>
          </div>

          {/* Course Details */}
          <div className="space-y-4">
            <p className="text-muted-foreground">has successfully completed the course</p>
            <h3 className="text-2xl font-semibold text-foreground">{courseTitle}</h3>
            <div className="flex justify-center gap-8 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Level:</span> {courseLevel}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {durationHours} hours
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="pt-8 space-y-2">
            <p className="text-sm text-muted-foreground">Completion Date</p>
            <p className="text-lg font-medium text-foreground">
              {format(new Date(completedAt), "MMMM dd, yyyy")}
            </p>
          </div>

          {/* Signature Line */}
          <div className="pt-12 flex justify-center">
            <div className="w-64 border-t-2 border-foreground/20 pt-2">
              <p className="text-sm text-muted-foreground">Authorized Signature</p>
            </div>
          </div>
        </div>
      </Card>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-container,
          .certificate-container * {
            visibility: visible;
          }
          .certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 2px solid hsl(var(--primary) / 0.2);
            box-shadow: none;
          }
          @page {
            size: landscape;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};
