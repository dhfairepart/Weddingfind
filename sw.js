/* FuturMariés — Service Worker
   À placer à la RACINE du site (pas dans un dossier). */

self.addEventListener("install", function (event) {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

/* Réception d'une notification push envoyée par le serveur */
self.addEventListener("push", function (event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {
    try { data = { body: event.data.text() }; } catch (e2) { data = {}; }
  }
  var title = data.title || "FuturMariés.fr";
  var options = {
    body: data.body || "Vous avez une nouvelle notification.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    image: data.image || undefined,
    data: { url: data.url || "/" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

/* Clic sur la notification : amener l'utilisateur directement au bon endroit */
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async function (list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.url.indexOf(self.location.origin) === 0) {
          try { await c.focus(); } catch (e) {}
          try { c.postMessage({ type: "ojv-go", url: url }); } catch (e) {}
          try { await c.navigate(url); } catch (e) {}
          return;
        }
      }
      if (self.clients.openWindow) await self.clients.openWindow(url);
    })
  );
});
