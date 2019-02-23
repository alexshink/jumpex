var page = document.getElementById('page'),
    hero = document.getElementById('hero'),
    road = document.getElementById('road'),
    obstacles = document.getElementById('obstacles'),

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

function addClass(id, addedClass){
  document.getElementById(id).classList.add(addedClass);
};

function removeClass(id, removeClass){
  document.getElementById(id).classList.remove(removeClass);
};

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

// render obstacles
function renderObstacle(){      
  var renderObstacle = document.createElement('div'),
      renderObstacleImg = document.createElement('img'),
      lastObstacle,
      lastObstacleSpeed,
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
    if ( document.body.className.indexOf('page_game-over') == -1 ) {
      renderObstacleLoop();
    };
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

          firstObstacle = document.getElementsByClassName('obstacle')[0],
          obstaclePosX = firstObstacle.getBoundingClientRect().left,
          obstaclePosY = parseFloat(getComputedStyle(firstObstacle).bottom) + firstObstacle.getBoundingClientRect().height;

      if ( obstaclePosX <= heroPosX && obstaclePosY > heroPosY ) {
        // bomb
        if ( firstObstacle.className.indexOf('obstacle_bomb') != -1 ) {
          firstObstacle.firstElementChild.remove();
          firstObstacle.appendChild(document.createElement('img'));
          firstObstacle.firstElementChild.src = 'resources/img/explosive.gif';
          setTimeout(function(){
            firstObstacle.remove();
          }, 2500);
        };
        // remove hero and stop animation
        hero.remove();
        firstObstacle.classList.add('obstacle_active');
        document.body.classList.add('page_game-over');
      };
    } catch {};
  }, 10);
