import { useState } from "react";
import MenuView from "@/components/MenuView";
import CameraInterface from "@/components/CameraInterface";
import ScanResults from "@/components/ScanResults";
import { useToast } from "@/hooks/use-toast";

type AppState = "menu" | "camera" | "results";

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>("menu");
  const [capturedImage, setCapturedImage] = useState<string>("");
  const { toast } = useToast();

  const handleStartScan = () => {
    setCurrentState("camera");
  };

  const handleCaptureComplete = (imageUrl: string) => {
    setCapturedImage(imageUrl);
    setCurrentState("results");
  };

  const handleCancelCamera = () => {
    setCurrentState("menu");
  };

  const handleBackFromResults = () => {
    setCurrentState("menu");
  };

  const handleRescan = () => {
    setCurrentState("camera");
  };

  const handleSaveScan = (result: any) => {
    // In a real app, this would save to the backend
    toast({
      title: "Scan Saved Successfully",
      description: `${result.dish.name} (${result.portion}× portion) logged with ${result.nutrition.calories} kcal`,
    });
    setCurrentState("menu");
  };

  if (currentState === "camera") {
    return (
      <CameraInterface 
        onCapture={handleCaptureComplete}
        onCancel={handleCancelCamera}
      />
    );
  }

  if (currentState === "results") {
    return (
      <ScanResults
        capturedImage={capturedImage}
        onBack={handleBackFromResults}
        onSave={handleSaveScan}
        onRescan={handleRescan}
      />
    );
  }

  return <MenuView onStartScan={handleStartScan} />;
};

export default Index;
