import { Component, ViewEncapsulation } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { HeaderComponent } from './components/header.component';
import { HeroComponent } from './components/hero.component';
import { FeaturesComponent } from './components/features.component';
import { HowItWorksComponent } from './components/how-it-works.component';
import { TestimonialsComponent } from './components/testimonials.component';
import { CtaComponent } from './components/cta.component';
import { FooterComponent } from './components/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroComponent, 
    FeaturesComponent,
    HowItWorksComponent,
    TestimonialsComponent,
    CtaComponent,
    FooterComponent
  ],
  styleUrl: './landing_styles.css',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="app">
      <app-header></app-header>
      <main>
        <app-hero></app-hero>
        <app-features></app-features>
        <app-how-it-works></app-how-it-works>
        <app-testimonials></app-testimonials>
        <app-cta></app-cta>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    main {
      flex: 1;
    }
  `]
})
export class appLanding {}

bootstrapApplication(appLanding);