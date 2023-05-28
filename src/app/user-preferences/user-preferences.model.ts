/**
 * Model for user preferences
 *
 * @export
 * @class UserPreferences
 */
export class UserPreferences {
    /**
     * Preference ID in database
     *
     * @type {number}
     * @memberof UserPreferences
     */
    id: number;
    /**
     * Dark mode enabled or disabled (`false`)
     *
     * @type {boolean}
     * @memberof UserPreferences
     */
    darkMode: boolean = false;
    /**
     * User selected language
     *
     * @type {string}
     * @memberof UserPreferences
     */
    language: string = 'en';
    /**
     * Currency that is visually displayed
     *
     * @type {string}
     * @memberof UserPreferences
     */
    displayCurrency: string = '€';
}
