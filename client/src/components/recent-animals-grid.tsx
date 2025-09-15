import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { Link } from "wouter";
import { AnimalReport } from "@shared/schema";

export default function RecentAnimalsGrid() {
  const { data: animals, isLoading } = useQuery<AnimalReport[]>({
    queryKey: ['/api/reports'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const recentAnimals = animals?.slice(0, 6) || [];

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const reportDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Há poucos minutos";
    if (diffInHours === 1) return "Há 1 hora";
    if (diffInHours < 24) return `Há ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Há 1 dia";
    return `Há ${diffInDays} dias`;
  };

  return (
    <div className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Animais Recentes</h3>
          <p className="text-muted-foreground">Veja os últimos animais registrados que precisam de ajuda</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentAnimals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <MapPin className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p className="text-lg">Nenhum animal registrado ainda</p>
              <p className="text-sm">Seja o primeiro a registrar um animal que precisa de ajuda!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentAnimals.map((animal) => (
              <Card 
                key={animal.id} 
                className="animal-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                data-testid={`card-animal-${animal.id}`}
              >
                <div className="h-48 bg-muted relative">
                  <img 
                    src={`/api/images/${animal.pathPhoto}`}
                    alt={`${animal.animalTipo} encontrado`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE2MCAyMDBIMjQwTDIwMCAxNTBaIiBmaWxsPSIjOUI5QjlCIi8+Cjwvc3ZnPg==';
                    }}
                    data-testid={`img-animal-${animal.id}`}
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      {animal.animalTipo}
                    </Badge>
                    <Badge variant="secondary">
                      {animal.animalRaca}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2 flex items-center">
                    <MapPin className="mr-1 h-3 w-3" />
                    <span data-testid={`text-animal-location-${animal.id}`}>
                      {animal.bairro && animal.cidade 
                        ? `${animal.bairro}, ${animal.cidade}`
                        : 'Localização não disponível'
                      }
                    </span>
                  </div>
                  
                  {animal.comentario && (
                    <p className="text-sm text-foreground mb-3 line-clamp-2" data-testid={`text-animal-description-${animal.id}`}>
                      {animal.comentario}
                    </p>
                  )}
                  
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    <span data-testid={`text-animal-time-${animal.id}`}>
                      Registrado {formatTimeAgo(animal.datetime)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/map">
            <Button variant="secondary" size="lg" data-testid="button-view-all-map">
              Ver Todos no Mapa
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
