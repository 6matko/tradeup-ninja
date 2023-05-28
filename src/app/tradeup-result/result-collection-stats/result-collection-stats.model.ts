import { Collection } from '@server/items';

export class ResultCollectionStats {
  /**
   * Information about collection
   *
   * @type {Collection}
   * @memberof ResultCollectionStats
   */
  collection: Collection;
  /**
   * Amount of profitable tradeups in specific collection
   *
   * @type {number}
   * @memberof ResultCollectionStats
   */
  profitableTradeupAmount: number = 1;
  constructor(collection?: Collection) {
    if (collection) {
      this.collection = collection;
    }
  }
}
