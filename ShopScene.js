class ShopScene extends Phaser.Scene{
  constructor(){
    super("ShopScene");
    //initial values of all of the variables for game

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

    this.load.image('tavernBackground', 'assets/tavernBackground.png');
    this.load.image('profRaddish', 'assets/professorRaddish.png');
    this.cameras.main.fadeIn(500);
  }

  create(){
    console.log("SHOP");

    this.add.image(0,0,"tavernBackground").setOrigin(0);
    var backToMainScreen = new TitleButton(this, "back", 60, 560, this.loadStartScreen);
    var menuButton = new TitleButton(this, "menu", 200, 200, this.handleMenu);
    var brianButton = new TitleButton(this, "brian", 500, 400, this.handleBrian);
    var raddishButton = new TitleButton(this, "no one is here :/", 200, 420, this.handleProfRaddish);
    if(this.gameData.solvedAllDaily){
      raddishButton.setText("prof raddish")
      this.add.image(30,250,"profRaddish").setOrigin(0);
    }
    this.menu =  new MenuBox(this);
    this.difficultyMenu = new DifficultyMenu(this);
    this.menu.setVisible(false);
    this.difficultyMenu.setVisible(false);





  }
  update(){


  }

  loadStartScreen(button, groupName, index, pointer, event){
    button.scene.scene.start("TitleScene", button.scene.gameData);
  }
  handleMenu(button, groupName, index, pointer, event){
    button.scene.menu.setVisible(true);
    button.scene.gameData.numHints++;
  }
  handleBrian(button, groupName, index, pointer, event){
    button.scene.difficultyMenu.setVisible(true);
  }
  handleProfRaddish(button, groupName, index, pointer, event){
    if(button.scene.gameData.solvedAllDaily){
      window.open("https://simonlhopkins.github.io/weeklyHexWizard");
      console.log("link here");
    }else{

    }
  }
}
class Menu{
  constructor(scene){
    this.scene = scene;
    console.log(scene);
    this.background = scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x000000);
    this.buttonDict = {};

  }
  renderButtons(buttons){
    console.log(buttons);
    var menuRef = this;
    this.menuGrid = this.scene.rexUI.add.gridButtons({
            x: 300, y: 300,
            width: 300, height: 400,

            background: this.background,

            buttons: buttons,
            space: {
                left: 10, right: 10, top: 20, bottom: 20,
                row: 20, column: 10
            }
        }).layout().on('button.click', function (button, index, pointer, event) {
          if(menuRef.buttonDict[button.text]!= undefined){
            menuRef.buttonDict[button.text]();
          }
        }).setDepth(100);

  }
  createButton(scene, text, callBack) {
    this.buttonDict[text] = callBack;
    return scene.rexUI.add.label({
        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10).setFillStyle(0xFFFFFF),
        text: scene.add.text(0, 0, text, {
          fontFamily: 'Whacky_Joe',
            fontSize: 24,
        }).setColor(0xFFFFFF),
        align: 'center'
    }).setDepth(100);
  }

  setVisible(isVisible){
    this.menuGrid.visible = isVisible;
  }
}


class DifficultyMenu extends Menu{
  constructor(scene){
    super(scene);
    var button = new TitleButton(scene, "brian doesn't", 0,0, function(){}).button.buttons[0];

    var button2 = new TitleButton(scene, "do anything", 0,0, function(){}).button.buttons[0];
    var button3 = new TitleButton(scene, "YET!", 0,0, function(){}).button.buttons[0];
    var menuRef = this;
    var button4 =new TitleButton(scene, "exit", 0,0, function(){
      menuRef.setVisible(false);
    }).button.buttons[0];
    var buttons = [[button], [button2], [button3], [button4]];
    this.renderButtons(buttons);
  }
}
class MenuBox extends Menu{
  constructor(scene){
    super(scene);
    this.hintButton = new TitleButton(scene, "buy hint", 0,0, function(){

      button.scene.gameData.numHints++
    });
    var button = this.hintButton.button.buttons[0];

    // var button2 = this.createButton(this.scene, "order drink", function(){
    //   console.log('order drink');
    // });
    // var button3 = this.createButton(this.scene, "order food", function(){
    //   console.log('order food');
    // });
    var menuRef = this;
    var button4 =new TitleButton(scene, "exit", 0,0, function(){
      menuRef.setVisible(false);
    }).button.buttons[0];

    var buttons = [[button], [button4]];
    this.renderButtons(buttons);
  }
}
