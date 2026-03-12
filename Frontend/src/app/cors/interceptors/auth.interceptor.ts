import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log("authInterceptor");
  console.log("req", req);
  const token = localStorage.getItem('token');
  if (token && req.url.startsWith(req.url)) {
    console.log("token", token);
    const reqWithHeader = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
    return next(reqWithHeader);
  }
  return next(req);
};
