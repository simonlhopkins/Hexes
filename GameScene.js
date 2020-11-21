//Main game scene

class GameScene extends Phaser.Scene{
  constructor(){
    super("GameScene");
  }
  init (data)
  {
    //load in options passed from TitleScene
    this.gameData = data;



  }
  preload ()
  {
    this.load.scenePlugin({
      key: 'rexuiplugin',
      url: "rexuiplugin.min.js",
      sceneKey: 'rexUI'
    });
    //preload all image assets
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ph_hex', 'assets/hexagon.png');
    this.load.spritesheet('masterSpriteSheet',
        'assets/spriteSheet.png',
        { frameWidth: 111, frameHeight: 128 }
    );
    this.load.spritesheet('dotsSpritesheet',
        'assets/dots_spritesheet.png',
        { frameWidth: 111, frameHeight: 128 }
    );
    this.load.spritesheet('starPathSpritesheet',
        'assets/starPath_spritesheet.png',
        { frameWidth: 111, frameHeight: 64 }
    );
    this.load.spritesheet('pointerPathSpritesheet',
        'assets/pointerPath_spritesheet.png',
        { frameWidth: 64, frameHeight: 64 }
    );
    this.load.spritesheet('outpostSpriteSheet',
        'assets/outpost_spritesheet.png',
        { frameWidth: 111, frameHeight: 128 }
    );
    this.load.spritesheet('villageSpriteSheet',
        'assets/villageSpriteSheet.png',
        { frameWidth: 111, frameHeight: 128 }
    );
    this.load.spritesheet('successPathSpriteSheet',
        'assets/success_SpriteSheet.png',
        { frameWidth: 111, frameHeight: 64 }
    );
    this.load.spritesheet('successConstSpriteSheet',
        'assets/successConst_spriteSheet.png',
        { frameWidth: 111, frameHeight: 64 }
    );
    this.load.spritesheet('constExplosionSpriteSheet',
        'assets/constExplosion_SpriteSheet.png',
        { frameWidth: 64, frameHeight: 64 }
    );
    this.load.spritesheet('constFadeSpriteSheet',
        'assets/constFade_SpriteSheet.png',
        { frameWidth: 64, frameHeight: 64 }
    );
    this.load.image("ph_path", "assets/ph_path.png");
    this.load.image("ph_pointerPath", "assets/ph_pointerPath.png");
    this.load.image("ph_pointer", "assets/ph_pointer.png");
    this.load.audio("BOWL_1", "assets/Audio/bowl1.mp3");
    this.load.audio("BOWL_2", "assets/Audio/bowl2.mp3");
    this.load.audio("BOWL_3", "assets/Audio/bowl3.mp3");
    this.load.audio("BOWL_4", "assets/Audio/bowl4.mp3");
    this.load.audio("BOWL_5", "assets/Audio/bowl5.mp3");
  }

  create ()
  {

      //Create all animations used in the game using spritesheets
      this.graphics = this.add.graphics();

      //make the board!
      this.board = new Board(this.gameData.rows, this.gameData.cols, 64, 1, this.gameData.colors, this);
      this.board.loadAssets();
      this.board.drawBoard();
      var sceneRef=this;
      //board events for if you move your cursor out of the board
      this.input.on('pointerup', function(pointer){
        if(sceneRef.board.currentPath){
          sceneRef.board.currentPath.endPath();

        }
      });
      this.input.on('gameout', function(){
        if(sceneRef.board.currentPath){
          sceneRef.board.currentPath.endPath();

        }
      });

      //helper variables to calculate delta time
      this.d = new Date();
      this.timeLastFrame = this.d.getTime();
      this.cameras.main.fadeIn(500);
      //this.board.boardData[0][1]
  }
  update ()
  {
    var timeThisFrame = new Date().getTime();
    //update any hexes that are moving down
    for(var i = 0; i<this.board.movingHexs.length; i++){
      this.board.movingHexs[i].updateAnim();
    }
    //update hexes spawned from above only after all moving hexes are finished
    if(this.board.movingHexs.length == 0){
      for(var i = 0; i<this.board.droppingHexes.length; i++){
        this.board.droppingHexes[i].updateAnim();
      }
    }

    //update the line indicating where your path currently is
    if(this.board.currentPath != undefined){
      this.board.currentPath.updateGuidingLinePos();
      if(this.board.currentPath.camAnimationData != undefined){
        if(this.board.currentPath.camAnimationData.interpolationAmount<=1){
          this.board.currentPath.updateCameraPos();
        }
      }
      if(this.board.currentPath.isLoop){
        this.board.currentPath.updateSuccessPath();
      }

    }

    //updates all UI elements
    this.board.updateUI();

    //this.board.updateTime(timeThisFrame - this.timeLastFrame);
    this.timeLastFrame = timeThisFrame;
  }

}
