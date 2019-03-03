'use strict';
importScripts('sw-toolbox.js');
toolbox.precache(['game.html','resources/game.min.css']);
toolbox.router.get('resources/*', toolbox.cacheFirst);
toolbox.router.get('*', toolbox.networkFirst, { networkTimeoutSeconds: 5});
