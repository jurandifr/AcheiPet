import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Home, Plus, PawPrint, Dog, Cat, HelpCircle } from "lucide-react";
import MapView from "@/components/map-view";
import RegistrationForm from "@/components/registration-form";

export default function MapPage() {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedBreed, setSelectedBreed] = useState("all");

  const filterOptions = [
    { value: "all", label: "Todos", icon: PawPrint },
    { value: "Cão", label: "Cães", icon: Dog },
    { value: "Gato", label: "Gatos", icon: Cat },
    { value: "Outro", label: "Outros", icon: HelpCircle },
  ];

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
              <Link href="/">
                <Button variant="secondary" data-testid="button-home">
                  <Home className="mr-2 h-4 w-4" />
                  Início
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Filter Bar */}
      <Card className="border-b border-border rounded-none">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Filtros:</label>
            </div>
            <div className="flex gap-2 flex-wrap">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={activeFilter === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(option.value)}
                    className={activeFilter === option.value ? "bg-primary text-primary-foreground" : ""}
                    data-testid={`filter-${option.value}`}
                  >
                    <Icon className="mr-1 h-4 w-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
            <div className="ml-auto">
              <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                <SelectTrigger className="w-40" data-testid="select-breed">
                  <SelectValue placeholder="Todas as raças" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as raças</SelectItem>
                  <SelectItem value="SRD">SRD</SelectItem>
                  <SelectItem value="Labrador">Labrador</SelectItem>
                  <SelectItem value="Poodle">Poodle</SelectItem>
                  <SelectItem value="Golden Retriever">Golden Retriever</SelectItem>
                  <SelectItem value="Siamês">Siamês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Map Container */}
      <div className="relative">
        <MapView filters={{ tipo: activeFilter, raca: selectedBreed }} />
        
        {/* Floating Add Button */}
        <Button
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground floating-button z-40"
          onClick={() => setShowRegistrationForm(true)}
          data-testid="button-floating-add"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <RegistrationForm onClose={() => setShowRegistrationForm(false)} />
      )}
    </div>
  );
}
