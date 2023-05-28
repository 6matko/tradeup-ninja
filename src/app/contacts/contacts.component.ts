import { Component, Inject, OnInit } from '@angular/core';
import { SYSTEM_CONST } from '../app.const';
import { ISystemConst } from '../base.model';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {

  constructor(
    @Inject(SYSTEM_CONST) public systemConst: ISystemConst,
  ) { }

  ngOnInit() {
  }

}
