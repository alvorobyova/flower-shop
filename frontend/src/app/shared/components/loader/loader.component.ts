import {Component, inject, OnInit} from '@angular/core';
import {LoaderService} from "../../services/loader.service";

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent implements OnInit {

  private loaderService = inject(LoaderService);

  isShowed: boolean = false;

  ngOnInit() {
    this.loaderService.isShowed$.subscribe((isShowed: boolean) => {
      this.isShowed = isShowed;
    })
  }
}
