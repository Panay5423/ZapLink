import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './cors/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { RegisterComponent } from './features/auth/register/register.component';
export const routes: Routes = [
    {
        path: 'auth', component: AuthLayoutComponent, children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent }
        ]

    },
    {
        path: 'dashboard', component: MainLayoutComponent, canActivate: [authGuard]
    }
];
