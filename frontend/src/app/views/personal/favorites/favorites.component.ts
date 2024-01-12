import {Component, inject, OnInit} from '@angular/core';
import {environment} from "../../../../environments/environment.development";
import {FavoritesService} from "../../../shared/services/favorites.service";
import {FavoritesType} from "../../../../types/favorites.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HotToastService} from "@ngneat/hot-toast";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent implements OnInit {


  serverStaticPath = environment.serverStaticPath;
  products: FavoritesType[] = [];
  count: number = 1;
  cart: CartType | null = null;

  private favoritesService = inject(FavoritesService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private toast = inject(HotToastService);


  ngOnInit() {

    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.cart = data as CartType;

        this.showFavorites();
      });

  }

  showFavorites() {
    if (this.authService.getIsLoggedIn()) {
      this.favoritesService.getFavorites()
        .subscribe((data: FavoritesType[] | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            const error = (data as DefaultResponseType).message;
            throw new Error(error);
          }

          if (this.cart && this.cart.items.length > 0) {
            this.products = (data as FavoritesType[]).map((product: FavoritesType) => {
              if (this.cart) {
                const productInCart = this.cart.items.find(item => item.product.id === product.id);
                if (productInCart) {
                  product.countInCart = productInCart.quantity;
                }
              }
              return product;
            });
            console.log(this.products)
          } else {
            this.products = data as FavoritesType[];
            this.count =1;
          }
        });
    }
  }

  removeFromFavorites(id: string) {
    this.favoritesService.removeFavorites(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          // ..
          // throw new Error(data.message);
          this.toast.error(data.message);
        }

        this.products = this.products.filter(item => item.id !== id);
        this.toast.info('Товар удален из избранного!');
      })
  }

  updateCount(product: FavoritesType, value: number) {
    this.count = value;
    if (product.countInCart) {
      this.cartService.updateCart(product.id, this.count)
        .subscribe((data: CartType | DefaultResponseType) => {
          if((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          product.countInCart = this.count;
        });
    }

  }

  addToCart(product: FavoritesType):void {

    if(product) {
      this.cartService.updateCart(product.id, this.count)
        .subscribe((data: CartType | DefaultResponseType) => {
          if((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          product.countInCart = this.count;
          this.toast.success('Товар добавлен в корзину!', {duration: 3000});
        });
    }

  }

  removeFromCart(product: FavoritesType):void {
    this.cartService.updateCart(product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        product.countInCart = 0;
        this.count = 1;
        this.toast.warning('Товар удален из корзины!', {duration: 3000});
      });
  }

}
