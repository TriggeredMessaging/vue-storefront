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
  getProductOptions,
  addProductCategories
} from './helpers';
import { Category } from '@vue-storefront/core/modules/catalog-next/types/Category';

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

function categoryPageVisited (store: Store, category: Category) {
  const products = data
    .categoryProducts(store)
    .map(buildProductImageUrls)
    .map((product) => addProductCategories(store, product, category));
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

function otherPageVisited (route: any) {
  $TB().hooks.onOtherPageVisit(route);
}

export function attachHooks (store: Store) {
  cartHooks.afterAddToCart(() => afterAddToCart(store));
  cartHooks.afterRemoveFromCart(() => afterRemoveFromCart(store));
  catalogHooks.categoryPageVisited((category) =>
    categoryPageVisited(store, category)
  );
  catalogHooks.productPageVisited(() => productPageVisited(store));

  store.subscribe(({ type, payload }) => {
    // Opening the cart sidebar
    if (type === 'ui/setMicrocart' && payload === true) {
      afterCartVisited(store);
    } else if (type === 'checkout/SET_THANKYOU' && payload === true) {
      afterPurchaseComplete(store);
    } else if (type === 'product/product/SET_CURRENT') {
      productVariantSelected(store);
    } else if (type === 'route/ROUTE_CHANGED') {
      if (payload.to.name === 'checkout') {
        afterCheckoutVisited(store);
      } else {
        otherPageVisited(payload.to);
      }
    }
  });

  Logger.debug('Hooks attached', 'FR')();
}

// function rebuildCart (store: Store) {
//   const rebuildCode = data.currentRoute(store).query['some query string key']; // check url query string for rebuild code
//   if (rebuildCode) {
//     // build new cart and products from query string

//     // using cart module:
//     // 1) clear current cart - unsure how to do this safely
//     // 2) add new items to the cart - using @vue-storefront/core/modules/cart/store/actions/itemActions.ts addItems function
//   }
// }

export function initialCapture (store: Store) {
  afterAppInit(store);

  // call rebuild cart function here
  // rebuildCart(store);

  if (data.categoryProducts(store).length) {
    categoryPageVisited(store, data.currentCategory(store));
  } else if (data.currentProduct(store)) {
    productPageVisited(store);
  } else {
    otherPageVisited(data.currentRoute(store));
  }
}
