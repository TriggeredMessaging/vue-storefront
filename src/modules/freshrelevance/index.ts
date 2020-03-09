import { StorefrontModule } from '@vue-storefront/core/lib/modules';
import { isServer } from '@vue-storefront/core/helpers'

const freshrelevanceStore = {
  namespaced: true,
  state: {
    key: null
  }
};

const freshrelevanceSnippet = (frid) => (function (h, o, t, j, a, r) {
  h.hj =
    h.hj ||
    function () {
      (h.hj.q = h.hj.q || []).push(arguments);
    };
  h._hjSettings = {hjid: frid, hjsv: 6};
  a = o.getElementsByTagName('head')[0];
  r = o.createElement('script');
  r.async = 1;
  r.src = t + h._hjSettings.hjid + j;
  a.appendChild(r);
})(window as any, document, '//d81mfvml8p5ml.cloudfront.net/', '.js');

export const FreshrelevanceModule: StorefrontModule = function ({store, appConfig}) {
  store.registerModule('freshrelevance', freshrelevanceStore)
  console.log(isServer);
  console.dir(appConfig.freshrelevance);
  if (!isServer && appConfig.freshrelevance && appConfig.freshrelevance.id) {
    freshrelevanceSnippet(appConfig.freshrelevance.id);
  }
}
