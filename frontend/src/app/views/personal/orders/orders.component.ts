import {Component, inject, OnInit} from '@angular/core';
import {OrderService} from "../../../shared/services/order.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {OrderType} from "../../../../types/order.type";
import {OrderStatusUtil} from "../../../shared/utils/order-status.util";
import {map} from "rxjs";

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {

  private orderService = inject(OrderService);

  // getStatusAndColor = OrderStatusUtil.getStatusAndColor;

  orders: OrderType[] = [];

  ngOnInit() {

    this.orderService.getOrders()
      .subscribe((data: DefaultResponseType | OrderType[]) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.orders = (data as OrderType[]).map(item => {
          const status = OrderStatusUtil.getStatusAndColor(item.status);

          item.statusRus = status.name;
          item.color = status.color;

          return item;
        });
      });
  }
}
