import {inject, Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment.development";
import {HttpClient} from "@angular/common/http";
import {FavoritesType} from "../../../types/favorites.type";
import {DefaultResponseType} from "../../../types/default-response.type";

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private http = inject(HttpClient);

  constructor() { }
  getFavorites(): Observable<FavoritesType[] | DefaultResponseType> {
    return this.http.get<FavoritesType[] | DefaultResponseType>(environment.api + 'favorites');
  }

  removeFavorites(productId: string): Observable<DefaultResponseType> {
    return this.http.delete<DefaultResponseType>(environment.api + 'favorites', {
      body: {productId}
    });
  }

  addFavorites(productId: string): Observable<DefaultResponseType | FavoritesType> {
    return this.http.post<DefaultResponseType | FavoritesType>(environment.api + 'favorites', {productId});
  }
}
