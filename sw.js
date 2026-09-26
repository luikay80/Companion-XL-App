const CACHE='companion-xl-v7';
const CORE=['./','./index.html','./app-v2.js','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(res=>{
    const copy=res.clone();
    if(new URL(e.request.url).origin===self.location.origin){caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});}
    return res;
  })));
});