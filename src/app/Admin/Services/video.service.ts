import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoDTO } from '../../../dtos/video.dto';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

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

  crearVideo(cveCurso: number, video: VideoDTO): Observable<VideoDTO> {
    return this.http.post<VideoDTO>(`${this.apiUrl}/${cveCurso}`, video, {
      headers: this.getHeaders()
    });
  }

  actualizarVideo(cveCurso: number, video: VideoDTO): Observable<VideoDTO> {
    return this.http.put<VideoDTO>(`${this.apiUrl}/${cveCurso}`, video, {
      headers: this.getHeaders()
    });
  }

  eliminarVideo(cveVideo: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cveVideo}`, {
      headers: this.getHeaders()
    });
  }


  subirPortada(videoId: number, file: File): Observable<VideoDTO> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token') || ''}`
      // No 'Content-Type', let browser set it for multipart/form-data
    });

    return this.http.post<VideoDTO>(
      `${this.apiUrl}/${videoId}/portada`,
      formData,
      { headers }
    );
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
