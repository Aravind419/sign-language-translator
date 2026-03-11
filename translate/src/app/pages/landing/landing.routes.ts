import {Routes} from '@angular/router';
import {AboutComponent} from './about/about.component';
import {LandingComponent} from './landing.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    children: [
      {path: '', component: AboutComponent},
      {path: 'about', redirectTo: ''},
    ],
  },
];
