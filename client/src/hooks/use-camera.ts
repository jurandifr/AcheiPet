import { useState, useCallback, useRef } from "react";

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Câmera não é suportada neste navegador");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment", // Use back camera if available
        },
      });

      setStream(mediaStream);
      streamRef.current = mediaStream;
    } catch (err: any) {
      let errorMessage = "Erro ao acessar câmera";
      
      if (err.name === "NotAllowedError") {
        errorMessage = "Permissão de câmera negada";
      } else if (err.name === "NotFoundError") {
        errorMessage = "Câmera não encontrada";
      } else if (err.name === "NotSupportedError") {
        errorMessage = "Câmera não suportada";
      }
      
      setError(errorMessage);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  return {
    stream,
    error,
    startCamera,
    stopCamera,
  };
}
