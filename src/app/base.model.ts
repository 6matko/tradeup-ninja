/**
 * Sorting options for skins:
 * name - By skin name
 * floatCap - By highest float cap
 * collection - By collection name
 * floatValue - By float value
 */
export type SkinSortingOption = 'name' | 'floatCap' | 'collection' | 'floatValue';

/**
 * Sorting options for collections:
 * outcomes - By outcome count (amount)
 */
export type CollectionSortingOption = 'outcomes';

/**
 * Base model for Entity in DB
 *
 * @export
 * @class BaseEntity
 */
export class BaseEntity {
  /**
   * ID of entity
   *
   * @type {number}
   * @memberof BaseEntity
   */
  id: number;
  /**
   * Date when entity was created
   *
   * @type {Date}
   * @memberof BaseEntity
   */
  created: Date;
  /**
   * Date when entity was modified for the last time
   *
   * @type {Date}
   * @memberof BaseEntity
   */
  modified: Date;
}

/**
 * Interface for system constants
 *
 * @export
 * @interface ISystemConst
 */
export interface ISystemConst {
  /**
   * Link to our discord server
   *
   * @type {string}
   * @memberof ISystemConst
   */
  discordUrl: string;
  /**
   * Link to Changelog channel within Discord server
   *
   * @type {string}
   * @memberof ISystemConst
   */
  discordChangelogUrl: string;
  /**
   * Link to our STEAM group
   *
   * @type {string}
   * @memberof ISystemConst
   */
  steamGroupUrl: string;
  /**
   * Cookie consent name
   *
   * @type {string}
   * @memberof ISystemConst
   */
  consentName: string;
  /**
   * Access token key in storage
   *
   * @type {string}
   * @memberof ISystemConst
   */
  accessTokenKey: string;
}

/**
 * Helper model for describing Dropdown scroll position of ng-select
 *
 * @export
 * @class DropdownScrollPosition
 */
export class DropdownScrollPosition {
  /**
   * Index of list start
   *
   * @type {number}
   * @memberof DropdownScrollPosition
   */
  start: number;
  /**
   * Index of list end
   *
   * @type {number}
   * @memberof DropdownScrollPosition
   */
  end: number;
}

/**
 * Sorting direction
 *
 * @export
 * @enum {string}
 */
export const enum SortingDirection {
  Ascending = 'asc',
  Descending = 'desc',
}

/**
 * Sorting opptions (settings) which includes option and direction
 *
 * @export
 * @class SortingOption
 * @template T Specific sorting option type (For example for skins and collections it might be different)
 */
export class SortingOption<T> {
  option: T;
  direction: SortingDirection = SortingDirection.Ascending;
}
