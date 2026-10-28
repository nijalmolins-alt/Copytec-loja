const CACHE='copytec-loja-v2';
const STATIC=['./assets/icon.svg','./assets/copytec-mascotes.webp','./assets/controles-copytec.webp'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(STATIC)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('copytec-loja-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  // Never cache Supabase/API responses, the admin page, or config.js. The catalog must stay current.
  if(url.origin!==self.location.origin||url.pathname.endsWith('/admin.html')||url.pathname.endsWith('/config.js')||url.pathname.includes('/rest/v1/')||url.pathname.includes('/auth/'))return;
  if(request.mode==='navigate'||url.pathname.endsWith('.html')){
    event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy))}return response}).catch(()=>caches.match(request).then(cached=>cached||caches.match('./index.html'))));
    return;
  }
  if(STATIC.some(path=>url.pathname.endsWith(path.replace('./',''))))event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));
});
