import { HttpInterceptorFn } from '@angular/common/http';

export const interceptorsInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
