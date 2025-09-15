import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, MessageCircle, Phone, Navigation } from "lucide-react";
import { AnimalReport } from "@shared/schema";

interface AnimalDetailModalProps {
  animal: AnimalReport;
  onClose: () => void;
}

export default function AnimalDetailModal({ animal, onClose }: AnimalDetailModalProps) {
  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const reportDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "há poucos minutos";
    if (diffInHours === 1) return "há 1 hora";
    if (diffInHours < 24) return `há ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "há 1 dia";
    return `há ${diffInDays} dias`;
  };

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${animal.latitude},${animal.longitude}`;
    window.open(url, '_blank');
  };

  const contactPerson = () => {
    if (!animal.contato) return;
    
    // Check if it's a phone number or email
    if (animal.contato.includes('@')) {
      window.location.href = `mailto:${animal.contato}`;
    } else {
      // Remove any non-digit characters for phone
      const phoneNumber = animal.contato.replace(/\D/g, '');
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="relative">
          <img 
            src={`/api/images/${animal.pathPhoto}`}
            alt={`${animal.animalTipo} encontrado`}
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE2MCAyMDBIMjQwTDIwMCAxNTBaIiBmaWxsPSIjOUI5QjlCIi8+Cjwvc3ZnPg==';
            }}
            data-testid="img-animal-detail"
          />
          <Button 
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
            onClick={onClose}
            data-testid="button-close-detail"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {formatTimeAgo(animal.datetime)}
          </div>
        </div>

        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-primary text-primary-foreground" data-testid="badge-animal-type">
              {animal.animalTipo}
            </Badge>
            <Badge variant="secondary" data-testid="badge-animal-breed">
              {animal.animalRaca}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-chart-2 mt-1 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium" data-testid="text-animal-street">
                  {animal.rua || 'Endereço não disponível'}
                </div>
                <div className="text-muted-foreground" data-testid="text-animal-neighborhood">
                  {animal.bairro && animal.cidade && animal.estado
                    ? `${animal.bairro}, ${animal.cidade} - ${animal.estado}`
                    : 'Detalhes do endereço não disponíveis'
                  }
                </div>
              </div>
            </div>

            {animal.comentario && (
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <p className="text-sm" data-testid="text-animal-comment">
                  {animal.comentario}
                </p>
              </div>
            )}

            {animal.contato && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-chart-1 mt-1 flex-shrink-0" />
                <span className="text-sm" data-testid="text-animal-contact">
                  {animal.contato}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            {animal.contato && (
              <Button 
                className="flex-1" 
                onClick={contactPerson}
                data-testid="button-contact"
              >
                <Phone className="mr-2 h-4 w-4" />
                Contatar
              </Button>
            )}
            <Button 
              variant="secondary" 
              className={`${animal.contato ? 'flex-1' : 'w-full'} bg-chart-2 hover:bg-chart-2/90 text-white`}
              onClick={openDirections}
              data-testid="button-directions"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Rotas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
