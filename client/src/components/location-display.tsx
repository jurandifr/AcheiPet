import { Button } from "@/components/ui/button";
import { MapPin, RotateCcw } from "lucide-react";

interface LocationDisplayProps {
  location: { latitude: number; longitude: number } | null;
  error: string | null;
  onRefresh: () => void;
}

export default function LocationDisplay({ location, error, onRefresh }: LocationDisplayProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Localização</label>
      <div className="bg-muted rounded-lg p-3 text-sm">
        {location ? (
          <>
            <div className="flex items-center gap-2 text-chart-2 mb-1">
              <MapPin className="h-4 w-4" />
              <span data-testid="text-location-address">
                Aguardando endereço...
              </span>
            </div>
            <div className="text-muted-foreground text-xs" data-testid="text-location-coordinates">
              Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
            </div>
          </>
        ) : error ? (
          <div className="text-destructive text-center">
            <MapPin className="mx-auto h-4 w-4 mb-1" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="text-muted-foreground text-center">
            <MapPin className="mx-auto h-4 w-4 mb-1" />
            <p>Obtendo localização...</p>
          </div>
        )}
      </div>
      <Button 
        type="button" 
        variant="link" 
        size="sm" 
        onClick={onRefresh}
        className="text-primary p-0 h-auto"
        data-testid="button-refresh-location"
      >
        <RotateCcw className="mr-1 h-3 w-3" />
        Atualizar localização
      </Button>
    </div>
  );
}
