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
    obstaclesItems = {
      bomb: {
        img: 'resources/img/obstacles/bomb.png',
        cls: 'obstacle_bomb'
      },
      fire: {
        img: 'resources/img/obstacles/fire.gif',
        cls: 'obstacle_fire'
      },
      plasm: {
        img: 'resources/img/obstacles/plasm.gif',
        cls: 'obstacle_plasm'
      },
      robot: {
        img: 'resources/img/obstacles/robot.gif',
        cls: 'obstacle_robot'
      }
    },

    // mobile controls
    btnJump = getId('btnJump'),
    menu = getId('menu'),
    menuButtons = document.getElementsByClassName('menu__button');

// preload obstacles images
function preloadObstacles(obstaclesItems, finish){
  var counter = 0,
      imgCount = Object.keys(obstaclesItems).length;
  Object.keys(obstaclesItems).map(function(objectKey) {
    preloadImage(obstaclesItems[objectKey].img, function(){
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

// preloadObstacles(obstaclesItems, function(){
//   removeClass('page', 'page_preload');
// });

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
          }
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
  var heroRender = document.createElement('div'),
      hero;

  heroRender.id = 'hero';
  heroRender.className = 'hero';
  heroRender.innerHTML = '<img src="resources/img/jumpex.gif">';
  page.appendChild(heroRender);
  hero = getId('hero');

  // hero jump
  function heroJump(){
    if( hero.className.indexOf('hero_jump') == -1 ) {
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
    if( hero.className.indexOf('hero_fire') == -1 ) {
      // render shot
      var fireShot = document.createElement('span');
      fireShot.className = 'fire-shot';
      hero.appendChild(fireShot);
      // hero class
      addClass('hero', 'hero_fire');
      setTimeout(function(){
        removeClass('hero', 'hero_fire');
      }, 700);
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

  // mobile jump
  document.addEventListener('touchstart', function(e){
    if ( e.target.className.indexOf('jump') != -1 ) {
      heroJump();
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
    getCoins = setInterval(function(){
      increaseCoins();
    }, 100);
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

  // obstacle detection
  var obstacleDetection = setInterval(function(){
    try {
      var heroOffsetLeft = hero.getBoundingClientRect().left,
          heroPosX = heroOffsetLeft + hero.getBoundingClientRect().width,
          heroPosY = parseFloat(getComputedStyle(hero).bottom),

          firstObstacle = document.getElementsByClassName('obstacle')[0],
          obstaclePosX = firstObstacle.getBoundingClientRect().left,
          obstacleLeftWidth = obstaclePosX + firstObstacle.getBoundingClientRect().width,
          obstaclePosY = parseFloat(getComputedStyle(firstObstacle).bottom) + firstObstacle.getBoundingClientRect().height;

      if ( (obstaclePosX <= heroPosX && obstacleLeftWidth > heroOffsetLeft) && obstaclePosY > heroPosY ) {
        firstObstacle.classList.add('obstacle_active');
        window.stopGame();

        // bomb explosion
        if ( firstObstacle.className.indexOf('obstacle_bomb') != -1 ) {
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
    } catch {};
  }, 10);

  // stop game
  window.stopGame = function(){
    clearInterval(getCoins);
    clearInterval(obstacleDetection);
    menu.scrollTop = 0;
    removeClass('page', 'page_rungame');
    setTimeout(function(){
      removeClass('menu', 'menu_disable');
    }, 700);
    renderCoins.remove();
    hero.remove();
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
