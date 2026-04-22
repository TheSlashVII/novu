// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserAPIService}  from '../services/user-api.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = inject(UserAPIService).getToken();
    if (token) {
        req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
    return next(req);
};
