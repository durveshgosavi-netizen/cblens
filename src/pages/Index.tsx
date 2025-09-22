import { useState, useEffect } from "react";
import MenuView from "@/components/MenuView";
import CameraInterface from "@/components/CameraInterface";
import ScanResults from "@/components/ScanResults";
import AuthPage from "@/components/AuthPage";
import ScanHistory from "@/components/ScanHistory";
import Analytics from "@/components/Analytics";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, History, BarChart3, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AppState = "menu" | "camera" | "results";

const Index = () => {
  const { isAuthenticated, loading, signOut, profile } = useAuth();
  const [currentState, setCurrentState] = useState<AppState>("menu");
  const [activeTab, setActiveTab] = useState("menu");
  const [capturedImage, setCapturedImage] = useState<string>("");
  const { toast } = useToast();

  // Debug logging for state changes
  console.log("Index component rendering, currentState:", currentState);

  const handleAuthSuccess = () => {
    // User will be redirected automatically
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const handleStartScan = () => {
    console.log("Scan button clicked, changing state to camera");
    console.log("Current state before change:", currentState);
    setCurrentState("camera");
    console.log("State should now be camera");
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

  // Handle camera and results states (these should override the normal tab interface)
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

  // Normal tabbed interface when currentState is "menu"

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary-glow to-fresh-mint p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">CB Lens</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm">{profile?.full_name}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="menu"><Camera className="h-4 w-4 mr-2" />Menu</TabsTrigger>
            <TabsTrigger value="history"><History className="h-4 w-4 mr-2" />History</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="menu"><MenuView onStartScan={handleStartScan} /></TabsContent>
          <TabsContent value="history"><ScanHistory /></TabsContent>
          <TabsContent value="analytics"><Analytics /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
