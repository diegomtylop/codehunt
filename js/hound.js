/*
Just for fun
Created by: Diego Montoya
Email: diego.mtylop@gmail.como
2017/09/27
*/

/*
Global variable:
Array of Array with boolean values that represents the MAZE
*/
var MAZE;


//Adds the listeners
document.getElementById('files').addEventListener('change', handleFileSelect, false);

//handle the event when the file is selected
function handleFileSelect(evt) {

    var files = evt.target.files; // FileList object

    console.log(files);
    console.log(files[0]);

    var reader = new FileReader();
   // Closure to capture the file information.
    reader.onload = function() {
      //console.log(reader.result);

      var fileContent =reader.result;

      parsearArchivo( fileContent );
      pintarLaberinto();
      //alert('termino de paresear');
      $('#ingresoPosicion').show();
      $('#contSolucion').hide();
      $('#solucion').html('');
    }

    reader.readAsText(files[0]);
}


//Asigna la posición inicial y dispara la ejecución de
$('#btnInitialPosition').click(function( evt ){
  //alert('Posicion inicial');
  debugger;
  var initialX = $('#initialX').val();
  var initialY = $('#initialY').val();

  var endX = $('#endX').val();
  var endY = $('#endY').val();

  if( MAZE ){
    var validInitialPos;
    var validEndPos;

    try{
      validInitialPos = MAZE[initialX][initialY]
    }catch(e){
      validInitialPos = false;
    }

    try{
      validEndPos = MAZE[endX][endY];
    }catch(e){
      validEndPos = false;
    }

    if( !validInitialPos ){
      alert('The hound position is not valid');
      return;
    }

    if( !validEndPos ){
      alert('The prey position is not valid');
      return;
    }
    //alert(endX+ ' '+endY);
    $('[x-pos='+ endX+'-'+endY+']').addClass('final');
    //alert(initialX+ ' '+initialY);
    $('[x-pos='+ initialX+'-'+initialY+']').addClass('inicial');

    debugger;
	pintarLaberinto();
    //resolverLaberinto( MAZE, initialX, initialY, endX, endY );
    resolverLaberinto( MAZE, endX, endY, initialX, initialY);
  }else{
    alert('First you should select a file')
  }
});

//Generate the MAZE according to the file Content
function parsearArchivo( fileContent ){
    var charAct;

    var offsetRows = offSetCols = 5;

    var rows = fileContent.split('\n');
    //console.log(rows.length + ' total filas');

    //Define the array
    var labe = [];
    var firstRow = rows[offsetRows];

	//Object that stores the visited cells
	var visited = {};

    var curYPos = 0;

	var rowIndex = 0;
	debugger;
	var maxColumnIndex = 0;
    for( i = offsetRows ; i < rows.length ; i++){
        var curRow = rows[i];

        var rowArray = [];

        //console.log('procesando la fila '+i );
        //console.log(curRow);

        //Offset de 5
        var counter = offSetCols;
		var columnIndex = 0;

        var curXPos = 0;

        while( counter < curRow.length ){

			console.log('Procesando '+columnIndex+' ' +rowIndex)
            charAct = curRow[counter];

			if( rowIndex == 0 ){
				labe.push([]);
			}else if( columnIndex > maxColumnIndex ){
				//debugger;
				//Adds a new Column
				labe.push([]);
			}
			/*if(columnIndex == 24){
				debugger;
			}*/
            //console.log('charAct '+charAct);

            switch( charAct ){
                case 'F' :
                    counter+=2;//Para ignorar el siguiente espacio en blanco
                    //console.log('Es un camino'+charAct);
                    rowArray.push(true);//Indica que la celda es un camino

					labe[columnIndex][rowIndex] = true;
					columnIndex++;
                break;
                default:
                    //console.log('Es este otro caracter'+charAct);
                    counter+=1;
                    rowArray.push(false);//Indica que la celda no es un camino
					labe[columnIndex][rowIndex] = false;
					columnIndex++;
            }
            curXPos++;
        }
		if( columnIndex > maxColumnIndex ){
			maxColumnIndex = columnIndex-1;
		}
        rowIndex++;
        curYPos++;
    }
	MAZE = labe;
}

//Render the Maze
function pintarLaberinto(){
    var newDOM;

    $('#maze').html('');//Borra el contenido del div contenedor

	//Llena la primera fila de ayuda
	$fila = $( '<div class="fila"></div>');

	//Celda vacía de la primer columna
	var newDOMRef = '<div class="reference">-</div>';
	$fila.append(newDOMRef);
	for( i = 0; i < MAZE.length; i++ ){
	  newDOMRef = '<div class="reference">'+i+'</div>';
	  $fila.append(newDOMRef);
	}

	$('#maze').css('width',MAZE.length*34);
	$('#maze').append($fila);
    for( j = 0 ; j < MAZE[0].length ; j++){
        //console.log('Va a pintar la  fila '+i );
        //console.log(curRow);
        $fila = $( '<div class="fila"></div>');

		var newDOMRef = '<div class="reference">'+j+'</div>';
		$fila.append(newDOMRef);

        var isPath;
        for( i = 0; i < MAZE.length; i++ ){
            isPath = MAZE[i][j];

            //console.log('isPath '+isPath);

            if( isPath ){
                newDOM = '<div class="path" x-pos="'+i+'-'+j+'"></div>';
                //console.log('Es un camino');
            }else{
                newDOM = '<div class="void"  x-pos="'+i+'-'+j+'"></div>'
                //console.log('Es un espacio');
            }

            $fila.append(newDOM);
        }
        $('#maze').append($fila);
    }
}

function resolverLaberinto( currMaze, initX, initY, endX, endY ){
	//console.log('Vamos a resolver el laberinto '+currMaze);
	//debugger;

	//Variables para indicar en que dirección se está avanzando
	const NORTH = 'N';
	const EAST = 'E';
	const SOUTH = 'S';
	const WEST = 'W';


	//Dirección actual en la cual se avanza
	var currDir;
	//Current position
	var currPosX = Number(initX);
	var currPosY = Number(initY);

	//Pila de pasos que ha realizado
	var breadcrum = [];

	//Pila de pasos que ha visitado
	var visited = [];

	visited[currPosX+'-'+currPosY]=true
	//Añade a la lista de pasos
	breadcrum.push([currPosX,currPosY]);
	//Pinta el cuadro
	$('[x-pos='+ currPosX+'-'+currPosY+']').addClass('visitado');


	//Define la direccion objetivo
	currDir = endX > initX? EAST : WEST;

	var maxSteps = 10000;
	var stepsCounter = 0;

	var desvios = [];
	//Ciclo de recorrido
	while( stepsCounter < maxSteps ){
		//console.log(stepsCounter+': Current position [X='+currPosX+', Y='+currPosY+'] Direccion'+currDir);

		if(  currPosX == endX && currPosY == endY   ){
			//alert('Prey found');
			$('#modalFound').show();

			var stepsSolution = breadcrum.reverse();
			var solOutput = JSON.stringify( stepsSolution );

			//Pinta la solución
			breadcrum.forEach(function( step){
				$('[x-pos='+ step[0]+'-'+step[1]+']').addClass('solucion');
			});
			console.log('Solución:'+solOutput );
			$('#solucion').html( solOutput );
      $('#contSolucion').show();
			break;
		}


		if( currPosX == 19 && currPosY == 4){
			debugger;
		}

		var freeForward = isFreeForward();
		var freeLeft = isFreeLeft();
		var freeRight= isFreeRight();

		//Dirección hacía la cual se debería de mover
		var targetDirectionX,targetDirectionY;
		targetDirectionX = endX > currPosX?EAST:WEST;
		targetDirectionY = endY > currPosY?SOUTH:NORTH;

		//Compara hacía donde debería dirigirse
			var difX = Math.abs(endX - currPosX );
			var difY = Math.abs( endY - currPosY);



		/*
		Si puede seguir hacia adelante y hacia la izquierda
		*/
		if(freeLeft && freeRight && freeForward ){
			console.log('Libre en todas las direcciones');
			debugger;
			/*if( difX < difY ){
				currDir = currPosX > endX ?WEST:EAST;
			}else{
				currDir = currPosY > endY ?NORTH:SOUTH;
			}*/
			//TODO: PROBAR SI ESTO FUNCIONA

			desvios.push({posX:currPosX,posY:currPosY, dir:currDir,turn:'LEFT' });
			desvios.push({posX:currPosX,posY:currPosY, dir:currDir,turn:'RIGHT' });
			forward();
			continue;
		}else if( freeLeft && freeRight){
			//adelante no hay paso, se debe debe voltear a la dirección que lo acerque mas
			console.log('Debe decidir si gira a la izquierda o a la deracha');
			debugger;

			switch( currDir ){
				case NORTH:
					if( targetDirectionX == EAST ){
						desvios.push({posX:currPosX,posY:currPosY, dir:currDir,turn:'LEFT' });
						turnRight();
					}else{
						desvios.push({posX:currPosX,posY:currPosY, dir:currDir,turn:'RIGHT' });
						turnLeft();
					}
				break;

				case SOUTH:
					if( targetDirectionX == EAST ){
						desvios.push({posX:currPosX,posY:currPosY, dir:currDir,turn:'RIGHT' });
						turnLeft();
					}else{
						desvios.push({posX:currPosX,posY:currPosY, dir:currDir,turn:'LEFT' });
						turnRight();
					}
				break;

				case WEST:
					if( targetDirectionY == NORTH ){
						desvios.push({posX:currPosX,posY:currPosY, dir:currDir,turn:'LEFT' });
						turnRight();
					}else{
						desvios.push({posX:currPosX,posY:currPosY, dir:currDir,turn:'RIGHT' });
						turnLeft();
					}
				break;

				case EAST:
					if( targetDirectionY == NORTH ){
						desvios.push({posX:currPosX,posY:currPosY, dir:currDir,turn:'RIGHT' });
						turnLeft();
					}else{
						desvios.push({posX:currPosX,posY:currPosY, dir:currDir,turn:'LEFT' });
						turnRight();
					}
				break;
			}
			forward();
			continue;
		}else if( freeLeft && freeForward){
			//Guarde en la lista de posibles desvios
			console.log('Libre a la izquierda');
			desvios.push({posX:currPosX,posY:currPosY, dir:currDir,turn:'LEFT' });
			console.log('Libre a la izquierda: Debería decidir si girar o Seguir derecho');
			debugger;
		}else if ( freeRight && freeForward){
			//Guarde en la lista de posibles desvios
			console.log('Libre a la derecha');
			desvios.push({posX:currPosX,posY:currPosY, dir:currDir, turn:'RIGHT' });
			console.log('Libre a la derecha: Debería decidir si girar o Seguir derecho');
			debugger;
		}

		if( freeForward ){
			forward();
		}else if( freeLeft ){
			turnLeft();
			forward();
		}else if( freeRight ){
			turnRight();
			forward();
		}else{
			//Si se quedó sin movimientos regresa hasta la última posición donde todavía tenía altenativas
			debugger;
			var ultimoDesvio = desvios.pop();
			var previousStep;
			currPosX = ultimoDesvio.posX;
			currPosY = ultimoDesvio.posY;
			currDir = ultimoDesvio.dir;
			var savedTurn = ultimoDesvio.turn;
			for(;breadcrum.length;){

				var previousStep = breadcrum[breadcrum.length-1];
				//Sacá de la miga de pan los pasos visitados hasta el último desvío
				if( previousStep[0] == ultimoDesvio.posX &&
					previousStep[1] == ultimoDesvio.posY ){
					break;
				}
				breadcrum.pop();
				var keyToRemove = previousStep[0]+'-'+previousStep[1];
				//delete visited[keyToRemove];
				//$('[x-pos='+ previousStep[0]+'-'+previousStep[1]+']').removeClass('visitado');
			}

			if( savedTurn == 'LEFT'){
				turnLeft();
			}else if(  savedTurn  == 'RIGHT' ){
				turnRight();
			}
			forward();
		}

		stepsCounter++;
	}

	function isFreeForward(){
		if( currDir == NORTH ){
			if( currPosY == 0 ){
				return false;
			}else{
				//return currMaze[currPosX][currPosY-1];
				checkedPosX = currPosX;
				checkedPosY  = currPosY-1;
			}
		}else if( currDir == WEST ){
			if( currPosX == 0 ){
				return false;
			}else{
				//return currMaze[currPosX-1][currPosY];
				checkedPosX = currPosX-1;
				checkedPosY  = currPosY;
			}
		}else if( currDir == SOUTH){
			if( currPosX == currMaze[0].length-1 ){
				return false;
			}else{
				//return currMaze[currPosX][currPosY+1];
				checkedPosX = currPosX;
				checkedPosY  = currPosY+1;
			}
		}else if( currDir == EAST){
			if( currPosX == currMaze.length-1 ){
				return false;
			}else{
				//return currMaze[currPosX+1][currPosY];
				checkedPosX = currPosX+1;
				checkedPosY  = currPosY;
			}
		}
		var isPath = currMaze[checkedPosX][checkedPosY];
		var wasVisited = visited[checkedPosX+'-'+checkedPosY]?true:false;
		return isPath && !wasVisited;
	}

	function isFreeLeft(){

		var checkedPosX=0, checkedPosY=0;
		if( currDir == NORTH ){
			if( currPosX == 0 ){
				return false;
			}else{
				checkedPosX = currPosX-1;
				checkedPosY  = currPosY;
			}
		}else if( currDir == WEST ){
			if( currPosX == currMaze[0].length-1 ){
				return false;
			}else{
				//return currMaze[currPosX][currPosY+1];
				checkedPosX = currPosX;
				checkedPosY  = currPosY+1;
			}
		}else if( currDir == SOUTH){
			if( currPosX == currMaze.length-1 ){
				return false;
			}else{
				//return currMaze[currPosX+1][currPosY];
				checkedPosX = currPosX+1;
				checkedPosY  = currPosY;
			}
		}else if( currDir == EAST){
			if( currPosY == 0 ){
				return false;
			}else{
				//return currMaze[currPosX][currPosY-1];
				checkedPosX = currPosX;
				checkedPosY  = currPosY-1;
			}
		}

		var isPath = currMaze[checkedPosX][checkedPosY];
		var wasVisited = visited[checkedPosX+'-'+checkedPosY]?true:false;
		return isPath && !wasVisited;
	}

	function isFreeRight(){
		if( currDir == NORTH ){
			if( currPosX == currMaze.length-1 ){
				return false;
			}else{
				//return currMaze[currPosX+1][currPosY];
				checkedPosX = currPosX+1;
				checkedPosY  = currPosY;
			}
		}else if( currDir == WEST ){
			if( currPosY == 0 ){
				return false;
			}else{
				//return currMaze[currPosX][currPosY-1];
				checkedPosX = currPosX;
				checkedPosY  = currPosY-1;
			}

		}else if( currDir == SOUTH){
			if( currPosX == 0 ){
				return false;
			}else{
				//return currMaze[currPosX-1][currPosY];
				checkedPosX = currPosX-1;
				checkedPosY  = currPosY;
			}
		}else if( currDir == EAST){
			if( currPosX == currMaze[0].length-1 ){
				return false;
			}else{
				//return currMaze[currPosX][currPosY+1];
				checkedPosX = currPosX;
				checkedPosY  = currPosY+1;
			}
		}

		var isPath = currMaze[checkedPosX][checkedPosY];
		var wasVisited = visited[checkedPosX+'-'+checkedPosY]?true:false;
		return isPath && !wasVisited;
	}


	//Función para avanzar hacía adelante en la dirección actual
	function forward(){
		var nextX, nextY = 0;

		var canMove = false;
		if( currDir == NORTH ){
			if( currMaze[currPosX][currPosY-1] ){// si está libre la casilla de arribla
				currPosY--;
				canMove = true;//Se puede mover hacía arriba
			}
		}else if( currDir == WEST ){
			if( currMaze[currPosX-1][currPosY] ){// si está libre la casilla de arribla
				currPosX--;
				canMove =  true;//Se puede mover hacía la izquierda
			}
		}else if( currDir == SOUTH){
			if( currMaze[currPosX][currPosY+1] ){// si está libre la casilla de arribla
				currPosY++;
				canMove = true;//Se puede mover hacía arriba
			}
		}else if( currDir == EAST){
			if( currMaze[currPosX+1][currPosY] ){// si está libre la casilla de arribla
				currPosX++;
				canMove = true;//Se puede mover hacía arriba
			}
		}

		if( canMove ) {
			var key = currPosX+'-'+currPosY;
			visited[key]=true;//Marca la celda como visitada
			//Añade a la lista de pasos
			breadcrum.push([currPosX,currPosY]);
			//Pinta el cuadro
			$('[x-pos='+ currPosX+'-'+currPosY+']').addClass('visitado');
			return true;
		}else{
			console.error('Tratando de moverse a una posición inválida'+currPosX+', '+currPosY );
		}
		return false;
	}

	function turnLeft(){
		if( currDir == NORTH ){
			currDir = WEST;
		}else if( currDir == WEST ){
			currDir = SOUTH;
		}else if( currDir == SOUTH){
			currDir = EAST;
		}else if( currDir == EAST){
			currDir = NORTH;
		}
	}

	function turnRight(){
		if( currDir == NORTH ){
			currDir = EAST;
		}else if( currDir == WEST ){
			currDir = NORTH;
		}else if( currDir == SOUTH){
			currDir = WEST;
		}else if( currDir == EAST){
			currDir = SOUTH;
		}
	}
}
