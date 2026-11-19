/* OuiJeVeux — Service Worker
   À placer à la RACINE du site : https://ouijeveux.fr/sw.js
   (pas dans un dossier, sinon les notifications push ne fonctionneront pas) */

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
  var title = data.title || "OuiJeVeux.fr";
  var options = {
    body: data.body || "Vous avez une nouvelle notification.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

/* Clic sur la notification : ouvrir le site */
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf(url) !== -1 && "focus" in list[i]) return list[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
