export const MAX_SAVED_PRODUCT_IDS=100;
export const MAX_RECENT_PRODUCT_IDS=12;
export function normalizeSavedIds(ids:readonly string[],max=MAX_SAVED_PRODUCT_IDS){
 const seen=new Set<string>();const result:string[]=[];
 for(const raw of ids){const id=String(raw??'').trim();if(!id||seen.has(id))continue;seen.add(id);result.push(id);if(result.length>=max)break;}
 return result;
}
export function toggleSavedProduct(ids:readonly string[],productId:string){
 const id=productId.trim();if(!id)return normalizeSavedIds(ids);
 return ids.includes(id)?ids.filter(x=>x!==id):normalizeSavedIds([id,...ids]);
}
export function pushRecentlyViewed(ids:readonly string[],productId:string){
 const id=productId.trim();if(!id)return normalizeSavedIds(ids,MAX_RECENT_PRODUCT_IDS);
 return normalizeSavedIds([id,...ids.filter(x=>x!==id)],MAX_RECENT_PRODUCT_IDS);
}
