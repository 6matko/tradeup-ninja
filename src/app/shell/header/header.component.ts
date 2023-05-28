import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  menuHidden = true;
  /**
   * Indicates if temporary notification display is hidden or not
   *
   * @type {boolean}
   * @memberof HeaderComponent
   */
  notificationHidden: boolean;
  constructor() { }

  ngOnInit() { }

  toggleMenu() {
    this.menuHidden = !this.menuHidden;
  }
}
