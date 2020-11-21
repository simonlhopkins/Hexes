

const STUDY_COLOR = {name: "STUDY_YELLOW", color: 0xf7f0c7}
const COLORS = [{name: "DARK_BLUE", color: 0x312E8C},
                {name: "LIGHT_BLUE", color: 0x82B0D9},
                {name: "YELLOW", color: 0xF2CA7E},
                {name: "ORANGE", color: 0xD98218},
                {name: "RED", color: 0xD95043},
                {name: "PURPLE", color: 0x150773},
                {name: "PINK", color: 0xF23568},
                {name: "GREEN", color: 0x6DA644}]
//for my custom game mode :^)
const CLANS = [
          {name: "SEA", color: 0x82B0D9},
          {name: "SKY", color: 0xF2CA7E},

          {name: "PRARIE", color: 0x6DA644}]

//class to hold all dara pertaining to the hexes
class Hex{
  constructor(board, x, y, offset, index, scale, game) {
    this.x = x;
    this.y = y;
    this.offset = offset;
    this.board = board;
    this.index = index;
    this.game = game
    this.isMoving = false;
    this.interpolationAmount = 0;
    this.neighborArray = [[]];
    this.animData = {startPos: undefined, endpos: undefined, amount: 0}
    this.numColorsToSpawn =this.board.numColors;
    this.moveData=[];
    this.currentMoveStep = 0;
    if(this.game.gameData.gameMode == "DOTS"){
      this.identifier = this.chooseRandomColor();
    }else{
      this.identifier = this.chooseRandomClan();
    }
    this.color = new Phaser.Display.Color.ValueToColor(this.identifier.color);
    this.darkTint = new Phaser.Display.Color.ValueToColor(this.identifier.color).darken(50).desaturate(10);
    this.lightTint = new Phaser.Display.Color.ValueToColor(this.identifier.color).lighten(30).desaturate(10);


    if(!(this.identifier.name in this.board.identifierDict)){
      this.board.identifierDict[this.identifier.name] = new Set();
    }
    this.board.identifierDict[this.identifier.name].add(this);
    this.pathNumToNeighbor = 0;
  }
  setPathNumToNeighbor(newPath){
    this.pathNumToNeighbor = newPath;
  }
  chooseRandomColor(){
    if(this.board.isTome){
      return STUDY_COLOR;
    }
    var maxNum = Math.min(this.numColorsToSpawn, COLORS.length);
    return COLORS[Math.floor(Math.random()*maxNum)];
  }
  chooseRandomClan(){
    var maxNum = Math.min(this.numColorsToSpawn, CLANS.length);
    return CLANS[[Math.floor(Math.random()*maxNum)]];
  }
  draw(){
    this.gameObject = this.game.add.sprite(this.x + this.offset, this.y, "ph_hex");
    this.gameObject.setOrigin(0,0);
    this.gameObject.setDepth(0);
    //this.gameObject.setTintFill(this.assocColor.hex);
    if(this.game.gameData.gameMode == "DOTS"){
      this.gameObject.anims.play("DOTS_IDLE");
    }else{
      console.log(this.identifier.name+"_IDLE");
      console.log(this.gameObject.anims);
      this.gameObject.anims.play(this.identifier.name+"_IDLE");
    }
    this.assocText = this.game.add.text("", { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });

    var hexRef = this;
    this.gameObject.setInteractive().on('pointerdown', function(pointer, localX, localY, event){
        if(!hexRef.board.gameOverTriggered){
          hexRef.board.initalizePath(hexRef);

        }

    });
    this.gameObject.on('pointerover', function(pointer, localX, localY, event){
        //console.log(hexRef.board.validHexes);
        if(hexRef.board.currentPath){
          hexRef.board.currentPath.resolveHexHover(hexRef);

        }
    });

    //I need to make this a global mouse up thing
    this.gameObject.on('pointerup', function(pointer, localX, localY, event){


    });
    this.gameObject.setTint(this.identifier.color);
    this.gameObject.setScale(this.board.hexScale - this.board.padding);
    this.assocText.setScale(this.board.hexScale * 2);
  }
  //animation helpers
  addHexToPathAnim(){

    if(this.game.gameData.gameMode == "DOTS"){
      this.gameObject.anims.play("DOTS_ACTIVATE", false);
      this.gameObject.anims.chain("DOTS_ACTIVATED_IDLE", true);
    }else{
      this.gameObject.anims.play("OUTPOST_SPAWN", false);
      this.gameObject.anims.chain("OUTPOST_IDLE", true);
    }

  }
  removeHexFromPathAnim(){
    if(this.game.gameData.gameMode == "DOTS"){
      this.gameObject.anims.play("DOTS_IDLE");
    }else{
      this.gameObject.anims.play(this.identifier.name+"_IDLE");
    }

  }
  isInIslandAnim(){
    if(this.game.gameData.gameMode == "DOTS"){
      this.gameObject.anims.play("DOTS_ACTIVATE", false);
      this.gameObject.anims.chain("DOTS_ACTIVATED_IDLE", true);
    }else{
      this.gameObject.anims.play("VILLAGE_SPAWN", false);
      this.gameObject.anims.chain("VILLAGE_IDLE", true);
    }


  }

  //class for creating the animation for moving the hexes down
  moveDown(amount){
    var initRow = this.index.row;
    this.index.row+=amount;
    this.gameObject.setTint(this.identifier.color);
    this.moveData.push({
      from: {x: this.gameObject.x, y:this.gameObject.y},
      to: {x: this.x + ((initRow + 1)%2 * this.board.hexWidth/2), y: this.y + this.board.vertOffset}
    });
    //generates all of the positions that it will go on it's way movinf down
    //I can then interpolate between each of these positions
    for(var i = 1; i< amount; i++){
      this.moveData.push({
        from: {x: this.moveData[i-1].to.x, y: this.moveData[i-1].to.y},
        to: {x: this.x + ((initRow + i+1 )%2 * this.board.hexWidth/2), y: this.y + (i+1) * this.board.vertOffset}
      });
    }
    this.offset =(this.index.row%2 * this.board.hexWidth/2);

    this.assocText.setText("");
    this.y += amount * this.board.vertOffset
    this.addToBoardAnim();
  }

  //gets the 6 neighbors of the hex
  //adapted from https://www.redblobgames.com/grids/hexagons/
  getNeighbors(){

    var offSetDir = [
        [[-1,-1], [-1, 0], [0,1], [1, 0], [1,-1], [0, -1]],
        [[-1, 0], [-1, 1], [0,1], [1,1], [1, 0], [0, -1]]
    ]
    var parity = this.index.row % 2;
    var neighbors = []
    for(var i = 0; i<6; i++){
      var assocNeighbor = {row: this.index.row + offSetDir[parity][i][0], col: this.index.col + offSetDir[parity][i][1]}
      if(assocNeighbor.row>=0 && assocNeighbor.row < this.board.numRows){
        if(assocNeighbor.col>=0 && assocNeighbor.col< this.board.numColumns){
          if(this.board.getHex(assocNeighbor.row, assocNeighbor.col)!=undefined && this.board.getHex(assocNeighbor.row, assocNeighbor.col).identifier.name== this.identifier.name){
            neighbors.push(this.board.getHex(assocNeighbor.row, assocNeighbor.col));

          }
        }
      }
    }
    return neighbors;
  }
  getAllNeighbors(){
    var offSetDir = [
        [[-1,-1], [-1, 0], [0,1], [1, 0], [1,-1], [0, -1]],
        [[-1, 0], [-1, 1], [0,1], [1,1], [1, 0], [0, -1]]
    ]
    var parity = this.index.row % 2;
    var neighbors = []
    for(var i = 0; i<6; i++){
      var assocNeighbor = {row: this.index.row + offSetDir[parity][i][0], col: this.index.col + offSetDir[parity][i][1]}
      if(assocNeighbor.row>=0 && assocNeighbor.row < this.board.numRows){
        if(assocNeighbor.col>=0 && assocNeighbor.col< this.board.numColumns){
          if(this.board.getHex(assocNeighbor.row, assocNeighbor.col)!=undefined){
            neighbors.push(this.board.getHex(assocNeighbor.row, assocNeighbor.col));

          }
        }
      }
    }
    return neighbors;
  }
  addToBoardAnim(){
    this.board.movingHexs.push(this);
  }
  addToBoardDropAnim(){
    this.board.droppingHexes.push(this);
  }
  updateAnim(){
    this.gameObject.visible = true;
    if(this.moveData.length == 0){
      var index = this.board.movingHexs.indexOf(this);
      this.board.movingHexs.splice(index, 1);
      return;
    }
    this.gameObject.x = Phaser.Math.Interpolation.Linear([this.moveData[this.currentMoveStep].from.x, this.moveData[this.currentMoveStep].to.x], this.interpolationAmount);
    this.gameObject.y = Phaser.Math.Interpolation.Linear([this.moveData[this.currentMoveStep].from.y, this.moveData[this.currentMoveStep].to.y], this.interpolationAmount);


    this.interpolationAmount+=0.1;
    if(this.interpolationAmount>1){
      this.interpolationAmount = 0;
      this.currentMoveStep+=1;
      if(this.currentMoveStep>=this.moveData.length){
        var index = this.board.movingHexs.indexOf(this);
        this.board.movingHexs.splice(index, 1);
        this.moveData = [];
        this.currentMoveStep = 0;
      }
    }
  }
  getOffSetPos(){
    return {x: this.x + this.offset + this.board.hexWidth/2, y: this.y + this.board.hexHeight/2};
  }
  spawnAnim(){
    this.gameObject.visible = false;
    this.moveData.push({
      from: {x: this.x + this.offset, y:this.y -100},
      to: {x: this.x + this.offset, y: this.y}
    });
    this.addToBoardDropAnim();
  }
  removeFromDict(){
    this.board.identifierDict[this.identifier.name].delete(this);
  }

  //this is the recursive function to check if a hex is completely surrounded by a path
  //hexes checked is an array of hexes we know we've already checked
  checkIfNeighborsAreWithingBoundry(boundry, hexesChecked, innerSet){
    //if we are on an edge
    //return false if at any point during the recursion we find that we've reached an edge, this means it is impossible for it to be full now
    //console.log("recurse on: " + this.index.col + ", "+ this.index.row)
    if(this.index.row == this.board.numRows-1 || this.index.row == 0){
      return false;
    }
    else if(this.index.col == this.board.numColumns-1 || this.index.col == 0){
      return false;
    }
    //ok, we are not an edge, now we can recurse to see if our neighbors are ok
    //
    var neighbors = this.getAllNeighbors();
    var newHexChecked = [];
    for(var i = 0; i< hexesChecked.length; i++){
      newHexChecked.push(hexesChecked[i]);
    }
    var foundDeadEnd = false;
    for(var i = 0; i<neighbors.length; i++){

      //if neighbors haven't been checkked or aren't in the already checked list
      if(!hexesChecked.includes(neighbors[i]) && !boundry.includes(neighbors[i])){
        newHexChecked.push(neighbors[i]);
         //neighbors[i].checkIfNeighborsAreWithingBoundry(boundry, newHexChecked, testSet);

        if(!neighbors[i].checkIfNeighborsAreWithingBoundry(boundry, newHexChecked, innerSet)){
          foundDeadEnd = true;
          return false;
        }
      }
    }
    if(!foundDeadEnd){
      innerSet.add(this);

      return true;
    }else{
      return false;
    }




  }
  setColorToDarker(){

    this.gameObject.setTint(this.darkTint.color);
   }
  setColorToLighter(){

    this.gameObject.setTint(this.lightTint.color);
   }
  setColorToDefault(){
    this.gameObject.setTint(this.color.color);
  }
}
