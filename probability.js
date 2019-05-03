/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var game = null;

var theScene = null;

var w, h, dim;

function getDimensions(selector) {
    w = $(selector).width();
    h = $(selector).height();
    if(w < h)
        dim = w;
    else
        dim = h;
}

$(window).resize(function() {
    getDimensions("#plinko-canvas");
    if(game === null || theScene === null)
        return;
    game.scale.resize(dim, dim);
    getDimensions("canvas");
    theScene.restart();
    theScene  = null;
});

var config = {
    type: Phaser.AUTO,
    width: 300,
    height: 300,
    scale: {
        parent: "plinko-canvas",
    mode: Phaser.Scale.NONE,
    center: Phaser.Scale.CENTER_BOTH,
    width: 300,
    height: 300
},
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    transparent: true
};



function preload ()
{

    this.load.image('block', 'block.svg');
    this.load.image('coin', 'coin.svg');
}

function create ()
{
    /* The below values assume a 300x300 screen */
    /* Scale them */
    var theScale = dim/300;
    var spacing = 60*theScale;
    
    var pointsDim = 4*spacing;
    
    coin = this.physics.add.image(65, 20, 'coin');
    coin.setScale(0.05*theScale);
    /*coin.setCircle(259);*/
    coin.setCollideWorldBounds(true);
    coin.body.collideWorldBounds = true;
    coin.body.setBounce(1, 1);
    coin.body.mass = 1;
    
    coin.setVelocityX(getRandomInt(-10, 10));
    this.input.setDraggable(coin.setInteractive());
    
    var off = Math.abs((pointsDim+(pointsDim/2))-(dim+(dim/2)));
    off -= (spacing/2);
    console.log(off);
    
    group = this.physics.add.group();
    for(var j = 0; j < 4; j++) {
        for(var i = 0; i < 4; i++) {
            var extraOff;
            if(j & 1) {
                extraOff = 20;
            } else
                extraOff = 0;
            extraOff *= theScale;
            var image = this.physics.add.image(off+extraOff+(i*spacing), off+(10*theScale)+(j*spacing), 'block');
            group.add(image);
            image.setScale(0.07*theScale);
            /*image.setCircle(170);*/
            image.setCollideWorldBounds(true);
            image.body.collideWorldBounds = true;
            /*image.body.mass = 0.01;*/
            image.body.mass = 1;
            image.setImmovable();
            image.body.setAllowGravity(false);
            
        }
    }
    
    
    
    
    getDimensions("canvas");
    console.log("w " + w + " h " + h);
    
    this.physics.world.bounds = new Phaser.Geom.Rectangle(10, 10, w - 10, h - 10);
    this.physics.world.setBoundsCollision(true, true, true, true);
    
    theScene = this.scene;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function update() {
    this.physics.world.collide(coin, group, function() {
        
    });
}
    
$(window).load(function() {
    getDimensions("#plinko-canvas");
    config.width = dim;
    config.height = dim;
    config.scale.width = dim;
    config.scale.height= dim;
    game = new Phaser.Game(config);
});