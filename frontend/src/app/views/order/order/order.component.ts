import {Component, ElementRef, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {Router} from "@angular/router";
import {HotToastService} from "@ngneat/hot-toast";
import {DeliveryType} from "../../../../types/delivery.type";
import {FormBuilder, Validators} from "@angular/forms";
import {PaymentType} from "../../../../types/payment.type";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {OrderService} from "../../../shared/services/order.service";
import {OrderType} from "../../../../types/order.type";
import {HttpErrorResponse} from "@angular/common/http";
import {UserService} from "../../../shared/services/user.service";
import {UserInfoType} from "../../../../types/userInfo.type";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit {

  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private toast = inject(HotToastService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  cart: CartType | null = null;
  totalAmount: number = 0;
  totalCount: number = 0;
  deliveryType: DeliveryType = DeliveryType.delivery;
  deliveryTypes = DeliveryType;
  paymentTypes = PaymentType;

  orderForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    fatherName: [''],
    phone: ['', Validators.required],
    paymentType: [PaymentType.cashToCourier, Validators.required],
    email: ['', [Validators.required, Validators.email]],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: [''],
    comment: ['']
  })

  @ViewChild('popup') popup!: TemplateRef<ElementRef>;
  dialogRef: MatDialogRef<any> | null = null;

  constructor() {
    this.updateDeliveryTypeValidation();
  }

  ngOnInit() {

    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.cart = data as CartType;

        if (!this.cart || (this.cart && this.cart.items.length === 0)) {
          this.router.navigate(['/']);
          this.toast.warning('Корзина пуста!')
          return;
        }
        this.calculateTotal();
      })

    if(this.authService.getIsLoggedIn()) {
      this.userService.getUserInfo()
        .subscribe((data: UserInfoType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          const userInfo = data as UserInfoType;
          const paramsToUpdate = {
            firstName: userInfo.firstName ? userInfo.firstName : '',
            lastName: userInfo.lastName ? userInfo.lastName : '',
            fatherName: userInfo.fatherName ? userInfo.fatherName : '',
            phone: userInfo.phone ? userInfo.phone : '',
            paymentType: userInfo.paymentType ? userInfo.paymentType : PaymentType.cashToCourier,
            email: userInfo.email ? userInfo.email : '',
            street: userInfo.street ? userInfo.street : '',
            house: userInfo.house ? userInfo.house : '',
            entrance: userInfo.entrance ? userInfo.entrance : '',
            apartment: userInfo.apartment ? userInfo.apartment : '',
            comment: '',
          }

          this.orderForm.setValue(paramsToUpdate);
          if (userInfo.deliveryType) {
            this.deliveryType = userInfo.deliveryType;
          }
        });
    }


  }

  calculateTotal() {
    this.totalAmount = 0;
    this.totalCount = 0;

    if (this.cart) {
      this.cart.items.forEach(item => {
        this.totalAmount += item.quantity * item.product.price;
        this.totalCount += item.quantity;
      })
    }
  }

  changeDeliveryType(type: DeliveryType) {
    this.deliveryType = type;
    this.updateDeliveryTypeValidation();
  }

  updateDeliveryTypeValidation() {
    if (this.deliveryType === DeliveryType.delivery) {
      this.orderForm.get('street')?.setValidators(Validators.required);
      this.orderForm.get('house')?.setValidators(Validators.required);
    } else {

      // удаляем валидаторы для самовывоза, потому что там эти поля необязательны
      this.orderForm.get('street')?.removeValidators(Validators.required);
      this.orderForm.get('house')?.removeValidators(Validators.required);

      // задаем пустые значения, чтобы они не отправлялись, если пользователь поменяет способ доставки на самовывоз
      this.orderForm.get('street')?.setValue('');
      this.orderForm.get('house')?.setValue('');
      this.orderForm.get('entrance')?.setValue('');
      this.orderForm.get('apartment')?.setValue('');
    }
    this.orderForm.get('street')?.updateValueAndValidity();
    this.orderForm.get('house')?.updateValueAndValidity();
  }

  createOrder() {
    if (this.orderForm.valid && this.orderForm.value.firstName
    && this.orderForm.value.lastName && this.orderForm.value.phone && this.orderForm.value.paymentType
    && this.orderForm.value.email) {

      const paramsObject: OrderType = {
        deliveryType: this.deliveryType,
        firstName: this.orderForm.value.firstName,
        lastName: this.orderForm.value.lastName,
        phone: this.orderForm.value.phone,
        paymentType: this.orderForm.value.paymentType,
        email: this.orderForm.value.email,
      };

      if(this.deliveryType === DeliveryType.delivery) {
        if(this.orderForm.value.street) {
          paramsObject.street = this.orderForm.value.street;
        }
        if(this.orderForm.value.house) {
          paramsObject.house = this.orderForm.value.house;
        }
        if(this.orderForm.value.apartment) {
          paramsObject.apartment = this.orderForm.value.apartment;
        }
        if(this.orderForm.value.entrance) {
          paramsObject.entrance = this.orderForm.value.entrance;
        }
      }

      if(this.orderForm.value.comment) {
        paramsObject.comment = this.orderForm.value.comment;

      }

      this.orderService.createOrder(paramsObject)
        .subscribe({
          next: (data: OrderType | DefaultResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              throw new Error((data as DefaultResponseType).message);
            }

            console.log(this.orderForm.value);
            this.dialogRef = this.dialog.open(this.popup);
            this.dialogRef.backdropClick()
              .subscribe(() => {
                this.router.navigate(['/']);
              });
            this.cartService.setCount(0);

          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.message) {
              this.toast.error(errorResponse.message);
            } else {
              this.toast.error('Ошибка при оформлении заказа!');
            }
          }
        });

    } else {
      this.orderForm.markAllAsTouched();
      this.toast.warning('Необходимо заполнить обязательные поля!');
    }
  }

  closePopup() {
    this.dialogRef?.close();
    this.router.navigate(['/']);
  }

}
