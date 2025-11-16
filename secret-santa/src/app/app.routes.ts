import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
    { path: '', component: RegisterComponent },
    { path: 'admin', component: AdminComponent },
];
