import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, PawPrint, MapPin, Calendar, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { AnimalReport } from "@shared/schema";
import { format } from "date-fns";
import AnimalDetailModal from "@/components/animal-detail-modal";
import { useState } from "react";

export default function MyReportsPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalReport | null>(null);

  const { data: reports, isLoading } = useQuery<AnimalReport[]>({
    queryKey: ["/api/reports/my"],
    enabled: isAuthenticated,
  });

  const getAnimalIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      "Cão": "🐕",
      "Gato": "🐈",
      "Outro": "🐾"
    };
    return icons[tipo] || "🐾";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Autenticação Necessária</h2>
            <p className="text-muted-foreground mb-4">
              Você precisa estar autenticado para ver seus relatórios.
            </p>
            <Button onClick={() => window.location.href = "/api/login"} data-testid="button-login">
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <PawPrint className="text-xl" />
              </div>
              <h1 className="text-xl font-semibold">Meus Relatórios</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="secondary" data-testid="button-home">
                  <Home className="mr-2 h-4 w-4" />
                  Início
                </Button>
              </Link>
              
              {isAuthenticated && user && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} className="object-cover" />
                    <AvatarFallback>
                      {user.firstName?.[0] || user.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = "/api/logout"}
                    data-testid="button-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Meus Relatórios de Animais</h2>
          <p className="text-muted-foreground">
            Todos os animais que você reportou estão listados aqui.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-48 w-full mb-4 rounded-md" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <Card 
                key={report.id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedAnimal(report)}
                data-testid={`card-report-${report.id}`}
              >
                <div className="relative h-48 bg-muted">
                  <img
                    src={`/api/images/${report.pathPhoto}`}
                    alt={`${report.animalTipo} - ${report.animalRaca}`}
                    className="w-full h-full object-cover"
                    data-testid={`img-report-${report.id}`}
                  />
                  <div className="absolute top-2 right-2 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-sm font-medium">
                    {getAnimalIcon(report.animalTipo)} {report.animalTipo}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2" data-testid={`text-breed-${report.id}`}>
                    {report.animalRaca}
                  </h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">
                        {[report.rua, report.bairro, report.cidade]
                          .filter(Boolean)
                          .join(", ") || "Localização não disponível"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(report.datetime), "dd/MM/yyyy 'às' HH:mm")}</span>
                    </div>
                  </div>
                  {report.comentario && (
                    <p className="mt-3 text-sm line-clamp-2" data-testid={`text-comment-${report.id}`}>
                      {report.comentario}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <PawPrint className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum relatório ainda</h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não reportou nenhum animal. Comece a ajudar pets em situação de rua!
              </p>
              <Link href="/">
                <Button data-testid="button-report-animal">
                  Reportar Animal
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      {selectedAnimal && (
        <AnimalDetailModal
          animal={selectedAnimal}
          isOpen={!!selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
        />
      )}
    </div>
  );
}
