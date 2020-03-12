import { Logger } from '@vue-storefront/core/lib/logger';
import { Store } from './types';

import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import { coreHooks } from '@vue-storefront/core/hooks';
import { cartHooks } from '@vue-storefront/core/modules/cart/hooks';
import { catalogHooks } from '@vue-storefront/core/modules/catalog-next/hooks';
import { buildProductImageUrls, $TB, data } from './helpers';

function afterUserAuthorise (store: Store) {
  const user = data.user(store);
  $TB().hooks.onUserUpdate(user);
}

function afterAppInit (store: Store) {
  const storeView = currentStoreView();
  $TB().hooks.initializeStore(storeView);
  afterUserAuthorise(store);
}

function onCart (store: Store) {
  const cart = data.cart(store);
  cart.items = cart.items.map(buildProductImageUrls);
  $TB().hooks.onCart(cart);
}

function afterAddToCart (store: Store) {
  onCart(store);
}

function afterRemoveFromCart (store: Store) {
  onCart(store);
}

function categoryPageVisited (store: Store) {
  const products = data.categoryProducts(store).map(buildProductImageUrls);
  $TB().hooks.onProductList(products);
}

function productPageVisited (store: Store) {
  const product = buildProductImageUrls(data.currentProduct(store));
  $TB().hooks.onProductBrowse(product);
}

export function attachHooks (store: Store) {
  cartHooks.afterAddToCart(() => afterAddToCart(store));
  cartHooks.afterRemoveFromCart(() => afterRemoveFromCart(store));
  catalogHooks.categoryPageVisited(() => categoryPageVisited(store));
  catalogHooks.productPageVisited(() => productPageVisited(store));

  store.subscribe(({ type, payload }) => {
    // Opening the cart sidebar
    if (type === 'ui/setMicrocart' && payload === true) {
      onCart(store);
    }
  });

  Logger.debug('Hooks attached', 'FR')();
}

export function initialCapture (store: Store) {
  afterAppInit(store);

  console.log(store.getters);

  if (data.categoryProducts(store).length) {
    categoryPageVisited(store);
  } else if (data.currentProduct(store)) {
    productPageVisited(store);
  }
}
