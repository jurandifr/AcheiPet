import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { X, Camera, Upload, MapPin, RotateCcw, Check, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CameraCapture from "./camera-capture";
import LocationDisplay from "./location-display";
import { useGeolocation } from "@/hooks/use-geolocation";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  description: z.string().optional(),
  contact: z.string().optional(),
});

interface RegistrationFormProps {
  onClose: () => void;
}

export default function RegistrationForm({ onClose }: RegistrationFormProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ tipo: string; raca: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { location, error: locationError, getCurrentLocation } = useGeolocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      contact: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { 
      photo: File; 
      latitude: number; 
      longitude: number; 
      comentario?: string; 
      contato?: string; 
    }) => {
      const formData = new FormData();
      formData.append('photo', data.photo);
      formData.append('latitude', data.latitude.toString());
      formData.append('longitude', data.longitude.toString());
      if (data.comentario) formData.append('comentario', data.comentario);
      if (data.contato) formData.append('contato', data.contato);

      const response = await fetch('/api/reports', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to register animal');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Animal registrado com sucesso!",
        description: `Tipo: ${data.animalTipo}, Raça: ${data.animalRaca}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar animal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setShowCamera(false);
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

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!capturedImage) {
      toast({
        title: "Foto obrigatória",
        description: "Por favor, tire ou carregue uma foto do animal.",
        variant: "destructive",
      });
      return;
    }

    if (!location) {
      toast({
        title: "Localização obrigatória",
        description: "Por favor, permita o acesso à localização.",
        variant: "destructive",
      });
      return;
    }

    const photoFile = dataURLtoFile(capturedImage, 'animal-photo.jpg');
    
    submitMutation.mutate({
      photo: photoFile,
      latitude: location.latitude,
      longitude: location.longitude,
      comentario: values.description || undefined,
      contato: values.contact || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle>Registrar Animal</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-form">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Camera Section */}
              <div className="space-y-3">
                <FormLabel>Foto do Animal</FormLabel>
                <div className="camera-preview aspect-square rounded-lg border-2 border-dashed border-border bg-muted flex items-center justify-center">
                  {capturedImage ? (
                    <img 
                      src={capturedImage} 
                      alt="Animal capturado" 
                      className="w-full h-full object-cover rounded-lg"
                      data-testid="img-captured-animal"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Camera className="mx-auto h-12 w-12 mb-2" />
                      <p>Toque para tirar foto</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    className="flex-1" 
                    onClick={() => setShowCamera(true)}
                    data-testid="button-take-picture"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Tirar Foto
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="button-upload"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Location Section */}
              <LocationDisplay 
                location={location}
                error={locationError}
                onRefresh={getCurrentLocation}
              />

              {/* AI Analysis Preview */}
              {aiAnalysis && (
                <div className="bg-accent rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-accent-foreground" />
                    <span className="text-sm font-medium text-accent-foreground">Análise IA</span>
                  </div>
                  <div className="text-sm text-accent-foreground" data-testid="text-ai-analysis">
                    <span>{aiAnalysis.tipo}</span> - <span>{aiAnalysis.raca}</span>
                  </div>
                </div>
              )}

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ex: Cachorro dócil, parece estar com fome..."
                        className="resize-none"
                        rows={3}
                        data-testid="textarea-description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Field */}
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Telefone ou e-mail para contato"
                        data-testid="input-contact"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitMutation.isPending}
                data-testid="button-submit-report"
              >
                {submitMutation.isPending ? (
                  <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {submitMutation.isPending ? "Registrando..." : "Registrar Animal"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture 
          onCapture={handleImageCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
