import { Logger } from '@vue-storefront/core/lib/logger';
import { Store } from './types';

import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import { coreHooks } from '@vue-storefront/core/hooks';
import { cartHooks } from '@vue-storefront/core/modules/cart/hooks';
import { catalogHooks } from '@vue-storefront/core/modules/catalog-next/hooks';
import {
  buildProductImageUrls,
  $TB,
  data,
  getCategories,
  getProductOptions
} from './helpers';

function afterUserAuthorise (store: Store) {
  const user = data.user(store);
  $TB().hooks.onUserUpdate(user);
}

function afterAppInit (store: Store) {
  const storeView = currentStoreView();
  $TB().hooks.initializeStore(storeView);
  afterUserAuthorise(store);
}

function afterCartVisited (store: Store) {
  const cart = data.cart(store);
  cart.items = cart.items.map(buildProductImageUrls);
  const options = getProductOptions(store);
  const categories = getCategories(store);
  $TB().hooks.onCartVisit(cart, options, categories);
}

function afterAddToCart (store: Store) {
  afterCartVisited(store);
}

function afterRemoveFromCart (store: Store) {
  afterCartVisited(store);
}

function afterCheckoutVisited (store: Store) {
  $TB().hooks.onCheckoutVisit();
}

function categoryPageVisited (store: Store) {
  const products = data.categoryProducts(store).map(buildProductImageUrls);
  const options = getProductOptions(store);
  const categories = getCategories(store);
  $TB().hooks.onProductList(products, options, categories);
}

function productPageVisited (store: Store) {
  const product = buildProductImageUrls(data.currentProduct(store));
  const options = getProductOptions(store);
  const categories = getCategories(store);

  $TB().hooks.onProductBrowse(product, options, categories);
}

function productVariantSelected (store: Store) {
  productPageVisited(store);
}

function afterPurchaseComplete (store: Store) {
  $TB().hooks.onPurchaseComplete();
}

function otherPageVisited () {
  $TB().hooks.onOtherPageVisit();
}

export function attachHooks (store: Store) {
  cartHooks.afterAddToCart(() => afterAddToCart(store));
  cartHooks.afterRemoveFromCart(() => afterRemoveFromCart(store));
  catalogHooks.categoryPageVisited(() => categoryPageVisited(store));
  catalogHooks.productPageVisited(() => productPageVisited(store));

  store.subscribe(({ type, payload }) => {
    // Opening the cart sidebar
    if (type === 'ui/setMicrocart' && payload === true) {
      afterCartVisited(store);
    }

    if (type === 'route/ROUTE_CHANGED') {
      if (payload.to.name === 'checkout') {
        afterCheckoutVisited(store);
      } else if (payload.to.name === 'home') {
        otherPageVisited();
      }
    }

    if (type === 'checkout/SET_THANKYOU' && payload === true) {
      afterPurchaseComplete(store);
    }

    if (type === 'product/product/SET_CURRENT') {
      productVariantSelected(store);
    }
  });

  Logger.debug('Hooks attached', 'FR')();
}

export function initialCapture (store: Store) {
  afterAppInit(store);

  if (data.categoryProducts(store).length) {
    categoryPageVisited(store);
  } else if (data.currentProduct(store)) {
    productPageVisited(store);
  } else {
    otherPageVisited();
  }
}
