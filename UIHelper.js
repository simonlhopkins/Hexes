class UIHelper{

}

//Class for the size sliders so I could have a uniform look on them, and I wouldn't have to repeat all the formatting for each one
class SizeSlider{
  constructor(scene, label, yPos, initValue, maxValue, valueChange){
    this.yPos = yPos;
    this.scene = scene;
    this.xPos = 350;
    this.width = 350;
    this.height = 40;
    this.backgroundColor = 0xFFFFFF
    this.thumbColor = 0x000000
    this.label = label;
    this.maxValue = maxValue;
    this.labelText = scene.add.text(this.xPos - this.width/2 -150, this.yPos - this.height/2, this.label, { fontFamily: 'Whacky_Joe', fontSize: "24px" });
    this.amountText = scene.add.text(this.xPos + this.width/2 + 10, this.yPos - this.height/2, initValue, { fontFamily: 'Whacky_Joe', fontSize: "24px" });
    var sliderRef = this;
    this.slider = this.scene.rexUI.add.slider({
            x: this.xPos,
            y: this.yPos,
            width: this.width,
            height: this.height,
            orientation: 'x',

            track: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, this.backgroundColor),
            thumb: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 15, this.thumbColor),
            value: initValue/maxValue,
            valuechangeCallback: function(newValue, oldValue, slider){

              sliderRef.amountText.setText(sliderRef.getModValue(newValue));
              valueChange(newValue, oldValue, slider, sliderRef);
            },
            space: {
                top: 4,
                bottom: 4
            },
            input: 'drag', // 'drag'|'click'
        }).layout();

  }
  getModValue(value){
    return Math.max(1, Math.ceil(value * this.maxValue));
  }
}

//Helper class to save time on formatting buttons
class TitleButton{
  constructor(scene, text, xPos, yPos, clickCallBack){
    this.scene = scene;
    this.text = text;
    this.xPos = xPos;
    this.yPos = yPos;
    this.baseColor =  0xFFFFFF;
    this.toggleColor = 0xFF0000;
    this.toggle = false;
    var titleButtonRef = this;

    this.button = scene.rexUI.add.buttons({
        x: this.xPos, y: this.yPos,
        width: 0,
        orientation: 'x',

        buttons: [
            this.createButton(scene, text), // Add button in constructor
        ],
        click: {
          mode: "pointerup",
          clickInterval: 100
        },
        align: 'center'
    }).layout().setDepth(100);

    this.button
    .on('button.click', function(button, index, pointer, event){
      titleButtonRef.removePopUp();
      clickCallBack(button, index, pointer, event);
    })
    .on('button.over', function(button, index, pointer, event) {
        button.setScale(1.1);
        button.backgroundChildren[0].fillColor = 0xff6961;
    })
    .on('button.out', function(button, index, pointer, event) {
        button.setScale(1);
        if(this.toggle){
          button.backgroundChildren[0].fillColor = titleButtonRef.toggleColor;
        }else{
          button.backgroundChildren[0].fillColor = titleButtonRef.baseColor;
        }

    });
    this.popUp = undefined;
    //this.addPopUp("hello");
  }
  addPopUp(text){
    console.log(this.button);
    this.popUp = this.scene.rexUI.add.label({
      x: this.button.x + this.button.width/2,
      y: this.button.y - this.button.height/2,
      background:  this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0xAEC6CF),

      text: this.scene.add.text(0, 0, text, { fontFamily: 'Whacky_Joe', fontSize: "16px" , color: 0xFFFFFF}),
      space: {
          left: 10,
          right: 10,
          top: 0,
          bottom: 10
      },
    }).layout().setDepth(200).setAngle(20);
  }
  removePopUp(){
    if(this.popUp!=undefined){
      this.popUp.destroy();
    }
  }
  setColor(newColor){
    this.button.buttons[0].getElement('background').fillColor = newColor;
    this.baseColor = newColor;
  }
  switchToggle(){
    this.toggle = !this.toggle;
    if(this.toggle){
      this.setColor(this.toggleColor);
    }
  }
  setText(newText){
    this.button.buttons[0].setText(newText);
    this.button.layout();
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
