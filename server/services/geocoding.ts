export interface AddressInfo {
  rua?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export class GeocodingService {
  async reverseGeocode(latitude: number, longitude: number): Promise<AddressInfo> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AcheiUmPet/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      const address = data.address || {};

      return {
        rua: address.road || address.street || address.pedestrian,
        bairro: address.suburb || address.neighbourhood || address.residential,
        cidade: address.city || address.town || address.village || address.municipality,
        estado: address.state || address.region
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {};
    }
  }
}

export const geocodingService = new GeocodingService();
