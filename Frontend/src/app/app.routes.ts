import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { PaymentComponent } from './payment/payment/payment';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'payment', component: PaymentComponent },
  { path: '**', redirectTo: '' },
];
