import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { NgbDropdown, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { RootObject, Weapon, WeaponEnum } from '@server/items';
import { combineLatest, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { SYSTEM_CONST } from '../app.const';
import { ISystemConst } from '../base.model';
import { TradeupSearchService } from '../tradeup-search/tradeup-search.service';
import { UserPreferencesLoaderService } from '../user-preferences/user-preferences-loader.service';
import { UserPreferences } from '../user-preferences/user-preferences.model';
import { CsgoTraderAppItemForSelect, CsgoTraderAppItemPrices, SelectedSticker, Sticker } from './sticker-price.model';
import { StickerPriceService } from './sticker-price.service';

@Component({
  selector: 'app-sticker-price',
  templateUrl: './sticker-price.component.html',
  styleUrls: ['./sticker-price.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StickerPriceComponent implements OnInit {
  /**
   * Flag indicates if something is being loaded
   *
   * @type {boolean}
   * @memberof StickerPriceComponent
   */
  isLoading: boolean = true;
  /**
   * Skins aka weapons for select
   *
   * @type {CsgoTraderAppItemForSelect[]}
   * @memberof StickerPriceComponent
   */
  skinsForSelect: CsgoTraderAppItemForSelect[] = [];
  /**
   * Stickers for select
   *
   * @type {CsgoTraderAppItemForSelect[]}
   * @memberof StickerPriceComponent
   */
  stickersForSelect: CsgoTraderAppItemForSelect[] = [];
  /**
   * Currently selected skin
   *
   * @type {CsgoTraderAppItemForSelect}
   * @memberof StickerPriceComponent
   */
  selectedSkin: CsgoTraderAppItemForSelect;
  /**
   * Information about selected skin. Mostly used for informative display
   *
   * @type {Weapon}
   * @memberof StickerPriceComponent
   */
  selectedSkinInfo: Weapon;
  /**
   * List with selected stickers
   *
   * @type {SelectedSticker[]}
   * @memberof StickerPriceComponent
   */
  selectedStickers: SelectedSticker[] = new Array(4).fill(null);
  /**
   * List with available price providers for selected skin (keys)
   *
   * @type {string[]}
   * @memberof StickerPriceComponent
   */
  availablePriceProviderKeys: string[] = [];
  /**
   * Key of currently selected provider
   *
   * @type {string}
   * @memberof StickerPriceComponent
   */
  selectedProviderKey: string;
  /**
   * Market price for selected skin and selected provider
   *
   * @type {number}
   * @memberof StickerPriceComponent
   */
  marketPrice: number = 0;
  /**
   * Price for which skin was listed
   *
   * @type {number}
   * @memberof StickerPriceComponent
   */
  listedFor: number;
  /**
   * Resulting value of sticker price percentage (After calculations)
   *
   * @type {number}
   * @memberof StickerPriceComponent
   */
  stickerPricePercent: number;
  /**
   * List with exclusive providers that is available for specific sticker
   *
   * @type {string[]}
   * @memberof StickerPriceComponent
   */
  availableProviderKeysForSticker: string[] = [];
  /**
   * Error message if something goes wrong
   *
   * @type {string}
   * @memberof StickerPriceComponent
   */
  error: string = '';
  /**
   * User preferences
   *
   * @type {UserPrefeferences}
   * @memberof StickerPriceComponent
   */
  userPreferences: UserPreferences;
  /**
   * All stored CsgoTraderApp items
   *
   * @private
   * @type {CsgoTraderAppItemPrices}
   * @memberof StickerPriceComponent
   */
  private storedItems: CsgoTraderAppItemPrices;
  /**
   * Stored items that are used for tradeup. We need them particularly because they contain information about skins
   *
   * @private
   * @type {RootObject}
   * @memberof StickerPriceComponent
   */
  private storedTradeupItems: RootObject;
  /**
   * Stored list with sticker information
   *
   * @private
   * @type {Sticker[]}
   * @memberof StickerPriceComponent
   */
  private storedStickerInfo: Sticker[] = [];
  /**
   * Reference to sticker selection popover
   *
   * @private
   * @type {NgbPopover}
   * @memberof StickerPriceComponent
   */
  @ViewChild('stickerSelectPop') private stickerSelectPop: NgbPopover;
  constructor(
    @Inject(SYSTEM_CONST) public systemConst: ISystemConst,
    private tradeupSearchService: TradeupSearchService,
    private stickerPriceService: StickerPriceService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: string,
    private meta: Meta,
    private userPreferencesService: UserPreferencesLoaderService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Storing user preeferences. In case we don't have them then initializing with default values
    // NOTE: We need to have any value because if there are no user preferences then we can't
    // decide either dark mode is enabled or disabled. We need at least some kind of value for that
    this.userPreferences = this.userPreferencesService.getPreferences() || new UserPreferences();
  }

  ngOnInit() {
    // Setting description META tag
    this.meta.updateTag({
      name: 'description',
      content: `A simple tool to calculate the overpay on stickered CS:GO skins!`,
    });

    // Initializing dark mode based on user preferences
    this.toggleDarkMode(this.userPreferences.darkMode);

    // Making requests only on browser platform because if its
    // rendered on server then user doesn't see meaningful content cause
    // responses may take up to few seconds to complete and all this time user
    // will be waiting content (blank page)
    if (isPlatformBrowser(this.platformId)) {
      combineLatest([
        this.stickerPriceService.getCsgoTraderAppPrices(),
        this.stickerPriceService.getStickers(),
        this.tradeupSearchService.getItems(),
      ])
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          }),
          catchError((err) => {
            // Setting error message in case of error
            this.error = 'Something went wrong. Please contact support@tradeup.ninja';
            return throwError(err);
          })
        )
        .subscribe((result) => {
          const [items, stickers, tradeupItems] = result;
          // Storing sticker information
          this.storedStickerInfo = stickers;
          this.storedTradeupItems = tradeupItems;
          // Storing all items in case if they will be needed
          this.storedItems = items;
          // Getting item keys because all items are in object format aka dictionary
          const itemKeys = Object.keys(items);
          // Getting values of Weapon enum. We will need these to search for items that have weapon name in their keys
          const weaponKeys = Object.values(WeaponEnum);

          // Walking through all items and selecting only skins and stickers
          itemKeys.forEach((key) => {
            // Converting key to lowercase for easier access and comparing
            const lowerCaseKey = key.toLowerCase();
            // If current item is sticker then adding it to found sticker list (used for display)
            if (lowerCaseKey.includes('sticker |')) {
              // Adding sticker to list for display
              this.stickersForSelect.push({
                key,
                prices: items[key],
              });
            }

            // Searching for items that contain weapon name in their key
            // NOTE: Ignoring Souvenirs
            const includesWeapon =
              !lowerCaseKey.includes('souvenir') &&
              // Ignoring graffiti cause there are some graffities with weapon names
              !lowerCaseKey.includes('graffiti') &&
              // Ignoring stickers with weapon names in them like "Sticker | Hello M4A4" or "Sticker | AWP Country"
              !lowerCaseKey.includes('sticker | ') &&
              // NOTE: Space after weapon key is also required because otherwise it might take "AK-47" for example
              // which doesn't have prices nor doesn't have to appera in list
              weaponKeys.some((weaponKey) => lowerCaseKey.includes(`${weaponKey.toLowerCase()} `));
            if (includesWeapon) {
              // Adding found weapon to list for display
              this.skinsForSelect.push({
                key,
                prices: items[key],
              });
            }
          });

          // Sorting found items alphabetically
          this.sortAlphabetically(this.skinsForSelect);
          this.sortAlphabetically(this.stickersForSelect);
          // Recreating array to avoid references because otherwise ng-select shows "No items". It is because
          // initially array was empty and it doesn't track changes by references
          this.skinsForSelect = [...this.skinsForSelect];
          this.stickersForSelect = [...this.stickersForSelect];
        });
    }
  }

  /**
   * Function for searching collections in multiselect
   *
   * @memberof TradeupCalculatorActionsComponent
   */
  searchFn = (searchTerm: string, displayItem: CsgoTraderAppItemForSelect) => {
    // Converting both to lower cases in order to find more precise results
    return (
      displayItem.key
        .toLowerCase()
        // Ignoring " | " for better search
        .replace(' | ', ' ')
        // Doing it twice because we have format "Sticker | ALEX (Foil) | Berlin 2019" and repalace removes only first occurance
        .replace(' | ', ' ')
        // Ignoring braces during search
        .replace('(', '')
        .replace(')', '')
        .includes(searchTerm.toLowerCase())
    );
  };

  /**
   * Method sets all necessary information about skin for display
   *
   * @param {CsgoTraderAppItemForSelect} skin Selected skin
   * @memberof StickerPriceComponent
   */
  selectSkin(skin: CsgoTraderAppItemForSelect) {
    // If skin was selected then getting and storing information about this skin (for display)
    if (skin) {
      // Clearing selected stickers
      this.selectedStickers.fill(null);
      // Removing wear. Src: https://stackoverflow.com/a/37205480
      const skinNameWithoutWear = skin.key
        .replace(/ \([^)]*\)|\[[^\]]*\]/, '')
        // Also removing Stattrak
        .replace('StatTrak™ ', '');
      this.selectedSkinInfo = this.storedTradeupItems.weapons[skinNameWithoutWear];
      // Getting keys of available providers for display
      this.availablePriceProviderKeys = Object.keys(skin.prices);
      // Manually selecting initial provider key (First element)
      this.selectProvider(this.availablePriceProviderKeys[0]);
    } else {
      // Clearing previously stored information
      this.selectedSkinInfo = undefined;
      // Clearing providers
      this.availablePriceProviderKeys.length = 0;
      // Clearing selected provider
      this.selectProvider();
    }
  }

  /**
   * Method selects and stores key of new price provider
   *
   * @param {string} [provider=''] Key of provider that has to be selected. By default empty string aka nothing selected
   * @memberof StickerPriceComponent
   */
  selectProvider(provider: string = '') {
    // Storing key of new provider
    this.selectedProviderKey = provider;
    // If provider was selected and not cleared then setting market price for selected skin and selected provider
    if (provider) {
      this.marketPrice = this.getSkinStartingPrice(provider, this.selectedSkin);
      // Walking through every sticker and updated display price
      this.selectedStickers.map((sticker) => {
        // Setting price only if sticker is selected
        if (sticker) {
          // Setting sticker price
          sticker.providerPrice = this.getStickerPrice(provider, sticker);
        }
      });

      // Performing calculation on provider change
      this.calculateSP();
    }
  }

  /**
   * Method sets information about selected sticker
   *
   * @param {CsgoTraderAppItemForSelect} sticker Selected sticker from select
   * @param {number} stickerIndex Index of sticker in array
   * @memberof StickerPriceComponent
   */
  setStickerInfo(sticker: CsgoTraderAppItemForSelect, stickerIndex: number) {
    // Searching for sticker information if sticker was indeed selected. Otherwise clearing it
    if (sticker) {
      // Searching for sticker information
      const foundStickerInfo = this.storedStickerInfo.find((s) =>
        s.market_hash_name.toLowerCase().includes(sticker.key.toLowerCase())
      );
      // If sticker information is found then uppdating selected sticker with necessary info
      if (foundStickerInfo) {
        this.selectedStickers[stickerIndex] = Object.assign(
          sticker,
          foundStickerInfo,
          // Getting price for display based on currently selected provider
          { providerPrice: this.getStickerPrice(this.selectedProviderKey, sticker) }
        );
      } else {
        // Otherwise clearing selected sticker
        this.selectedStickers[stickerIndex] = undefined;
      }
    } else {
      // Clearing selected sticker because it was cleared on select component
      this.selectedStickers[stickerIndex] = undefined;
    }

    // Performing calculation when sticker was changed
    this.calculateSP();

    // Closing popover because otherwise on select (especially when no sticker is selected)
    // it might change focus to next sticker block and remain opened. We need to close it
    this.closePopover();
  }

  /**
   * Method closes sticker selection popover
   *
   * @memberof StickerPriceComponent
   */
  closePopover() {
    // Closing only if we have found select popover in markup.
    // If user is editing sticker then this popover won't be rendered
    // and there is n othing to closse
    if (this.stickerSelectPop) {
      this.stickerSelectPop.close();
    }
  }

  /**
   * Method calculated sticker price percentage
   *
   * @memberof StickerPriceComponent
   */
  calculateSP() {
    // Checking if at least one sticker is set because we can't and have no reason to calculate without stickerss
    const atLeastOneStickerIsSet = this.selectedStickers.some((sticker) => Boolean(sticker));
    // Checking if every sticker has price
    const allStickersHavePrice = this.selectedStickers
      // NOTE: Taking only selected stickers (non empty slots) to compare prices
      .filter((sticker) => Boolean(sticker))
      .every((sticker) => sticker?.providerPrice);

    // If everything is good then performing calculation
    if (atLeastOneStickerIsSet && allStickersHavePrice && this.selectedSkin && this.listedFor && this.marketPrice) {
      // Calculating total price of all selected stickers
      const totalStickerPrice = this.selectedStickers.reduce((prevValue, currentSticker) => {
        return prevValue + (currentSticker?.providerPrice || 0);
      }, 0);

      // Calculating sticker price perecentage
      this.stickerPricePercent = (this.listedFor - this.marketPrice) / totalStickerPrice;
      // If calculation can not be done then setting result as "0"
    } else {
      this.stickerPricePercent = 0;
    }
  }

  /**
   * Method creates list of available providers for specific sticker
   *
   * @param {SelectedSticker} sticker Sticker for which providers should be created
   * @param {NgbDropdown} dropdown Reference to dropdown
   * @memberof StickerPriceComponent
   */
  createProvidersForSticker(sticker: SelectedSticker, dropdown: NgbDropdown) {
    // Based on current state of dropdown we are either cleaning dropdown items or creating them
    if (dropdown.isOpen()) {
      // Clearing previous provider keys
      this.availableProviderKeysForSticker.length = 0;
      // Closing dropdown
      dropdown.close();
    } else {
      // Getting only those provider keys that have actual price (more than 0)
      this.availableProviderKeysForSticker = Object.keys(sticker.prices).filter((key) =>
        Boolean(this.getStickerPrice(key, sticker))
      );
      // Opening dropdown
      dropdown.open();
    }
  }

  /**
   * Method clones selected sticker to available slot
   *
   * @param {SelectedSticker} sticker Sticker that needs to be cloned into empty slot
   * @memberof StickerPriceComponent
   */
  cloneSticker(sticker: SelectedSticker) {
    // Searching for empty slot index
    const emptyStickerSlotIndex = this.selectedStickers.findIndex((s) => !s);
    // If we found empty slot then filling it with current sticker that needs to be cloned
    if (emptyStickerSlotIndex !== -1) {
      this.setStickerInfo(sticker, emptyStickerSlotIndex);
    }
  }

  /**
   * Method toggles dark mode (dark theme)
   *
   * @param {boolean} [darkMode=!this.darkMode] Indicates if dark mode is enabled. If not passed then toggled value of current dark mode will be used
   * @memberof StickerPriceComponent
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

  private getStickerPrice(provider: string, sticker: CsgoTraderAppItemForSelect) {
    // Getting sticker price
    const price = this.getSkinStartingPrice(provider, sticker);
    // Checking if price is numeric value. If not, then setting it as "null" to make
    // further actions and give user ability to act. Otherwise returning price
    return isNaN(price) ? null : price;
  }

  /**
   * Method returns price
   *
   * @private
   * @param {string} provider Provider key
   * @param {CsgoTraderAppItemForSelect} skin Skin with prices
   * @returns {number} Returns price for provided skin and selected provider
   * @memberof StickerPriceComponent
   */
  private getSkinStartingPrice(provider: string, skin: CsgoTraderAppItemForSelect): number {
    switch (provider) {
      case 'steam':
        return skin.prices.steam.last_7d;
      case 'bitskins':
        // Converting to number
        return +skin.prices.bitskins.price;
      case 'lootfarm':
        return skin.prices.lootfarm;
      case 'csgotm':
        // Converting to number
        return +skin.prices.csgotm;
      case 'csmoney':
        return skin.prices.csmoney.price;
      case 'skinport':
        return skin.prices.skinport.starting_at;
      case 'csgotrader':
        return skin.prices.csgotrader.price;
      case 'csgoempire':
        return skin.prices.csgoempire;
      case 'swapgg':
        return skin.prices.swapgg;
      case 'csgoexo':
        return skin.prices.csgoexo;
      case 'buff163':
        return skin.prices.buff163.starting_at.price;
      // By default returning "0" cause we don't know price for this provider
      default:
        return 0;
    }
  }

  /**
   * Method sorts list alphabetically by "key" property
   *
   * @private
   * @param {CsgoTraderAppItemForSelect[]} list List that has to be sorted
   * @memberof StickerPriceComponent
   */
  private sortAlphabetically(list: CsgoTraderAppItemForSelect[]) {
    // Sorting alphabetically
    list.sort((a, b) => {
      if (a.key < b.key) {
        return -1;
      }
      if (a.key > b.key) {
        return 1;
      }
      return 0;
    });
  }
}
