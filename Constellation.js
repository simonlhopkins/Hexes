


class Constellation{
  constructor(patternArray, name, story){
    this.patternArray = patternArray;
    this.name = name;
    this.story = story;
    this.height = 0;
    this.width = 0;
    this.maxHeight = 0;
    this.maxWidth = 0;
    this.minWidth = 0;
    var guide = this.patternArray;
    this.startColumn = 0;
    this.distortionSymbols = ["Þ", "¿", "∎", "_", "#"];
    this.distortedName = this.distortConstellationName();
    if(this.patternArray[0].length!=undefined){
      guide = this.patternArray[0];
    }
    guide.forEach((item, i) => {
      switch(item){
        case 0:
          this.width++;
          break;
        case 1:

          if(this.height%2 == 1){
            this.width++;
          }
          this.height--;
          break;
        case 2:
          if(this.height%2 == 0){
            this.width--;
          }
          this.height--;
          break;
        case 3:
          this.width--;
          break;
        case 4:
          if(this.height%2 == 0){
            this.width--;
          }
          this.height++;
          break;
        case 5:
          if(this.height%2 == 1){
            this.width++;
          }
          this.height++;
          break;
      }

      if(this.height > this.maxHeight){

        this.maxHeight = this.height;
      }
      if(this.width > this.maxWidth){
        this.maxWidth = this.width;
      }
      if(this.width < this.minWidth){
        this.minWidth = this.width;
      }
    });
    if(this.name == "the self"){
      console.log("MIN WIDTH");
      console.log(this.minWidth);

    }
    this.startColumn = Math.abs(this.minWidth);
    this.height = this.maxHeight +1;
    this.width = Math.abs(this.minWidth) + this.maxWidth+1;
  }

  getPatternArray(){
    var guide = this.patternArray;
    if(this.patternArray[0].length!=undefined){
      guide = this.patternArray[0];
    }
    return guide;
  }
  getScoreMod(){
    return this.patternArray.length;
  }

  distortConstellationName(){
    var word = this.name.substring(0, 5);
    var startIndex = 0;
    var precursorWord = "the "
    var indexOfThe = this.name.indexOf(precursorWord);
    if(indexOfThe!==-1){
      startIndex = indexOfThe + precursorWord.length;
    }

    for(var i = startIndex; i < this.name.length-1; i++){
      if(this.name.charAt(i) == " "){

        word+=" "
      }else{
        word += this.distortionSymbols[Math.floor(this.distortionSymbols.length * Math.random())];
        //word+= "*";
      }
    }
    return word;
  }

}

CONSTELLATIONS = [

  new Constellation([0,5,4,3,2,1], "the self", "look, it's you"),
  new Constellation([5,5,4,3,2,1,1], "the shard", "just a piece"),
  new Constellation([0,0,0,4,4,4,2,2,2], "the triangle", "upside down"),
  new Constellation([0, 5, 1, 0, 4, 5, 4, 3, 3, 2, 1, 2], "the rabbit", "gotta be quick"),
  new Constellation([0, 0, 0, 4, 5, 3, 3, 3, 1, 2], "the anvil", "always creating"),
  new Constellation([0, 5, 3, 3, 1], "the trapazoid", "half baked"),
  new Constellation([5, 0, 1, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1], "the feline", "meow"),
  new Constellation([0, 5, 1, 0, 0, 5, 4, 4, 3, 3, 2, 3, 1, 2], "the whale", "big fish"),
  new Constellation([0, 0, 4, 5, 4, 3, 2, 1, 2], "the vase", "what is inside"),
  new Constellation([0, 5, 1, 0, 4, 4, 3, 2, 2], "the vendetta", "think before acting"),
  new Constellation([0, 5, 3, 5, 4, 3, 3, 1, 2, 0, 1], "the penguin", "brrrr"),
  new Constellation([0, 5, 3, 5, 4, 3, 2, 2, 0, 1], "the chicken", "cluck cluck"),
  new Constellation([0, 0, 5, 4, 4, 3, 2, 2, 1], "the diamond", "shiny"),
  new Constellation([5, 0, 1, 5, 5, 4, 3, 4, 2, 3, 2, 1, 1], "the fox", "quick dog!"),
  new Constellation([5, 1, 5, 1, 5, 5, 3, 3, 3, 3, 1, 1], "the mountain", "big hill!"),
  new Constellation([5, 1, 5, 5, 3, 4, 2, 3, 4, 2, 2, 0, 0, 1], "the mouse", "smaller than you think"),
  new Constellation([0, 0, 0, 0, 0, 4, 5, 4, 3, 3, 3, 3, 2, 1, 2], "the cauldron", "cookin up something nice"),
  new Constellation([0, 0, 0, 0, 4, 5, 4, 3, 3, 3, 2, 1, 2], "the bowl", "soupy"),
  new Constellation([5, 0, 4, 5, 3, 2, 4, 3, 1, 2, 0, 1], "the star", "shiny!"),
  new Constellation([0, 5, 4, 0, 4, 3, 3, 2, 0, 2, 1], "the alter", "praise the hex"),
  new Constellation([0, 5, 5, 4, 4, 3, 1, 1, 2, 2], "the bow", "sharpshooter"),
  new Constellation([5, 0, 4, 3, 3, 1, 1], "the clog", "what are those!"),
  new Constellation([0, 5, 4, 5, 3, 3, 1, 2, 1], "the globe", "well traveled"),
  new Constellation([[5, 5, 3, 1], [5, 3, 1, 2]], "the broom", "sweep it up!"),
  new Constellation([5, 0, 1, 5, 0, 4, 3, 4, 2, 3, 2, 1], "the shark", "CHOMP!"),
  new Constellation([[5, 4, 5, 4, 5, 3, 2, 1, 2, 1, 1], [5, 5, 4, 5, 4, 3, 1, 2, 1, 2, 1]], "the monolith", "tall and handsome"),
  new Constellation([0, 0, 4, 5, 3, 3, 1, 2], "the table", "sturdy :)"),
  new Constellation([5, 4, 4, 3, 1, 2, 0, 1], "the sinking ship", "what are you sinking about"),
  new Constellation([5, 5, 3, 3, 1, 1], "the balance", "good"),
  new Constellation([0, 0, 4, 4, 2, 2], "the imbalance", "bad"),
  new Constellation([[5, 5, 3, 4, 2, 2, 0, 1], [5, 0, 4, 4, 2, 3, 1, 1]], "the bow tie", "looking sharp"),
  new Constellation([0, 0, 0, 4, 5, 4, 4, 3, 2, 2, 1, 2], "the urn", "hot body :O"),
  new Constellation([5, 0, 4, 4, 3, 3, 3, 2, 1, 0, 0, 1], "the pig", "look its a cop"),
  new Constellation([5, 0, 1, 5, 4, 5, 4, 3, 3, 2, 1, 2, 1], "the beast", "scary!"),
  new Constellation([0, 0, 5, 4, 3, 3, 2, 1], "the squashed self", "CRONCH"),
  new Constellation([[0, 0, 0, 0, 4, 3, 2], [0, 0, 4, 3, 2, 3, 3]], "the big dipper", "I know this one!"),
  new Constellation([5, 0, 4, 3, 3, 2, 0, 1], "the ship", "afloat!"),
  new Constellation( [0, 5, 4, 5, 4, 0, 0, 2, 1, 2, 1, 0, 5, 4, 5, 4, 5, 3, 3, 3, 3, 3, 1, 2, 1, 2, 1], "the pillars", "twins"),
  new Constellation([0, 0, 5, 5, 4, 3, 1, 2, 3, 4, 5, 3, 2, 1, 1], "the cave", "plato loves this shit"),
  new Constellation([0, 0, 5, 4, 4, 3, 3, 2, 1, 0, 5, 3, 1], "the fist", "bump"),
  new Constellation([0, 0, 0, 0, 4, 4, 2, 3, 4, 2, 2], "the fangs", "hiss"),

]

CONSTELLATIONS.sort(function(a, b){
  if(a.getPatternArray().length<b.getPatternArray().length){
    return -1;
  }else if(a.getPatternArray().length>b.getPatternArray().length){
    return 1;
  }else{
    return a.name < b.name;
  }
  return a - b
});

class ConstellationNode{
  constructor(value, parent, assocConstellation){
    this.value = value,
    this.children = [undefined, undefined, undefined,undefined, undefined,undefined];
    this.parent = parent;
    this.assocConstellation = assocConstellation;
  }
  traverseToChild(childNum){
    if(this.children[childNum] == 0){
      return;
    }
    traverseToChild(this.children.childNum);
  }
  setConstellation(con){
      this.assocConstellation = con;
  }

}
//example [1, 2, 3, 4, 5, 6]
class ConstellationManager{
  constructor(boardRef){
    this.rootNode = new ConstellationNode(boardRef, undefined, undefined, undefined)
    this.boardRef = boardRef;
    var manRef = this;
    CONSTELLATIONS.forEach((item, i) => {
      if(item.patternArray[0].length!=undefined){
        console.log(item.name)
        item.patternArray.forEach((pattern, i) => {
          manRef.addConstellation(item, pattern);
        });

      }else{
        manRef.addConstellation(item, item.patternArray);
      }
    });

  }
  addConstellationHelper(node, newConstellation, constArray, starNum){
    //check if that child has been initialized yet
    if(starNum == constArray.length+1){
      node.setConstellation(newConstellation);
      return;
    }
    if(node.children[constArray[starNum]] == undefined){
      var value = constArray[starNum];
      node.children[constArray[starNum]] = new ConstellationNode(value, node, undefined);

    }
    this.addConstellationHelper(node.children[constArray[starNum]], newConstellation, constArray, starNum+1);
  }
  addConstellation(newConstellation, constArray){
    this.addConstellationHelper(this.rootNode, newConstellation, constArray, 0);
  }
  getConstellation(constArray){
    return this.getConstellationHelper(this.rootNode, constArray, 0);
  }

  getConstellationHelper(node, constArray, starNum){

    //console.log(constToFind.patternArray[starNum]);
    //console.log(node.children[constToFind.patternArray[starNum]]);
    if(starNum == constArray.length+1){

      if(node.assocConstellation == undefined){
        return false;
      }else{
        this.onFoundChild(node.assocConstellation);
        return node;
      }
    }
    if(node.children[constArray[starNum]] == undefined){
      console.log("no child here");
      return false;
    }

    return this.getConstellationHelper(node.children[constArray[starNum]], constArray, starNum+1);
  }
  onFoundChild(constellation){
    this.boardRef.onValidConstellation(constellation);


  }
}
