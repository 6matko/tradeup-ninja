import { Component, Inject, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SYSTEM_CONST } from '../../app.const';
import { ISystemConst } from '../../base.model';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  /**
   * Current date
   *
   * @type {Date}
   * @memberof FooterComponent
   */
  today: Date = new Date();
  /**
   * Current version
   *
   * @type {(string | null)}
   * @memberof FooterComponent
   */
  version: string | null = environment.version;
  constructor(@Inject(SYSTEM_CONST) public systemConst: ISystemConst) {}

  ngOnInit() {}
}
