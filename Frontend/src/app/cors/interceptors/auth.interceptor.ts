import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log("authInterceptor");
  console.log("req", req);
  console.log(req.url)
  const token = localStorage.getItem('token');

  if (token && req.url.includes('auth') || req.url.includes('social')) {
    console.log("token......", token);
    const reqWithHeader = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
    return next(reqWithHeader);
  }
  if (token && req.url.includes('action')) {

    return next(req);
  }

  return next(req);
};
