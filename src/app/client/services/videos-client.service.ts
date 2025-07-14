import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoDTO } from '../../../dtos/video.dto';

@Injectable({
  providedIn: 'root'
})
export class VideosClientService {

    private apiUrl = `${environment.apiUrl}/api/videos`;


  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token'); // Obtén el token del sessionStorage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }



  listarVideos(cveCurso: number): Observable<VideoDTO[]> {
    return this.http.get<VideoDTO[]>(`${this.apiUrl}/${cveCurso}/videos`, {
      headers: this.getHeaders()
    });
  }

  obtenerVideoPorId(cveVideo: number): Observable<VideoDTO> {
    return this.http.get<VideoDTO>(`${this.apiUrl}/${cveVideo}`, {
      headers: this.getHeaders()
    });
  }

    obtenerPortada(nombreArchivo: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token') || ''}`
    });

    return this.http.get(
      `${this.apiUrl}/portada/${encodeURIComponent(nombreArchivo)}`,
      { headers, responseType: 'blob' }
    );
  }
}
