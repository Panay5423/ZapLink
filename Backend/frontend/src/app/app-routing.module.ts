import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guard/auth.guard';
import { PostComponent } from './post/post.component';
import { DashBoardComponent } from './dash-board/dash-board.component';
import { ResetPassworComponent } from './reset-passwor/reset-passwor.component';


 const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/blank', pathMatch: 'full' },
  {
    path:' DashBoard' , component:DashBoardComponent
  },
  {
    path: 'reset-password/:token', component:ResetPassworComponent
  }
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
