import { Component, Inject, OnInit } from '@angular/core';
import { SYSTEM_CONST } from '../../app.const';
import { ISystemConst } from '../../base.model';

@Component({
  selector: 'app-about-known-bugs',
  templateUrl: './about-known-bugs.component.html',
  styleUrls: ['./about-known-bugs.component.scss']
})
export class AboutKnownBugsComponent implements OnInit {

  constructor(
    @Inject(SYSTEM_CONST) public systemConst: ISystemConst,
  ) { }

  ngOnInit() {
  }

}
