import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Step {
  number: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
})
export class WelcomeComponent {
  private router = inject(Router);

  currentYear = new Date().getFullYear();
  // signals are like a record to save stuff inside of them. Is like an object
  steps = signal<Step[]>([
    {
      number: '01',
      title: 'Regístrate con tu correo universitario',
      description: 'Solo se admiten cuentas con dominio de universidad reconocida. Tu identidad queda verificada desde el primer momento.',
    },
    {
      number: '02',
      title: 'Crea tu perfil y elige tus intereses',
      description: 'Añade tu carrera, universidad, hobbies y lo que buscas. Cuanto más completo, mejores conexiones.',
    },
    {
      number: '03',
      title: 'Descubre perfiles y queda en persona',
      description: 'Desliza, conecta y organiza quedadas. El match sucede cuando hay interés mutuo.',
    },
  ];

  features: Feature[] = [
    {
      icon: 'check',
      title: '100% verificado',
      description: 'Solo estudiantes con carnet de estudiante válido. Sin bots, sin cuentas falsas. Una comunidad real y de confianza.',
    },
    {
      icon: 'users',
      title: '100% conexiones reales',
      description: 'Novu fomenta el encuentro en persona. El chat es el puente, el café es el destino.',
    },
    {
      icon: 'shield',
      title: 'Privacidad primero',
      description: 'Controla qué compartes y con quién. Tu información no se vende ni se usa para publicidad.',
    },
    {
      icon: 'chat',
      title: 'Chat integrado',
      description: 'Cuando hay match, podéis hablar directamente desde la app. Sencillo y sin fricciones.',
    },
    {
      icon: 'filter',
      title: 'Filtra por instituto, estudios o intereses',
      description: 'Encuentra estudiantes de tu misma universidad o de otras ciudades. Novu adapta los perfiles a tu contexto.',
    },
  ];

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
