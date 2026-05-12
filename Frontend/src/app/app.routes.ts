import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './cors/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomeComponent } from './features/home/home.component';
import { ProfileComponent } from './features/profile/profile.component';
import { FriendsComponent } from './features/friends/friends.component';

export const routes: Routes = [
    {
        path: 'auth', component: AuthLayoutComponent, children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent }
        ]

    },
    {
        path: 'dashboard/:id', component: MainLayoutComponent, canActivate: [authGuard],
    },
    {
        path: 'dashboard', component: MainLayoutComponent, canActivate: [authGuard],
        children: [
            { path: '', component: HomeComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'profile/:id', component: ProfileComponent },
            { path: 'followers', component: FriendsComponent }
        ]
    },
    {
        path: '', redirectTo: '/auth/login', pathMatch: 'full'
    }
];
// End of routes

// minor code update 1
