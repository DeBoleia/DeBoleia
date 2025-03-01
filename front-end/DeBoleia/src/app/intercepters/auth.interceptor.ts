import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticatorService } from '../services/authenticator.service';
import { LoadingService } from '../services/loading-service.service';
import { finalize } from 'rxjs/operators';

export function AuthInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const authService = inject(AuthenticatorService);
  const token = authService.getToken();
  const loadingService = inject(LoadingService);

  loadingService.setLoading(true);

  let clonedReq = req;

  if (token) {
    clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  return next(clonedReq).pipe(
    finalize(() => {
      loadingService.setLoading(false);
    })
  );
}
