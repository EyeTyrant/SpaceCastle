// Declare Game parameters
var config = {
  type: Phaser.AUTO,
  width: 1600,
  height: 1200,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  }
};
// Create Game object
var game = new Phaser.Game(config);

var castle;
var playerShip;
var cursors;
var bullets;
var lastFired = 0;
var fire;



function preload() {
  // load assets
  this.load.image('castle', 'assets/castle.png');
  this.load.image('bullet', 'assets/playerLaser1.png');
  this.load.spritesheet('playerShip', 'assets/playerShipSheet.png', { frameWidth: 80, frameHeight: 80 });

}

var innerShield;
var innerPlates;
var middleShield;
var middlePlates;
var outerShield;
var outerPlates;


function create() {
// create castle
  castle = this.physics.add.sprite(800, 600, 'castle');

// castle tween to point at playerShip
  tween = this.tweens.add({
    targets: castle,
    x: 800,
    y: 400,
    ease: 'Sine.easeIn',
    duration: 5000,
    paused: true
  });

  this.input.on('playerShip', function () {

    tween.play();

  });



// create innerShield 
  innerShield = this.add.graphics(castle);
  innerShield.lineStyle(4, 0x00f0aa, 1.0);
  

  innerPlates = [
    new Phaser.Geom.Line(26, -97, -26, -97),
    new Phaser.Geom.Line(-26, -97, -71, -71),
    new Phaser.Geom.Line(-71, -71, -97, -26),
    new Phaser.Geom.Line(-97, -26, -97, 26),
    new Phaser.Geom.Line(-97, 26, -71, 71),
    new Phaser.Geom.Line(-71, 71, -26, 97),
    new Phaser.Geom.Line(-26, 97, 26, 97),
    new Phaser.Geom.Line(26, 97, 71, 71),
    new Phaser.Geom.Line(71, 71, 97, 26),
    new Phaser.Geom.Line(97, 26, 97, -26),
    new Phaser.Geom.Line(97, -26, 71, -71),
    new Phaser.Geom.Line(71,-71,26,-97),
];
// create middleShield
  middleShield = this.add.graphics(castle);
  middleShield.lineStyle(4, 0x40a00a, 1.0);

  middlePlates = [
    new Phaser.Geom.Line(39, -145, -39, -145),
    new Phaser.Geom.Line(-39, -145, -106, -106),
    new Phaser.Geom.Line(-106, -106, -145, -39),
    new Phaser.Geom.Line(-145, -39, -145, 39),
    new Phaser.Geom.Line(-145, 39, -106, 106),
    new Phaser.Geom.Line(-106, 106, -39, 145),
    new Phaser.Geom.Line(-39, 145, 39, 145),
    new Phaser.Geom.Line(39, 145, 106, 106),
    new Phaser.Geom.Line(106, 106, 145, 39),
    new Phaser.Geom.Line(145, 39, 145, -39),
    new Phaser.Geom.Line(145, -39, 106, -106),
    new Phaser.Geom.Line(106, -106, 39, -145),
];
// create outerShield
  outerShield = this.add.graphics(castle);
  outerShield.lineStyle(4, 0x00f0aa, 1.0);

  outerPlates = [
    new Phaser.Geom.Line(52, -193, -52, -193),
    new Phaser.Geom.Line(-52, -193, -141, -141),
    new Phaser.Geom.Line(-141, -141, -193, -52),
    new Phaser.Geom.Line(-193, -52, -193, 52),
    new Phaser.Geom.Line(-193, 52, -141, 141),
    new Phaser.Geom.Line(-141, 141, -52, 193),
    new Phaser.Geom.Line(-52, 193, 52, 193),
    new Phaser.Geom.Line(52, 193, 141, 141),
    new Phaser.Geom.Line(141, 141, 193, 52),
    new Phaser.Geom.Line(193, 52, 193, -52),
    new Phaser.Geom.Line(193, -52, 141, -141),
    new Phaser.Geom.Line(141, -141, 52, -193),
];
  
  // create playerShip
  playerShip = this.physics.add.sprite(1400, 600, 'playerShip');

  // playerShip.setCollideWorldBounds(true);
  playerShip.body.setGravityY(0);
  // animate playerShip (thrust flames)
  this.anims.create({
    key: 'none',
    frames: [{ key: 'playerShip', frame: 0 }],
    frameRate: 20
  });
  this.anims.create({
    key: 'thrust',
    frames: this.anims.generateFrameNumbers('playerShip', { start: 1, end: 2 }),
    frameRate: 2,
    repeat: 10
  });


  playerShip.setDrag(300);
  playerShip.setAngularDrag(400);
  playerShip.setMaxVelocity(600);



  // create bullets

  var Bullet = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Image,

    initialize:

      function Bullet(scene) {
        Phaser.Physics.Arcade.Image.call(this, scene, 0, 0, 'bullet');
        this.setBlendMode(1);
        this.setDepth(-1);
        this.speed = 500;
        this.lifespan = 1000;
      },

    fire: function (playerShip) {
      this.lifespan = 1000;

      this.setActive(true);
      this.setVisible(true);

      this.setAngle(playerShip.body.rotation);
      this.setPosition(playerShip.x, playerShip.y);
      this.body.reset(playerShip.x, playerShip.y);


      var angle = Phaser.Math.DegToRad(playerShip.body.rotation - 180);

      this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);

      this.body.velocity.x *= 2;
      this.body.velocity.y *= 2;
    },

    update: function (time, delta) {
      this.lifespan -= delta;

      if (this.lifespan <= 0) {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
      }
    }

  });

  bullets = this.physics.add.group({
    classType: Bullet,
    maxSize: 30,
    runChildUpdate: true
  });
  // create keyboard input functionality
  cursors = this.input.keyboard.createCursorKeys();
  fire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

}


function update(time) {

  // point castle at playerShip
  castle.rotation = Math.atan2(playerShip.y - castle.y, playerShip.x - castle.x);

  if (tween.isPlaying()) {
    tween.updateTo('x', playerShip.x, true);
    tween.updateTo('y', playerShip.y, true);

    //text.setText('Progress: ' + tween.progress);
  }
  else {
    //text.setText('Click to start');
  }


  // rotate shields
  for (var i = 0; i < innerPlates.length; i++) {
    innerShield.strokeLineShape(innerPlates[i]); 
    innerShield.rotation += 0.002;
  }
  for (var i = 0; i < middlePlates.length; i++) {
    middleShield.strokeLineShape(middlePlates[i]); 
    middleShield.rotation += -0.00175;
  }
  for (var i = 0; i < outerPlates.length; i++) {
    outerShield.strokeLineShape(outerPlates[i]); 
    outerShield.rotation += 0.0015;
  }

  // keyboard actions
  if (cursors.left.isDown) {
    playerShip.setAngularVelocity(-150);
  }
  else if (cursors.right.isDown) {
    playerShip.setAngularVelocity(150);
  }
  else {
    playerShip.setAngularVelocity(0);
  }

  if (cursors.up.isDown) {
    playerShip.anims.load('thrust');
    this.physics.velocityFromRotation(playerShip.rotation, -600, playerShip.body.acceleration);
  }
  else {
    playerShip.anims.load('none');
    playerShip.setAcceleration(0);
  }


  if (fire.isDown && time > lastFired) {
    var bullet = bullets.get();

    if (bullet) {
      bullet.fire(playerShip);
      lastFired = time + 100;
    }
  }
  // create world wrap
  this.physics.world.wrap(playerShip, 0);
  
}