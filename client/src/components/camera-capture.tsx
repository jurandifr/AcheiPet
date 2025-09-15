import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, X, RotateCcw } from "lucide-react";
import { useCamera } from "@/hooks/use-camera";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { stream, error, startCamera, stopCamera } = useCamera();
  const { toast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro de câmera",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    onCapture(imageData);
    stopCamera();
    setIsCapturing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Capturar Foto</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-camera">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                data-testid="video-camera-preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Camera className="mx-auto h-12 w-12 mb-2" />
                  <p>Iniciando câmera...</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <Button
              onClick={capturePhoto}
              disabled={!stream || isCapturing}
              size="lg"
              className="rounded-full w-16 h-16"
              data-testid="button-capture-photo"
            >
              {isCapturing ? (
                <RotateCcw className="h-6 w-6 animate-spin" />
              ) : (
                <Camera className="h-6 w-6" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
