// ============================================================
// CASA DE ESTUDO — Service Worker
// Versão nova: SEMPRE busca o arquivo atualizado na internet.
// Só usa o guardado no celular se estiver sem sinal.
//
// >>> Toda vez que subir arquivo novo, troque o número aqui embaixo <<<
// ============================================================
const VERSAO = 'casa-de-estudo-v8';

const ESSENCIAIS = [
  './',
  './index.html',
  './aluno.html',
  './admin.html',
  './entidades.html',
  './mensalidade.html'
];

// Instala e já assume o controle sem esperar
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(VERSAO).then(c => c.addAll(ESSENCIAIS).catch(() => null))
  );
});

// Limpa tudo que é de versão antiga
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(nomes.filter(n => n !== VERSAO).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Rede primeiro, cache só como salva-vidas
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return;

  // Nada do Supabase é guardado — dados sempre ao vivo
  if (req.url.includes('supabase.co')) return;

  e.respondWith(
    fetch(req)
      .then(resp => {
        const copia = resp.clone();
        caches.open(VERSAO).then(c => c.put(req, copia)).catch(() => null);
        return resp;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});

// Permite que a página mande atualizar na hora
self.addEventListener('message', e => {
  if (e.data === 'skip' || e.data === 'ATUALIZAR_AGORA') self.skipWaiting();
});
