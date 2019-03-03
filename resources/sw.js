'use strict';
importScripts('/jumpex/resources/sw-toolbox.js');
toolbox.precache(['/jumpex/game.html','/jumpex/resources/game.min.css']);
toolbox.router.get('/jumpex/resources/*', toolbox.cacheFirst);
toolbox.router.get('/jumpex/*', toolbox.networkFirst, { networkTimeoutSeconds: 5});
