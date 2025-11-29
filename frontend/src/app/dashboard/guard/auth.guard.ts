import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthServisec } from '../../services/auth.services';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthServisec, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.showToast('You need to login first.', 'error');
      this.router.navigate(['/login']);
      return of(false);
    }

    return this.authService.verifyToken().pipe(
      map((res: any) => {
        if (res.success) return true;

        this.handleExpired('Session expired. Please login again.');
        return false;
      }),
      catchError((err) => {
        console.error('Token verification failed:', err);
        const msg =
          err.error?.message || 'Session expired or invalid token. Please login again.';
        this.handleExpired(msg);
        return of(false);
      })
    );
  }

  private handleExpired(message: string) {
    this.showToast(message, 'error');
    localStorage.clear();
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2500);
  }

  private showToast(message: string, type: 'success' | 'error' = 'error') {
    const toast = document.createElement('div');
    toast.className = `auth-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }
}
