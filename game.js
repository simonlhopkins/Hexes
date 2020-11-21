//Setting up the game here
var config = {
    type: Phaser.AUTO,
    width: 600,
    height: 600,
    pixelArt: true,
    roundPixels: false,
    backgroundColor: 0x000000,
    activePointers: 1,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [TutorialScene, TitleScene, GameScene, TomeScene, SettingsScene, ShopScene]
};


var game = new Phaser.Game(config);
