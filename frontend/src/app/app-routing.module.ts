import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './dashboard/guard/auth.guard'; 
import { PostComponent } from './post/post.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ResetPassworComponent } from './reset-passwor/reset-passwor.component';
import { FeedComponent } from './pages/feed/feed.component';
import { StoriesComponent } from './pages/stories/stories.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { FriendsComponent } from './pages/friends/friends.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfileViewComponent } from './pages/profile-view/profile-view.component';


 const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/blank', pathMatch: 'full' },
  {
    path: 'reset-password/:token', component:ResetPassworComponent
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'feed', component: FeedComponent },
      { path: 'stories', component: StoriesComponent },
      { path: 'friends', component: FriendsComponent },
      { path: 'settings', component: SettingsComponent },
      {path: 'user-profile' , component:ProfileComponent},
      {path: 'profile/:id', component:ProfileViewComponent},
    ],
  },
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
