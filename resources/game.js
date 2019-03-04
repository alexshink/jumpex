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
        img: 'resources/img/bomb.webp',
        cls: 'obstacle_bomb'
      },
      fire: {
        img: 'resources/img/fire.gif',
        cls: 'obstacle_fire'
      },
      plasm: {
        img: 'resources/img/plasm.gif',
        cls: 'obstacle_plasm'
      },
      // robot: {
      //   img: 'resources/img/robot.gif',
      //   cls: 'obstacle_robot'
      // }
    },

    // mobile controls
    btnJump = getId('btnJump'),
    menuButtons = document.getElementsByClassName('menu__button');

// menu
for (var i = 0; i < menuButtons.length; i++) {
  menuButtons[i].addEventListener('click', function(){
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
    }
  }, false);
}

function runGame(){

  addClass('page', 'page_rungame');
  addClass('menu', 'menu_disable');

  // remove all obstacles
  obstacles.innerHTML = '';
  clearTimeout(renderLoopTimeout);

  // render hero
  var heroRender = document.createElement('div'),
      hero;

  heroRender.id = 'hero';
  heroRender.className = 'hero';
  heroRender.innerHTML = '<img src="resources/img/jumpex.gif">';
  page.appendChild(heroRender);
  hero = getId('hero');

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

  // desktop jump
  document.onkeydown = function(e){
    if( e.keyCode == 38 ) {
      heroJump();
    };
  };

  // mobile jump
  document.addEventListener('touchstart', function(e){
    if ( e.target.className.indexOf('jump') != -1 ) {
      heroJump();
    };
  }, false);

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

  // coins storage
  if ( !localStorage.coins ) {
    localStorage.coins = 0;
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
    lastObstacleSpeed = (lastObstacle.getBoundingClientRect().left + lastObstacle.getBoundingClientRect().width) * pixelsPerMs;
    lastObstacle.style['animation-duration'] = lastObstacleSpeed + 's';
  };

  // render obstacles loop
  (function renderObstacleLoop(){
    var obstacleRenderDelay = Math.floor(Math.random() * 1500) + 700;
    if ( page.className.indexOf('page_rungame') != -1 ) {
      renderLoopTimeout = setTimeout(function(){
          renderObstacle();
          renderObstacleLoop();
      }, obstacleRenderDelay);
    };
  }());

  // remove obstacle
  document.addEventListener('animationend', function(e){
    if ( e.target.className.indexOf('obstacle') != -1 ) {
      e.target.remove();
    };
  }, false);

  // obstacle detection
  var obstacleDetection = setInterval(function(){
    try {
      var heroPosX = hero.getBoundingClientRect().left + hero.getBoundingClientRect().width,
          heroPosY = parseFloat(getComputedStyle(hero).bottom),

          firstObstacle = document.getElementsByClassName('obstacle')[0],
          obstaclePosX = firstObstacle.getBoundingClientRect().left,
          obstaclePosY = parseFloat(getComputedStyle(firstObstacle).bottom) + firstObstacle.getBoundingClientRect().height;

      if ( obstaclePosX <= heroPosX && obstaclePosY > heroPosY ) {
        stopGame();
        // bomb explosion
        if ( firstObstacle.className.indexOf('obstacle_bomb') != -1 ) {
          firstObstacle.firstElementChild.remove();
          firstObstacle.appendChild(document.createElement('img'));
          firstObstacle.firstElementChild.src = 'resources/img/explosive.gif';
          setTimeout(function(){
            firstObstacle.remove();
          }, 2500);
        };
        firstObstacle.classList.add('obstacle_active');
      };
    } catch {};
  }, 10);

  // stop game
  function stopGame(){
    getId('menu').scrollTop = 0;
    setTimeout(function(){
      removeClass('menu', 'menu_disable');
    }, 700);
    clearInterval(getCoins);
    renderCoins.remove();
    clearInterval(obstacleDetection);
    removeClass('page', 'page_rungame');
    hero.remove();
  };

};

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
