class TomeScene extends Phaser.Scene{
  constructor(){
    super("TomeScene");
    //initial values of all of the variables for game
    this.constNum = 0;
    this.hintData = {};
  }

  init(data){
    this.gameData = data;
    this.constNum = data.startTomeConst;
    console.log(this.constNum);

  }
  preload(){
    this.load.scenePlugin({
      key: 'rexuiplugin',
      url: "rexuiplugin.min.js",
      sceneKey: 'rexUI'
    });
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
    this.load.audio("WRONG_BELL", "assets/Audio/wrongBell.mp3");
    this.load.audio("GRUNT_1", "assets/Audio/grunt1.mp3");
    this.load.audio("GRUNT_2", "assets/Audio/grunt2.mp3");
    this.load.audio("GRUNT_3", "assets/Audio/grunt3.mp3");
    this.load.audio("GRUNT_4", "assets/Audio/grunt4.mp3");
    this.cameras.main.fadeIn(500);
  }

  create(){

    this.constText = this.add.text(300, 20, CONSTELLATIONS[this.constNum].name, { fontFamily: 'Whacky_Joe', fontSize: "36px" }).setOrigin(0.5, 0.5);
    this.discoveredText = this.add.text(300, 80, "not discovered", { fontFamily: 'Whacky_Joe', fontSize: "24px" }).setOrigin(0.5, 0.5);

    var nextConstButton = new TitleButton(this, ">", 550, 40, this.goToNextConstellation);
    var nextConstButton = new TitleButton(this, "hint ("+ this.gameData.numHints + ")", 500, 560, this.getHint);

    var prevConstButton = new TitleButton(this, "<", 40, 40, this.goToPrevConstellation);
    var backToMainScreen = new TitleButton(this, "back", 60, 560, this.loadStartScreen);


    //only remove from new constellations once you are here

    this.assetsLoaded= false;
    console.log(this.constNum);
    this.loadNewBoard(CONSTELLATIONS[this.constNum]);
    console.log(this.board);


    var sceneRef=this;
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

  }
  update(){
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

  }
  incrementConstellationNum(){
    this.constNum ++;
    this.constNum %= CONSTELLATIONS.length;
    return CONSTELLATIONS[this.constNum];
  }
  decrementConstellationNum(){
    this.constNum --;
    if(this.constNum<0){
      this.constNum+= CONSTELLATIONS.length;
    }
    this.constNum %= CONSTELLATIONS.length;
    console.log(this.constNum);
    return CONSTELLATIONS[this.constNum];
  }

  loadNewBoard(constellation){
    if(this.board != undefined){
      this.board.destroyBoard();
    }
    this.board = new Board(constellation.height, constellation.width, 64, 1, 1, this, true);
    if(!this.assetsLoaded){
      this.board.loadAssets();
      this.assetsLoaded = true;
    }
    this.board.drawBoard();
    this.initializeHintsGotten(this.constNum);
    if(this.gameData.constellationsFound.has(constellation.name)){
      this.board.drawSolution(constellation);
    }else{
      this.discoveredText.setText("not discovered");
    }
    this.constText.setText(constellation.name);


  }
  goToNextConstellation(button, groupName, index, pointer, event){
    console.log("next");
    button.scene.loadNewBoard(button.scene.incrementConstellationNum());
  }
  goToPrevConstellation(button, groupName, index, pointer, event){
    console.log("prev");
    button.scene.loadNewBoard(button.scene.decrementConstellationNum());
  }
  loadStartScreen(button, groupName, index, pointer, event){
    console.log(button.scene.changedToDots);
    if(button.scene.changedToDots){
      console.log("changed");
      //button.scene.gameData.gameMode = "CUSTOM";
    }
    button.scene.scene.start("TitleScene", button.scene.gameData);

  }
  getHint(button, groupName, index, pointer, event){
    console.log(button);

    button.scene.addHint(button.scene.constNum);
    button.text = "hint ("+ button.scene.gameData.numHints + ")";

  }
  addHint(constellationNum){
    if(this.gameData.numHints <=0){
      console.log("no hints remaining");
      return;
    }
    if(this.gameData.constellationsFound.has(CONSTELLATIONS[constellationNum].name)){

      console.log("already solved");
      return;
    }
    if(this.hintData[constellationNum]== undefined){
      this.hintData[constellationNum] = new Set();
    }
    if(this.hintData[constellationNum].size >= CONSTELLATIONS[constellationNum].getPatternArray().length-1){
      this.board.drawSolution(CONSTELLATIONS[constellationNum]);
      console.log("all hints");
      return;
    }
    var music = this.game.sound.add("GRUNT_" + Math.ceil(Math.random()*4));
    music.play();
    //this will be an array of the pattern that has been revealed so far
    var startPatternArray = [...Array(CONSTELLATIONS[constellationNum].getPatternArray().length).keys()];

    this.hintData[constellationNum].forEach((item, i) => {
      startPatternArray.splice(startPatternArray.indexOf(item), 1);
    });
    var hintNum = startPatternArray[Math.floor(Math.random() * startPatternArray.length)];
    this.hintData[constellationNum].add(hintNum);
    this.board.drawHint(CONSTELLATIONS[constellationNum], hintNum);
    this.gameData.numHints --;


  }
  initializeHintsGotten(constellationNum){
    if(this.hintData[constellationNum] == undefined){
      return;
    }
    var boardRef = this.board;
    this.hintData[constellationNum].forEach((item, i) => {
      boardRef.drawHint(CONSTELLATIONS[constellationNum], item);
    });
  }


  getCurrentConstellation(){
    return CONSTELLATIONS[this.constNum];
  }

}
