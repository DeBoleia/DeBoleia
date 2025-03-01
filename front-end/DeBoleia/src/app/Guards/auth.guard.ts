import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthenticatorService } from '../services/authenticator.service';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthenticatorService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const requiresAuth = route.data['requiresAuth'] || false;

    if (!requiresAuth) {
      return true; // Permite acesso a rotas públicas
    }

    if (this.authService.isLoggedIn()) {
      return true; // Permite acesso a rotas protegidas se o usuário está autenticado
    } else {
      this.authService.saveTargetUrl(state.url); // Salva a URL alvo para redirecionamento após login
      this.router.navigate(['/login']); // Redireciona para login
      return false; // Bloqueia acesso
    }
  }
}
