//Main board class that holds all of the data structures involved in the game
class Board{

  constructor(numRows, numColumns, hexSize, scale, numColors, game, isTome = false){
    this.game = game;


    this.isTome = isTome;
    this.numRows = numRows;
    this.numColumns = numColumns;
    this.boardYOffset = 130;
    this.boardDim = this.calcScale(hexSize, 600, 600, this.numRows, this.numColumns);
    this.hexScale = this.boardDim.scale;
    this.padding =0.05;
    console.log(this.boardDim);
    this.hexSize = hexSize * this.hexScale;

    this.hexHeight = 2*this.hexSize;
    this.hexWidth = Math.sqrt(3) * this.hexSize;
    this.initOffset = {x: this.boardDim.upperLeft, y:this.boardYOffset}
    this.horOffset = this.hexWidth;
    this.vertOffset = (3/4) * this.hexHeight;
    this.boardData = [];


    //GAME LOGIC
    this.focussedHex = undefined;
    this.validHexes = [];
    this.currentPath = undefined;
    this.movingHexs = [];
    this.droppingHexes = [];
    this.movingUI = [];
    this.constellationsFoundThisGame = new Set();
    this.score = 0;


    this.numColors = numColors;
    this.timeRemaining = 1000;
    this.identifierDict = {};
    this.gameOverTriggered = false;
    this.cameraOffset = {x: 0,
                        y: 0};
    this.cameraZoom = 1;
    this.pointer = new Phaser.Input.Pointer(Phaser.Input.InputManager, 0);
    this.numMovesLeft = 30;

    this.constellationManager = new ConstellationManager(this);
    this.exclamationText = "nice";
    this.subExclamation = "epic";
    this.drawUI();

    this.solutionPath = [];
    this.constFadePath = [];
    this.constellationText = this.game.rexUI.add.label({
      x: 0,
      y: 0,
      background: this.game.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0xFFFFFF).setAlpha(0.7),
      text: this.game.add.text(0, 0, this.exclamationText, { fontFamily: 'Whacky_Joe', fontSize: "24px" }),
      align: 'center',
      space: {
          left: 10,
          right: 10,
          top: 0,
          bottom: 10
      },
    }).layout().setOrigin(0.5, 0.5);
    this.subConstellationText = this.game.rexUI.add.label({
      x: 0,
      y: 0,
      background: this.game.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0xFFFFFF).setAlpha(0.7),
      text: this.game.add.text(0, 0, this.exclamationText, { fontFamily: 'Whacky_Joe', fontSize: "12px" }),
      align: 'center',
      space: {
          left: 10,
          right: 10,
          top: 0,
          bottom: 10
      },
    }).layout().setOrigin(0.5, 0.5);
    this.constellationText.visible = false;
    this.subConstellationText.visible = false;
    this.constellationText.setDepth(200);
    this.subConstellationText.setDepth(200);
    this.hintPath = [];
    this.hasConstellation = false;

  }
  drawUI(){
    if(this.isTome){
      return;
    }
    this.game.add.image(300, 300, 'sky').setScale(2);
    this.scoreText = this.game.add.text(10, 50, 'score: 0', { fontFamily: 'Whacky_Joe', fontSize: "24px" });
    this.exploreScoreText = this.game.add.text(10, 10, 'path score: 0', { fontFamily: 'Whacky_Joe', fontSize: "24px" });
    this.timeText = this.game.add.text(400, 10, 'moves: '+ this.numMovesLeft, { fontFamily: 'Whacky_Joe', fontSize: "24px" });
  }
  drawSolution(constellation){

    var currentPos = new Phaser.Math.Vector2(this.boardData[constellation.startColumn][0].getOffSetPos().x, this.boardData[constellation.startColumn][0].getOffSetPos().y);
    console.log(constellation.name);
    this.hintPath.forEach((item, i) => {
      item.destroy();
    });
    this.hintPath= [];
    console.log("DRAW SOLUTION");
    if(this.isTome){
      this.game.discoveredText.setText("discovered!");
      this.learnConstellation(constellation);
    }
    constellation.getPatternArray().forEach((item, i) => {
      var rotAngle = -item*60;

      var newPath = this.game.add.sprite(currentPos.x, currentPos.y, 'ph_path').setOrigin(0, 0.5);
      currentPos.x = currentPos.x + this.hexWidth * Math.cos(Phaser.Math.DegToRad(rotAngle));
      currentPos.y = currentPos.y + this.hexWidth * Math.sin(Phaser.Math.DegToRad(rotAngle));
      newPath.setAngle(rotAngle);
      newPath.setScale(this.hexScale);
      newPath.setDepth(100);
      newPath.anims.play("SOLUTION_IDLE");
      this.solutionPath.push(newPath);
    });

  }
  //should prob do this one time at beginning lol
  drawHint(constellation, hintNum){
    console.log(constellation);
    var currentPos = new Phaser.Math.Vector2(this.boardData[constellation.startColumn][0].getOffSetPos().x, this.boardData[constellation.startColumn][0].getOffSetPos().y);
    constellation.getPatternArray().forEach((item, i) => {

      var rotAngle = -item*60;
      if(i==hintNum){
        var newPath = this.game.add.sprite(currentPos.x, currentPos.y, 'ph_path').setOrigin(0, 0.5);

      }

      currentPos.x = currentPos.x + this.hexWidth * Math.cos(Phaser.Math.DegToRad(rotAngle));
      currentPos.y = currentPos.y + this.hexWidth * Math.sin(Phaser.Math.DegToRad(rotAngle));
      if(i!=hintNum){
        return;
      }
      newPath.setAngle(rotAngle);
      newPath.setScale(this.hexScale);
      newPath.setDepth(100);
      newPath.anims.play("HINT_IDLE");
      this.hintPath.push(newPath);
    });
  }
  destroyBoard(){
    this.boardData.forEach((row, i) => {
      row.forEach((cell, i) => {
        cell.gameObject.destroy();
      });

    });
    this.solutionPath.forEach((item, i) => {
      item.destroy();
    });
    this.hintPath.forEach((item, i) => {
      item.destroy();
    });


  }
  onValidConstellation(constellation){

    //hasn't found it yet
    // this.currentPath.animLinePath.forEach((item, i) => {
    //   console.log(item);
    //   var newSuccConst = this.game.add.sprite(item.x, item.y, 'ph_path').setOrigin(0, 0.5);
    //   newSuccConst.setAngle(item.angle);
    //   newSuccConst.setScale(this.hexScale);
    //   newSuccConst.anims.play("SUCCESSCONST_SPAWN");
    //   newSuccConst.anims.chain("SUCCESSCONST_IDLE");
    //   this.successConstellationPath.push(newSuccConst);
    // });
    this.hasConstellation = true;
    this.game.cameras.main.shake(200, 0.006);
    this.constFadePath = [];
    this.currentPath.animLinePath.forEach((item, i) => {
      console.log(item);
      var newSuccConst = this.game.add.sprite(item.x, item.y, 'ph_path').setOrigin(0, 0.5);
      newSuccConst.setAngle(item.angle);
      newSuccConst.setScale(this.hexScale);
      newSuccConst.visible = false;
      this.constFadePath.push(newSuccConst);
    });
    this.constellationText.backgroundChildren[0].fillColor = this.currentPath.hexesInPath[0].color.color;
    this.constellationText.setText(constellation.name).layout();
    this.subConstellationText.backgroundChildren[0].fillColor = this.currentPath.hexesInPath[0].darkTint.color;
    this.subConstellationText.setText(constellation.story).layout();
    this.constellationText.setPosition(this.currentPath.loopEndHex.getOffSetPos().x , this.currentPath.loopEndHex.getOffSetPos().y- this.hexHeight/2);
    this.subConstellationText.setPosition(this.currentPath.loopEndHex.getOffSetPos().x , this.currentPath.loopEndHex.getOffSetPos().y- this.hexHeight/2+40);

    this.constellationText.visible = true;
    console.log("visible");
    var constExplosion = this.game.add.sprite(this.currentPath.loopEndHex.getOffSetPos().x, this.currentPath.loopEndHex.getOffSetPos().y, 'ph_pointerPath').setOrigin(0.5, 0.5);
    constExplosion.anims.play("CONST_EXPLOSION", false);
    constExplosion.setTint(0xf7f0c7);
    constExplosion.setScale(this.hexScale * 2);
    this.currentPath.pointerImage.visible = false;
    var pointerRef= this.currentPath.pointerImage;
    constExplosion.setDepth(100);
    var constExplosionRef = constExplosion;
    constExplosion.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
      console.log('SPRITE_ANIMATION_COMPLETE')
      pointerRef.visible = true;
      constExplosionRef.destroy();
    })


    if(!this.isTome){
      var music = this.game.sound.add("BOWL_" + Math.ceil(Math.random() * 5));
      music.play();
      this.constellationsFoundThisGame.add(constellation);
      if(!this.game.gameData.constellationsFound.has(constellation.name)){
        this.game.gameData.newConstellations.add(constellation.name);
        this.learnConstellation(constellation);
        console.log("new constellation" + constellation.name);

      }
      this.exclamationText = constellation.name;

    }else{

      if(this.game.getCurrentConstellation().name == constellation.name){
        this.game.discoveredText.setText("discovered");

        var music = this.game.sound.add("BOWL_" + Math.ceil(Math.random() * 5));
        music.play();
        this.drawSolution(constellation);
      }else{
        this.constellationText.setText(constellation.distortedName).layout();
        this.subConstellationText.setText("you stumbled onto something...").layout();
        var music = this.game.sound.add("WRONG_BELL", {volume: 0.1});
        music.play();
        //put special sound because you've discover A pattern but not THE pattern
      }
    }


  }
  learnConstellation(constellation){
    this.game.gameData.constellationsFound.add(constellation.name);
    localStorage.setItem("wizardConstellations", JSON.stringify(Array.from(this.game.gameData.constellationsFound)));
  }

  //function that calculates the optimal scale for the hexes based on how many rows and columns you plan on using are.
  calcScale(initSize, boardWidth, boardHeight, numRows, numColumns){

    var hexWidth = (Math.sqrt(3) * initSize);

    var widthHexesShouldBe = (boardWidth)/(numColumns+0.5);
    var hexHeight = (2 * initSize);
    var heightHexesShouldBe = (boardHeight - this.boardYOffset)/(numRows*0.75 +0.25);
    var bestFitHeightScale = heightHexesShouldBe/hexHeight;
    var bestFitWidthScale = widthHexesShouldBe/hexWidth;
    var chosenScale = Math.min(bestFitWidthScale, bestFitHeightScale);
    var upperLeft = (boardWidth/2) - (hexWidth* chosenScale * ((numColumns+0.5)/2))

    return {
      scale: chosenScale,
      actualWidth: chosenScale * hexWidth * (numColumns+0.5),
      actualHeight: chosenScale *  hexHeight * (numRows*0.75 +0.25),
      upperLeft: upperLeft
    };


  }
  logContellation(con){
    console.log(con.patternArray);
  }
  decrementNumMoves(){
    if(this.isTome){
      return;
    }
    this.numMovesLeft -=1;
    this.timeText.setText("moves: " + this.numMovesLeft);
    if(this.numMovesLeft <=0){
      this.onGameOver();
    }
  }
  //updates time based on the delta time in the update loop
  updateTime(deltaTime){
    if(this.timeRemaining>0){
      this.timeRemaining -= deltaTime/1000;
      this.timeText.setText(Math.ceil(this.timeRemaining));
    }else{
      if(!this.gameOverTriggered){
        this.onGameOver();

      }
    }

  }

  //function that positions various UI elements when the game ends
  onGameOver(){
    this.gameOverTriggered = true;
    this.playAgainButton = new GameOverButton(this.game, 300, 300, -300, 0, "play again", this.restartGame);
    this.returnToMenuButton = new GameOverButton(this.game, 300, 400, 300, 0, "return to menu", this.backToMenu);

    this.movingUI.push(this.playAgainButton);
    this.movingUI.push(this.returnToMenuButton);
    this.playAgainButton.button.visible = true;

    var numSimilar = 0;
    this.game.gameData.dailyConstellations.forEach((item, i) => {
      if(this.constellationsFoundThisGame.has(item)){
        numSimilar++;
      }
    });
    this.game.gameData.constellationsFoundLastGame = this.constellationsFoundThisGame;
    if(numSimilar == this.game.gameData.dailyConstellations.length){
      console.log("found all daily in single game");
      this.game.gameData.solvedAllDaily = true;
      localStorage.setItem("wizardSolvedAllWeekly", true);
    }
  }
  //helper function for restarting game
  restartGame(button, groupName, index, pointer, event){
    button.scene.board.setHighScore();
    button.scene.scene.start("GameScene", button.scene.gameData);
  }
  //helper function for returning to the main menu
  backToMenu(button, groupName, index, pointer, event){
      button.scene.board.setHighScore();
      button.scene.scene.start("TitleScene", button.scene.gameData);
  }

  setHighScore(){
    if(this.game.gameData.highScore< this.score){
      this.game.gameData.highScore = this.score;
      localStorage.setItem("wizardHighScore", this.score);
    }


  }
  //this function goes through all of the items that are in the moving UI list and updates their positions
  //once they are finished, i.e. they are interpolated a total of 1, then they are removed from the list
  updateUI(){
    var finishedThisFrame = [];

    for(var i = 0; i< this.movingUI.length; i++){
      this.movingUI[i].updatePosition();

      if(this.movingUI[i].interpolationAmount>=1){
        finishedThisFrame.push(this.movingUI[i]);
      }
    }
    for(var i = 0; i< finishedThisFrame.length; i++){
      var index = this.movingUI.indexOf(finishedThisFrame[i]);
      this.movingUI.splice(index, 1);
    }


  }
  setScore(scoreToAdd){
    if(this.isTome){
      return;
    }
    this.score += scoreToAdd;
    this.scoreText.setText("score: " + this.score);
  }

  //draws the board using the values gotten in calcScale
  drawBoard(){
    for(var i = 0; i<this.numColumns; i++){
      this.boardData.push([]);

      for(var j = 0; j<this.numRows; j++){

        this.boardData[i].push(new Hex(this, this.initOffset.x + i*this.hexWidth,this.initOffset.y +j*this.vertOffset,  ((j%2) * this.hexWidth/2), {row: j, col: i}, this.hexScale, this.game));
        this.boardData[i][j].draw();

      }
    }
    console.log(this.identifierDict);

  }


  getHex(row, col){
    return this.boardData[col][row];
  }

  initalizePath(startHex){
    this.currentPath = new Path(startHex, this);
  }

  //funtion for resolving the score based on a given path
  evaluateScore(path){
    var pathScore = 0;

    if(this.game.gameData.gameMode == "DOTS"){

      pathScore = path.hexesInPath.length + path.additionalHexes.size;
      if(path.currentConstellation!= false){
        console.log(path.currentConstellation);
        pathScore+=path.currentConstellation.assocConstellation.getScoreMod();
      }
    }else{
      var scorePerHex = 1;

      if(path.isLoop){
        if(path.hexesInPath.length>3){
          pathScore += 3;
        }else{
          pathScore+=1;
        }

      }
      for(var  i = 0; i<path.hexesInPath.length; i++){
        pathScore+= scorePerHex;
      }
      pathScore += (5* path.getNumDifferentInLoop());

    }
    return pathScore;


  }

  //destroys the appropiate game objects based on the path that was given
  resolvePath(path, hasLoop){
    if(this.gameOverTriggered){
      return;
    }
    this.exclamationText = "nice";
    this.currentPath = undefined;
    if(path.hexesInPath.length ==1){
      path.hexesInPath[0].removeHexFromPathAnim();
      return;
    }
    this.decrementNumMoves();
    this.setScore(this.evaluateScore(path));
    for(var col in path.columnsAffected){
      col = parseInt(col);
      //loop over all of the hexs in the affected columns
      var numBelow = 0;
      //decrement from bottom up
      for(var i = this.boardData[col].length-1; i>=0; i--){
        //if it reaches an undefined one, skip
        if(this.boardData[col][i] == undefined){
          continue;
        }
        //if we are on a row that was removed in the column
        if(path.columnsAffected[col].includes(this.boardData[col][i].index.row)){
          numBelow++;
          this.boardData[col][i].removeFromDict();
          this.boardData[col][i].assocText.destroy();
          this.boardData[col][i].gameObject.destroy();

          this.boardData[col][i] = undefined;


        }else{
          if(numBelow>0){
            this.boardData[col][i].moveDown(numBelow);
            this.boardData[col][i+numBelow] = this.boardData[col][i];
            //make new hexs here
            this.boardData[col][i] = undefined;
          }


        }


      }
      for(var i =0; i< numBelow; i++){
        this.boardData[col][i] = new Hex(this, this.initOffset.x + col*this.hexWidth,this.initOffset.y + i*this.vertOffset,  ((i%2) * this.hexWidth/2), {row: i, col: col}, this.hexScale, this.game);
        this.boardData[col][i].draw();

        this.boardData[col][i].spawnAnim();
      }

    }


    var constTextRef= this.constellationText;
    this.subConstellationText.visible = false;
    this.constellationText.visible = false;
    this.constFadePath.forEach((item, i) => {
      item.visible = true;
      item.setDepth(100);
      item.anims.play("CONST_FADE", false);
      var itemRef = item;
      item.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
        console.log('SPRITE_ANIMATION_COMPLETE')
        constTextRef.visible = false;
        itemRef.destroy();
      })

    });
    this.constFadePath = [];
    this.hasConstellation = false;
  }

  loadAssets(){
    this.game.anims.create({
        key: "HINT_IDLE",
        frames: this.game.anims.generateFrameNumbers('successPathSpriteSheet', { start: 0, end: 2}),
        frameRate: 8,
        repeat: -1
    });
    this.game.anims.create({
        key: "SOLUTION_IDLE",
        frames: this.game.anims.generateFrameNumbers('successPathSpriteSheet', { start: 23, end: 27}),
        frameRate: 8,
        repeat: -1
    });
    this.game.anims.create({
        key: "CONST_FADE",
        frames: this.game.anims.generateFrameNumbers('successPathSpriteSheet', { start: 13, end: 22}),
        frameRate: 8,
        repeat: 0
    });

    this.game.anims.create({
        key: "SUCCESS_SPAWN",
        frames: this.game.anims.generateFrameNumbers('successPathSpriteSheet', { start: 3, end: 11}),
        frameRate: 24,
        repeat: 0
    });
    this.game.anims.create({
        key: "SUCCESS_IDLE",
        frames: this.game.anims.generateFrameNumbers('successPathSpriteSheet', { start: 11, end: 13}),
        frameRate: 8,
        repeat: -1
    });
    this.game.anims.create({
        key: "CONST_EXPLOSION",
        frames: this.game.anims.generateFrameNumbers('constExplosionSpriteSheet', { start: 0, end: 9}),
        frameRate: 8,
        repeat: 0
    });


    this.game.anims.create({
        key: "VILLAGE_SPAWN",
        frames: this.game.anims.generateFrameNumbers('villageSpriteSheet', { start: 0, end: 7}),
        frameRate: 8,
        repeat: 0
    });
    this.game.anims.create({
        key: "VILLAGE_IDLE",
        frames: this.game.anims.generateFrameNumbers('villageSpriteSheet', { start: 8, end: 11}),
        frameRate: 8,
        repeat: -1
    });
    this.game.anims.create({
        key: "OUTPOST_SPAWN",
        frames: this.game.anims.generateFrameNumbers('outpostSpriteSheet', { start: 0, end: 7}),
        frameRate: 8,
        repeat: 0
    });
    this.game.anims.create({
        key: "OUTPOST_IDLE",
        frames: this.game.anims.generateFrameNumbers('outpostSpriteSheet', { start: 8, end: 11}),
        frameRate: 8,
        repeat: -1
    });
    this.game.anims.create({
        key: "POINTER_IDLE",
        frames: this.game.anims.generateFrameNumbers('pointerPathSpritesheet', { start: 0, end: 6}),
        frameRate: 8,
        repeat: -1
    });
    this.game.anims.create({
        key: "POINTERPATH_IDLE",
        frames: this.game.anims.generateFrameNumbers('pointerPathSpritesheet', { start: 7, end: 16}),
        frameRate: 8,
        repeat: -1
    });
    this.game.anims.create({
        key: "STARPATH_IDLE",
        frames: this.game.anims.generateFrameNumbers('starPathSpritesheet', { start: 0, end: 13}),
        frameRate: 8,
        repeat: -1
    });

    this.game.anims.create({
        key: "CREATE_MOUNTAINS",
        frames: this.game.anims.generateFrameNumbers('masterSpriteSheet', { start: 0, end: 3}),
        frameRate: 8,
        repeat: 0
    });
    this.game.anims.create({
        key: "MOUNTAINS_IDLE",
        frames: this.game.anims.generateFrameNumbers('masterSpriteSheet', { start: 4, end: 5}),
        frameRate: 4,
        repeat: -1
    });
    this.game.anims.create({
        key: "SKY_IDLE",
        frames: this.game.anims.generateFrameNumbers('masterSpriteSheet', { start: 10, end: 11}),
        frameRate: 2,
        repeat: -1
    });
    this.game.anims.create({
        key: "SEA_IDLE",
        frames: this.game.anims.generateFrameNumbers('masterSpriteSheet', { start: 8, end: 9 }),
        frameRate: 2,
        repeat: -1
    });
    this.game.anims.create({
        key: "PRARIE_IDLE",
        frames: this.game.anims.generateFrameNumbers('masterSpriteSheet', { start: 6, end: 7 }),
        frameRate: 2,
        repeat: -1
    });
    this.game.anims.create({
        key: "DOTS_IDLE",
        frames: this.game.anims.generateFrameNumbers('dotsSpritesheet', { start: 0, end: 6 }),
        frameRate: 12,
        repeat: -1
    });
    this.game.anims.create({
        key: "DOTS_ACTIVATE",
        frames: this.game.anims.generateFrameNumbers('dotsSpritesheet', { start: 7, end: 13 }),
        frameRate: 12,
        repeat: 0
    });
    this.game.anims.create({
        key: "DOTS_ACTIVATED_IDLE",
        frames: this.game.anims.generateFrameNumbers('dotsSpritesheet', { start: 14, end: 17 }),
        frameRate: 12,
        repeat: -1
    });
  }


}



//This is a class that stores all data pertaining to the current path that you are drawing. It includes all
//the hexes in the current path, any hexes that are going to be removed, and any hexes that are completely
//surrounded in a loop
class Path{
  constructor(startHex, board){
    this.hexesInPath = [];
    this.color = "";
    //I store the hexes that are going to be removed in a dictionary of columns with the entries being a list
    //of rows in that column that will be destroyed. I do this so in the board class we don't have to loop over
    //every column, and instead only loop over the ones that are going to have changes
    this.columnsAffected= new Object();
    //all of the valid hexes
    this.pathOptions = [];
    this.board = board;
    //hexes completely surrounded
    this.innerHexes = new Set();
    //hexes elsewhere on the board that are effected by the path (when you get a loop all hexes of that color are effected)
    this.additionalHexes= new Set();
    this.linePath = [];
    this.animLinePath = [];
    this.circlesInLinePath = [];
    this.lineGraphics = this.board.game.add.graphics();
    this.guidingLineGraphics = this.board.game.add.graphics();
    this.pointerImage = this.board.game.add.sprite(0,0, "ph_pointer").setScale(this.board.hexScale);
    this.pointerImage.anims.play("POINTER_IDLE");

    this.isLoop = false;
    this.addHex(startHex);
    this.zoomToHex(startHex);
    this.pointerPath = [];
    var temp = this;
    this.cameraInterpolation = 0;
    this.prevLoop = false;
    this.hexsInLoop = [];
    this.loopEndHex = undefined;
    this.currentSuccessPathNum = 0;
    this.pathScoreText = undefined;
    this.currentConstellation = false;

  }
  //helper function for zooming, so it zooms to the average point of the last 3 hexes in your path
  getAveragePoint(){
    var sumX = 0;
    var sumY = 0;
    var numIncluded =0;
    for(var i = this.hexesInPath.length-1; i>= Math.max(0, this.hexesInPath.length-3);i--){
      sumX+=this.hexesInPath[i].getOffSetPos().x;
      sumY+=this.hexesInPath[i].getOffSetPos().y;
      numIncluded++;
      console.log(this.hexesInPath[i]);
    }
    return {
      x: sumX/numIncluded,
      y: sumY/numIncluded
    };
  }
  //function that determines what happenes when you hover over the hex
  resolveHexHover(newHex){
    if(this.board.gameOverTriggered){
      return;
    }

    //this.isLoop = false;
    //if you had a loop last hover, and now don't have a loop, you want to reset the loop
    if(this.isLoop){
      //if we didn't undo back to tail
      if(newHex != this.getTail()){
        if(!this.isValidHex(newHex) || newHex == this.loopEndHex){
          return;
        }
      }
      this.board.constellationText.visible = false;
      this.board.subConstellationText.visible = false;
      this.currentConstellation = false;
      this.board.constFadePath = [];
      this.board.exclamationText = "nice";
      //we undid back to tail or hit another valid hex
      this.removeLineSegmant();
      this.isLoop = false;
      this.resetPathToDefault();
      if(this.innerHexes.size>0){
        for (let innerHex of this.innerHexes) {
          innerHex.removeHexFromPathAnim();
          innerHex.setColorToDefault();
          if(this.board.game.gameData.gameMode != "DOTS"){
            var index = this.columnsAffected[innerHex.index.col].indexOf(innerHex.index.row);
            this.columnsAffected[innerHex.index.col].splice(index, 1);
          }

        }
        this.innerHexes.clear();
      }
      var pathRef = this;
      this.additionalHexes.forEach(function(entry){
        entry.removeHexFromPathAnim();
        entry.setColorToDefault();
        var index = pathRef.columnsAffected[entry.index.col].indexOf(entry.index.row);
        pathRef.columnsAffected[entry.index.col].splice(index, 1);
      });
      for(var i = 0; i< this.hexesInPath.length; i++){
        this.hexesInPath[i].setColorToDefault();
      }
      this.additionalHexes.clear();
      this.updateExploreText();


    }

    //if you hover over a hex that cannot be included in the path. No need to go further
    if(!this.isValidHex(newHex)){
      return;
    }

    //zoom to the current hex

    this.zoomToHex(newHex);

    if(this.hexesInPath.length>0){
      //you;ve already visited the hex on the path
      if(this.hexesInPath.includes(newHex)){
        if(newHex == this.getPrevTail()){
          //undoing back a step
          this.isLoop = false;
          this.removeHex(this.getTail());
        }
        else{
          //you've looped somewhere in your hex
          if(this.hexesInPath.length>2 && !this.isLoop){
            this.addLineSegment(this.getTail(), newHex);
            this.isLoop = true;
            this.loopEndHex = newHex;
            this.evaluateLoop(this.hexesInPath);
            //this.zoomToHex(newHex, Array.from(this.innerHexes));

          }

        }


      }else{
        //you haven't visited it, and it is valid, so add it to the path
        this.isLoop = false;
        this.addHex(newHex);
      }
    }

    this.updateExploreText();
    this.prevLoop = this.isLoop;
  }
  //pans and zooms to the current hex if you are playing with mobile friendly turned on
  zoomToHex(assocHex, hexesToAverage = []){
    if(!this.board.game.gameData.mobileFriendly){
      return;
    }
    var boardRef = this.board;
    var cam = this.board.game.cameras.main;
    var targetPos = {x: assocHex.getOffSetPos().x,
                    y: assocHex.getOffSetPos().y};
    var offset = cam.originX - targetPos.x;
    var modMousePosX = this.board.game.input.activePointer.positionToCamera(this.board.game.cameras.main).x;
    var modMousePosY = this.board.game.input.activePointer.positionToCamera(this.board.game.cameras.main).y;
    // cam.scrollX = modMousePosX;
    // cam.zoom = 2;
    // cam.scrollX = -modMousePosX;
    var weight = {
      x: modMousePosX/600,
      y: modMousePosY/600
    }
    //cam.originX = weight.x;
    //cam.originY= weight.y;
    //cam.zoom = 2;
    if(this.board.game.cameras.main.zoom>1){
      if(hexesToAverage.length>0){
        var averagePos = {
          x:0,
          y:0
        }
        for(var i = 0; i< hexesToAverage.length; i++){
          averagePos.x += hexesToAverage[i].getOffSetPos().x;
          averagePos.y += hexesToAverage[i].getOffSetPos().y;
        }
        averagePos.x/=hexesToAverage.length;
        averagePos.x/=600;
        averagePos.y/=hexesToAverage.length;
        averagePos.y/=600;
        this.animateCameraOrigin(cam.originX, cam.originY, averagePos.x, averagePos.y);
      }else{
        this.animateCameraOrigin(cam.originX, cam.originY, assocHex.getOffSetPos().x/600, assocHex.getOffSetPos().y/600);

      }

    }else{
      cam.originX = weight.x;
      cam.originY= weight.y;
    }
    this.board.game.cameras.main.zoomTo(1/this.board.hexScale * 1.5, 2000, "Cubic", true, function(camera, progress, zoomValue) {
      boardRef.cameraZoom = zoomValue;
    });
    //

    //var cr = Phaser.Renderer.Canvas.CanvasRenderer(this.board.game.game);

    //transformMatrix.setToContext(this.board.game.game.context)

  }
  animateCameraOrigin(fromX, fromY, toX, toY){
    console.log("animating");
    this.camAnimationData =
    {
      fromX: fromX,
      fromY: fromY,
      toX: toX,
      toY: toY,
      interpolationAmount: 0
    }
    console.log(this.camAnimationData);

  }
  updateCameraPos(){

    this.board.game.cameras.main.originX =  Phaser.Math.Interpolation.CatmullRom([this.camAnimationData.fromX, this.camAnimationData.toX], this.camAnimationData.interpolationAmount);
    this.board.game.cameras.main.originY =  Phaser.Math.Interpolation.CatmullRom([this.camAnimationData.fromY, this.camAnimationData.toY], this.camAnimationData.interpolationAmount);
    this.camAnimationData.interpolationAmount += 0.03;
  }


  onLoopComplete(){




  }
  //removes hex from the path
  removeHex(newHex){
    newHex.removeHexFromPathAnim();
    //remove path from list
    this.hexesInPath.splice(this.hexesInPath.length-1, 1);
    this.columnsAffected[newHex.index.col].splice(this.columnsAffected[newHex.index.col].length-1, 1);
    //remove line segment
    this.removeLineSegmant();
    for(var i =0; i< this.linePath.length; i++){
      this.drawLineSegment(this.linePath[i], this.circlesInLinePath[i]);
    }
    this.pathOptions = this.getTail().getNeighbors();

  }
  //removes line segment from the path
  removeLineSegmant(){
    this.linePath.splice(this.linePath.length-1, 1);
    this.circlesInLinePath.splice(this.circlesInLinePath.length-1, 1);
    this.lineGraphics.clear();
    var lineToDelete = this.animLinePath.splice(this.animLinePath.length-1, 1);

    lineToDelete[0].destroy();
  }
  //add hex to path
  addHex(newHex){
    if(this.hexesInPath.length !=0){
      this.addLineSegment(this.getTail(), newHex);

    }
    this.hexesInPath.push(newHex);
    if(this.hexesInPath.length == 1){
      this.initializeGuidingLine();
      this.initializePathLine();
    }
    this.addToColumnsAffected(newHex);
    this.pathOptions = newHex.getNeighbors();
    newHex.addHexToPathAnim();

  }
  //used in my custom game mode, you get the number of different types of hexes that would be completely surrounded
  getNumDifferentInLoop(){
    var typesOfInnerHexes= new Set();
    for (let innerHex of this.innerHexes) {
      typesOfInnerHexes.add(innerHex.identifier.name);

    }
    return typesOfInnerHexes.size;
  }
  //this is your path score, I called it exploring for a second haha
  updateExploreText(){
    console.log(this.isTome);
    if(this.board.isTome){
      return;
    }
    var text = "";
    if(this.board.game.gameData.gameMode == "DOTS"){
      text = "path score: " + this.hexesInPath.length + " + " + this.additionalHexes.size;

    }else{
      var loopModText = "";
      if(this.isLoop){
        if(this.hexesInPath.length>3){
          loopModText = "+3";
        }else{
          loopModText = "+1";
        }
      }
      var communityText = "";

      for(var i = 0; i<this.getNumDifferentInLoop(); i++){
        communityText+= "+5"
      }
      text = "path score: " + this.hexesInPath.length + loopModText + communityText;
    }

    this.board.exploreScoreText.setText(text);

  }
  resetExploreText(){
    if(this.board.isTome){
      return;
    }
    this.board.exploreScoreText.setText("path score: 0");
  }
  //adds hex to the columns effected dictionary
  addToColumnsAffected(assocHex){
    if(!this.columnsAffected[assocHex.index.col]){
      this.columnsAffected[assocHex.index.col] = [];
    }
    this.columnsAffected[assocHex.index.col].push(assocHex.index.row);
  }

  isValidHex(hex){
    for(var i = 0; i< this.pathOptions.length; i++){
      if(hex == this.pathOptions[i]){
        return true;
      }
    }
    return false;
  }
  endPath(){
    this.guidingLineGraphics.destroy();
    this.lineGraphics.destroy();
    if(this.pathScoreText != undefined){
      this.pathScoreText.destroy();

    }
    this.board.resolvePath(this, false);
    //maybe can do an animation here?
    for(var i = 0; i<this.animLinePath.length; i++){
      this.animLinePath[i].destroy();
    }
    for(var i = 0; i<this.pointerPath.length; i++){
      this.pointerPath[i].destroy();
    }
    this.pointerImage.destroy();
    this.resetExploreText();
    var boardRef = this.board;
    this.board.game.cameras.main.zoomTo(1, 500, "Cubic", true, function(camera, progress, zoomValue) {
      boardRef.cameraZoom = zoomValue;
    });
    this.board.game.cameras.main.pan(300, 300, 500, 'Cubic', true, function(camera, progress, x, y){
      boardRef.cameraOffset.x = x;
      boardRef.cameraOffset.y = y;
    });

  }
  addLineSegment(fromHex, toHex){
    var newLine= new Phaser.Geom.Line(fromHex.getOffSetPos().x, fromHex.getOffSetPos().y, toHex.getOffSetPos().x, toHex.getOffSetPos().y);
    var newCircle = new Phaser.Geom.Circle(toHex.getOffSetPos().x, toHex.getOffSetPos().y, 5);
    this.drawLineSegment(newLine, newCircle);
    this.circlesInLinePath.push(newCircle);
    this.linePath.push(newLine);
    var rotAngle = Phaser.Math.Angle.Between(newLine.x1, newLine.y1, newLine.x2, newLine.y2) * Phaser.Math.RAD_TO_DEG;
    var newLineAnim = this.board.game.add.sprite(newLine.x1, newLine.y1, 'ph_path');
    //wait i can set this here lmao
    //THIS IS DUMMY SHIT
    switch(Math.round(rotAngle)) {
      case 0:
        console.log("0");
        fromHex.setPathNumToNeighbor(0);
        break;
      case -60:
        fromHex.setPathNumToNeighbor(1);
        break;
      case -120:
        fromHex.setPathNumToNeighbor(2);
        break;
      case 180:
        fromHex.setPathNumToNeighbor(3);
        break;
      case 120:
        fromHex.setPathNumToNeighbor(4);
        break;
      case 60:
        fromHex.setPathNumToNeighbor(5);
        break;
      default:
        // code block
    }
    newLineAnim.anims.play("STARPATH_IDLE");
    newLineAnim.setOrigin(0, 0.5).setScale(this.board.hexScale).setAngle(rotAngle);
    this.animLinePath.push(newLineAnim);
  }
  //draws a debug line segment
  drawLineSegment(line, circle){
    // this.lineGraphics.lineStyle(10, 0xfdfd96, 0.7);
    // this.lineGraphics.strokeLineShape(line);
    // this.lineGraphics.fillStyle(0xfdfd96, 0.7);
    // this.lineGraphics.fillCircleShape(circle);


  }
  initializePathLine(){
    this.lineGraphics = this.board.game.add.graphics();
  }
  initializeGuidingLine(){
    this.guidingLineGraphics = this.board.game.add.graphics();
    this.guidingLine = new Phaser.Geom.Line(this.getTail().getOffSetPos().x, this.getTail().getOffSetPos().y, this.getTail().getOffSetPos().x, this.getTail().getOffSetPos().y);
    this.guidingLineGraphics.lineStyle(10);
    this.guidingLineGraphics.strokeLineShape(this.guidingLine);
    this.guidingLineGraphics.clear();
  }
  //updates the leading line
  updateGuidingLinePos(){
    if(this.guidingLine == undefined){
      return;
    }
    if(this.board.gameOverTriggered){
      return;
    }
    //guiding line will always go from the last node in the path
    var mousePos = this.board.game.input.activePointer;;
    var modMousePosX = this.board.game.input.activePointer.positionToCamera(this.board.game.cameras.main).x;
    var modMousePosY = this.board.game.input.activePointer.positionToCamera(this.board.game.cameras.main).y;
    this.guidingLineGraphics.clear();
    var lerpedPosX = Phaser.Math.Interpolation.Linear([this.guidingLine.x2, modMousePosX], 0.3);
    var lerpedPosY = Phaser.Math.Interpolation.Linear([this.guidingLine.y2, modMousePosY], 0.3);
    this.guidingLine.setTo(this.getTail().getOffSetPos().x,this.getTail().getOffSetPos().y, lerpedPosX, lerpedPosY);

    //helper to progamatically include as many segments of the animation for the leading line
    var lineLength = Phaser.Geom.Line.Length(this.guidingLine);
    var numSegments = Math.floor(lineLength/(64 * this.board.hexScale));
    if(numSegments > this.pointerPath.length){
      var newSegment = this.board.game.add.sprite(0,0, "ph_pointerPath");
      newSegment.anims.play("POINTERPATH_IDLE");
      this.pointerPath.push(newSegment);
      newSegment.setOrigin(0,0.5);
      newSegment.setScale(this.board.hexScale);

    }
    if(numSegments < this.pointerPath.length){
      var pathToRemove = this.pointerPath.splice(this.pointerPath.length-1, 1);
      pathToRemove[0].destroy();

    }
    //draw out each segment for the leading line
    var angle = Phaser.Math.Angle.Between(this.guidingLine.x1, this.guidingLine.y1, this.guidingLine.x2, this.guidingLine.y2)
    for(var i = 0; i< this.pointerPath.length; i++){
      //var xPos = Phaser.Phaser.Math.Interpolation.Linear[]
      var xPos = this.getTail().getOffSetPos().x + Math.cos(angle) * (64*this.board.hexScale * i);
      var yPos = this.getTail().getOffSetPos().y + Math.sin(angle) * (64*this.board.hexScale * i);
      this.pointerPath[i].setAngle(angle * Phaser.Math.RAD_TO_DEG);
      this.pointerPath[i].setPosition(xPos,yPos);
    }
    this.pointerImage.setPosition(lerpedPosX, lerpedPosY);

  }
  //this checks to see what hexes are included in the inner loop
  spawnSuccessPath(){
    this.currentSuccessPathNum = 0;
    this.changePathToSuccess(this.currentSuccessPathNum);
    for(var i = 0; i< this.hexesInPath.length; i++){
      this.hexesInPath[i].setColorToDarker();
    }
    console.log("SPAWN");
  }
  updateSuccessPath(){
    // if(this.innerHexes.size <=0){
    //   return;
    // }
    if(this.currentSuccessPathNum >= this.animLinePath.length){
      return;
    }
    if(this.animLinePath[this.currentSuccessPathNum].anims.getProgress()>0.9){
      this.currentSuccessPathNum++;
      if(this.currentSuccessPathNum >= this.animLinePath.length){
        this.onSuccessLoopComplete();

        return;
      }
      this.changePathToSuccess(this.currentSuccessPathNum);
    }
  }
  onSuccessLoopComplete(){
    this.board.game.cameras.main.shake(200, 0.003);
    if(this.currentConstellation!= false){
      this.board.subConstellationText.visible = true;

    }
    for(var i = 0; i< this.animLinePath.length; i++){

      this.animLinePath[i].anims.setTimeScale(1);

    }
    for(var i = 0; i< this.pointerPath.length; i++){
       this.pointerPath[i].setTint(this.hexesInPath[0].color.color);
    }
    this.pointerImage.setTint(this.hexesInPath[0].color.color);
    //random nice animation

  }
  changePathToSuccess(pathNum){
    var percentThrough = this.currentSuccessPathNum/this.animLinePath.length
    this.animLinePath[this.currentSuccessPathNum].anims.setTimeScale(1+ percentThrough*10)
    console.log(1+ percentThrough*10);
    this.animLinePath[this.currentSuccessPathNum].anims.play("SUCCESS_SPAWN");
    this.animLinePath[this.currentSuccessPathNum].anims.chain("SUCCESS_IDLE");
    this.animLinePath[this.currentSuccessPathNum].setTint(this.hexesInPath[0].color.color);

  }
  resetPathToDefault(){
    for(var i = 0; i< this.animLinePath.length; i++){
      this.animLinePath[i].setTint(0xFFFFFF);
      this.animLinePath[i].play("STARPATH_IDLE");
      this.animLinePath[i].anims.setTimeScale(1);
    }
    if(this.pathScoreText!=undefined){
      this.pathScoreText.destroy();

    }
    this.pathScoreText = undefined;
    this.pointerImage.setTint(0xFFFFFF);
  }

  checkPattern(){

    //find the top most hex
    var highestHexes = [];
    var minY = 600;
    this.hexesInPath.forEach((item, i) => {
      if(item.getOffSetPos().y< minY){
        highestHexes = [];
        minY = item.getOffSetPos().y;
        highestHexes.push(item);
      }else if(item.getOffSetPos().y==minY){
        highestHexes.push(item);
      }
    });
    var minX = 600;
    var startHex = undefined;
    highestHexes.forEach((item, i) => {
      if(item.getOffSetPos().x< minX){
        minX = item.getOffSetPos().x;
        startHex = item;
      }
    });
    var pathToOperateOn = this.hexesInPath.slice();

    //we see if the loop is clockwise or counter clockwise
    var clockwiseArray = [1,0,5];
    var directionsArray=[];
    var isCounterClockwise = false;
    var center = {
      x: 0,
      y:0
    }
    this.hexesInPath.forEach((item, i) => {
      center.x+= item.getOffSetPos().x;
      center.y+= item.getOffSetPos().y;
    });
    center.x/=this.hexesInPath.length;
    center.y/=this.hexesInPath.length;

    //var vectorToLast = new Phaser.Math.Vector2(this.getTail().getOffSetPos().x - center.x, this.getTail().getOffSetPos().y - center.y);
    var clockwiseCount =0;
    var prevVector = new Phaser.Math.Vector2(this.hexesInPath[0].getOffSetPos().x - center.x, this.hexesInPath[0].getOffSetPos().y - center.y).normalize();
    for(var i=1; i< this.hexesInPath.length; i++){
      var curVector = new Phaser.Math.Vector2(this.hexesInPath[i].getOffSetPos().x - center.x, this.hexesInPath[i].getOffSetPos().y - center.y).normalize();
      if(prevVector.cross(curVector)>0){
        clockwiseCount++;
      }else{
        clockwiseCount--;
      }

      prevVector = curVector;
    }

    console.log("clockwiseCount");
    console.log(clockwiseCount);
    if(clockwiseCount<0){
      isCounterClockwise= true;
    }
    if(isCounterClockwise){
      pathToOperateOn.reverse();
      console.log("counter clockwise");

      console.log("new path to neighbors");
      pathToOperateOn.forEach((item, i) => {
        isCounterClockwise = true;
        //item.pathNumToNeighbor = (pathToOperateOn[(i+1) % pathToOperateOn.length].pathNumToNeighbor + 3)%6;

      });

    }else{
      console.log("clockwise");
    }
    //starHex is the start node
    var startHexIndex = pathToOperateOn.indexOf(startHex);
    var newBeginningArray = pathToOperateOn.slice(startHexIndex, pathToOperateOn.length);
    var newEndArray = pathToOperateOn.slice(0, startHexIndex);
    var finalArray = newBeginningArray.concat(newEndArray);

    var sortedArray = [];


    finalArray.forEach((item, i) => {
      if(isCounterClockwise){
        sortedArray.push((finalArray[(i+1) % finalArray.length].pathNumToNeighbor + 3)%6);
      }else{
        sortedArray.push(item.pathNumToNeighbor);
      }
    });
    console.log("pattern on screen: ");
    console.log(sortedArray);
    this.currentConstellation = this.board.constellationManager.getConstellation(sortedArray);
    console.log(this.currentConstellation);
  }
  evaluateLoop(loopOfHexes){

    var foundStart =false;

    for(const col in this.columnsAffected){
      //finds the minimum and maximum rows that we need to look at in the column
      var minRow = Math.min(...this.columnsAffected[col]);
      var maxRow = Math.max(...this.columnsAffected[col]);

      for(var i = minRow; i<maxRow; i++){
        //if it isn't in the columns effected list
        if(!this.columnsAffected[col].includes(i)){
          //I need to check to make sure all neighbors are in the path
          if(this.innerHexes.has(this.board.boardData[col][i])){
            console.log("already in");
            continue;
          }else{
            //trigger a recursive function in the hex class that recursively checks its neighbors to see if they are touching an edge of the board
            //if they are touching an edge they cannot be in the middle of the hexes
            // console.log("result of running on " + col + ", " + i+ ": " + this.board.boardData[col][i].checkIfNeighborsAreWithingBoundry(this.hexesInPath, [this.board.boardData[col][i]], this.innerHexes));
            var newSet = new Set();
            if(this.board.boardData[col][i].checkIfNeighborsAreWithingBoundry(this.hexesInPath, [this.board.boardData[col][i]], newSet)){

              newSet.forEach(this.innerHexes.add, this.innerHexes)
              newSet.forEach((item, i) => {
                  console.log(item);
              });

              console.log("hex at : " + col + ", " + i + " evaluated to true");

            };
          }



        }
      }
    }
    if(this.board.game.gameData.gameMode == "DOTS"){
      if(this.innerHexes.size>0 || this.board.game.gameData.easyLoops){
        this.onLoopComplete();
        var itemToDelete = this.hexesInPath[0].identifier.name;

        var pathRef = this;
        this.board.identifierDict[itemToDelete].forEach(function(entry){
          if(!pathRef.hexesInPath.includes(entry)){
            pathRef.addToColumnsAffected(entry);
            entry.isInIslandAnim();
            entry.setColorToLighter();
            pathRef.additionalHexes.add(entry);
          }

        });
      }
    }else{

      if(this.innerHexes.size>0 || this.board.game.gameData.easyLoops){
        this.onLoopComplete();
      }
      for (let innerHex of this.innerHexes) {
        this.addToColumnsAffected(innerHex);
        innerHex.isInIslandAnim();
        innerHex.setColorToLighter();
      }
    }
    this.spawnSuccessPath();
    this.checkPattern();



  }

  getTail(){
    return this.hexesInPath[this.hexesInPath.length-1];
  }
  getPrevTail(){
    if(this.hexesInPath.length<2){
      return undefined;
    }
    return this.hexesInPath[this.hexesInPath.length-2];
  }
}

class GameOverButton{
  constructor(scene, x, y, xDelta, yDelta, text, clickCallBack){
    this.scene = scene;
    this.startX = x + xDelta;
    this.startY = y + yDelta;
    this.xPos = x;
    this.yPos = y;
    this.text = text;
    this.interpolationAmount =0;
    this.button = scene.rexUI.add.buttons({
        x: this.startX, y: this.startY,
        width: 300,
        orientation: 'x',

        buttons: [
            this.createButton(scene, text), // Add button in constructor
        ],
        click: {
          mode: "pointerdown",
          clickInterval: 100
        },
        align: 'center'
    }).layout();
    this.button.setDepth(1);
    this.button.on('button.click', clickCallBack);
  }
  updatePosition(){

    this.button.x= Phaser.Math.Interpolation.Linear([this.startX, this.xPos], this.interpolationAmount);
    this.button.y= Phaser.Math.Interpolation.Linear([this.startY, this.yPos], this.interpolationAmount);
    this.button.layout();
    this.interpolationAmount += 0.05;
  }
  createButton(scene, text){

    return scene.rexUI.add.label({

        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0xFFFFFF),
        text: scene.add.text(0, 0, text, { fontFamily: 'Whacky_Joe', fontSize: "24px" , color: 0xFFFFFF}),
        space: {
            left: 10,
            right: 10,
            top: 0,
            bottom: 10
        },
        align: 'center',
        name: text
    });
  }
}
