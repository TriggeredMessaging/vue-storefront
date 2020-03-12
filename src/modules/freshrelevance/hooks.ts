import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import { coreHooks } from '@vue-storefront/core/hooks';
import { cartHooks } from '@vue-storefront/core/modules/cart/hooks';
import { catalogHooks } from '@vue-storefront/core/modules/catalog-next/hooks';
import { Logger } from '@vue-storefront/core/lib/logger';

const $TB = () => (window as any).$TB;

export function attachHooks (store) {
  // coreHooks.afterProductThumbnailPathGenerate((p) => {
  //   // after the app has initialised
  //   console.log('app init', ...args);
  // });

  cartHooks.afterAddToCart((products) => afterAddToCart(store, products));

  catalogHooks.categoryPageVisited((category) =>
    categoryPageVisited(store, category)
  );

  catalogHooks.productPageVisited((product) =>
    productPageVisited(store, product)
  );

  Logger.debug('Hooks attached', 'FR')();
}

export function initialCapture (store) {
  // 1) determine what kind of page we're on using store state
  // 2) call the relevant hook below with the correct data
  const storeView = currentStoreView();
  const currencyCode = storeView.i18n.currencyCode;
}

function afterAddToCart (store, products) {}

function categoryPageVisited (store, category) {
  // called after a product list page has been navigated to
  $TB().hooks.onProductList(category);
}

function productPageVisited (store, product) {
  // called after a product page has been navigated to
  $TB().hooks.onProductBrowse(product);
}
