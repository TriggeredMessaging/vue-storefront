import config from 'config';
import { Store } from './types';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import { getThumbnailPath } from '@vue-storefront/core/helpers';
import { productThumbnailPath } from '@vue-storefront/core/helpers';
import getThumbnailForProduct from '@vue-storefront/core/modules/cart/helpers/getThumbnailForProduct';

export const $TB = () => (window as any).$TB;

export const data = {
  categoryProducts: (store: Store) =>
    store.getters['category-next/getCategoryProducts'],
  currentProduct: (store: Store) =>
    store.getters['product/getCurrentProduct'],
  cart: (store: Store) => ({
    items: store.getters['cart/getCartItems'],
    totals: store.getters['cart/getTotals'].reduce(
      (totals, { code, value }) => ({ ...totals, [code]: value }),
      {}
    ),
    coupon: store.getters['cart/getCoupon']
  }),
  user: (store: Store) => ({
    email: store.getters['user/getUserEmail']
  })
};

export function getImageForProduct (product: CartItem) {
  const thumbnail = productThumbnailPath(product);
  return getThumbnailPath(
    thumbnail,
    config.products.gallery.width,
    config.products.gallery.height
  );
}

export function buildProductImageUrls (product: CartItem) {
  const image = getImageForProduct(product);
  const thumbnail = getThumbnailForProduct(product);
  let configurable_children = product.configurable_children;

  if (configurable_children) {
    configurable_children = configurable_children.map(
      buildProductImageUrls
    );
  }

  return { ...product, image, thumbnail, configurable_children };
}
