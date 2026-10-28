const CACHE="circuit-v5";
const CORE=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // réseau d'abord pour la page (mises à jour), cache en secours hors ligne
    if(req.mode==="navigate"){e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put("index.html",c));return r}).catch(()=>caches.match("index.html")));return}
    e.respondWith(caches.match(req).then(m=>m||fetch(req)));return;
  }
  if(url.host.endsWith("googleapis.com")||url.host.endsWith("gstatic.com")){
    e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(m=>{const f=fetch(req).then(r=>{c.put(req,r.clone());return r}).catch(()=>m);return m||f})));
  }
});
