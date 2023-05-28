import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UserInfoService } from './user-info.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
  ],
  providers: [
    UserInfoService,
  ],
})
export class UserInfoModule { }
