// Super Gabi: funciona sin señal. La app se guarda en el teléfono; los datos van a Supabase.
const V='super-gabi-v1';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  const own=u.origin===location.origin;
  const fonts=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(!own&&!fonts)return; // Supabase y Gemini siempre por red
  if(own&&(r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html'))){
    // red primero para recibir actualizaciones; si no hay señal, la copia guardada
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(ca=>ca.put('./index.html',c));return res}).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(V).then(ca=>ca.put(r,c))}return res}).catch(()=>hit);
    return hit||net;
  }));
});
