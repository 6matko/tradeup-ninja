import { Component, Inject, OnInit } from '@angular/core';
import { SYSTEM_CONST } from '../../app.const';
import { ISystemConst } from '../../base.model';

@Component({
  selector: 'app-about-useful-links',
  templateUrl: './about-useful-links.component.html',
  styleUrls: ['./about-useful-links.component.scss']
})
export class AboutUsefulLinksComponent implements OnInit {

  constructor(
    @Inject(SYSTEM_CONST) public systemConst: ISystemConst,
  ) { }

  ngOnInit() {
  }

}
