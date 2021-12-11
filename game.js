
// the game itself
let game
 
// all game options are defined in this object
let gameOptions = {
 
    // game width
    gameWidth: 640,
 
    // game height
    gameHeight: 960,
 
    // number of segments which build the tail
    tailSegments: 300,
 
    // lenght of each segment
    segmentLength: 2,
 
    // number of levels. Useful to preload each level PNGs
    levels: 3,
 
    // current level
    currentLevel: 1
}
 
// levels information are stored here
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
 
// when the window loads
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
 
        // preloading all level images, PNG images with transparency
        for(let i = 1; i <= gameLevels.length; i ++){
            this.load.image("level" + i, "assets/sprites/level" + i + ".png");
        }
 
        // preloading game icons as spritesheet
        this.load.spritesheet("icons", "assets/sprites/icons.png", {
            frameWidth: 80,
            frameHeight: 80
        });
    }
 
    create(){
 
        //
        // GRADIENT BACKGROUND
        //
 
        // creation of a graphic object without adding it to the game
        let background = this.make.graphics({
            x: 0,
            y: 0,
            add: false
        });
 
        // we are going to create a gradient background, that is a series of retangles filled with different colors
        let gradientSteps = game.config.height / 2;
 
        // determining rectangle height according to game height and gradient steps
        let rectangleHeight = Math.floor(game.config.height / gradientSteps);
 
        // looping through all gradient steps
        for(let i = 0; i <= gradientSteps; i ++){
 
            // ColorWithColor method interpolates the two given colors based on "gradientSteps" steps returns the i-th step
            let color = Phaser.Display.Color.Interpolate.ColorWithColor(Phaser.Display.Color.ValueToColor("0x0e2be3"), Phaser.Display.Color.ValueToColor("0xa6e1ff"), gradientSteps, i);
 
            // setting background fill stile
            background.fillStyle(Phaser.Display.Color.RGBToString(Math.round(color.r), Math.round(color.g), Math.round(color.b), 0, "0x"));
 
            // drawing a filled rectangle covering the full width of the game and "rectangleHeight" height
            background.fillRect(0, rectangleHeight * i, game.config.width, rectangleHeight);
        }
 
        // generating a texture called "gradient" from the graphics
        background.generateTexture("gradient", game.config.width, game.config.height);
 
        // no need to keep the grahpic object anymore
        background.destroy();
 
        // adding the texture data as a sprite
        this.add.sprite(game.config.width / 2, game.config.height / 2, "gradient");
 
        //
        // LEVEL MAZE
        //
 
        this.add.sprite(game.config.width / 2, game.config.height / 2, "level" + gameOptions.currentLevel);
 
        //
        // GAME ICONS
        //
 
        // temp variable to access more quicly to level information
        let levelObject = gameLevels[gameOptions.currentLevel - 1];
 
        // adding start icon
        this.startSpot = this.add.sprite(levelObject.startSpot.x, levelObject.startSpot.y, "icons", 0);
 
        // adding end icon
        this.endSpot = this.add.sprite(levelObject.endSpot.x, levelObject.endSpot.y, "icons", 1);
 
        //
        // INPUT MANAGEMENT
        //
 
        // just a flag to inform us if we already had an input, that is if the player already clicked/touched the canvas
        this.firstInput = true;
 
        // flag to check if the player can drag
        this.canDrag = false;
 
        // input listeners
        this.input.on("pointerdown", this.startMoving, this);
        this.input.on("pointermove", this.dragString, this);
        this.input.on("pointerup", this.stopMoving, this);
 
        //
        // GAME STUFF
        //
 
        // we create a graphics instance called "canvas", we'll draw the string on it
        this.canvas = this.add.graphics(0, 0);
 
        // segments is the array which will contain string segments
        this.segments = [];
 
        // it's not game over yet
        this.gameOver = false;
 
        // do not consume the string
        this.consumeString = false;
 
    }
 
    // startMoving method, will be called each time the player touches/clicks the canvas
    startMoving(e){
 
        // if it's not game over...
        if(!this.gameOver){
 
            // the player cna not dragg
            this.canDrag = true;
 
            // checking if it's the first input: player clicks/touches the canvas for the first time
            if(this.firstInput){
 
                // not the first input anymore
                this.firstInput = false;
 
                // making start icon invisible
                this.startSpot.visible = false;
 
                // populating segments array with an amount of "gameOptions.tailSegments" Phaser Vector2 objects
                for(let i = 0; i < gameOptions.tailSegments; i++){
 
                    // I want the string to be a circle at first, so I am using a little trigonometry to place these points accordingly
                    let radians = 12 * Math.PI * i / gameOptions.tailSegments + Math.PI / 4;
 
                    // creating Vector2 objects and placing them into segments array. "10" is the radius of the circle
                    this.segments[i] = new Phaser.Math.Vector2(this.startSpot.x + 10 * Math.cos(radians), this.startSpot.y + 10 * Math.sin(radians));
                }
 
                // calling moveString function. Actually this function moves and renders the string, and the two arguments represent
                // respectively the x and y movement to apply to string's head. We set them to zero because there's no movement yet
                this.moveString(0, 0);
            }
 
            // add a move callback to be fired when the player moves the mouse/finger and call dragString method
            //game.input.addMoveCallback(this.dragString, this);
 
            // add a up callback to be fired when the player releases the finger/mouse button and call endMove method
            //game.input.onUp.add(this.endMove, this);
 
            // saving current event position, that is the position where the player is currently touching/clicking
            this.startPosition = e.position;
        }
    }
 
    // moveString method updates and renders the string
    moveString(x, y){
 
        // the head of the string is current input position
        let head = new Phaser.Math.Vector2(this.segments[0].x + x, this.segments[0].y + y);
 
        // the first segment is the head itself
        this.segments[0] = new Phaser.Math.Vector2(head.x, head.y);
 
        // renders the string and checks for game over
        this.gameOver = this.renderString();
 
        // if it's game over or the head of the string is fairly inside the end spot...
        if(this.segments[0].distance(new Phaser.Math.Vector2(this.endSpot.x, this.endSpot.y)) < this.endSpot.width / 4 || this.gameOver){
 
            // can't drag anymore
            this.canDrag = false;
 
            // if it's not game over, this means the player solved the level and we consume the string
            if(!this.gameOver){
                this.consumeString = true;
            }
 
            // wait 2 seconds before restarting the game.
            this.time.addEvent({
                delay: 2000,
                callbackScope: this,
                callback: function(){
 
                    // if it's not game over, this means the player solved the level so we move on to next level
                    if(!this.gameOver){
                        gameOptions.currentLevel = (gameOptions.currentLevel % gameLevels.length) + 1;
                    }
                    this.scene.start("PlayGame");
                }
            });
        }
    }
 
    // dragString method is called when the player moves the finger or the mouse while keeping mouse button pressed
    dragString(e){
 
        // if the player can drag
        if(this.canDrag){
 
            // calling moveString function. Actually this function moves and renders the string, and the two arguments represent
            // respectively the x and y movement to apply to string's head.
            // We set them to represent the distance from current input position and previous input position
            this.moveString(e.position.x - this.startPosition.x, e.position.y - this.startPosition.y);
 
            // updating startPosition variable
            this.startPosition = new Phaser.Math.Vector2(e.position.x, e.position.y);
        }
    }
 
    // method to render the string, returns true if the string collided with the maze
    renderString(){
 
        // did the string collide?
        let collided = false;
 
        // clearing the canvas, ready to be redrawn
        this.canvas.clear();
 
        // only draw if there's something to draw
        if(this.segments.length > 0){
 
            // setting line style to a 4 pixel thick line, black, 100% opaque
            this.canvas.lineStyle(4, 0x000000, 1);
 
            // placing the pen on the head
            this.canvas.moveTo(this.segments[0].x, this.segments[0].y);
 
            // looping through all segments starting from the second one
            for(let i = 1; i < this.segments.length - 1; i++){
 
                // determining the angle between current segment and previous segment
                let nodeAngle = Math.atan2(this.segments[i].y - this.segments[i - 1].y, this.segments[i].x - this.segments[i - 1].x);
 
                // calculating new segment position according to previous segment position and the angle
                this.segments[i] = new Phaser.Math.Vector2(this.segments[i - 1].x + gameOptions.segmentLength * Math.cos(nodeAngle), this.segments[i - 1].y + gameOptions.segmentLength * Math.sin(nodeAngle));
 
                // getting the transparency behind the segment
                let alpha = this.textures.getPixelAlpha(Math.round(this.segments[i].x), Math.round(this.segments[i].y), "level" + gameOptions.currentLevel);
 
                // if the color alpha is different than zero, that is it's not a transparent pixel...
                if(alpha != 0){
 
                    // from now on, draw the string in red
                    this.canvas.lineStyle(4, 0xff0000, 1);
 
                    // collision...
                    collided = true;
 
                }
 
                // drawing the segment
                this.canvas.lineTo(this.segments[i].x, this.segments[i].y);
                this.canvas.moveTo(this.segments[i].x, this.segments[i].y);
 
            }
 
            this.canvas.strokePath();
        }
 
        return collided;
    }
 
    // method to be executed at each frame
    update(){
 
        // if we need to consume the string...
        if(this.consumeString){
 
            // if there are more than 5 segments...
            if(this.segments.length >= 5){
 
                // remove the latest 5 segments
                this.segments.length = this.segments.length - 5;
            }
            else{
                this.segments.length = 0;
            }
 
            // then render the string
            this.renderString();
        }
    }
 
    // stopMoving method, the player cannot drag anymore
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
