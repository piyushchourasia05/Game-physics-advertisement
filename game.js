//Made by Piyush Chourasia 20BCG10054

let game
 

let gameOptions = {
 
    
    gameWidth: 640,
 
    gameHeight: 960,

    tailSegments: 300,
 
    segmentLength: 2,
 
    levels: 3,
 
    
    currentLevel: 1
}
 

let gameLevels = [
    {
        startSpot: {
            x: 320,
            y: 120
        },
        endSpot: {
            x: 320,
            y: 840
        }
    },
    {
        startSpot: {
            x: 80,
            y: 80
        },
        endSpot: {
            x: 280,
            y: 80
        }
    },
    {
        startSpot: {
            x: 80,
            y: 830
        },
        endSpot: {
            x: 80,
            y: 130
        }
    }
]
 

window.onload = function() {
    let gameConfig = {
        width: gameOptions.gameWidth,
        height: gameOptions.gameHeight,
        scene: playGame
    }
    game = new Phaser.Game(gameConfig);
    window.focus()
    resize();
    window.addEventListener("resize", resize, false);
}
 
class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
    }
 
    preload(){
 
     
        for(let i = 1; i <= gameLevels.length; i ++){
            this.load.image("level" + i, "assets/sprites/level" + i + ".png");
        }
 
    
        this.load.spritesheet("icons", "assets/sprites/icons.png", {
            frameWidth: 80,
            frameHeight: 80
        });
    }
 
    create(){
 
        //
        // GRADIENT BACKGROUND
        //
 
        
        let background = this.make.graphics({
            x: 0,
            y: 0,
            add: false
        });
 
        let gradientSteps = game.config.height / 2;
 
       
        let rectangleHeight = Math.floor(game.config.height / gradientSteps);
 
      
        for(let i = 0; i <= gradientSteps; i ++){
            let color = Phaser.Display.Color.Interpolate.ColorWithColor(Phaser.Display.Color.ValueToColor("0x0e2be3"), Phaser.Display.Color.ValueToColor("0xa6e1ff"), gradientSteps, i);
 
            
            background.fillStyle(Phaser.Display.Color.RGBToString(Math.round(color.r), Math.round(color.g), Math.round(color.b), 0, "0x"));
 t
            background.fillRect(0, rectangleHeight * i, game.config.width, rectangleHeight);
        }
 
        background.generateTexture("gradient", game.config.width, game.config.height);
 
        background.destroy();
 
        this.add.sprite(game.config.width / 2, game.config.height / 2, "gradient");
 
        //
        // LEVEL MAZE
        //
 
        this.add.sprite(game.config.width / 2, game.config.height / 2, "level" + gameOptions.currentLevel);
 
        //
        // GAME ICONS
        //
 
        let levelObject = gameLevels[gameOptions.currentLevel - 1];
 
        this.startSpot = this.add.sprite(levelObject.startSpot.x, levelObject.startSpot.y, "icons", 0);
 
        this.endSpot = this.add.sprite(levelObject.endSpot.x, levelObject.endSpot.y, "icons", 1);
 
        //
        // INPUT MANAGEMENT
        //
 
        this.firstInput = true;
 
        this.canDrag = false;
 
        this.input.on("pointerdown", this.startMoving, this);
        this.input.on("pointermove", this.dragString, this);
        this.input.on("pointerup", this.stopMoving, this);
 
        //
        // GAME STUFF
        //
 
        this.canvas = this.add.graphics(0, 0);
 
        this.segments = [];
 
        this.gameOver = false;
 
        this.consumeString = false;
 
    }
 
    startMoving(e){
 
        if(!this.gameOver){
 
            this.canDrag = true;
 
            if(this.firstInput){
 
                this.firstInput = false;
 
                this.startSpot.visible = false;
 
                for(let i = 0; i < gameOptions.tailSegments; i++){
 
                    let radians = 12 * Math.PI * i / gameOptions.tailSegments + Math.PI / 4;
 
                    this.segments[i] = new Phaser.Math.Vector2(this.startSpot.x + 10 * Math.cos(radians), this.startSpot.y + 10 * Math.sin(radians));
                }
 
                this.moveString(0, 0);
            }
 
            //game.input.addMoveCallback(this.dragString, this);
 
            //game.input.onUp.add(this.endMove, this);
            this.startPosition = e.position;
        }
    }
 
    moveString(x, y){
 
        let head = new Phaser.Math.Vector2(this.segments[0].x + x, this.segments[0].y + y);
 
        this.segments[0] = new Phaser.Math.Vector2(head.x, head.y);
 
        this.gameOver = this.renderString();
 
        if(this.segments[0].distance(new Phaser.Math.Vector2(this.endSpot.x, this.endSpot.y)) < this.endSpot.width / 4 || this.gameOver){
 
            this.canDrag = false;
 
            if(!this.gameOver){
                this.consumeString = true;
            }
 
            this.time.addEvent({
                delay: 2000,
                callbackScope: this,
                callback: function(){
 
                    if(!this.gameOver){
                        gameOptions.currentLevel = (gameOptions.currentLevel % gameLevels.length) + 1;
                    }
                    this.scene.start("PlayGame");
                }
            });
        }
    }
 
    dragString(e){
 
    
        if(this.canDrag){
 
            this.moveString(e.position.x - this.startPosition.x, e.position.y - this.startPosition.y);
 
        
            this.startPosition = new Phaser.Math.Vector2(e.position.x, e.position.y);
        }
    }
 
   
    renderString(){
 
        let collided = false;
 
        this.canvas.clear();
 
        if(this.segments.length > 0){
 
 
            this.canvas.lineStyle(4, 0x000000, 1);
 
            this.canvas.moveTo(this.segments[0].x, this.segments[0].y);
 

            for(let i = 1; i < this.segments.length - 1; i++){
 
                let nodeAngle = Math.atan2(this.segments[i].y - this.segments[i - 1].y, this.segments[i].x - this.segments[i - 1].x);
 
        
                this.segments[i] = new Phaser.Math.Vector2(this.segments[i - 1].x + gameOptions.segmentLength * Math.cos(nodeAngle), this.segments[i - 1].y + gameOptions.segmentLength * Math.sin(nodeAngle));
 
                let alpha = this.textures.getPixelAlpha(Math.round(this.segments[i].x), Math.round(this.segments[i].y), "level" + gameOptions.currentLevel);
 
                if(alpha != 0){
 
                    this.canvas.lineStyle(4, 0xff0000, 1);
 
                    collided = true;
 
                }
 
                this.canvas.lineTo(this.segments[i].x, this.segments[i].y);
                this.canvas.moveTo(this.segments[i].x, this.segments[i].y);
 
            }
 
            this.canvas.strokePath();
        }
 
        return collided;
    }
 
    update(){
 
  
        if(this.consumeString){
 
          
            if(this.segments.length >= 5){
 

                this.segments.length = this.segments.length - 5;
            }
            else{
                this.segments.length = 0;
            }
 
            this.renderString();
        }
    }
 
    stopMoving(e){
        this.canDrag = false;
    }
}
function resize() {
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}
