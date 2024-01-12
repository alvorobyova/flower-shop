import {Component, inject, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ProductType} from "../../../../types/product.type";
import {ProductService} from "../../../shared/services/product.service";
import {ActivatedRoute} from "@angular/router";
import {environment} from "../../../../environments/environment.development";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";
import {HotToastService} from "@ngneat/hot-toast";
import {FavoritesService} from "../../../shared/services/favorites.service";
import {FavoritesType} from "../../../../types/favorites.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {AuthService} from "../../../core/auth/auth.service";
// import {CartComponent} from "../../order/cart/cart.component";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit {

  private productService = inject(ProductService);
  private favoritesService = inject(FavoritesService);
  private authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);
  private cartService = inject(CartService);
  private toast = inject(HotToastService);

  recommendedProducts: ProductType[] = [];
  product!: ProductType;
  serverStaticPath = environment.serverStaticPath;
  count: number = 1;
  isLogged: boolean = false;

  constructor() {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 24,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: false
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.productService.getProduct(params['url'])
        .subscribe((data: ProductType) => {
          this.product = data;

          this.cartService.getCart()
            .subscribe((cartData: CartType | DefaultResponseType) => {
              if((cartData as DefaultResponseType).error !== undefined) {
                throw new Error((cartData as DefaultResponseType).message);
              }

              const cartDataResponse = cartData as CartType;
              if (cartDataResponse) {
                const productInCart = cartDataResponse.items.find(item => item.product.id === this.product.id);
                if (productInCart) {
                  this.product.countInCart = productInCart.quantity;
                  this.count = this.product.countInCart;
                }
              }
            });

          if(this.authService.getIsLoggedIn()) {
            this.favoritesService.getFavorites()
              .subscribe((data: FavoritesType[] | DefaultResponseType) => {
                if ((data as DefaultResponseType).error !== undefined) {
                  const error = (data as DefaultResponseType).message;
                  throw new Error(error);
                }

                const products = data as FavoritesType[];
                const currentProductExists = products.find(item => item.id === this.product.id)
                if (currentProductExists) {
                  this.product.isInFavorites = true;
                }
              });
          }

        })

    })

    this.productService.getBestProducts()
      .subscribe((data: ProductType[]) => {
        this.recommendedProducts = data;
      })

  }

  updateCount(value: number) {
    this.count = value;

    if (this.product.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaultResponseType) => {
          if((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          this.product.countInCart = this.count;

        });
    }
  }

  addToCart() {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.product.countInCart = this.count;
        this.toast.success('Товар добавлен в корзину!', {duration: 3000});
      });
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.product.countInCart = 0;
        this.count = 1;
        this.toast.warning('Товар удален из корзины!', {duration: 3000});
      });
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

}
