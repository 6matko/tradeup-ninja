import { Component, Inject, OnInit } from '@angular/core';
import { SYSTEM_CONST } from '../app.const';
import { ISystemConst } from '../base.model';


@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  constructor(
    @Inject(SYSTEM_CONST) public systemConst: ISystemConst,
  ) { }

  ngOnInit() { }
}
