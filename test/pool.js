import test from 'ava';
import Pool from '../lib/pool';

test('can borrow and return items', async t => {
  t.plan(8);

  let i = 1;

  const pool = new Pool(2, async () => i++);

  // The first two items should be returned right away.
  const i1 = await pool.borrow();
  const i2 = await pool.borrow();

  t.is(i1, 1);
  t.is(i2, 2);

  let returned = false;

  // This time, an item won't be returned right away.
  const i3 = pool.borrow().then(i => {
    returned = true;
    return i;
  });

  pool.return(i1);

  t.false(returned);
  t.is(await i3, 1);
  t.true(returned);

  t.true(pool.return(i2));
  t.true(pool.return(await i3));

  const i4 = await pool.borrow();

  t.is(i4, 1);
});

test('Pool#return() returns false when returning an invalid item', async t => {
  const pool = new Pool(2, async i => i);

  t.false(pool.return(4));
});
