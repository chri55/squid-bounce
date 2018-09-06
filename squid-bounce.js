var config = {
    type: Phaser.AUTO,
    width: 720,
    height: 720,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);


/**
Grab all necessary images, sprites, music, etc.
*/
function preload() {
    this.load.image('bg', 'background.jpg');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

/**
This is essentially the initial load. Anything set on
startup will be 'created' here.
*/
function create() {

    for (i=0;i<3;i++){
        for (j=0;j<=20;j++){
            this.add.image(i*360, j*240, 'bg');
        }
    }

    //this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();

    platforms.create(360, 3600, 'ground').setScale(2).refreshBody();

    player = this.physics.add.sprite(360, 3500, 'dude');

    //player.setBounce(0);
    player.setScrollFactor(1);

    //player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(player, true);
    this.cameras.main.setBounds(0, 0, 100);


    var jumped = false;


    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4}],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.physics.add.collider(player, platforms);

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(stars, platforms);

    this.physics.add.overlap(player, stars, collectStar, null, this);


}

function update(){

    var cam = this.cameras.main;

    if (cursors.left.isDown && jumped){
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown && jumped){
        player.setVelocityX(160);
        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.down.isDown && !jumped){
        player.setVelocityY(-1000);
        cam.scrollY = -30;
        jumped = true;
    }

    if (player.body.touching.down){
        jumped = false;
    }

}

function collectStar (player, star){
    star.disableBody(true, true);
}
