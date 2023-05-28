import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserInfo } from './user-info.model';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  private userInfoBehaviorSubject = new BehaviorSubject<UserInfo>(null);
  constructor() { }

  getUserInfo() {
    return this.userInfoBehaviorSubject.asObservable();
  }

  emitUserInfo(userInfo: UserInfo) {
    this.userInfoBehaviorSubject.next(userInfo);
  }
}
