
//TODO add ice platforms
//TODO add moving platforms
//separate container for moving platforms so we can use different collision logic.
//TODO global variables in better order, more sensible.

const unit = 16; // 16 pixels per unit.
const CHARGE_SPEED = 1; //charge += 1 every 100ms
const LEVEL_BASE = 455; //px
const W = 512,
      H = 512,
      WW = 512, // WORLD WIDTH
      WH = 1024;// WORLD HEIGHT // both probably deprecated, I can just make the world as big as I need to.

/* add:
- player                | PIXI.Sprite()
- player animation      | PIXI.extras.AnimatedSprite()
- main stage            | PIXI.Application()
- player charge         | number
- charger               | Interval function.
- regular floor         | PIXI.Container()

- goal                  | PIXI.Sprite()
- winText               | PIXI.Text()
- levelText             | PIXI.Text()
- gameOverText          | PIXI.Text()
- score                 | PIXI.Text()
*/
var sprite, anim, app, charge, charger, floor;
var goal, winText, levelText, gameOverText, score;

var level = 1;
charge = 0;

class Player {
    constructor(){
        // houses all the positions and velocities.
        this.sprite = null;
        // extra bool checks
        this.jumping = false;
        this.chargedUp = false;
        this.charging = false;
        // helpful scoring vars
        this.score = 0;
        this.maxHeight = 0;
        this.gameOver = false;
    }
}
var player = new Player();

class Lava {
  constructor(level){
    this.level = level;
    this.startingHeight = LEVEL_BASE + 50;
  }
}


function main() {

    // create a new pixi application and append it to screen.
    app = new PIXI.Application({width: 512 , height: 512});
    document.body.append(app.view);

    //images need to be added to the texture cache before use.
    PIXI.utils.TextureCache["assets/still.png"];
    PIXI.utils.TextureCache["assets/log.png"];
    PIXI.utils.TextureCache["assets/jump_charge.png"];
    for (var i = 1; i < 9; i++){
        PIXI.utils.TextureCache["assets/jump_charge/jump" + i + ".png"];
    }
    PIXI.utils.TextureCache["assets/full/full1.png"];
    PIXI.utils.TextureCache["assets/full/full12png"];
    PIXI.utils.TextureCache["assets/star.png"];
    PIXI.utils.TextureCache["assets/bg.png"];
    PIXI.utils.TextureCache["assets/lava.png"];

    PIXI.loader
        .add("assets/still.png")
        .add("assets/log.png")
        .add("assets/jump_charge/jump1.png")
        .add("assets/jump_charge/jump2.png")
        .add("assets/jump_charge/jump3.png")
        .add("assets/jump_charge/jump4.png")
        .add("assets/jump_charge/jump5.png")
        .add("assets/jump_charge/jump6.png")
        .add("assets/jump_charge/jump7.png")
        .add("assets/jump_charge/jump8.png")
        .add("assets/full/full1.png")
        .add("assets/full/full2.png")
        .add("assets/star.png")
        .add("assets/bg.png")
        .add("assets/lava.png")
        .load(setup);

    function update(delta){
        // Falling Down //
        if (player.sprite.vy < 10){
            player.sprite.y += player.sprite.vy;
            player.sprite.vy += 0.15; //how fast you fall
        }
        else {
            player.sprite.vy = 9.7;
            player.jumping = false;
        }
        // Side To Side Move //
        player.sprite.x += player.sprite.vx;

        // Check Collision with Floor(s) //
        // Regular Floor tiles
        Array.prototype.forEach.call(floor.children, (function(tile) {
            if(player.sprite.vy > 0 && hitTestRectangle(player.sprite, tile)){
              if (player.maxHeight + 34 <= tile.y){

                player.jumping = false;
                player.sprite.vx = 0;
                player.sprite.y = tile.y - 34;
              }
            }
        }));

        // LAVA
        Array.prototype.forEach.call(lava.children, (function(tile) {
            tile.y -= .75;
            if(hitTestRectangle(player.sprite, tile)){
              player.sprite.vy = 0;
              player.sprite.vx = 0;
              // don't allow them to build up charge for next level early.
              player.jumping = true;
              gameOverText.visible = true;
              app.ticker.stop();
              level = 1;
              sleep(2000).then(() => {
                  // Reset Level //
                  levelText.text = "Level " + level;
                  createLevel(level, 300);
                  createLava();
                  console.log("slept");
                  gameOverText.visible = false;
                  app.stage.removeChild(player.sprite);
                  app.stage.addChild(player.sprite);
                  player.maxHeight = LEVEL_BASE-35;
                  player.jumping = false;
                  player.score = 0;
                  app.ticker.start();
              });
            }
        }));

        // http://www.html5gamedevs.com/topic/25372-camera-position-and-object-positioning/
        // Move the screen instead of the player to simulate camera //
        app.stage.pivot.y = player.sprite.y;
        app.stage.position.y = app.renderer.height/2;

        // Screen Wrap //
        player.sprite.x = player.sprite.x % 512;
        if (player.sprite.x < -17){
            player.sprite.x += 528;
        }

        // Add Score //
        if (player.sprite.y < player.maxHeight){
            player.score += 5;
            player.maxHeight = player.sprite.y;
        }

        // Goal Collision //
        if (hitTestRectangle(player.sprite, goal)){
            player.sprite.vy = 0;
            player.sprite.vx = 0;
            // don't allow them to build up charge for next level early.
            player.jumping = true;
            winText.visible = true;
            player.score += 1000 * level;
            app.ticker.stop();
            level ++;
            sleep(1000).then(() => {
                // Reset Level //
                levelText.text = "Level " + level;
                createLevel(level, 300);
                createLava();
                console.log("slept");
                winText.visible = false;
                app.stage.removeChild(player.sprite);
                app.stage.addChild(player.sprite);
                player.maxHeight = LEVEL_BASE-35;
                player.jumping = false;
                player.charge = 0;
                app.ticker.start();
            });
        }
        // Update Score //
        score.text = player.score;

        // Keep score and level text in their respective corners.
        score.y = player.sprite.y - 250;
        levelText.y = player.sprite.y - 250;
        gameOverText.y = player.sprite.y - 50;

    }


    function setup(){

        // BACKGROUND //
        for (var i = -1; i < 100; i++){
            var bg = new PIXI.Sprite(PIXI.loader.resources["assets/bg.png"].texture);
            bg.y = -i * bg.height;
            app.stage.addChild(bg);
            var bbg = new PIXI.Sprite(PIXI.loader.resources["assets/bg.png"].texture);
            bbg.y = -i * bg.height;
            bbg.x = bbg.width;
            app.stage.addChild(bbg);
        }

        // FLOOR TILES //
        floor = new PIXI.Container();
        createLevelBase();
        for (var i = 11; i < 20; i++){
            var tile = new PIXI.Sprite(PIXI.loader.resources["assets/log.png"].texture);
            floor.addChild(tile);
            tile.x = i * unit;
            tile.y = 300;
        }
        var yval = 150;
        for (var i = 0; i < 10; i++){
            createPlat(level, yval);
            yval -= 150;
        }
        app.stage.addChild(floor);

        // LAVA //
        lava = new PIXI.Container();
        createLava();
        app.stage.addChild(lava);



        // END GOAL //
        goal = new PIXI.Sprite(PIXI.loader.resources["assets/star.png"].texture);
        goal.x = W / 2 - goal.width;
        goal.y = yval - 50;
        app.stage.addChild(goal);

        winText = new PIXI.Text("Fresh!", {fontFamily : 'Press Start 2P', fontSize : 40,
                                               fill : 0xffffff, align : 'center'});
        winText.x = (W / 2) - (winText.width / 2);
        winText.y = goal.y - 50;
        winText.visible = false;
        app.stage.addChild(winText);

        gameOverText = new PIXI.Text("Game over!", {fontFamily : 'Press Start 2P', fontSize : 40,
                                               fill : 0xffffff, align : 'center'});
        gameOverText.x = (W / 2) - (gameOverText.width / 2);
        gameOverText.visible = false;
        app.stage.addChild(gameOverText);


        //PLAYER
        var frames = [];

        for (var i = 1; i < 9; i++) {
            frames.push(PIXI.Texture.fromFrame("assets/jump_charge/jump" + i + ".png"))
        }
        anim = new PIXI.extras.AnimatedSprite(frames);
        anim.x = 240;
        anim.y = 420;
        anim.animationSpeed = 0.125;
        anim.loop = false;
        player.sprite = anim;

        // Fully charged animation, we only wanna show this at a certain time.
        var fully = [];
        fully.push(PIXI.Texture.fromFrame("assets/full/full1.png"));
        fully.push(PIXI.Texture.fromFrame("assets/full/full2.png"));
        fullanim = new PIXI.extras.AnimatedSprite(fully);
        fullanim.animationSpeed = 0.3;
        fullanim.play();
        fullanim.visible = false;
        player.sprite.addChild(fullanim);

        app.stage.addChild(player.sprite);
        player.sprite.x = 240;
        player.sprite.y = 420;
        player.sprite.vy = 0;
        player.sprite.vx = 0;
        player.maxHeight = player.sprite.y+1;
        gameOverText.y = player.sprite.y - 50;


        // HUD //
        score = new PIXI.Text(player.score, {fontFamily : 'Press Start 2P', fontSize: 18,
                                             fill : 0xffffff, align : 'right'});
        score.x = 5
        score.y = 0;
        score.visible = true;
        app.stage.addChild(score);

        levelText = new PIXI.Text("Level " + level, {fontFamily : 'Press Start 2P', fontSize: 16,
                                          fill: 0xffffff, align : 'left'});
        levelText.x = W - levelText.width - 10;
        levelText.y = 0;
        levelText.visible = true;
        app.stage.addChild(levelText);


        // CONTROLLER | INPUT //
        var left  = controller(37),
            up    = controller(38),
            right = controller(39),
            down  = controller(40);

        down.press = () => {
            player.sprite.play();
            if (charge < 10){
                charger = setInterval(function (){
                    if (charge < 10){
                        charge += CHARGE_SPEED;
                        console.log(charge);
                        player.charging = true;
                        player.charged = false;
                    }
                    else {
                        player.sprite.getChildAt(0).visible = true;
                        player.charging = false;
                        player.charged = true;
                    }
                }, 100);
            }
        }

        down.release = () => {
            player.sprite.getChildAt(0).visible = false;
            player.sprite.gotoAndStop(0);
            player.sprite.texture = player.sprite.textures[0];
            if (!player.jumping){
                clearInterval(charger);
                player.sprite.vy = -charge;
                console.log(player.sprite.vy);
                player.jumping = true;
                charge = 0;
            }
            else {
                clearInterval(charger);
                charge = 0;
            }
        }

        left.press = () => {
            //necessary to override inputs.
            if (right.isDown){
                right.isDown = false;
                right.isUp = true;
            }
            if (player.jumping){
                player.sprite.vx = -3;
            }
        }

        right.press = () => {
            if (left.isDown){
                left.isDown = false;
                left.isUp = true;
            }
            if (player.jumping){
                player.sprite.vx = 3;
            }
        }

        left.release = () => {
            player.sprite.vx = 0;
        }
        right.release = () => {
            player.sprite.vx = 0;
        }

        // START //
        app.ticker.add(delta => update(delta));

    }

    // CONTROLLER CLASS //
    function controller(keyCode){
        var key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;

        key.downHandler = event => {
            if (event.keyCode == key.code){
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };

        key.upHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                    key.isDown = false;
                    key.isUp = true;
            }
            event.preventDefault();
        };

        window.addEventListener ("keydown", key.downHandler.bind(key), false);
        window.addEventListener ("keyup", key.upHandler.bind(key), false);
        return key;
    }

    // COLLISION CLASS //
    function hitTestRectangle(r1, r2) {

      //Define the variables we'll need to calculate
      let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

      //hit will determine whether there's a collision
      hit = false;

      //Find the center points of each sprite
      r1.centerX = r1.x + r1.width / 2;
      r1.centerY = r1.y + r1.height / 2;
      r2.centerX = r2.x + r2.width / 2;
      r2.centerY = r2.y + r2.height / 2;

      //Find the half-widths and half-heights of each sprite
      r1.halfWidth = r1.width / 2;
      r1.halfHeight = r1.height / 2;
      r2.halfWidth = r2.width / 2;
      r2.halfHeight = r2.height / 2;

      //Calculate the distance vector between the sprites
      vx = r1.centerX - r2.centerX;
      vy = r1.centerY - r2.centerY;

      //Figure out the combined half-widths and half-heights
      combinedHalfWidths = r1.halfWidth + r2.halfWidth;
      combinedHalfHeights = r1.halfHeight + r2.halfHeight;

      //Check for a collision on the x axis
      if (Math.abs(vx) < combinedHalfWidths) {

        //A collision might be occurring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {

          //There's definitely a collision happening
          hit = true;
        } else {

          //There's no collision on the y axis
          hit = false;
        }
      } else {

        //There's no collision on the x axis
        hit = false;
      }

      //`hit` will be either `true` or `false`
      return hit;
    }


}


function createLevelBase() {
    /*
    Create a base for the level at a specific y value. This will be the same each time.

    TODO: refactor to let any asset be passed in.
    */
    for (var i  = 0 ; i < 32; i++){
        var tile = new PIXI.Sprite(PIXI.loader.resources["assets/log.png"].texture);
        floor.addChild(tile);
        tile.x = i * unit;
        tile.y = LEVEL_BASE;
    }
}



function createPlat(level, yval){
    /*
    Create a platform.
    Level modifiers can be added and changed. These determine how many blocks
    are taken away from a platform.

    yMod is a random value between 0-100 that is subtracted to the platform to
    add some distance between plats.

    There is a 1/15 chance that a platform will not be drawn after the modifier
    is > 0.
    */
    platStart = Math.floor((Math.random() * 22) + 1);
    var modifier;
    if (level == 1){
        modifier = 0
    }
    else if (level < 6){
        modifier = 2;
    }
    else {
        modifier = 4;
    }
    var yMod = Math.floor(Math.random() * 100);
    for (var i = platStart; i < platStart + 10 - modifier; i++){
        if (modifier > 0 && (Math.floor(Math.random) * 15) == 1){
            break;
        }
        var tile = new PIXI.Sprite(PIXI.loader.resources["assets/log.png"].texture);
        floor.addChild(tile);
        tile.x = i * unit;
        tile.y = yval - yMod;
    }
}

function createGoal(yval){
    // Move the goal to the given y value.
    // winText position will be updated to match goal position.
    goal.y = yval - 50;
    winText.y = goal.y - 50;

}

function createLava() {
  app.stage.removeChild(lava);
  lava = new PIXI.Container();
  for (var h = 0; h < 3; h++){
    for (var i  = 0 ; i < 6; i++){
        var tile = new PIXI.Sprite(PIXI.loader.resources["assets/lava.png"].texture);
        lava.addChild(tile);
        tile.x = i * 100;
        tile.y = LEVEL_BASE + ((h+1) * 100);
    }
  }
  app.stage.addChild(lava);
}

function createLevel(level, yval){
    /* Create a level on win of a previous level.
    level is the global variable of how many times a player has reached a goal.

    yVal is the starting value for a platform. Generally 300, but can be reduced
    for a higher starting platform.

    all floor(s) containers will be destroyed on load to redraw them and prevent
    leftover hitboxes from being there.

    an extra (level) platforms are added per level.
    */
    app.stage.removeChild(floor);
    floor = new PIXI.Container();
    app.stage.addChild(floor);

    createLevelBase();
    player.sprite.y = LEVEL_BASE-1;

    for (var k = 0; k < 10 + level; k++){
        createPlat(level, yval);
        yval -= 150;
    }
    createGoal(yval);
}

const sleep = (ms) => {
    // sleepy boi.
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initial function call. //
main();
