/**
 * Jeu Dr Mario
 * DrMario.js
 * 
 * @author Nathanaël Houn
 */


// ##########################################################################################
// ###################################### Variables #########################################
// ##########################################################################################

var isOnFocus = true;
var isOnPause = false;



var ground = [];

var lastUpdate = 0;
var lastRefresh = 0;

const EMPTY_BOX = {
    type: 0,
    color: 0
}

var numLevel = 1;
var victory = false;
var defeat = false;
var isMedicineFalling = false;

// Coloration variables
const COLORS = ["blue", "red", "yellow"];


// Miscellaneous
const BOX_WIDTH = 25;
const BOX_HEIGHT = BOX_WIDTH;
const VIRUS = 1;
const CAPSULE = 2;
const BOTTLE_HEIGHT = 16;
const BOTTLE_WIDTH = 8;
const REFRESH_SPEED = 1000;

// Medicine
const TOP = 0;
const RIGHT = 1;
const BOTTOM = 2;
const LEFT = 3;
var medicine = {
    x: 0,
    y: 0,
    direction: RIGHT,
    color1 : "grey",
    color2 : "grey"
};

// ##########################################################################################
// ###################################### Functions #########################################
// ##########################################################################################

/**
 * Check if this is a victory for the player
 * @return true if the player wins
 */
function isVictory(){
    return(remainingVirusNumber(ground) == 0);
}


/**
 * Check if the player loses
 * @return true if the player loses 
 */
function isDefeat(){
    return(ground[0][3].type != 0 || ground[0][4].type != 0);
}


/**
 * @return a random number between 1 and 3
 */
function randomColor(){
    return(COLORS[Math.floor(Math.random()*COLORS.length)]);
}


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
            matrice[randomLine][randomColumn].color = randomColor();
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


/**
 * Count the number of remaining virus
 * @param {*} matrice the ground
 * @return the number of remaining virus
 */
function remainingVirusNumber(matrice){
    var virusNumber = 0;
    
    for(var i=0 ; i<BOTTLE_HEIGHT ; i++){
        for(var j=0 ; j<BOTTLE_WIDTH ; j++){
            if(matrice[i][j].type == VIRUS){
                virusNumber++;
            }
        }
    }
    
    return(virusNumber);
}

/**
 * Create a medicine with random colors
 * @param {*} med the medicine you want to reset
 * @return the medicine created
 */
function createMedicine(med){
    med = {
        x: 3,
        y: 0,
        direction: RIGHT,
        color1 : randomColor(),
        color2 : randomColor()
    }
    isMedicineFalling = true;
    return(med);
}

/**
 * Check if a medicine can fall (modify global var isMedicineFalling) and if yes, make it fall
 * @param {*} med the medicine
 * @return med the medicine with updated coordinates
 */
function medicineFalling(med){
    if(med.y >= 15){
        isMedicineFalling = false;
    } else {
        if(ground[med.y+1][med.x].type != 0){
            isMedicineFalling = false;
        } else {
            switch(med.direction){
                case RIGHT:
                    if(ground[med.y+1][med.x+1].type != 0){
                        isMedicineFalling = false;
                    }
                break;

                case LEFT:
                    if(ground[med.y+1][med.x-1].type != 0){
                        isMedicineFalling = false;
                    }
                break;

                case BOTTOM:
                    if(med.y>=14){
                        isMedicineFalling = false;
                    } else if(ground[med.y+2][med.x].type != 0){
                        isMedicineFalling = false;
                    }
                break;
            }
        }
    }
    if(isMedicineFalling){
        med.y++;
    }
    return(med);
}

/**
 * Does exactly what you expect & reset the medicine var
 * @param {*} matrice the matrice you want to transfer in
 * @param {*} med the medicine you want to transfer
 * @return the updated matrice
 */
function transferMedicineToGround(matrice,med){
        matrice[med.y][med.x].type = CAPSULE;
        matrice[med.y][med.x].color = med.color1;

        var x2, y2;
        switch(med.direction){
            case RIGHT:
                x2 = med.x + 1;
                y2 = med.y;
            break;

            case BOTTOM:
                x2 = med.x ;
                y2 = med.y + 1 ;
            break;

            case LEFT:
                x2 = med.x - 1;
                y2 = med.y;
            break;

            case TOP:
                x2 = med.x;
                y2 = med.y - 1;
            break;
        }
        matrice[y2][x2].type = CAPSULE;
        matrice[y2][x2].color = med.color2;
        
        var medicine = {
            x: 0,
            y: 0,
            direction: RIGHT,
            color1 : "grey",
            color2 : "grey"
        };        

    return(matrice)
}


/**
 * Check if we can move down the medicine (and do if it is possible)
 */
function moveMedicineDown(){
    var isMoveAllowed = true;
    if(medicine.y >= 15){
        isMoveAllowed = false;
    } else {
        if(ground[medicine.y+1][medicine.x].type != 0){
            isMoveAllowed = false;
        } else {
            switch(medicine.direction){
                case RIGHT:
                    if(ground[medicine.y+1][medicine.x+1].type != 0){
                        isMoveAllowed = false;
                    }
                break;

                case LEFT:
                    if(ground[medicine.y+1][medicine.x-1].type != 0){
                        isMoveAllowed = false;
                    }
                break;

                case BOTTOM:
                    if(medicine.y>=14){
                        isMoveAllowed = false;
                    } else if(ground[medicine.y+2][medicine.x].type != 0){
                        isMoveAllowed = false;
                    }
                break;
            }
        }
    }
    if(isMoveAllowed){
        medicine.y++;
    } else {
        isMedicineFalling = false;
    }
}


/**
 * Check if we can move to the left the medicine (and do if it is possible)
 */
function moveMedicineLeft(){
    var isMoveAllowed = true;
    
    if(medicine.x<=0){
        isMoveAllowed = false;
    } else if(ground[medicine.y][medicine.x-1].type !=0){
        isMoveAllowed = false;
    } else {
        switch(medicine.direction){
            case LEFT:
                if(medicine.x <=1){
                    isMoveAllowed = false;
                } else if(ground[medicine.y][medicine.x-2].type != 0){
                    isMoveAllowed = false;
                }
            break;

            case BOTTOM:
                if(ground[medicine.y+1][medicine.x-1].type != 0){
                    isMoveAllowed = false;
                }
            break;

            case TOP:
                if(ground[medicine.y-1][medicine.x-1].type != 0){
                    isMoveAllowed = false;
                }
            break;
        }
    }
    
    if(isMoveAllowed){
        medicine.x --;
    }
}


/**
 * Check if we can move to the right the medicine (and do if it is possible)
 */
function moveMedicineRight(){
    var isMoveAllowed = true;
    
    if(medicine.x>=7){
        isMoveAllowed = false;
    } else if(ground[medicine.y][medicine.x+1].type !=0){
        isMoveAllowed = false;
    } else {
        switch(medicine.direction){
            case RIGHT:
                if(medicine.x >=6){
                    isMoveAllowed = false;
                } else if(ground[medicine.y][medicine.x+2].type != 0){
                    isMoveAllowed = false;
                }
            break;

            case BOTTOM:
                if(ground[medicine.y+1][medicine.x+1].type != 0){
                    isMoveAllowed = false;
                }
            break;

            case TOP:
                if(ground[medicine.y-1][medicine.x+1].type != 0){
                    isMoveAllowed = false;
                }
            break;
        }
    }
    
    if(isMoveAllowed){
        medicine.x ++;
    }
}


/**
 * Check if we can rotate the medicine (and do if it is possible)
 */
function rotateMedicine(){
    var isMoveAllowed = true;
    var newdirection = (medicine.direction+1)%4;
    
    switch(newdirection){
        case RIGHT:
            if(medicine.x>=7){
                isMoveAllowed = false;
            } else if(ground[medicine.y][medicine.x+1].type !=0){
                isMoveAllowed = false;
            }
        break;

        case BOTTOM:
            if(ground[medicine.y+1][medicine.x].type !=0){
                isMoveAllowed = false;
            }
        break;

        case LEFT:
            if(medicine.x<=0){
                isMoveAllowed = false;
            } else if(ground[medicine.y][medicine.x-1].type !=0){
                isMoveAllowed = false;
            }
        break;

        case TOP:
            if(ground[medicine.y-1][medicine.x].type !=0){
                isMoveAllowed = false;
            }
        break;
    }

    if(isMoveAllowed){
        medicine.direction = newdirection;
    }
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
    
    
    medicine = createMedicine(medicine);
    


    // 2 listeners on the keyboard (keyup and keydown)
	document.addEventListener("keydown", captureKeyboardPress)
	document.addEventListener("keyup", captureKeyboardReleased)

    // Go my little game loop, and never stop
    lastUpdate = Date.now();
    lastRefresh = Date.now();
	gameLoop();
}

/**
 * Game loop
 */
function gameLoop(){
    if(!isOnFocus || isOnPause){
        document.title = "DrMario - en pause";
    } else {
        document.title = "DrMario";

        if(!defeat && !victory){
            update();
        }
        // Draw the game
        render();
        
    }
    requestAnimationFrame(gameLoop);
}

/**
*  Game update
*/
function update() {
    
    if(!isMedicineFalling){
        ground = transferMedicineToGround(ground,medicine);
        
        if(isDefeat()){
            defeat = true;
        } else {
            medicine = createMedicine(medicine);
        }
    } else 
    
    if(Date.now() - lastRefresh > REFRESH_SPEED){
        medicine = medicineFalling(medicine);
        lastRefresh = Date.now();
    }
      
    if(isVictory()){
        victory = true;
    }
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
            
            var x = 200+BOX_WIDTH*j+2;
            var y = 140+BOX_HEIGHT*i+2;
            
            switch(ground[i][j].type){    
                case 0:
                    context.fillStyle = "grey";
                    context.fillRect(x,y, BOX_HEIGHT-4,BOX_WIDTH-4);
                break;

                case VIRUS:
                    context.fillStyle = ground[i][j].color;
                    context.fillRect(x, y, BOX_HEIGHT-4,BOX_WIDTH-4);

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
                    context.fillStyle = ground[i][j].color;
                    context.fillRect(x, y, BOX_HEIGHT-4,BOX_WIDTH-4);
                break;
            }
            
        }
    }

    // Drawing the falling medicine
    context.fillStyle = medicine.color1;
    context.fillRect(202 + BOX_WIDTH*medicine.x, 142+BOX_HEIGHT*medicine.y, BOX_HEIGHT-4,BOX_WIDTH-4);

    context.fillStyle = medicine.color2;
    switch(medicine.direction){
        case LEFT:
            context.fillRect(202 + BOX_WIDTH*(medicine.x-1),  142+BOX_HEIGHT*medicine.y, BOX_HEIGHT-4,BOX_WIDTH-4);
        break;

        case RIGHT:
            context.fillRect(202 + BOX_WIDTH*(medicine.x+1),  142+BOX_HEIGHT*medicine.y, BOX_HEIGHT-4,BOX_WIDTH-4);
        break;

        case BOTTOM:
            context.fillRect(202 + BOX_WIDTH*medicine.x,  142+BOX_HEIGHT*(medicine.y+1), BOX_HEIGHT-4,BOX_WIDTH-4);
        break;

        case TOP:
            context.fillRect(202 + BOX_WIDTH*medicine.x,  142+BOX_HEIGHT*(medicine.y-1), BOX_HEIGHT-4,BOX_WIDTH-4);
        break;
    }

}


/**
*  Key down event
*/
captureKeyboardPress = function(event) {
	switch(event.keyCode){
        // 'P' means pause or unpause
        case 80:
            isOnPause = !isOnPause;
        break;

        // Left arrow
        case 37:
            moveMedicineLeft();
        break;

        //Right arrow
        case 39:
            moveMedicineRight()
        break;

        //Down arrow
        case 40:
            moveMedicineDown();
        break;

        //Space bar
        case 32:
            rotateMedicine();
        break;
    }    
}

/**
*  Key up event
*/
captureKeyboardReleased = function(event){
	switch (event.keyCode){
		
	}
}