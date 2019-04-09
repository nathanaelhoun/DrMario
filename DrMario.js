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


var gravityRecheck = false;

var ground = [];

var lastUpdate = 0;
var lastRefresh = 0;

const EMPTY_BOX = {
    type: 0,
    color: 0,
    attached:0,
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
const FALLING_CAPSULE = 3;
const BOTTLE_HEIGHT = 16;
const BOTTLE_WIDTH = 8;
const REFRESH_SPEED = 1000;

// Medicine
const TOP = 0;
const RIGHT = 1;
const BOTTOM = 2;
const LEFT = 3;
var medicine = {
    x: -1,
    y: -1,
    direction: RIGHT,
    color1 : "green",
    color2 : "green"
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
    if(med.x != -1){
        matrice[med.y][med.x].type = CAPSULE;
        matrice[med.y][med.x].color = med.color1;
        matrice[med.y][med.x].attached = med.direction;

        var x2, y2, direction2;
        switch(med.direction){
            case RIGHT:
                x2 = med.x + 1;
                y2 = med.y;
                direction2 = LEFT;
            break;

            case BOTTOM:
                x2 = med.x ;
                y2 = med.y + 1 ;
                direction2 = TOP;
            break;

            case LEFT:
                x2 = med.x - 1;
                y2 = med.y;
                direction2 = RIGHT;
            break;

            case TOP:
                x2 = med.x;
                y2 = med.y - 1;
                direction2 = BOTTOM;
            break;
        }
        matrice[y2][x2].type = CAPSULE;
        matrice[y2][x2].color = med.color2;
        matrice[y2][x2].attached = direction2;
        
        medicine = {
            x: -1,
            y: -1,
            direction: RIGHT,
            color1 : "green",
            color2 : "green"
        };        
        gravityRecheck = true;
    }
    return(matrice)
}


/**
 * Check if we can move down the medicine (and do if it is possible)
 */
function moveMedicineDown(){
    var isMoveAllowed = true;
    if(medicine.y >= 15 || medicine.x ==-1){
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
    
    if(medicine.x>=7 || medicine.x == -1){
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
    if(medicine.x != -1){
    
        var isMoveAllowed = true;
        var newdirection = (medicine.direction-1);
        if(newdirection<0){
            newdirection=3;
        }

        var newX = medicine.x;
        var newY = medicine.y;
        switch(newdirection){
            case RIGHT:
                newY += 1;
                if(medicine.x >=7){
                    newX -= 1;
                } else if(ground[medicine.y+1][medicine.x+1].type !=0){
                    if(ground[medicine.y][medicine.x-1].type ==0){
                        newX -=1;
                    } else {
                        isMoveAllowed = false;
                    }
                }
            break;

            case BOTTOM:
                newX -= 1;
                newY -= 1;
                if(ground[medicine.y-1][medicine.x-1].type !=0){
                    if(ground[medicine.y+1][medicine.x].type == 0){
                        newY +=1;
                    } else {
                        isMoveAllowed = false;
                    }
                }
            break;

            case LEFT:
                newX += 1 ;
                if(medicine.x>=7){
                    newX -= 1;
                    if(ground[medicine.y][medicine.x-1].type !=0){
                        isMoveAllowed = false;
                    }
                } else if(ground[medicine.y][medicine.x+1].type !=0){
                    if(ground[medicine.y][medicine.x-1].type == 0){
                        newX -= 1;
                    } else {
                        isMoveAllowed = false;
                    }
                }
            break;

            case TOP:
                if(ground[medicine.y-1][medicine.x].type !=0){
                    if(ground[medicine.y+1][medicine.x].type == 0){
                        newY +=1;
                    } else {
                        isMoveAllowed = false;
                    }
                }
            break;
        }

        if(isMoveAllowed){
            medicine.direction = newdirection;
            medicine.x = newX;
            medicine.y = newY;
        }
    }
}


/**
 * Detect 4-wide alignement of virus and capsules with the same color and destroy them. 
 * @param {*} matrice the ground in an 2-dim array 
 */
function detectColorMatching(matrice){
    //vertical
    var isVerticalMatchingFound;
    do{    
        isVerticalMatchingFound = false;
        var i=15;
        while(i>=3 && !isVerticalMatchingFound){
            
            var j=0;
            while(j<8 && !isVerticalMatchingFound){
                
                if(ground[i][j].type !=0){
                    if(matrice[i][j].color == matrice[i-1][j].color 
                    && matrice[i][j].color ==matrice[i-2][j].color
                    && matrice[i][j].color ==matrice[i-3][j].color){
                        isVerticalMatchingFound = true;
                        var y=i;
                        while(matrice[y][j].color == matrice[y-1][j].color){
                            switch(matrice[y][j].attached){
                                case RIGHT:
                                    matrice[y][j+1].attached = -1;
                                break;
    
                                case TOP:
                                    matrice[y-1][j].attached = -1;
                                break;
                                
                                case LEFT:  
                                    matrice[y][j-1].attached = -1;
                                break;
    
                                case BOTTOM:
                                    matrice[y+1][j].attached = -1;
                                break;
                            }
                            matrice[y][j]=JSON.parse(JSON.stringify(EMPTY_BOX));
                            y--;
                        }
                        switch(matrice[y][j].attached){
                            case RIGHT:
                                matrice[y][j+1].attached = -1;
                            break;

                            case TOP:
                                matrice[y-1][j].attached = -1;
                            break;
                            
                            case LEFT:  
                                matrice[y][j-1].attached = -1;
                            break;

                            case BOTTOM:
                                matrice[y+1][j].attached = -1;
                            break;
                        }
                        matrice[y][j]=JSON.parse(JSON.stringify(EMPTY_BOX));
                        gravityRecheck = true;
                    }
                }
                j++;
            }
            i--;
        }
    } while(isVerticalMatchingFound);


    //Horizontal
    var isHorizontalMatchingFound;
    do{
        isHorizontalMatchingFound = false;
        var i=15;
        while(i>=0 && !isHorizontalMatchingFound){
            
            var j=0;
            while(j<5 && !isHorizontalMatchingFound){
                
                if(ground[i][j].type !=0){
                    if(matrice[i][j].color == matrice[i][j+1].color 
                    && matrice[i][j].color ==matrice[i][j+2].color
                    && matrice[i][j].color ==matrice[i][j+3].color){
                        isHorizontalMatchingFound = true;
                        var x=j;
                        while(matrice[i][x].color == matrice[i][x+1].color){
                            switch(matrice[i][x].attached){
                                case RIGHT:
                                    matrice[i][x+1].attached = -1;
                                break;
    
                                case TOP:
                                    matrice[i-1][x].attached = -1;
                                break;
                                
                                case LEFT:  
                                    matrice[i][x-1].attached = -1;
                                break;
    
                                case BOTTOM:
                                    matrice[i+1][x].attached = -1;
                                break;
                            }
                            matrice[i][x]=JSON.parse(JSON.stringify(EMPTY_BOX));
                            x++;
                        }

                        switch(matrice[i][x].attached){
                            case RIGHT:
                                matrice[i][x+1].attached = -1;
                            break;

                            case TOP:
                                matrice[i-1][x].attached = -1;
                            break;
                            
                            case LEFT:  
                                matrice[i][x-1].attached = -1;
                            break;

                            case BOTTOM:
                                matrice[i+1][x].attached = -1;
                            break;
                        }
                        matrice[i][x]=JSON.parse(JSON.stringify(EMPTY_BOX));
                        gravityRecheck = true;
                    }
                }
                j++;
            }
            i--;
        }
    }while(isHorizontalMatchingFound);

        
    return(matrice);
}


/**
 * Make the capsules fall if there is nothing under them
 * @param {*} matrice the ground
 * @return the updated ground
 */
function capsuleGravity(matrice){
    gravityRecheck = false;
    //Detect 
    for(var i=14 ; i>=0 ; i--){
        for(var j = 0 ; j<8 ; j++){ 
            if(matrice[i][j].type === CAPSULE){
                if( i+1 < 16 && (matrice[i+1][j].type == 0 || matrice[i+1][j].type == FALLING_CAPSULE)){
                    var fall = true;
                    switch(matrice[i][j].attached){
                        case RIGHT:
                            if(matrice[i+1][j+1].type != 0 && matrice[i+1][j+1].type != FALLING_CAPSULE){
                                fall = false;
                            }
                        break;
                        
                        case LEFT:  
                            if(matrice[i+1][j-1].type != 0 && matrice[i+1][j-1].type != FALLING_CAPSULE){
                                fall = false;
                            }
                        break;
                    }

                    if(fall){
                        gravityRecheck = true;
                        matrice[i][j].type = FALLING_CAPSULE;
                    }
                }
            }
        }
    }

    //Make fall
    for(var i=14 ; i>=0 ; i--){
        for(var j = 0 ; j<8 ; j++){ 
            if(matrice[i][j].type === FALLING_CAPSULE){
                matrice[i+1][j].color = matrice[i][j].color;
                matrice[i+1][j].type = CAPSULE;
                matrice[i+1][j].attached = matrice[i][j].attached;
                matrice[i][j] = JSON.parse(JSON.stringify(EMPTY_BOX));    
            }
        }
    }

    return(matrice);
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
    
    // If we are not in the fall of the medicine
    if(!isMedicineFalling){

        //
        ground = transferMedicineToGround(ground,medicine);
        
        //If capsules are still falling
        if(gravityRecheck){
            
            //Let an delta = REFRESH_SPEED divided by 2 between two frames
            if(Date.now() - lastRefresh > REFRESH_SPEED/2){
                ground = capsuleGravity(ground);
                lastRefresh = Date.now();
            }

        //If capsules are not falling
        } else {
            
            //
            ground = detectColorMatching(ground);

            // Defeat
            if(isDefeat()){
                defeat = true;

            // Launch a new medicine
            } else if(!gravityRecheck) {
                medicine = createMedicine(medicine);
            }
        }
    
    //Falling of the medicine
    } else {
        if(Date.now() - lastRefresh > REFRESH_SPEED){
            medicine = medicineFalling(medicine);
            lastRefresh = Date.now();
        }
    }
    
    //Victory ?
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
            
            var x = 202+BOX_WIDTH*j;
            var y = 142+BOX_HEIGHT*i;
            
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
                case FALLING_CAPSULE:                  
                    context.fillStyle = ground[i][j].color;
                    context.fillRect(x, y, BOX_HEIGHT-4,BOX_WIDTH-4);

                    //Corners
                    context.fillStyle = "grey";
                    switch(ground[i][j].attached){
                        case RIGHT:
                            context.fillRect(x,y,1,4)
                            context.fillRect(x+1,y,3,1)
                            context.fillRect(x+1,y+1,1,1)

                            context.fillRect(x,y+17,1,4)
                            context.fillRect(x+1,y+20,3,1)
                            context.fillRect(x+1,y+19,1,1)    
                        break;

                        case LEFT:
                            context.fillRect(x+20,y,1,4)
                            context.fillRect(x+17,y,3,1)
                            context.fillRect(x+19,y+1,1,1)
            
                            context.fillRect(x+20,y+17,1,4)
                            context.fillRect(x+17,y+20,3,1)
                            context.fillRect(x+19,y+19,1,1)
                        break;

                        case BOTTOM:
                            context.fillRect(x,y,1,4)
                            context.fillRect(x+1,y,3,1)
                            context.fillRect(x+1,y+1,1,1)
                            
                            context.fillRect(x+20,y,1,4)
                            context.fillRect(x+17,y,3,1)
                            context.fillRect(x+19,y+1,1,1)    
                        break;

                        case TOP:
                            context.fillRect(x+20,y+17,1,4)
                            context.fillRect(x+17,y+20,3,1)
                            context.fillRect(x+19,y+19,1,1)

                            context.fillRect(x,y+17,1,4)
                            context.fillRect(x+1,y+20,3,1)
                            context.fillRect(x+1,y+19,1,1)
                        break;
                        default:
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
                    }
                break;
            }
        }
    }

    // Drawing the falling medicine
    if(medicine.x != -1){
        context.fillStyle = medicine.color1;
        
        var x = 202 + BOX_WIDTH*medicine.x;
        var y = 142+BOX_HEIGHT*medicine.y;
        context.fillRect(x, y, BOX_HEIGHT-4,BOX_WIDTH-4);
         
        //Corners
        context.fillStyle = "grey";
        switch(medicine.direction){
            case RIGHT:
                context.fillRect(x,y,1,4)
                context.fillRect(x+1,y,3,1)
                context.fillRect(x+1,y+1,1,1)

                context.fillRect(x,y+17,1,4)
                context.fillRect(x+1,y+20,3,1)
                context.fillRect(x+1,y+19,1,1)    
            break;

            case LEFT:
                context.fillRect(x+20,y,1,4)
                context.fillRect(x+17,y,3,1)
                context.fillRect(x+19,y+1,1,1)

                context.fillRect(x+20,y+17,1,4)
                context.fillRect(x+17,y+20,3,1)
                context.fillRect(x+19,y+19,1,1)
            break;

            case BOTTOM:
                context.fillRect(x,y,1,4)
                context.fillRect(x+1,y,3,1)
                context.fillRect(x+1,y+1,1,1)
                
                context.fillRect(x+20,y,1,4)
                context.fillRect(x+17,y,3,1)
                context.fillRect(x+19,y+1,1,1)    
            break;

            case TOP:
                context.fillRect(x+20,y+17,1,4)
                context.fillRect(x+17,y+20,3,1)
                context.fillRect(x+19,y+19,1,1)

                context.fillRect(x,y+17,1,4)
                context.fillRect(x+1,y+20,3,1)
                context.fillRect(x+1,y+19,1,1)
            break;
        }


        
        context.fillStyle = medicine.color2;
        switch(medicine.direction){
            case LEFT:
                x = 202 + BOX_WIDTH*(medicine.x-1);
                y = 142 + BOX_HEIGHT*medicine.y;
            
                context.fillRect(x, y, BOX_HEIGHT-4,BOX_WIDTH-4);
                
                context.fillStyle = "grey";
                context.fillRect(x,y,1,4)
                context.fillRect(x+1,y,3,1)
                context.fillRect(x+1,y+1,1,1)

                context.fillRect(x,y+17,1,4)
                context.fillRect(x+1,y+20,3,1)
                context.fillRect(x+1,y+19,1,1)  
            break;
    
            case RIGHT:
                x = 202 + BOX_WIDTH*(medicine.x+1);
                y = 142+BOX_HEIGHT*medicine.y;
                
                context.fillRect(x, y, BOX_HEIGHT-4,BOX_WIDTH-4);
                
                context.fillStyle = "grey";
                context.fillRect(x+20,y,1,4)    
                context.fillRect(x+17,y,3,1)
                context.fillRect(x+19,y+1,1,1)

                context.fillRect(x+20,y+17,1,4)
                context.fillRect(x+17,y+20,3,1)
                context.fillRect(x+19,y+19,1,1)

            break;
    
            case BOTTOM:                
                x = 202 + BOX_WIDTH*medicine.x;
                y = 142+BOX_HEIGHT*(medicine.y+1);
            
                context.fillRect(x, y, BOX_HEIGHT-4,BOX_WIDTH-4);
                
                context.fillStyle = "grey";
                context.fillRect(x+20,y+17,1,4)
                context.fillRect(x+17,y+20,3,1)
                context.fillRect(x+19,y+19,1,1)

                context.fillRect(x,y+17,1,4)
                context.fillRect(x+1,y+20,3,1)
                context.fillRect(x+1,y+19,1,1)
            break;
    
            case TOP:    
                x = 202 + BOX_WIDTH*medicine.x;
                y = 142+BOX_HEIGHT*(medicine.y-1);
            
                context.fillRect(x, y, BOX_HEIGHT-4,BOX_WIDTH-4);
                
                context.fillStyle = "grey";
                context.fillRect(x,y,1,4)
                context.fillRect(x+1,y,3,1)
                context.fillRect(x+1,y+1,1,1)
                
                context.fillRect(x+20,y,1,4)
                context.fillRect(x+17,y,3,1)
                context.fillRect(x+19,y+1,1,1)                  
            break;
        }    
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