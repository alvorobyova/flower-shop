import {Component, inject, Input, OnInit} from '@angular/core';
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment.development";
import {CartService} from "../../services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {HotToastService} from "@ngneat/hot-toast";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {FavoritesType} from "../../../../types/favorites.type";
import {AuthService} from "../../../core/auth/auth.service";
import {FavoritesService} from "../../services/favorites.service";
import {Router} from "@angular/router";

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent implements OnInit {
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private favoritesService = inject(FavoritesService);
  private toast = inject(HotToastService);
  private router = inject(Router);

  @Input() product!: ProductType;
  @Input() isLight: boolean = false;
  @Input() countInCart: number | undefined = 0;

  serverStaticPath = environment.serverStaticPath;
  count: number = 1;
  isLogged: boolean = false;
  // isInCart: boolean = false;

  constructor() {
    this.isLogged = this.authService.getIsLoggedIn();
  }


  ngOnInit(): void {
    if(this.countInCart && this.countInCart > 1) {
      this.count = this.countInCart;
    }
  }

  addToCart() {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.countInCart = this.count;
        this.toast.success('Товар добавлен в корзину!', {duration: 3000});
      });
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.countInCart = 0;
        this.count = 1;
        this.toast.warning('Товар удален из корзины!', {duration: 3000});
      });
  }

  updateCount(value: number) {
    this.count = value;

    if (this.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType |DefaultResponseType) => {
          if((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          this.countInCart = this.count;
        });
    }

  }

  updateFavorites() {
    if(!this.authService.getIsLoggedIn()) {
      this.toast.warning('Для добавления в избранное необходимо авторизоваться!');
      return;
    }
    if (this.product.isInFavorites) {
      this.favoritesService.removeFavorites(this.product.id)
        .subscribe((data: DefaultResponseType) => {
          if (data.error) {
            this.toast.error(data.message);
          }

          this.product.isInFavorites = false;
          this.toast.warning('Товар удален из избранного!');
        })
    } else {
      this.favoritesService.addFavorites(this.product.id)
        .subscribe((data: FavoritesType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          this.product.isInFavorites = true;

          this.toast.success('Товар добавлен в избранное!', {duration: 3000});
        });
    }

  }

  navigate() {
    if(this.isLight) {
      this.router.navigate(['/product/' + this.product.url]);
    }
  }

}
