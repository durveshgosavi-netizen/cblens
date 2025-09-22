import { useState, useEffect, useCallback } from "react";
import MenuView from "@/components/MenuView";
import CameraInterface from "@/components/CameraInterface";
import ScanResults from "@/components/ScanResults";
import AuthPage from "@/components/AuthPage";
import ScanHistory from "@/components/ScanHistory";
import Analytics from "@/components/Analytics";
import MenuUpload from "@/components/MenuUpload";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, History, BarChart3, Camera, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
type AppState = "menu" | "camera" | "results";
const Index = () => {
  const {
    isAuthenticated,
    loading,
    signOut,
    profile
  } = useAuth();
  const [currentState, setCurrentState] = useState<AppState>("menu");
  const [activeTab, setActiveTab] = useState("menu");
  const [capturedImage, setCapturedImage] = useState<string>("");
  const {
    toast
  } = useToast();

  // Debug logging for state changes
  console.log("Index component rendering, currentState:", currentState);

  // Track state changes
  useEffect(() => {
    console.log("State changed to:", currentState);
  }, [currentState]);

  // All hooks must be before any early returns
  const handleStartScan = useCallback(() => {
    console.log("Scan button clicked, changing state to camera");
    console.log("Current state before change:", currentState);
    setCurrentState("camera");
    console.log("State should now be camera");
  }, [currentState]);
  const handleCaptureComplete = useCallback((imageUrl: string) => {
    setCapturedImage(imageUrl);
    setCurrentState("results");
  }, []);
  const handleCancelCamera = useCallback(() => {
    setCurrentState("menu");
  }, []);
  const handleBackFromResults = useCallback(() => {
    setCurrentState("menu");
  }, []);
  const handleRescan = useCallback(() => {
    setCurrentState("camera");
  }, []);
  const handleSaveScan = useCallback((result: any) => {
    toast({
      title: "Scan Saved Successfully",
      description: `${result.dish.name} (${result.portion}× portion) logged with ${result.nutrition.calories} kcal`
    });
    setCurrentState("menu");
  }, [toast]);
  const handleAuthSuccess = () => {
    // User will be redirected automatically
  };

  // Early returns come after all hooks
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
  }
  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Handle camera and results states (these should override the normal tab interface)
  if (currentState === "camera") {
    return <CameraInterface onCapture={handleCaptureComplete} onCancel={handleCancelCamera} />;
  }
  if (currentState === "results") {
    return <ScanResults capturedImage={capturedImage} onBack={handleBackFromResults} onSave={handleSaveScan} onRescan={handleRescan} />;
  }

  // Normal tabbed interface when currentState is "menu"

  return <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary-glow to-fresh-mint p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/src/assets/logo-cbk.png" alt="Cheval Blanc Kantiner" className="w-10 h-10 object-contain" />
            <h1 className="text-2xl font-bold text-gray-700">Lens</h1>
          </div>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="menu"><Camera className="h-4 w-4 mr-2" />Menu</TabsTrigger>
            <TabsTrigger value="history"><History className="h-4 w-4 mr-2" />History</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
            <TabsTrigger value="upload"><Upload className="h-4 w-4 mr-2" />Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="menu"><MenuView onStartScan={handleStartScan} /></TabsContent>
          <TabsContent value="history"><ScanHistory /></TabsContent>
          <TabsContent value="analytics"><Analytics /></TabsContent>
          <TabsContent value="upload"><MenuUpload /></TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default Index;