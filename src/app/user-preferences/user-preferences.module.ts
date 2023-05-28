import { CommonModule } from '@angular/common';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModalModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { UserPreferencesLoaderService } from './user-preferences-loader.service';
import { UserPreferencesModalComponent } from './user-preferences-modal/user-preferences-modal.component';

export function loadPreferences(userPreferencesService: UserPreferencesLoaderService) {
  return () => userPreferencesService.loadPreferences();
}

@NgModule({
  imports: [
    CommonModule,
    NgbModalModule,
    NgbTooltipModule,
    ReactiveFormsModule,
    NgxIndexedDBModule,
  ],
  declarations: [
    UserPreferencesModalComponent,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: loadPreferences,
      deps: [UserPreferencesLoaderService],
      multi: true
    }
  ]
})
export class UserPreferencesModule { }
