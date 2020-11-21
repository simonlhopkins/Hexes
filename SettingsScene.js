const MAX_ROWS = 16;
const MAX_COLS = 16;
const MAX_COLORS = 8;


class SettingsScene extends Phaser.Scene{
  constructor(){
    super("SettingsScene");
    //initial values of all of the variables for game
    this.allButtons = {};
    console.log("settings");

  }

  init(data){

    this.gameData = data;
  }
  preload(){
    this.load.scenePlugin({
      key: 'rexuiplugin',
      url: "rexuiplugin.min.js",
      sceneKey: 'rexUI'
    });
  }

  create(){
    this.cameras.main.fadeIn(500);
    var initDataRef = this.gameData;
    //Setting up all UI elements here:
    var colorsSlider = new SizeSlider(this, "colors", 75, this.gameData.colors, MAX_COLORS, function(newValue, oldValue, slider, sliderRef){
      initDataRef.colors = sliderRef.getModValue(newValue);
    })
    var rowSlider = new SizeSlider(this, "rows", 125, this.gameData.rows, MAX_ROWS, function(newValue, oldValue, slider, sliderRef){
      initDataRef.rows = sliderRef.getModValue(newValue);
    })
    var colSlider = new SizeSlider(this, "columns", 175, this.gameData.cols, MAX_COLS, function(newValue, oldValue, slider, sliderRef){
      initDataRef.cols = sliderRef.getModValue(newValue);
    })


    this.add.text(10, 215, "game mode", { fontFamily: 'Whacky_Joe', fontSize: "24px" });

    var dotsModeButton = new TitleButton(this, "dots", 300, 240, this.changeToDotsMode);
    var customModeButton = new TitleButton(this, "custom", 450, 240, this.changeToCustomMode);

    this.add.text(10, 275, "easy loops", { fontFamily: 'Whacky_Joe', fontSize: "24px" });
    var easyLoopsButton = new TitleButton(this, "off", 290, 300, this.handleEasyLoops);
    this.add.text(10, 325, "mobile friendly", { fontFamily: 'Whacky_Joe', fontSize: "24px" });
    var zoomForMobile = new TitleButton(this, "off", 350, 350, this.handleMobileFriendly);

    this.add.text(5, 390, "the game was inteded to be played with 3 \ncolors on a 6x6. You CAN play with the\nsettings to make the game easier/harder.", { fontFamily: 'Whacky_Joe', fontSize: "16px" });



    var backToStartButton = new TitleButton(this, "back", 250, 520, this.backToStart);


    this.allButtons["dots"] = dotsModeButton;
    this.allButtons["custom"] = customModeButton;
    this.allButtons["mobileFriendly"] = zoomForMobile;
    this.allButtons["easyLoops"] = easyLoopsButton;

    if(this.gameData.gameMode == "DOTS"){
      this.allButtons["dots"].setColor(0x77dd77)

    }else{
      this.allButtons["custom"].setColor(0x77dd77)

    }
    if(this.gameData.easyLoops){
      easyLoopsButton.button.buttons[0].setText("on");
      this.allButtons["easyLoops"].setColor(0x77dd77)

    }else{

      this.allButtons["easyLoops"].setColor(0xFFFFFF)
      easyLoopsButton.button.buttons[0].setText("off");
    }

    if(this.gameData.mobileFriendly){
      this.allButtons["mobileFriendly"].setColor(0x77dd77)
      zoomForMobile.button.buttons[0].setText("on");

    }else{
      this.allButtons["mobileFriendly"].setColor(0xFFFFFF)
      zoomForMobile.button.buttons[0].setText("off");
    }





  }
  update(){


  }
  backToStart(button, groupName, index, pointer, event){
    button.scene.scene.start("TitleScene", button.scene.gameData);
  }
  resetButtons(){
    this.allButtons["dots"].setColor(0xFFFFFF);
    this.allButtons["custom"].setColor(0xFFFFFF);


  }
  handleEasyLoops(button, groupName, index, pointer, event){
    button.scene.gameData.easyLoops = !button.scene.gameData.easyLoops;

    if(button.scene.gameData.easyLoops){

      button.scene.allButtons["easyLoops"].setColor(0x77dd77);
      button.setText("on");
    }else{
      button.scene.allButtons["easyLoops"].setColor(0xFFFFFF);
      button.setText("off");
    }


  }
  handleMobileFriendly(button, groupName, index, pointer, event){
    button.scene.gameData.mobileFriendly = !button.scene.gameData.mobileFriendly;

    if(button.scene.gameData.mobileFriendly){
      button.scene.allButtons["mobileFriendly"].setColor(0x77dd77);

      button.setText("on");
    }else{
      button.scene.allButtons["mobileFriendly"].setColor(0xFFFFFF);

      button.setText("off");
    }


  }
  changeToDotsMode(button, groupName, index, pointer, event){
    if(button.scene.gameData.gameMode != "DOTS"){
      button.scene.resetButtons();
      button.scene.allButtons[button.text].setColor(0x77dd77);
      button.scene.gameData.gameMode = "DOTS";
    }
  }
  changeToCustomMode(button, groupName, index, pointer, event){
    if(button.scene.gameData.gameMode != "CUSTOM"){
      button.scene.resetButtons();
      button.scene.allButtons[button.text].setColor(0x77dd77);
      button.scene.gameData.gameMode = "CUSTOM";
    }
  }
}
