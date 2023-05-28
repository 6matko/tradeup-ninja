import { Component, Inject, OnInit } from '@angular/core';
import { SYSTEM_CONST } from '../../app.const';
import { ISystemConst } from '../../base.model';

@Component({
  selector: 'app-about-planned-features',
  templateUrl: './about-planned-features.component.html',
  styleUrls: ['./about-planned-features.component.scss']
})
export class AboutPlannedFeaturesComponent implements OnInit {

  constructor(
    @Inject(SYSTEM_CONST) public systemConst: ISystemConst,
  ) { }

  ngOnInit() {
  }

}
