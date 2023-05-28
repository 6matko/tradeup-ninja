import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit, Output, PLATFORM_ID, Renderer2 } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { UserInfo } from '../../@shared/user-info/user-info.model';
import { UserInfoService } from '../../@shared/user-info/user-info.service';
import { SYSTEM_CONST } from '../../app.const';
import { ISystemConst } from '../../base.model';
import { UserPreferencesLoaderService } from '../../user-preferences/user-preferences-loader.service';
import { UserPreferencesModalComponent } from '../../user-preferences/user-preferences-modal/user-preferences-modal.component';
import { UserPreferences } from '../../user-preferences/user-preferences.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  /**
   * Flag indicates if sidebar is currently opened
   *
   * @type {boolean}
   * @memberof SidebarComponent
   */
  isOpen: boolean;
  /**
   * Event emitter which emits events about sidebar open/close state. Emits new state(is opened or is closed)
   *
   * @type {EventEmitter<boolean>}
   * @memberof SidebarComponent
   */
  @Output() openStateChanged: EventEmitter<boolean> = new EventEmitter();
  /**
   * User preferences
   *
   * @type {UserPrefeferences}
   * @memberof SidebarComponent
   */
  userPreferences: UserPreferences;
  /**
   * Observable with user information
   *
   * @type {Observable<UserInfo>}
   * @memberof SidebarComponent
   */
  userInfo$: Observable<UserInfo>;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: string,
    private renderer: Renderer2,
    @Inject(SYSTEM_CONST) public systemConst: ISystemConst,
    private userPreferencesService: UserPreferencesLoaderService,
    private modalService: NgbModal,
    private userInfoService: UserInfoService,
  ) {
    // Storing user preeferences. In case we don't have them then initializing with default values
    // NOTE: We need to have any value because if there are no user preferences then we can't
    // decide either dark mode is enabled or disabled. We need at least some kind of value for that
    this.userPreferences = this.userPreferencesService.getPreferences() || new UserPreferences();
  }

  ngOnInit() {
    // Initializing dark mode based on user preferences
    this.toggleDarkMode(this.userPreferences.darkMode);
    // Setting observable with user information
    this.userInfo$ = this.userInfoService.getUserInfo();
  }

  /**
   * Method opens or closes sidebar
   *
   * @param {boolean} [open=true] If sidebar should be opened. By default `true`
   * @memberof SidebarComponent
   */
  openSidebar(open: boolean = true) {
    this.isOpen = open;
    // Emitting event with new sidebar state
    this.openStateChanged.emit(open);
  }

  /**
   * Method opens user preferences modal
   *
   * @memberof SidebarComponent
   */
  openPreferencesModal() {
    const modalRef = this.modalService.open(UserPreferencesModalComponent, {
      size: 'sm',
    });
    modalRef.result.then((newPreferences: UserPreferences) => {
      // Updating current preferences with new ones
      this.userPreferences = newPreferences;

      // Toggling dark mode based on new preferences
      this.toggleDarkMode(newPreferences.darkMode);

      // NOTE: this should remain empty even if not used to avoid errors`
    }, () => { });
  }

  /**
   * Method toggles dark mode (dark theme)
   *
   * @param {boolean} [darkMode=!this.darkMode] Indicates if dark mode is enabled. If not passed then toggled value of current dark mode will be used
   * @memberof SidebarComponent
   */
  toggleDarkMode(darkMode: boolean = !this.userPreferences.darkMode, updatePreferences?: boolean) {
    // Toggling only if current platform is browser. We need it to avoid errors during SSR
    if (isPlatformBrowser(this.platformId)) {

      // Updating user preference setting for dark mode
      this.userPreferences.darkMode = darkMode;

      // Saving preference updates (Latest changes) if necessary
      if (updatePreferences) {
        this.userPreferencesService.updatePreferences(this.userPreferences);
      }

      // If dark mode is enabled then adding "theme-dark" class to body and removing "theme-light".
      // Otherwise vice versa
      if (this.userPreferences.darkMode) {
        this.renderer.addClass(this.document.body, 'theme-dark');
        this.renderer.removeClass(this.document.body, 'theme-light');
      } else {
        this.renderer.addClass(this.document.body, 'theme-light');
        this.renderer.removeClass(this.document.body, 'theme-dark');
      }
    }
  }
}
