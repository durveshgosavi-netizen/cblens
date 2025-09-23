import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RotateCcw, Check, X, Upload } from "lucide-react";

interface CameraInterfaceProps {
  onCapture: (imageUrl: string) => void;
  onCancel: () => void;
}

export default function CameraInterface({ onCapture, onCancel }: CameraInterfaceProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showUploadOption, setShowUploadOption] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('Camera API not supported');
        setShowUploadOption(true);
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure video loads and plays
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
      }
    } catch (error) {
      console.error('Camera access denied or not available:', error);
      setShowUploadOption(true);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
    }
    
    setIsCapturing(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
              <div className="h-full relative">
                {stream && !showUploadOption ? (
                  <div className="relative h-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Camera overlay guides */}
                    <div className="absolute inset-4 pointer-events-none">
                      <div className="relative w-full h-full max-w-sm mx-auto">
                        <div className="absolute inset-0 border-2 border-dashed border-white/60 rounded-lg" />
                        <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
                        <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
                        <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg" />
                      </div>
                      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                        <p className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                          Center your plate in the frame
                        </p>
                      </div>
                    </div>

                    {isCapturing && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-card px-6 py-4 rounded-lg shadow-floating">
                          <div className="flex items-center gap-3">
                            <div className="animate-spin h-5 w-5 border-2 border-primary border-r-transparent rounded-full" />
                            <span className="font-medium">Capturing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full bg-gradient-to-b from-warm-cream to-fresh-mint flex items-center justify-center relative">
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <div className="w-64 h-48 border-2 border-dashed border-primary/40 rounded-lg bg-card/50 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <Camera className="h-12 w-12 text-primary mx-auto" />
                            <p className="text-sm text-muted-foreground">Camera not available</p>
                            <p className="text-xs text-muted-foreground">Upload a photo instead</p>
                          </div>
                        </div>
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
          <div className="space-y-3">
            {stream && !showUploadOption ? (
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
            ) : (
              <Button 
                variant="scan" 
                size="lg" 
                className="w-full" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Photo
              </Button>
            )}
            
            {stream && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Or upload from gallery
              </Button>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}