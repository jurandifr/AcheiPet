import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, MapPin, PawPrint, Map, Settings } from "lucide-react";
import RegistrationForm from "@/components/registration-form";
import RecentAnimalsGrid from "@/components/recent-animals-grid";

export default function Home() {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground rounded-lg p-2">
                <PawPrint className="text-xl" />
              </div>
              <h1 className="text-xl font-semibold">Achei um Pet</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/map">
                <Button variant="secondary" data-testid="button-view-map">
                  <Map className="mr-2 h-4 w-4" />
                  Ver Mapa
                </Button>
              </Link>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-r from-primary to-chart-2">
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ajude um Animal de Rua
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-light">
            Registre animais que precisam de ajuda ou encontre pets para resgatar próximo a você
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground px-8 py-4 text-lg hover:bg-primary/90 floating-button"
              onClick={() => setShowRegistrationForm(true)}
              data-testid="button-register-animal"
            >
              <Camera className="mr-2 h-5 w-5" />
              Registrar Animal
            </Button>
            <Link href="/map">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-card text-card-foreground px-8 py-4 text-lg hover:bg-card/90"
                data-testid="button-view-map-hero"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Ver Mapa
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2" data-testid="text-total-reports">
                --
              </div>
              <div className="text-muted-foreground">Animais Registrados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-chart-2 mb-2" data-testid="text-total-rescues">
                --
              </div>
              <div className="text-muted-foreground">Resgates Realizados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-chart-3 mb-2" data-testid="text-active-volunteers">
                --
              </div>
              <div className="text-muted-foreground">Voluntários Ativos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Animals Section */}
      <RecentAnimalsGrid />

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <RegistrationForm onClose={() => setShowRegistrationForm(false)} />
      )}
    </div>
  );
}
