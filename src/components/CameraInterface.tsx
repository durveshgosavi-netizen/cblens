import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RotateCcw, Check, X } from "lucide-react";

interface CameraInterfaceProps {
  onCapture: (imageUrl: string) => void;
  onCancel: () => void;
}

export default function CameraInterface({ onCapture, onCancel }: CameraInterfaceProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Mock camera capture - in real app this would use camera API
  const handleCapture = async () => {
    setIsCapturing(true);
    
    // Simulate camera capture delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock captured image URL
    const mockImageUrl = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center&auto=format&q=80";
    setCapturedImage(mockImageUrl);
    setIsCapturing(false);
  };

  const handleConfirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <Button variant="ghost" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Scan Plate</h2>
        <div className="w-10" />
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 relative overflow-hidden">
        <Card className="h-full border-0 rounded-none">
          <CardContent className="h-full p-0 relative">
            {capturedImage ? (
              <img 
                src={capturedImage} 
                alt="Captured plate" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full bg-gradient-to-b from-warm-cream to-fresh-mint flex items-center justify-center relative">
                {/* Mock camera viewfinder */}
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-64 h-48 border-2 border-dashed border-primary/40 rounded-lg bg-card/50 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Camera className="h-12 w-12 text-primary mx-auto" />
                        <p className="text-sm text-muted-foreground">Center your plate in the frame</p>
                      </div>
                    </div>
                    
                    {/* Corner guides */}
                    <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  </div>
                </div>

                {isCapturing && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-card px-6 py-4 rounded-lg shadow-floating">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-r-transparent rounded-full" />
                        <span className="font-medium">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="p-6 bg-card border-t">
        {capturedImage ? (
          <div className="flex gap-4">
            <Button variant="soft" className="flex-1" onClick={handleRetake}>
              <RotateCcw className="h-5 w-5 mr-2" />
              Retake
            </Button>
            <Button variant="confirm" className="flex-1" onClick={handleConfirmCapture}>
              <Check className="h-5 w-5 mr-2" />
              Use Photo
            </Button>
          </div>
        ) : (
          <Button 
            variant="scan" 
            size="lg" 
            className="w-full" 
            onClick={handleCapture}
            disabled={isCapturing}
          >
            <Camera className="h-5 w-5 mr-2" />
            {isCapturing ? "Capturing..." : "Capture Plate"}
          </Button>
        )}
      </div>
    </div>
  );
}