
import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Post } from './post/post';
import { CreatePost } from './create-post/create-post';
import { EditPost } from './edit-post/edit-post';
import { Dashboard } from './dashboard/dashboard';
import { PostsList } from './posts-list/posts-list';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { AuthGuard, AdminGuard } from './auth.guard';

export const routes: Routes = [
    {path:"", redirectTo:"/home", pathMatch:"full"},
    {path:"login", component:Login},
    {path:"home", component:Home},
    {path:"posts", component:PostsList},
    {path:"post/:id", component:Post},
    {path:"edit-post/:id", component:EditPost, canActivate: [AuthGuard]},
    {path:"create-post", component:CreatePost, canActivate: [AuthGuard]},
    {path:"dashboard", component:Dashboard, canActivate: [AuthGuard]},
    {path:"admin-dashboard", component:AdminDashboard, canActivate: [AdminGuard]}
];
