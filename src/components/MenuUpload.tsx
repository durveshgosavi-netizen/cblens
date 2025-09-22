import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function MenuUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [weekStartDate, setWeekStartDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.includes('spreadsheet') || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive"
        });
      }
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:... prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!file || !weekStartDate) {
      toast({
        title: "Missing information",
        description: "Please select a file and week start date",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileBase64 = await convertFileToBase64(file);
      
      const { data, error } = await supabase.functions.invoke('process-menu-upload', {
        body: {
          fileBase64,
          filename: file.name,
          weekStartDate
        }
      });

      if (error) throw error;

      toast({
        title: "Menu uploaded successfully",
        description: data.message
      });

      // Reset form
      setFile(null);
      setWeekStartDate("");
      const fileInput = document.getElementById('menu-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload menu file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload Weekly Menu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="week-start">Week Start Date</Label>
          <Input
            id="week-start"
            type="date"
            value={weekStartDate}
            onChange={(e) => setWeekStartDate(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="menu-file">Excel File</Label>
          <Input
            id="menu-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
          />
          {file && (
            <p className="text-sm text-muted-foreground mt-1">
              Selected: {file.name}
            </p>
          )}
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={!file || !weekStartDate || uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Uploading..." : "Upload Menu"}
        </Button>
      </CardContent>
    </Card>
  );
}