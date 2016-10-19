/**
 * @class Pool
 */
export default class Pool {
  /**
   * Create a new pool.
   *
   * @example
   * const pool = new Pool(10, async i => `Item ${i}`);
   *
   * @param {Number} limit The limit on the number of items available in the pool.
   * @param {Function} factory The factory function for constructing items for the pool.
   */
  constructor(limit, factory) {
    this._limit = limit;
    this._factory = factory;

    this._queue = [];
    this._available = [];
    this._borrowed = new Set();
    this._count = 0;
  }

  /**
   * Borrow an item from this pool.
   *
   * @example
   * const borrowed = await pool.borrow();
   * // => 'Item 0'
   *
   * @return {Promise} A promise that will resolve with the item when available.
   */
  borrow() {
    if (this._available.length !== 0) {
      this._count++;

      const item = this._available.pop();

      this._borrowed.add(item);

      return Promise.resolve(item);
    }

    if (this._count !== this._limit) {
      this._count++;

      return this._factory(this._count).then(item => {
        this._borrowed.add(item);

        return item;
      });
    }

    return new Promise(resolve => this._queue.push(resolve));
  }

  /**
   * Return an item to this pool.
   *
   * @example
   * const returned = pool.return(borrowed);
   * // => true
   *
   * @param {*} item The item to return to this pool.
   * @return {Boolean} `true` if the item was accepted by this pool, otherwise `false`.
   */
  return(item) {
    if (!this._borrowed.has(item)) {
      return false;
    }

    if (this._queue.length === 0) {
      this._count--;
      this._available.push(item);
      this._borrowed.delete(item);
    } else {
      this._queue.shift()(item);
    }

    return true;
  }
}
