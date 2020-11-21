//This class handles everything on the title screen, and modifies the object "initData" to pass to the game scene.
//constants


class TutorialScene extends Phaser.Scene{
  constructor(){
    super("TutorialScene");
    //initial values of all of the variables for game

    //helper array for toggleing the game mode

  }

  init(data){
    this.tutNumber = 0;
    this.tutArray = [];



  }
  preload(){
    this.load.scenePlugin({
      key: 'rexuiplugin',
      url: "rexuiplugin.min.js",
      sceneKey: 'rexUI'
    });
    this.load.image('tut1', 'assets/tut1.png');
    this.load.image('tut2', 'assets/tut2.png');
    this.load.image('tut3', 'assets/tut3.png');
    this.load.image('tut4', 'assets/tut4.png');

  }

  create(){
    this.tutArray.push(this.add.image(300, 300, 'tut1'));
    this.tutArray.push(this.add.image(300, 300, 'tut2'));
    this.tutArray.push(this.add.image(300, 300, 'tut3'));
    this.tutArray.push(this.add.image(300, 300, 'tut4'));
    this.nextTutButton = new TitleButton(this, "next", 500, 560, this.loadNextTut);
    this.prevTutButton = new TitleButton(this, "prev", 70, 560, this.loadPrevTut);
    this.prevTutButton.visible = false;
    this.updateTutorial();
  }
  update(){

  }
  updateTutorial(){
    this.tutArray.forEach((item, i) => {
      if(i==this.tutNumber){
        item.visible = true;
      }else{
        item.visible = false;
      }
    });

    if(this.tutNumber == this.tutArray.length-1){
      this.nextTutButton.setText("begin");
    }else{
      this.nextTutButton.setText("next");
    }
    if(this.tutNumber == 0){
      this.prevTutButton.button.visible = false;
    }else{
      this.prevTutButton.button.visible = true;
    }
  }
  loadNextTut(button, groupName, index, pointer, event){
    button.scene.tutNumber++;
    if(button.scene.tutNumber == button.scene.tutArray.length){
      button.scene.scene.start("TitleScene");
    }
    button.scene.tutNumber= Math.min(button.scene.tutArray.length-1, button.scene.tutNumber);
    button.scene.updateTutorial();
  }
  loadPrevTut(button, groupName, index, pointer, event){
    button.scene.tutNumber--;
    button.scene.tutNumber= Math.max(button.scene.tutNumber, 0);
    button.scene.updateTutorial();
  }
}
