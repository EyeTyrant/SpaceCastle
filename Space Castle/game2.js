// Declare Game parameters
var config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 700,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
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

var playerShip;
var cursors;
var bullets;
var lastFired = 0;
var fire;


function preload() {
  this.load.image('bullet', 'assets/playerLaser1.png');
  this.load.spritesheet('playerShip', 'assets/playerShipSheet.png', { frameWidth: 80, frameHeight: 80 });
}



function create() {
  // create playerShip
  playerShip = this.physics.add.sprite(700, 350, 'playerShip');

  // playerShip.setCollideWorldBounds(true);
  playerShip.body.setGravityY(0);
  // animate playerShip (thrust flames)
  this.anims.create({
    key: 'none',
    frames: [{key: 'playerShip', frame: 0}],
    frameRate: 20
  });
  this.anims.create({
    key:'thrust',
    frames: this.anims.generateFrameNumbers('playerShip', {start: 1, end: 2}),
    frameRate:2,
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

      
      var angle = Phaser.Math.DegToRad(playerShip.body.rotation -180);
      
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


