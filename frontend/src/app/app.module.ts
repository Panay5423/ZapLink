import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { PostComponent } from './post/post.component';
import { ResetPassworComponent } from './reset-passwor/reset-passwor.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { NewPostComponent } from './new-post/new-post.component';
import { FeedComponent } from './pages/feed/feed.component';
import { StoriesComponent } from './pages/stories/stories.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { FriendsComponent } from './pages/friends/friends.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfileViewComponent } from './pages/profile-view/profile-view.component';


@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    PostComponent,
    ResetPassworComponent,
    DashboardComponent,
    SidebarComponent,
    TopbarComponent,
    NewPostComponent,
    FeedComponent,
    StoriesComponent,
    SettingsComponent,
    FriendsComponent,
    ProfileComponent,
    ProfileViewComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,  
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
