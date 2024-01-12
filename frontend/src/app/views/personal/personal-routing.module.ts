import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {FavoritesComponent} from "./favorites/favorites.component";
import {InfoComponent} from "./info/info.component";
import {OrdersComponent} from "./orders/orders.component";

const routes: Routes = [
  {path: 'favorites', component: FavoritesComponent},
  {path: 'profile', component: InfoComponent},
  {path: 'orders', component: OrdersComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonalRoutingModule { }
