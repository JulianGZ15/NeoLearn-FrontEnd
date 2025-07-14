import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Button, ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CursoDTO } from '../../../../dtos/cuso.dto';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CursosClientService } from '../../services/cursosClient.service';
import { Tag, TagModule } from 'primeng/tag';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    ButtonModule,
    ChipModule,
    CardModule,
    CommonModule,
    TagModule,
    ProgressSpinner
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardClientComponent implements OnInit {
  cursosInscritos: CursoDTO[] = [];
  cursosDisponibles: CursoDTO[] = [];
  loading = false;
  portadasCache: { [key: string]: SafeUrl } = {};

  constructor(
    private cursosService: CursosClientService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cargarCursos();
  }

  cargarCursos(): void {
    this.loading = true;
    
    // Cargar cursos inscritos
    this.cursosService.listarCursosInscritos().subscribe({
      next: (cursos) => {
        this.cursosInscritos = cursos;
        this.cargarPortadas(cursos);
      },
      error: (error) => {
        console.error('Error al cargar cursos inscritos:', error);
      }
    });

    // Cargar cursos disponibles para compra
    this.cursosService.listarCursosDisponiblesParaCompra().subscribe({
      next: (cursos) => {
        this.cursosDisponibles = cursos;
        this.cargarPortadas(cursos);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cursos disponibles:', error);
        this.loading = false;
      }
    });
  }

  cargarPortadas(cursos: CursoDTO[]): void {
    cursos.forEach(curso => {
      if (curso.portada && !this.portadasCache[curso.portada]) {
        this.cursosService.obtenerPortada(curso.portada).subscribe({
          next: (blob) => {
            const objectURL = URL.createObjectURL(blob);
            this.portadasCache[curso.portada!] = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          },
          error: (error) => {
            console.error('Error al cargar portada:', error);
          }
        });
      }
    });
  }

  getPortadaUrl(nombreArchivo: string | undefined): SafeUrl | string {
    if (!nombreArchivo) return 'assets/default-course-image.jpg';
    return this.portadasCache[nombreArchivo] || 'assets/default-course-image.jpg';
  }

  openCourse(curso: CursoDTO): void {
    console.log("Abriendo curso:", curso.titulo);
    // Aquí puedes navegar al curso o abrir un modal
    // this.router.navigate(['/curso', curso.cveCurso]);
  }

  buyCourse(curso: CursoDTO): void {
    console.log("Comprando curso:", curso.titulo);
    // Aquí implementarías la lógica de compra
    // Podrías abrir un modal de pago o navegar a una página de checkout
  }

  formatearPrecio(precio: number | undefined): string {
    if (!precio) return 'Gratis';
    return `$${precio.toLocaleString('es-MX')}`;
  }

  get totalCursosInscritos(): number {
    return this.cursosInscritos.length;
  }

  get cursosCompletados(): number {
    // Asumiendo que tienes un campo de estado que indica si está completado
    return this.cursosInscritos.filter(curso => curso.estado === 'COMPLETADO').length;
  }

  get horasEstudio(): number {
    // Esto sería calculado basado en el progreso del usuario
    // Por ahora retornamos un valor de ejemplo
    return this.cursosInscritos.length * 10; // 10 horas promedio por curso
  }

  verDetalleCurso(curso: CursoDTO): void {
  this.router.navigate(['client/curso-detalle', curso.cveCurso]);
}

  videos(curso: CursoDTO): void {
    this.router.navigate(['client/curso/videos', curso.cveCurso]);
  }

}