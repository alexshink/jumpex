function getId(id){
  return document.getElementById(id);
};

function addClass(id, addedClass){
  getId(id).classList.add(addedClass);
};

function removeClass(id, removeClass){
  getId(id).classList.remove(removeClass);
};

var html = document.documentElement,
    page = getId('page'),
    road = getId('road'),
    obstacles = getId('obstacles'),
    renderLoopTimeout,

    // animation speed
    roadSpeed = parseFloat(getComputedStyle(road).animationDuration),
    pixelsPerMs = roadSpeed / 388, // road background image = 388

    // obstacles
    resources = {
      'obstaclesItems': {
        'bomb': {
          'img': 'resources/img/obstacles/bomb.png',
          'cls': 'obstacle_bomb obstacle_destructible'
        },
        'fire': {
          'img': 'resources/img/obstacles/fire.gif',
          'cls': 'obstacle_fire'
        },
        'plasm': {
          'img': 'resources/img/obstacles/plasm.gif',
          'cls': 'obstacle_plasm'
        },
        'robot': {
          'img': 'resources/img/obstacles/robot.gif',
          'cls': 'obstacle_robot obstacle_destructible'
        }
      },
      'additional': {
        'coin': {
          'img': 'resources/img/coin.svg'
        },
        'jumpex': {
          'img': 'resources/img/jumpex.gif'
        },
        'explosive': {
          'img': 'resources/img/obstacles/explosive.gif'
        },
        'buttonfire': {
          'img': 'resources/img/controls__button_type_fire.svg'
        },
        'buttonjump': {
          'img': 'resources/img/controls__button_type_jump.svg'
        },
        'fireshot': {
          'img': 'resources/img/fire-shot.svg'
        }
      }
    },

    obstaclesItems = resources.obstaclesItems;

    menu = getId('menu'),
    menuButtons = document.getElementsByClassName('menu__button');

// preload images
function preloadObstacles(resources, finish){
  var counter = 0,
      imgCount = Object.keys(resources).length;
  Object.keys(resources).map(function(objectKey) {
    preloadImage(resources[objectKey].img, function(){
      counter++;
      if ( counter == imgCount ) {
        finish();
      };
    });
  });
  function preloadImage(url, imageLoaded){
    var img = new Image();
    img.onload = imageLoaded;
    img.src = url;
  }
};

preloadObstacles(resources.obstaclesItems, function(){
  // removeClass('page', 'page_preload');
});

// Object.keys(resources).map(function(objectKey) {
//   Object.keys(resources[objectKey]).map(function(objectKeys) {
//     console.log('2: ' + resources[objectKey][objectKeys].img)
//   });
// });

console.log(Object.keys(resources).length)

// menu
for (var i = 0; i < menuButtons.length; i++) {
  menuButtons[i].addEventListener('click', function(){
    if ( page.className.indexOf('page_rungame') == -1 && menu.className.indexOf('menu_disable') == -1 ) {
      switch (this.id) {
        case 'menu-start':
          runGame();
          break;
        case 'menu-fullscreen':
          this.classList.toggle('menu__button_fullscreen');
          if ( this.className.indexOf('fullscreen') != -1 ) {
            openFullscreen();
          } else {
            closeFullscreen();
          };
          break;
      };
    };
  }, false);
};

function runGame(){

  addClass('page', 'page_rungame');
  addClass('menu', 'menu_disable');

  // remove all obstacles
  obstacles.innerHTML = '';

  // render hero
  var heroRender = document.createElement('div');

  heroRender.id = 'hero';
  heroRender.className = 'hero';
  heroRender.innerHTML = '<img src="resources/img/jumpex.gif">';
  page.appendChild(heroRender);

  // hero jump
  function heroJump(){
    if( getId('hero').className.indexOf('hero_jump') == -1 ) {
      addClass('hero', 'hero_jump');
      setTimeout(function(){
        try {
          removeClass('hero', 'hero_jump');
        } catch {};
      }, 700);
    };
  };

  // hero fire
  function heroFire(){
    if( getId('hero').className.indexOf('hero_fire') == -1 ) {
      // render shot
      var shot = document.createElement('span');
      shot.className = 'fire-shot';
      shot.style.bottom = parseFloat(getComputedStyle(getId('hero')).bottom) + 35 + 'px';
      shot.style.left = getId('hero').getBoundingClientRect().left + 40 + 'px';
      page.appendChild(shot);
      // shot animation
      shotSpeed = window.innerWidth * (pixelsPerMs-0.001);
      var newShot = document.querySelectorAll('.fire-shot:nth-last-of-type(1)')[0];
      newShot.style['transition'] = 'transform linear ' + shotSpeed + 's';
      setTimeout(function(){
        newShot.style['transform'] = 'translateX(' + window.innerWidth + 'px)';
      }, 10)
      // hero class
      addClass('hero', 'hero_fire');
      setTimeout(function(){
        removeClass('hero', 'hero_fire');
      }, 1400);
    };
  };

  // desktop hero controls
  document.onkeydown = function(e){
    switch (e.keyCode) {
      case 38: // 'arrow up' jump
        heroJump();
        break;
      case 32: // 'space' fire
        heroFire();
        break;
    };
  };

  // mobile hero controls
  document.addEventListener('touchstart', function(e){
    switch (e.target.id) {
      case 'control-jump':
        heroJump();
        break;
      case 'control-fire':
        heroFire();
        break;
    };
  }, false);

  // coins storage
  if ( !localStorage.coins ) {
    localStorage.coins = 0;
  };

  // render coins
  var renderCoins = document.createElement('div'),
      coinsCurrent,
      coinsAll;

  renderCoins.id = 'coins';
  renderCoins.className = 'coins';
  renderCoins.innerHTML = '<div class="coins__inner">' +
                            '<p id="coins__current" class="coins__current">0</p>' +
                            '<p class="coins__bank">' +
                              'Bank: <span id="coins__all" class="coins__all">' + 
                                       localStorage.coins + 
                                     '</span>' +
                            '</p>' +
                          '</div>';
  page.appendChild(renderCoins);
  coinsCurrent = getId('coins__current');
  coinsAll = getId('coins__all');
  
  // increase coins
  function increaseCoins(count){
    if ( !count ) {
      count = 1;
    };
    coinsCurrent.innerHTML = parseInt(coinsCurrent.innerHTML) + count;
    localStorage.coins = parseInt(localStorage.coins) + count;
    coinsAll.innerHTML = localStorage.coins;
  };

  // get coins
  var getCoins;
  setTimeout(function(){
    if ( page.className.indexOf('page_rungame') != -1 ) {
      getCoins = setInterval(function(){
        increaseCoins();
      }, 100);
    };
  }, 1400);

  // render obstacles
  function renderObstacle(){      
    if ( page.className.indexOf('page_rungame') != -1 ) {
      var renderObstacle = document.createElement('div'),
          renderObstacleImg = document.createElement('img'),
          lastObstacle,
          lastObstacleSpeed,
          // random key from obstacles
          randomObstacle = obstaclesItems[Object.keys(obstaclesItems)[Object.keys(obstaclesItems).length * Math.random() << 0]];

      // create obstacle
      renderObstacleImg.src = randomObstacle.img;
      renderObstacle.className = 'obstacle ' + randomObstacle.cls;
      renderObstacle.appendChild(renderObstacleImg);
      obstacles.appendChild(renderObstacle);

      // obstacle animation
      lastObstacle = obstacles.lastChild;
      lastObstacleSpeed = (lastObstacle.getBoundingClientRect().left+100) * pixelsPerMs;
      lastObstacle.style['transition'] = 'transform linear ' + lastObstacleSpeed + 's';
      lastObstacle.style['transform'] = 'translateX(-' + (lastObstacle.getBoundingClientRect().left+100) + 'px)';
    };
  };

  // render obstacles loop
  (function renderObstacleLoop(){
    var obstacleRenderDelay = Math.floor(Math.random() * 1500) + 700;
    if ( page.className.indexOf('page_rungame') != -1 ) {
      renderLoopTimeout = setTimeout(function(){
        renderObstacle();
        renderObstacleLoop();
      }, obstacleRenderDelay);
    }
  }());

  // detection
  var detection = setInterval(function(){
    try {
    // OBSTACLE DETECTION
      var heroOffsetLeft = getId('hero').getBoundingClientRect().left,
          heroPosX = heroOffsetLeft + getId('hero').getBoundingClientRect().width,
          heroPosY = parseFloat(getComputedStyle(getId('hero')).bottom),

          firstObstacle = document.getElementsByClassName('obstacle')[0],
          obstaclePosX = firstObstacle.getBoundingClientRect().left,
          obstacleLeftWidth = obstaclePosX + firstObstacle.getBoundingClientRect().width,
          obstaclePosY = parseFloat(getComputedStyle(firstObstacle).bottom) + firstObstacle.getBoundingClientRect().height;
      // collision
      if ( (obstaclePosX <= heroPosX && obstacleLeftWidth > heroOffsetLeft) && obstaclePosY > heroPosY ) {
        firstObstacle.classList.add('obstacle_active');
        window.stopGame();
        // obstacle explosion
        if ( firstObstacle.className.indexOf('destructible') != -1 ) {
          firstObstacle.firstElementChild.remove();
          firstObstacle.appendChild(document.createElement('img'));
          firstObstacle.firstElementChild.src = 'resources/img/obstacles/explosive.gif';
          setTimeout(function(){
            firstObstacle.remove();
          }, 2500);
        };
      };
      // remove useless obstacle
      if ( firstObstacle.getBoundingClientRect().left <= -100 ) {
        firstObstacle.remove();
      };

    // FIRESHOT DETECTION
      var shot = document.querySelectorAll('.fire-shot:nth-last-of-type(1)')[0],
          shotPositionX = shot.getBoundingClientRect().left,
          shotWidth = shot.getBoundingClientRect().width,
          shotPositionY = parseFloat(getComputedStyle(shot).bottom),
          destructibleObstacles = document.getElementsByClassName('obstacle_destructible');
      // find destructible obstacles ahead
      for (var i=0; i<destructibleObstacles.length; i++) {
        var destructibleObstaclePosition = destructibleObstacles[i].getBoundingClientRect().left + destructibleObstacles[i].getBoundingClientRect().width;
        if ( destructibleObstaclePosition < shotPositionX ) {
          destructibleObstacles.splice(i, 1);
        };
      };
      // remove shot and destructible obstacle
      var closestObstaclePositionX = destructibleObstacles[0].getBoundingClientRect().left,
          closestObstaclePositionY = parseFloat(getComputedStyle(destructibleObstacles[0]).bottom) + destructibleObstacles[0].getBoundingClientRect().height;
      if (
           ((shotPositionX + shotWidth) >= closestObstaclePositionX) 
           &&
           (shotPositionY - 15) <= closestObstaclePositionY
      ) {
        shot.remove();
        destructibleObstacles[0].remove();
      };
      // remove shot if the bullet didn't hit anywhere
      if ( document.getElementsByClassName('fire-shot')[0].getBoundingClientRect().left >= window.innerWidth ) {
        document.getElementsByClassName('fire-shot')[0].remove();
      };

    } catch {};
  }, 10);

  // stop game
  window.stopGame = function(){
    clearInterval(getCoins);
    clearInterval(detection);
    menu.scrollTop = 0;
    removeClass('page', 'page_rungame');
    setTimeout(function(){
      removeClass('menu', 'menu_disable');
    }, 700);
    renderCoins.remove();
    getId('hero').remove();
    // stop active obstacle
    var activeObstacle = document.getElementsByClassName('obstacle')[0];
    activeObstacle.style['left'] = activeObstacle.getBoundingClientRect().left + 'px';
    activeObstacle.style['transition'] = 'none';
    activeObstacle.style['transform'] = 'none';
  };

};

// resize
window.addEventListener('resize', function(){
  if ( page.className.indexOf('page_rungame') != -1 ) {
    window.stopGame();
  }; 
}, false);

/* fullscreen on */
function openFullscreen(){
  if (html.requestFullscreen) {
    html.requestFullscreen();
  } else if (html.mozRequestFullScreen) {
    html.mozRequestFullScreen();
  } else if (html.webkitRequestFullscreen) { 
    html.webkitRequestFullscreen();
  } else if (html.msRequestFullscreen) {
    html.msRequestFullscreen();
  };
};

/* fullscreen off */
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  };
};
