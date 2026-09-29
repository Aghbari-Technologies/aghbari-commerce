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

export const MAX_RECENT_SEARCHES=8;
export function pushRecentSearch(searches:readonly string[],query:string){
 const value=query.trim();
 if(value.length<2)return [...searches].slice(0,MAX_RECENT_SEARCHES);
 return Array.from(new Set([value,...searches.map(x=>x.trim()).filter(Boolean)])).slice(0,MAX_RECENT_SEARCHES);
}
