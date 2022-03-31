var APP_NAME = 'myResume';
var APP_VER = '0.6';
var CACHE_NAME = APP_NAME + '-' + APP_VER;

const REQUIRED_FILES = ['/', '/index.html', 'assets/css/style.css', 'assets/js/main.js'];

// Service Worker Diagnostic. Set true to get console logs.
var APP_DIAG = false;

//Service Worker Function Below.
self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(CACHE_NAME)
		.then(function(cache) {
			//Adding files to cache
			return cache.addAll(REQUIRED_FILES);
		}).catch(function(error) {
			//Output error if file locations are incorrect
			if(APP_DIAG){console.log('Service Worker Cache: Error Check REQUIRED_FILES array in _service-worker.js - files are missing or path to files is incorrectly written -  ' + error);}
		})
		.then(function() {
			//Install SW if everything is ok
			return self.skipWaiting();
		})
		.then(function(){
			if(APP_DIAG){console.log('Service Worker: Cache is OK');}
		})
	);
	if(APP_DIAG){console.log('Service Worker: Installed');}
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		//Fetch Data from cache if offline
		caches.match(event.request)
			.then(function(response) {
				if (response) {return response;}
				return fetch(event.request);
			}
		)
	);
	if(APP_DIAG){console.log('Service Worker: Fetching '+APP_NAME+'-'+APP_VER+' files from Cache');}
});

self.addEventListener('activate', function(event) {
	event.waitUntil(self.clients.claim());
	event.waitUntil(
		//Check cache number, clear all assets and re-add if cache number changed
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames
					.filter(cacheName => (cacheName.startsWith(APP_NAME + "-")))
					.filter(cacheName => (cacheName !== CACHE_NAME))
					.map(cacheName => caches.delete(cacheName))
			);
		})
	);
	if(APP_DIAG){console.log('Service Worker: Activated')}
});

self.addEventListener('message', function (event) {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
  });

self.addEventListener('push',function(event){
	const data = event.data.json();
	var options;

	if(data.url){
		options = {
			body: data.body,
			badge: "pwanotification.png",
			icon: "icon-192x192.png",
			vibrate: [100,50,100],
			data:{url:data.url},
			actions: [
				{
					action: 'web-action',
					tittle: 'Open web'
				}
			]
		}
	}else{
		options = {
			body: data.body,
			badge: "pwanotification.png",
			icon: "icon-192x192.png",
			vibrate: [100,50,100]
		}
	}
	self.registration.showNotification(data.title,options)
});

self.addEventListener('notificationclick',function(event){
	if(!event.action){
		console.info('Notification clik');
		return;
	}
	switch(event.action){
		case 'web-action':
			event.notification.close();

			event.waitUntil(
				clients.openWindow("https://zulhelmi.netlify.app")
			);
			break;
	}
});