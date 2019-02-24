function addClass(id, addedClass){
  document.getElementById(id).classList.add(addedClass);
};

function removeClass(id, removeClass){
  document.getElementById(id).classList.remove(removeClass);
};

// start game
document.getElementById('start').onclick = function(){
  addClass('page', 'page_rungame');
  runGame();
};

function runGame(){


  var page = document.getElementById('page'),
      road = document.getElementById('road'),
      obstacles = document.getElementById('obstacles'),
      heroRender = document.createElement('div'),
      hero,

      // animation speed
      roadSpeed = parseFloat(getComputedStyle(road).animationDuration),
      pixelsPerMs = roadSpeed / 388, // road background image = 388

      // obstacles
      obstaclesItems = {
        bomb: {
          img: 'resources/img/proton-bomb.png',
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
      };

  // render hero
  heroRender.innerHTML = '<div id="hero" class="hero">' +
                      '<img src="resources/img/jumpex.gif">' +
                    '</div>';
  page.appendChild(heroRender);
  hero = document.getElementById('hero');

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
  coinsCurrent = document.getElementById('coins__current');
  coinsAll = document.getElementById('coins__all');
  
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
  }, 1400)

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
    setTimeout(function(){
      renderObstacle();
      if ( page.className.indexOf('page_rungame') != -1 ) {
        renderObstacleLoop();
      } else {

      }
    }, obstacleRenderDelay);
  }());

  // remove obstacle
  document.addEventListener('animationend', function(e){
    if ( e.target.className.indexOf('obstacle') != -1 ) {
      e.target.remove();
    };
  }, false);

  // obstacle detection
  setInterval(function(){
    try {
      var heroPosX = hero.getBoundingClientRect().left + hero.getBoundingClientRect().width,
          heroPosY = parseFloat(getComputedStyle(hero).bottom),

          allObstacles = document.getElementsByClassName('obstacle'),
          firstObstacle = allObstacles[0],
          obstaclePosX = firstObstacle.getBoundingClientRect().left,
          obstaclePosY = parseFloat(getComputedStyle(firstObstacle).bottom) + firstObstacle.getBoundingClientRect().height;

      if ( obstaclePosX <= heroPosX && obstaclePosY > heroPosY ) {
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
        stopGame();
      };
    } catch {};
  }, 10);

  // stop game
  function stopGame(){
    hero.remove();
    removeClass('page', 'page_rungame');
    clearInterval(getCoins);
    renderCoins.remove();
  };
};
