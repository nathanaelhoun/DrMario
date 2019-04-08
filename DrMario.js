/**
 * Jeu Dr Mario
 * DrMario.js
 * 
 * @author Nathanaël Houn
 */


// ##########################################################################################
// ###################################### Variables #########################################
// ##########################################################################################
var ground = [];

var lastUpdate = 0;

const EMPTY_BOX = {
    type: 0,
    color: 0
}

numLevel = 1;


// Coloration variables
const BLUE = 1 ;
const RED = 2;
const YELLOW = 3;


// Miscellaneous
const BOX_WIDTH = 25;
const BOX_HEIGHT = BOX_WIDTH;
const VIRUS = 1;
const CAPSULE = 2;
const BOTTLE_HEIGHT = 16;
const BOTTLE_WIDTH = 8;

// ##########################################################################################
// ###################################### Functions #########################################
// ##########################################################################################

/**
 * Create an empty ground
 * @param {*} matrice the matrice you want to make empty
 * @return an empty matrice
 */
function groundInitialization(matrice){
    for(var i=0 ; i<BOTTLE_HEIGHT ; i++){
        var line = [];
        for(var j=0 ; j<BOTTLE_WIDTH ; j++){
            line[j] = JSON.parse(JSON.stringify(EMPTY_BOX));
        }
        matrice[i] = line;
    }
    return(matrice);
}

/**
 * Fill the ground with randomly generated virus with random colors
 * @param {*} matrice the matrice which will be filled
 * @param {*} numberOfVirus the number of virus which need to be created
 * @return the matrice with the virus
 */
function randomVirus(matrice,numberOfVirus){
    var actualNumberOfVirus = 0;
    while(actualNumberOfVirus < numberOfVirus && !isGroundFilled(matrice)){
        var randomLine = -1;
        var randomColumn = -1;
        
        do{
            randomLine = Math.floor(Math.random()*(BOTTLE_HEIGHT-4)+4);
            randomColumn = Math.floor(Math.random()*BOTTLE_WIDTH);
        } while(matrice[randomLine][randomColumn].type !== 0 && !isGroundFilled(matrice));
        
        if(randomLine>=0 && randomColumn >=0){
            var color = Math.floor(Math.random()*3)+1;
            matrice[randomLine][randomColumn].color = color;
            matrice[randomLine][randomColumn].type = VIRUS;
            actualNumberOfVirus++;
        }
    }

    return(matrice)
}

/**
 * Check if the ground is filled
 * @param {*} matrice 
 * @return true if it is
 */
function isGroundFilled(matrice){
    var existOneEmptyBox = false;
    var i = 4;
    var j = 0;
    while(i < BOTTLE_HEIGHT && !existOneEmptyBox){
        j=0;
        while(j < BOTTLE_WIDTH && !existOneEmptyBox){
            if(matrice[i][j].type === 0){
                existOneEmptyBox = true;
            }
            j++;
        }
        i++;
    }
    return(!existOneEmptyBox);
}


// ##########################################################################################
// ######################################## Game ############################################
// ##########################################################################################


/**
 * Initialization of the game
 */
function init(){
    
	// Initizalisation of the global var context
	context = document.getElementById("cvs").getContext("2d");
	context.width = document.getElementById("cvs").width;
	context.height = document.getElementById("cvs").height;

    //Pause if it is not on focus
	document.body.onblur = function() {
		isOnFocus = false;
	}
	document.body.onfocus = function() {
		isOnFocus = true;
    }
    
    //Creation of the bottle
    ground = groundInitialization(ground);
    ground = randomVirus(ground, 4*numLevel);
    // ground[4][4].type = VIRUS;
    // ground[4][4].color = BLUE;

    // 2 listeners on the keyboard (keyup and keydown)
	document.addEventListener("keydown", captureKeyboardPress)
	document.addEventListener("keyup", captureKeyboardReleased)

    // Go my little game loop, and never stop
    lastUpdate = Date.now();
	gameLoop();
}

/**
 * Game loop
 */
function gameLoop(){
    var delta = lastUpdate-Date.now();
    update(delta);
    
    // Draw the game
    render();

    requestAnimationFrame(gameLoop);
}

/**
*  Game update
*  @param delta the time between now and the last update
*/
function update(delta) {
    
}

/** 
 * Render the game state
 */
function render(){

    //Wiping the screen
    context.fillStyle = "black";
    context.fillRect(0,0,context.width,context.height);


    //Drawing the bottle
    context.fillStyle = "white";
    context.fillRect(200,140,BOTTLE_WIDTH*BOX_WIDTH,BOTTLE_HEIGHT*BOX_HEIGHT);


    //Draw the bottle's content
    for(var i=0 ; i< BOTTLE_HEIGHT ; i++){
        for(var j=0 ; j< BOTTLE_WIDTH ; j++){
            context.fillStyle = "darkblue";
            context.fillRect(200+25*j, 140+25*i, BOX_HEIGHT,BOX_WIDTH);
            
            var x = 200+25*j+2;
            var y = 140+25*i+2;
            
            switch(ground[i][j].type){    
                case 0:
                    context.fillStyle = "grey";
                    context.fillRect(x,y, BOX_HEIGHT-4,BOX_WIDTH-4);
                break;

                case VIRUS:
                    switch(ground[i][j].color){
                        case BLUE:
                            context.fillStyle = "blue";
                            context.fillRect(x, y, BOX_HEIGHT-4,BOX_WIDTH-4);
                        break;

                        case RED:
                            context.fillStyle = "red";
                            context.fillRect(x, y, BOX_HEIGHT-4,BOX_WIDTH-4);
                        break;

                        case YELLOW:
                            context.fillStyle = "yellow";
                            context.fillRect(x, y, BOX_HEIGHT-4,BOX_WIDTH-4);                        
                        break;
                    }
                    //Don't smile
                    context.fillStyle = "black";
                    context.fillRect(x + 4, y+4,3,5);
                    context.fillRect(x + 14, y+4,3,5);
                    context.fillRect(x + 4, y + 13, 12, 3);
                    context.fillRect(x + 3, y + 15, 3,3);
                    context.fillRect(x + 15, y + 15, 3,3);

                    //Corners
                    context.fillStyle = "grey";
                    
                    context.fillRect(x,y,1,4)
                    context.fillRect(x+1,y,3,1)
                    context.fillRect(x+1,y+1,1,1)

                    context.fillRect(x+20,y,1,4)
                    context.fillRect(x+17,y,3,1)
                    context.fillRect(x+19,y+1,1,1)

                    
                    context.fillRect(x,y+17,1,4)
                    context.fillRect(x+1,y+20,3,1)
                    context.fillRect(x+1,y+19,1,1)
                    
                    context.fillRect(x+20,y+17,1,4)
                    context.fillRect(x+17,y+20,3,1)
                    context.fillRect(x+19,y+19,1,1)
                break;

                case CAPSULE:
                    switch(ground[i][j].color){
                        case BLUE:
                            context.fillStyle = "blue";
                            context.fillRect(x, y, BOX_HEIGHT-4,BOX_WIDTH-4);
                        break;

                        case RED:
                            context.fillStyle = "red";
                            context.fillRect(x, y, BOX_HEIGHT-4,BOX_WIDTH-4);
                        break;

                        case YELLOW:
                            context.fillStyle = "yellow";
                            context.fillRect(x, y, BOX_HEIGHT-4,BOX_WIDTH-4);                        
                        break;
                    }
                break;
            }
            
        }
    }

}


/**
*  Key down event
*/
captureKeyboardPress = function(event) {
	switch(event.keyCode){

    }    
}

/**
*  Key up event
*/
captureKeyboardReleased = function(event){
	switch (event.keyCode){
		
	}
}