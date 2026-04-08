import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

interface Feature {
  icon: string;
  title: string;
  description: string;
  bgColor: string; 
}

interface Step {
  number: string;
  icon: string;
  title: string;
  description: string;
}

interface Avatar {
  id: number;
  initials: string;
  color: string;
}

interface Social {
  label: string;
  icon: string;
  href: string;
}

interface LinkColumn {
  title: string;
  links: string[];
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

  avatars = signal<Avatar[]>([
    { id: 1, initials: 'AL', color: 'linear-gradient(135deg,#7c3aed,#a855f7)' },
    { id: 2, initials: 'MR', color: 'linear-gradient(135deg,#f43f5e,#fb923c)' },
    { id: 3, initials: 'JK', color: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
    { id: 4, initials: 'SP', color: 'linear-gradient(135deg,#10b981,#06b6d4)' },
  ]);

  profileTags = signal<string[]>(['Diseño', 'Música', 'Fotografía']);

  features = signal<Feature[]>([
    {
      icon: '🔒',
      title: 'Conexión segura',
      description: 'Tu información está protegida. Solo ves lo que decides compartir y con quién.',
      bgColor: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(168,85,247,0.08))',
    },
    {
      icon: '🎓',
      title: 'Verificación de estudiante',
      description: 'Solo entran estudiantes verificados con carnet de estudiante. Sin bots ni perfiles falsos.',
      bgColor: 'linear-gradient(135deg, rgba(244,63,94,0.12), rgba(251,146,60,0.08))',
    },
    {
      icon: '✨',
      title: 'Match por intereses',
      description: 'Conectamos personas con intereses y estudios en común. No solo por fotos.',
      bgColor: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(244,63,94,0.08))',
    },
  ]);

  steps = signal <Step[]>([
    { number: '1', icon: '📝', title: 'Crea tu cuenta', description: 'Regístrate con tus datos.' },
    { number: '2', icon: '👤', title: 'Completa tu perfil', description: 'Añade tus intereses, estudios y lo que buscas.' },
    { number: '3', icon: '❤️', title: 'Da likes', description: 'Explora perfiles y dale like a quien te interese.' },
    { number: '4', icon: '💬', title: 'Chatea y queda', description: 'Si hay match, abre el chat y empieza a conoceros.' },
  ]);

  socials = signal<Social[]>([
    { label: 'Instagram', icon: '📷', href: '#' },
    { label: 'X', icon: '𝕏', href: '#' },
    { label: 'TikTok', icon: '▶', href: '#' },
  ]);

  linkColumns = signal<LinkColumn[]>([
    { title: 'Producto', links: ['Cómo funciona', 'Seguridad', 'Precios', 'Novedades'] },
    { title: 'Legal', links: ['Privacidad', 'Términos de uso', 'Cookies', 'Contacto'] },
  ]);

  goToLogin(): void { this.router.navigate(['/login']); }
  goToRegister(): void { this.router.navigate(['/register']); }
}
