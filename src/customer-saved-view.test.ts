import {describe,expect,it} from 'vitest';
import {MAX_RECENT_PRODUCT_IDS,normalizeSavedIds,pushRecentlyViewed,toggleSavedProduct} from './customer-saved-view';
describe('customer saved products',()=>{
 it('deduplicates and bounds ids',()=>expect(normalizeSavedIds(['a','a','','b','c'],3)).toEqual(['a','b','c']));
 it('toggles saved products',()=>{expect(toggleSavedProduct(['a','b'],'b')).toEqual(['a']);expect(toggleSavedProduct(['a','b'],'c')).toEqual(['c','a','b']);});
 it('moves recent products to the front and bounds recents',()=>{expect(pushRecentlyViewed(['a','b','c'],'b')).toEqual(['b','a','c']);expect(pushRecentlyViewed(Array.from({length:MAX_RECENT_PRODUCT_IDS},(_,i)=>String(i)),'new')).toHaveLength(MAX_RECENT_PRODUCT_IDS);});
});
