import {Component, HostListener, inject, Input, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from "@angular/router";
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";
import {CartService} from "../../services/cart.service";
import {ProductService} from "../../services/product.service";
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment.development";
import {FormControl} from "@angular/forms";
import {debounceTime} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @Input() categories: CategoryWithTypeType[] = [];

  isLogged: boolean = false;
  count: number = 0;
  // searchValue: string = '';
  products: ProductType[] = [];
  serverStaticPath = environment.serverStaticPath;
  showedSearch: boolean = false;
  searchFiled = new FormControl();

  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private _snackBar = inject(MatSnackBar);
  private router = inject(Router);

  constructor() {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {

    this.searchFiled.valueChanges
      .pipe(
        debounceTime(500)
      )

      .subscribe(value =>  {
        if (value && value.length > 2) {
          this.productService.searchProducts(value)
            .subscribe((data: ProductType[]) => {
              this.products = data;
              this.showedSearch = true;
            })
        } else {
          this.products = [];
        }
      });

    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
    });

    this.cartService.getCartCount()
      .subscribe((data: { count: number } | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.count = (data as { count: number }).count;
      });

    this.cartService.count$
      .subscribe(count => {
        this.count = count;
      })
  }

  logout(): void {
    this.authService.logout()
      .subscribe({
        next: (data: DefaultResponseType) => {
          this.doLogout();
        },
        error: () => {
          this.doLogout();
        }
      });
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;

    this._snackBar.open('Вы вышли из системы!');
    this.router.navigate(['/']);
  }

  /*changedSearchValue(newValue: string) {
    this.searchValue = newValue;
    if (this.searchValue && this.searchValue.length > 2) {
      this.productService.searchProducts(this.searchValue)
        .subscribe((data: ProductType[]) => {
          this.products = data;
          this.showedSearch = true;
        })
    } else {
      this.products = [];
    }
  }*/

  selectProduct(url: string) {
    this.router.navigate(['/product/' + url]);
    // this.searchValue = '';
    this.searchFiled.setValue('');
    this.products = [];
  }


  @HostListener('document:click', ['$event'])
  click(event: Event) {
    if(this.showedSearch && (event.target as HTMLElement).className.indexOf('search-product') === -1) {
      this.showedSearch = false;
    }
  }
}
