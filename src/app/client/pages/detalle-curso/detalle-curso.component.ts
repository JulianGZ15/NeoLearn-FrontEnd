import { Component, OnInit } from '@angular/core';
import { CursoDTO } from '../../../../dtos/cuso.dto';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CursosClientService } from '../../services/cursosClient.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ProgressSpinner } from 'primeng/progressspinner';


@Component({
  selector: 'app-detalle-curso',
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    CardModule,
    ProgressSpinner
  ],
  templateUrl: './detalle-curso.component.html',
  styleUrl: './detalle-curso.component.scss'
})
export class DetalleCursoComponent implements OnInit {
  curso: CursoDTO | null = null;
  loading = false;
  error = false;
  portadaUrl: SafeUrl | string = 'assets/default-course-image.jpg';
  comprando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cursosService: CursosClientService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.cargarDetalleCurso();
  }

  cargarDetalleCurso(): void {
    const cursoId = this.route.snapshot.paramMap.get('id');
    
    if (!cursoId) {
      this.error = true;
      return;
    }

    this.loading = true;
    this.error = false;

    this.cursosService.obtenerCursoPorId(+cursoId).subscribe({
      next: (curso) => {
        this.curso = curso;
        this.cargarPortada();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar el curso:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  cargarPortada(): void {
    if (this.curso?.portada) {
      this.cursosService.obtenerPortada(this.curso.portada).subscribe({
        next: (blob) => {
          const objectURL = URL.createObjectURL(blob);
          this.portadaUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        },
        error: (error) => {
          console.error('Error al cargar portada:', error);
          this.portadaUrl = 'assets/default-course-image.jpg';
        }
      });
    }
  }

  comprarCurso(): void {
    if (!this.curso) return;

    this.comprando = true;
    console.log('Comprando curso:', this.curso.titulo);
    
    // Aquí implementarías la lógica de compra
    // Por ejemplo, llamar a un servicio de compras
    
    // Simulación de compra
    setTimeout(() => {
      this.comprando = false;
      // Redirigir o mostrar mensaje de éxito
      alert('¡Compra realizada con éxito!');
      this.router.navigate(['/dashboard']);
    }, 2000);
  }

  inscribirseCurso(): void {
    if (!this.curso) return;

    this.comprando = true;
    console.log('Inscribiéndose al curso gratuito:', this.curso.titulo);
    
    // Aquí implementarías la lógica de inscripción gratuita
    
    // Simulación de inscripción
    setTimeout(() => {
      this.comprando = false;
      alert('¡Inscripción realizada con éxito!');
      this.router.navigate(['/dashboard']);
    }, 1500);
  }

  volver(): void {
    this.router.navigate(['client/dashboard']);
  }

  formatearPrecio(precio: number | undefined): string {
    if (!precio) return 'Gratis';
    return `$${precio.toLocaleString('es-MX')}`;
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getSeverityByEstado(estado: string | undefined): string {
    switch (estado) {
      case 'ACTIVO': return 'success';
      case 'INACTIVO': return 'danger';
      case 'BORRADOR': return 'warning';
      default: return 'info';
    }
  }
}