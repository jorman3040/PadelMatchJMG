const CACHE='padelmatch-v5';
const ASSETS=['/','/index.html','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png','/art/padel-bg.svg','/art/logo.png','/art/ball.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE&&caches.delete(k))))) });
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(net=>{const cp=net.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); return net}).catch(()=>caches.match('/index.html'))))});
