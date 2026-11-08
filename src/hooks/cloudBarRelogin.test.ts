import { expect, it } from "vitest";
import { build } from "vite";
import { chromium } from "playwright";
import path from "node:path";

// Real React renderer; only storage/network boundaries are in-memory fixtures.
// No Supabase import, credentials, app storage, or real account is used.
it.each([0, 25])("restores the saved cloud bar after relogin (stable catalogs, cache delay %i ms)", async (barReadDelay) => {
  const hook = (name: string) => JSON.stringify(path.resolve(`src/hooks/${name}.ts`).replaceAll("\\", "/"));
  const entry = `
import React,{useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {useSavedBar} from ${hook("useSavedBar")};
import {useFavorites} from ${hook("useFavorites")};
import {activateAccountCache,clearAccountCaches} from ${JSON.stringify(path.resolve("src/services/accountCache.ts").replaceAll("\\", "/"))};
const w=window;
w.trace=[];w.cache=new Map();w.pending=[];w.holdRemote=false;
w.cloudBar=['campari','sweet-vermouth'];w.cloudFavorites=['americano'];w.cloudB={bar:['b-only'],favorites:['b-drink']};
const ingredients=[{id:'campari'},{id:'sweet-vermouth'},{id:'guest'},{id:'edit'},{id:'b-only'}]; // stable identity, as App.tsx
const base='domashniy-bar:selected-ingredients';
w.cache.set(base,JSON.stringify(['guest']));
w.cache.set('domashniy-bar:favorites',JSON.stringify(['guest-drink']));
w.cache.set(base+':user:QA',JSON.stringify(w.cloudBar));
let user='QA',catalogGeneration=0;
function App(){
 const catalog=useMemo(()=>[...ingredients],[catalogGeneration]);
 const bar=useSavedBar(catalog,user,true);
 const ids=useMemo(()=>['americano','guest-drink','edit-drink','b-drink'],[catalogGeneration]);
 const favorites=useFavorites(ids,user,true);
 w.current={user,bar,favorites};
 w.trace.push({event:'render',user:user??'guest',bar:bar.selectedIngredients,loaded:bar.hasLoadedSavedBar,favorites:favorites.favorites,status:bar.syncStatus,favoritesStatus:favorites.favoritesSyncStatus});
 return React.createElement('div',null,JSON.stringify({bar:bar.selectedIngredients,favorites:favorites.favorites}));
}
const root=createRoot(document.getElementById('root'));
w.signOut=async()=>{user=undefined;root.render(React.createElement(App));await clearAccountCaches('QA');};
w.switchToB=()=>{activateAccountCache('B');user='B';root.render(React.createElement(App));};
w.signIn=()=>{activateAccountCache('QA');user='QA';root.render(React.createElement(App));};
w.releaseRemote=()=>{w.holdRemote=false;w.pending.splice(0).forEach(resolve=>resolve());};
w.catalogReload=()=>{catalogGeneration++;root.render(React.createElement(App));};
root.render(React.createElement(App));
`;
  const fixtureStorage = `const w=window;export default {
getItem:async(key)=>{const value=w.cache.get(key)??null;w.trace.push({event:'get',key,value});const delay=${barReadDelay};if(delay)await new Promise(resolve=>setTimeout(resolve,delay));return value;},
setItem:async(key,value)=>{w.trace.push({event:'set',key,value});w.cache.set(key,value);},
removeItem:async(key)=>{w.trace.push({event:'remove',key});w.cache.delete(key);}
};`;
  const fixtureBar = `export const loadRemoteUserBar=async(user)=>{window.trace.push({event:'load-bar',user});if(window.holdRemote)await new Promise(resolve=>window.pending.push(resolve));return {ingredientIds:[...(user==='B'?window.cloudB.bar:window.cloudBar)],updatedAt:'v1'};};
export const saveRemoteUserBar=async(user,ids,version)=>{window.trace.push({event:'save-bar',user,ids,version});if(user==='B')window.cloudB.bar=[...ids];else window.cloudBar=[...ids];return {status:'saved',bar:{ingredientIds:[...ids],updatedAt:'v2'}};};`;
  const fixtureFavorites = `export const loadRemoteUserFavorites=async(user)=>{window.trace.push({event:'load-favorites',user});if(window.holdRemote)await new Promise(resolve=>window.pending.push(resolve));return {cocktailIds:[...(user==='B'?window.cloudB.favorites:window.cloudFavorites)],updatedAt:'v1'};};
export const saveRemoteUserFavorites=async(user,ids,version)=>{window.trace.push({event:'save-favorites',user,ids,version});if(user==='B')window.cloudB.favorites=[...ids];else window.cloudFavorites=[...ids];return {status:'saved',favorites:{cocktailIds:[...ids],updatedAt:'v2'}};};`;
  const result = await build({
    configFile: false, logLevel: "silent",
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    plugins: [{ name: "cloud-bar-relogin-fixture", enforce: "pre",
      resolveId(id) {
        if (id.endsWith("virtual:cloud-bar-relogin")) return "\0entry";
        if (id === "@react-native-async-storage/async-storage") return "\0storage";
        if (id.includes("userBarService")) return "\0bar";
        if (id.includes("userFavoritesService")) return "\0favorites";
      },
      load(id) { return ({ "\0entry": entry, "\0storage": fixtureStorage, "\0bar": fixtureBar, "\0favorites": fixtureFavorites } as Record<string,string>)[id]; },
    }],
    build: { write: false, minify: false, lib: { entry: "virtual:cloud-bar-relogin", name: "CloudBarRelogin", formats: ["iife"] } },
  });
  const outputs = Array.isArray(result) ? result : [result];
  const chunk = outputs.flatMap((output: any) => output.output ?? []).find((output: any) => output.type === "chunk");
  expect(chunk).toBeTruthy();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.route("**/*", route => route.abort());
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({ content: chunk.code });
    await page.waitForFunction(() => (window as any).current?.bar.selectedIngredients.length === 2 && (window as any).current?.favorites.favorites.length === 1);
    await page.waitForTimeout(1000);
    await page.evaluate(() => (window as any).signOut());
    await page.waitForFunction(() => (window as any).current.user === undefined && (window as any).current.bar.hasLoadedSavedBar);
    await page.waitForTimeout(1000);
    expect(await page.evaluate(() => {const w=window as any;return {bar:w.current.bar.selectedIngredients,favorites:w.current.favorites.favorites};})).toEqual({bar:["guest"],favorites:["guest-drink"]});
    await page.evaluate(() => (window as any).signIn());
    await page.waitForFunction(() => (window as any).current.user === 'QA' && (window as any).current.bar.hasLoadedSavedBar);
    await page.waitForTimeout(1000);
    const observed = await page.evaluate(() => {
      const w = window as any;
      return {bar:w.current.bar.selectedIngredients, favorites:w.current.favorites.favorites,
        status:w.current.bar.syncStatus,error:w.current.bar.syncError, cloudBar:w.cloudBar,trace:w.trace};
    });
    const remoteReads = observed.trace.filter((event: any) => event.event === "load-bar").length;
    const remoteWrites = observed.trace.filter((event: any) => event.event === "save-bar");
    console.log("CLOUD_BAR_RELOGIN", JSON.stringify({barReadDelay, bar:observed.bar, favorites:observed.favorites, remoteReads, remoteWrites}));
    expect(remoteWrites).toEqual([]);
    expect(observed.trace.filter((event: any) => event.event === "save-favorites")).toEqual([]);
    expect(remoteReads).toBe(2);
    expect(observed.trace.filter((event: any) => event.event === "load-favorites")).toHaveLength(2);
    const initial = observed.trace.find((event: any) => event.event === "render");
    expect(initial.status).toBe("syncing");
    expect(initial.favoritesStatus).toBe("syncing");
    const signedIn = observed.trace.filter((event: any) => event.event === "render" && event.user === "QA");
    const returnFromGuest = signedIn.find((event: any) => event.bar.includes("guest"));
    expect(returnFromGuest.status).toBe("syncing");
    expect(returnFromGuest.favoritesStatus).toBe("syncing");
    expect(observed.status).toBe("remote");
    expect(observed.error).toBeNull();
    expect(observed.favorites).toEqual(["americano"]);
    expect(observed.cloudBar).toEqual(["campari", "sweet-vermouth"]);
    expect(observed.bar).toEqual(["campari", "sweet-vermouth"]);
    // Debounced saves must still work after the hydration write-skip.
    await page.evaluate(() => {const w=window as any;w.current.bar.setSelectedIngredients((ids: string[])=>[...ids,'edit']);w.current.favorites.toggleFavorite('edit-drink');});
    await page.waitForTimeout(1000);
    const edited = await page.evaluate(() => {const w=window as any;return {bar:w.cloudBar,favorites:w.cloudFavorites,writes:w.trace.filter((e: any)=>e.event.startsWith('save-'))};});
    expect(edited.bar).toEqual(["campari", "sweet-vermouth", "edit"]);
    expect(edited.favorites).toEqual(["americano", "edit-drink"]);
    expect(edited.writes).toHaveLength(2);
    expect(edited.writes.every((e: any)=>e.user==='QA' && e.ids.length>0 && e.version==='v1')).toBe(true);
    // Direct A → B must hydrate only B, with neither A nor guest merging.
    await page.evaluate(() => {const w=window as any;w.holdRemote=true;w.switchToB();});
    await page.waitForFunction(() => (window as any).pending.length === 2);
    await page.waitForTimeout(1000);
    const pending = await page.evaluate(() => {const w=window as any;return {status:w.current.bar.syncStatus,favoritesStatus:w.current.favorites.favoritesSyncStatus,renders:w.trace.filter((e: any)=>e.event==='render' && e.user==='B'),writes:w.trace.filter((e: any)=>e.event.startsWith('save-'))};});
    expect(pending.status).toBe("syncing");
    expect(pending.favoritesStatus).toBe("syncing");
    expect(pending.renders.every((e: any)=>e.status!=="remote" && e.favoritesStatus!=="remote")).toBe(true);
    expect(pending.writes).toEqual(edited.writes);
    await page.evaluate(() => (window as any).releaseRemote());
    await page.waitForTimeout(1000);
    const switched = await page.evaluate(() => {const w=window as any;return {bar:w.current.bar.selectedIngredients,favorites:w.current.favorites.favorites,writes:w.trace.filter((e: any)=>e.event.startsWith('save-')),cloudB:w.cloudB};});
    expect(switched.bar).toEqual(["b-only"]);
    expect(switched.favorites).toEqual(["b-drink"]);
    expect(switched.cloudB).toEqual({bar:["b-only"],favorites:["b-drink"]});
    expect(switched.writes).toEqual(edited.writes);
    // Catalog identity changes cannot be required to trigger hydration, but
    // when they do happen a same-account cache generation must hydrate too.
    await page.evaluate(() => (window as any).catalogReload());
    await page.waitForTimeout(1000);
    const reloaded = await page.evaluate(() => {const w=window as any;return {bar:w.current.bar.selectedIngredients,favorites:w.current.favorites.favorites,barReads:w.trace.filter((e: any)=>e.event==='load-bar' && e.user==='B'),reads:w.trace.filter((e: any)=>e.event==='load-favorites' && e.user==='B'),writes:w.trace.filter((e: any)=>e.event.startsWith('save-'))};});
    expect(reloaded.bar).toEqual(["b-only"]);
    expect(reloaded.favorites).toEqual(["b-drink"]);
    expect(reloaded.reads).toHaveLength(2);
    expect(reloaded.barReads).toHaveLength(2);
    expect(reloaded.writes).toEqual(edited.writes);
  } finally { await browser.close(); }
}, 30000);
