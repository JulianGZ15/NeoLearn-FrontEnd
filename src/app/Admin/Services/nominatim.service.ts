import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    town?: string;
    village?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

export interface AddressComponents {
  direccion_completa: string;
  calle: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  pais: string;
  latitud: number;
  longitud: number;
  place_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class NominatimService {
  private baseUrl = 'https://nominatim.openstreetmap.org';

  constructor(private http: HttpClient) { }

  searchAddresses(query: string, countryCode: string = 'mx'): Observable<NominatimResult[]> {
    const params = {
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '5',
      countrycodes: countryCode
    };

    return this.http.get<NominatimResult[]>(`${this.baseUrl}/search`, { params });
  }

  extractAddressComponents(result: NominatimResult): AddressComponents {
    const address = result.address || {};
    
    return {
      direccion_completa: result.display_name,
      calle: `${address.house_number || ''} ${address.road || ''}`.trim(),
      colonia: address.suburb || address.neighbourhood || '',
      ciudad: address.city || address.town || address.village || '',
      estado: address.state || '',
      codigo_postal: address.postcode || '',
      pais: address.country || '',
      latitud: parseFloat(result.lat),
      longitud: parseFloat(result.lon),
      place_id: result.place_id.toString()
    };
  }
}
