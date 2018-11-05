var unit = 16; // 16 pixels per unit.
var sprite, app, charge, floor;
charge = 0;

class Player {
    constructor(){
        // houses all the positions and velocities.
        this.sprite = null;
        // extra bool checks
        this.jumping = false;
        this.chargedUp = false;
        this.charging = false;
    }
}
var player = new Player();


function main() {

    // create a new pixi application and append it to screen.
    app = new PIXI.Application({width: 512 , height: 512});
    document.body.append(app.view);

    //images need to be added to the texture cache before use.
    PIXI.utils.TextureCache["assets/still.png"];
    PIXI.utils.TextureCache["assets/log.png"];

    PIXI.loader
        .add("assets/still.png")
        .add("assets/log.png")
        .add("background.jpg")
        .load(setup);

    function update(delta){
        if (player.sprite.vy < 9.8){
            player.sprite.y += player.sprite.vy;
            player.sprite.vy += 0.1;
        }
        else {
            player.sprite.vy = 9.7;
            player.jumping = false;
        }
        player.sprite.x += player.sprite.vx;

        Array.prototype.forEach.call(floor.children, (function(tile) {
            if(hitTestRectangle(player.sprite, tile)){
                player.jumping = false;
                player.sprite.vx = 0;
                player.sprite.y = tile.y - 34;
            }
        }));
    }


    function setup(){


        player.sprite = new PIXI.Sprite(PIXI.loader.resources["assets/still.png"].texture);
        app.stage.addChild(player.sprite);
        player.sprite.x = 240;
        player.sprite.y = 420;
        player.sprite.vy = 0;
        player.sprite.vx = 0;

        var left  = controller(37),
            up    = controller(38),
            right = controller(39),
            down  = controller(40);

        down.press = () => {
            if (!player.jumping){
                charge = 9;
            }
        }

        down.release = () => {
            if (!player.jumping){
                player.sprite.vy = -charge;
                console.log(player.sprite.vy);
                player.jumping = true;
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



        // FLOOR TILES
        floor = new PIXI.Container();
        for (var i  = 0 ; i < 32; i++){
            var tile = new PIXI.Sprite(PIXI.loader.resources["assets/log.png"].texture);
            floor.addChild(tile);
            console.log("hey listen");
            tile.x = i * 17;
            tile.y = 454;
        }
        app.stage.addChild(floor);

        //BACKGROUND. TODO: move to top to load in first after all is said and done.
        var bg = new PIXI.Sprite(PIXI.loader.resources["background.jpg"].texture);

        //Start the game loop by adding the `update` function to
        //Pixi's `ticker` and providing it with a `delta` argument.
        app.ticker.add(delta => update(delta));
    }

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



main();