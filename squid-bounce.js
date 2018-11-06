const unit = 16; // 16 pixels per unit.
const CHARGE_SPEED = 1; //charge += 1 every 100ms
const W = 512,
      H = 512,
      WW = 512,
      WH = 1024;
var sprite, anim, app, charge, charger, floor, viewport;
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
    PIXI.utils.TextureCache["assets/jump_charge.png"];
    for (var i = 1; i < 9; i++){
        PIXI.utils.TextureCache["assets/jump_charge/jump" + i + ".png"];
    }
    PIXI.utils.TextureCache["assets/full/full1.png"];
    PIXI.utils.TextureCache["assets/full/full12png"];

    PIXI.loader
        .add("assets/still.png")
        .add("assets/log.png")
        .add("assets/jump_charge.json")
        //.add("assets/fully_charged.gif")
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
        .add("background.jpg")
        .load(setup);

    function update(delta){
        if (player.sprite.vy < 10.8){
            player.sprite.y += player.sprite.vy;
            player.sprite.vy += 0.15; //how fast you fall
        }
        else {
            player.sprite.vy = 9.7;
            player.jumping = false;
        }
        player.sprite.x += player.sprite.vx;

        Array.prototype.forEach.call(floor.children, (function(tile) {
            if(player.sprite.vy > 0 && hitTestRectangle(player.sprite, tile)){
                player.jumping = false;
                player.sprite.vx = 0;
                player.sprite.y = tile.y - 34;
            }
        }));

        // http://www.html5gamedevs.com/topic/25372-camera-position-and-object-positioning/
        app.stage.pivot.y = player.sprite.y;
        app.stage.position.y = app.renderer.height/2;

        /*
        if (player.jumping && player.sprite.y < 300){
            Array.prototype.forEach.call(floor.children, (function(tile) {
                app.stage.pivot.y = player.sprite.y;
                app.stage.position.y = app.renderer.height/2;
            }))
        }
        */
        player.sprite.x = player.sprite.x % 512;
        if (player.sprite.x < 0){
            player.sprite.x += 511;
        }
    }


    function setup(){
        // FLOOR TILES
        floor = new PIXI.Container();
        for (var i  = 0 ; i < 32; i++){
            var tile = new PIXI.Sprite(PIXI.loader.resources["assets/log.png"].texture);
            floor.addChild(tile);
            console.log("hey listen");
            tile.x = i * unit;
            tile.y = 454;
        }
        for (var i = 11; i < 20; i++){
            var tile = new PIXI.Sprite(PIXI.loader.resources["assets/log.png"].texture);
            floor.addChild(tile);
            console.log("hey 2");
            tile.x = i * unit;
            tile.y = 300;
        }

        app.stage.addChild(floor);

        //BACKGROUND.
        var bg = new PIXI.Sprite(PIXI.loader.resources["background.jpg"].texture);


        //PLAYER
        var frames = [];

        for (var i = 1; i < 9; i++) {
            frames.push(PIXI.Texture.fromFrame("assets/jump_charge/jump" + i + ".png"))
        }
        anim = new PIXI.extras.AnimatedSprite(frames);
        //app.stage.addChild(anim);
        anim.x = 240;
        anim.y = 420;
        anim.animationSpeed = 0.125;
        anim.loop = false;
        player.sprite = anim;

        var fully = [];
        fully.push(PIXI.Texture.fromFrame("assets/full/full1.png"));
        fully.push(PIXI.Texture.fromFrame("assets/full/full2.png"));
        fullanim = new PIXI.extras.AnimatedSprite(fully);
        fullanim.animationSpeed = 0.3;
        fullanim.play();
        fullanim.visible = false;
        player.sprite.addChild(fullanim);

        //player.sprite = new PIXI.Sprite(PIXI.loader.resources["assets/still.png"].texture);
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
            player.sprite.play();
            //player.sprite = new PIXI.Sprite(PIXI.loader.resources["assets/jump_charge.gif"].texture);
            if (charge < 10.8){
                charger = setInterval(function (){
                    if (charge < 9){
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
