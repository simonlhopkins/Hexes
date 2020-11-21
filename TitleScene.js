//This class handles everything on the title screen, and modifies the object "initData" to pass to the game scene.
//constants


class TitleScene extends Phaser.Scene{
  constructor(){
    super("TitleScene");
    //initial values of all of the variables for game
    this.gameData =
    {
      colors: 3,
      rows: 6,
      cols: 6,

      gameMode: "DOTS",
      easyLoops: false,
      mobileFriendly: false,
      highScore: 0,
      constellationsFound: new Set(),
      newConstellations: new Set(),
      constellationsFoundLastGame: new Set(),
      numHints: 0,
      startTomeConst: 0,
      dailyConstellations: [],
      solvedAllDaily: false,
      musicInitialized: false,
      UIButtons: [],
      debugMode: false
    };

    this.constButtonDict = {};
    //helper array for toggleing the game mode

  }

  init(data){

    if(!(Object.keys(data).length === 0 && data.constructor === Object)){

      this.gameData = data;
      console.log(data);
    }
    if(localStorage.getItem("wizardConstellations") == null){
      localStorage.setItem("wizardConstellations", JSON.stringify([]));

      console.log(localStorage.getItem("wizardConstellations"));
    }
    else{
      this.gameData.constellationsFound = new Set(JSON.parse(localStorage.getItem("wizardConstellations")));
      console.log(localStorage.getItem("wizardConstellations"));

    }
    if(localStorage.getItem("wizardHighScore") == null){
      localStorage.setItem("wizardHighScore", 0);

      console.log(localStorage.getItem("wizardHighScore"));

    }
    else{
      this.gameData.highScore = localStorage.getItem("wizardHighScore");
      console.log(localStorage.getItem("wizardHighScore"));

    }

    // if(localStorage.getItem("wizardSolvedAllDaily") == null){
    //   localStorage.setItem("wizardSolvedAllDaily", false);
    // }
    // else{
    //   this.gameData.solvedAllDaily = localStorage.getItem("wizardSolvedAllDaily");
    // }


  }
  preload(){
    this.load.scenePlugin({
      key: 'rexuiplugin',
      url: "rexuiplugin.min.js",
      sceneKey: 'rexUI'
    });

    this.load.audio("WINDY_BACKGROUND", "assets/Audio/windySound.mp3");

  }

  create(){
    this.generateDailyConstellations();
    var settingsButton = new TitleButton(this, "settings", 100, 30, this.launchSettings);
    var settingsButton = new TitleButton(this, "tutorial", 500, 30, this.launchTutorial);
    var startButton = new TitleButton(this, "start", 450, 500, this.startGame);
    var tomeButton = new TitleButton(this, "tome", 300, 500, this.launchTome);
    var shopButton = new TitleButton(this, "tavern", 150, 500, this.launchShop);

    if(this.gameData.solvedAllDaily){
      shopButton.addPopUp("visitor!");
    }
    this.add.text(10, 60, "high score: " + this.gameData.highScore, { fontFamily: 'Whacky_Joe', fontSize: "24px" }).setOrigin(0,0);
    this.add.text(10, 110, "constellations found: " + this.gameData.constellationsFound.size + "/" + CONSTELLATIONS.length, { fontFamily: 'Whacky_Joe', fontSize: "24px" }).setOrigin(0,0);

    this.add.text(420, 540, "by simon :^)", { fontFamily: 'Whacky_Joe', fontSize: "16px" });
    this.add.text(300, 210, "weekly star chart:", { fontFamily: 'Whacky_Joe', fontSize: "24px" }).setOrigin(0.5, 0.5);
    //constellation test
    this.cameras.main.fadeIn(500);
    if(!this.gameData.musicInitialized){
      var music = this.game.sound.add("WINDY_BACKGROUND", {loop: true});
      music.play();
    }
    this.gameData.musicInitialized = true;
  }
  update(){

  }
  //helper functions for the buttons
  launchTome(button, groupName, index, pointer, event){
    button.scene.scene.start("TomeScene", button.scene.gameData);
  }
  launchShop(button, groupName, index, pointer, event){

    button.scene.scene.start("ShopScene", button.scene.gameData);
  }
  launchConst(button, groupName, index, pointer, event){
    var constNum = button.scene.constButtonDict[button.text];
    console.log(constNum);
    button.scene.gameData.startTomeConst = constNum;
    button.scene.scene.start("TomeScene", button.scene.gameData);
  }
  startGame(button, groupName, index, pointer, event){
    console.log(button.scene);
    button.scene.scene.start("GameScene", button.scene.gameData);
    button.scene.gameData.constellationsFoundLastGame = new Set();
  }
  launchSettings(button, groupName, index, pointer, event){

    button.scene.scene.start("SettingsScene", button.scene.gameData);
  }
  launchTutorial(button, groupName, index, pointer, event){

    button.scene.scene.start("TutorialScene", button.scene.gameData);
  }
  getWeek(){
    var d = new Date();


    return d.getFullYear() + d.getMonth() + Math.floor(d.getDate()/7);
  }
  generateDailyConstellations(){
    var seed = this.getWeek();

    var randNum = new Math.seedrandom(seed);
    var dailyConst = [];
    for(var i = 0; i<3; i++){

      //pick constellation
      var randIndex = Math.floor(randNum() * CONSTELLATIONS.length);
      var constellation = CONSTELLATIONS[randIndex];
      dailyConst.push(constellation);

      var newButton =  new TitleButton(this, constellation.name, 300, 280+(i*60), this.launchConst);
      console.log(this.gameData.constellationsFoundLastGame);
      if(this.gameData.constellationsFoundLastGame.has(constellation)){
        newButton.addPopUp("found");
      }
      this.constButtonDict[constellation.name] = randIndex;
      randNum = new Math.seedrandom(randNum.int32());
    }
    this.gameData.dailyConstellations = dailyConst;
    var randSeed1 = new Math.seedrandom(seed);
    console.log(randSeed1());
    var randSeed2 = new Math.seedrandom(randSeed1.int32());

  }
}
