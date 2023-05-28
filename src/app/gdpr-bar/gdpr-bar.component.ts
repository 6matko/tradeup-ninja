import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { SYSTEM_CONST } from '../app.const';
import { ISystemConst } from '../base.model';

@Component({
  selector: 'app-gdpr-bar',
  templateUrl: './gdpr-bar.component.html',
  styleUrls: ['./gdpr-bar.component.scss']
})
export class GdprBarComponent implements OnInit {
  /**
   * Emits event if consent was given (`true`) or `false` if not given
   *
   * @type {EventEmitter<boolean>}
   * @memberof GdprBarComponent
   */
  @Output() consentGiven: EventEmitter<boolean> = new EventEmitter();
  constructor(
    private cookieService: CookieService,
    @Inject(SYSTEM_CONST) private systemConst: ISystemConst,
  ) { }

  ngOnInit() {
  }

  /**
   * Method stores consent in a cookie and emits event
   *
   * @memberof GdprBarComponent
   */
  accept() {
    this.cookieService.set(this.systemConst.consentName, 'accept', 365, null, null, false);
    // Emitting that consent was given
    this.consentGiven.emit(true);
  }
}
