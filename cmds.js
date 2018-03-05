

const {log, biglog, errorlog, colorize} = require("./out");
const model = require('./model');

/**
*Muestra la ayuda
*/
exports.helpCmd = rl =>{
	log('h|help - Muestra esta ayuda.');
  	log('list - Listar los quizzes existentes.');
  	log('show <id> - Muestra la pregunta y la respuesta el quiz indicado.');
  	log('add - Añadir un nuevo quiz interactivamente.');
  	log('delete <id> - Borrar el quiz indicado.');
  	log('edit <id> - Editar el quiz indicado');
  	log('test <id> - Probar el quiz indicado');
  	log('p|play - Jugar a preguntar aleatoriamente todos los quizzes.');
  	log('credits - Créditos.');
  	log('q|quit - Salir del programa.');
  	rl.prompt();
};

/**
*Añade un quiz
*Pregunta la pregunta y la respuesta del quiz
*/
exports.addCmd = rl =>{
	//log('Añadir un nuevo quiz.');
	rl.question(colorize('introduzca una pregunta: ', 'red'), question =>{
		rl.question(colorize('introduzca la respuesta: ', 'red'), answer =>{
			model.add(question, answer);
			log(` ${colorize('Se ha añadido: ', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer} `);
			rl.prompt();
		});
	});
	
};

/**
*Muestra los quizzes existentes
*/
exports.listCmd = rl =>{
	//log('Listar todos los quizzes existentes.');
	model.getAll().forEach((quiz, id) => {
		log(` [${colorize(id, 'magenta')}]: ${quiz.question} ` );
	});

	rl.prompt();
};

/**
*Muestra el quiz indicado
*@param id Identificador del quiz a mostrar
*/
exports.showCmd = (rl, id) =>{
	//log('Mostrar el quiz indicado.');
	if(typeof id === "undefined") {
		errorlog(`falta el valor del parámetro id.`);
	}
	else{
		try{
			const quiz = model.getByIndex(id);
			log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer} ` ); 
		} catch(error){
			errorlog(error.message);
		}
	}
	rl.prompt();
};

/**
*Te pregunta el quiz indicado
*@param id Identificador del quiz a mostrar
*/
exports.testCmd = (rl, id) =>{
	//log('Probar el quiz indicado.');
	
	if(typeof id === "undefined") {
		errorlog(`falta el valor del parámetro id.`);
		rl.prompt();
	}
	else{
		try{
		const quiz = model.getByIndex(id);
				
			rl.question(` ${colorize(quiz.question, 'red')}${colorize('?', 'red')} `, resp => {
				if( resp.toLowerCase().trim() === quiz.answer.toLowerCase().trim() ){
					log(`Su respuesta es:`);
					biglog('Correcta', 'green');
					rl.prompt();
				}
				else{ 
					log(`Su respuesta es:`);
					biglog('Incorrecta', 'red');
					rl.prompt();
				}
			});
		
		}catch (error){
			errorlog(error.message);
			rl.prompt();
		}
	}	
};

/**
*Pregunta los quizzes existentes en orden aleatorio.
*Se gana si se contesta correctamente a todos.
*/
exports.playCmd = rl =>{
	//log('Jugar aleatoriamente a todos los quizzes.');
	let id = 300;
	n_preguntas = model.count();
	let score = 0;
	let toBeResolved = [];
	for (i=0; i< model.count(); i++){  //para recorrer array metiendo id
		toBeResolved[i] = i;
	};
	log(`${toBeResolved[0]} ${toBeResolved[1]} ${toBeResolved[2]} ${toBeResolved[3]}`);
	const playOne = () => {
	if(n_preguntas === 0){
		log('No hay nada más que preguntar');
		log('Fin del examen. Aciertos: ');
		biglog(score, 'magenta')
		rl.prompt();
	}else{
		let id_0 =Math.floor( Math.random() * n_preguntas);
		
		do{
		id = id_0;  //Cogemos un id al azar
		let quiz = model.getByIndex(id); //Sacamos el quiz de dicho id
		delete toBeResolved[id] //la quitamos del array
		
		rl.question(` ${colorize(quiz.question, 'red')}${colorize('?', 'red')} `, resp => {
			if( resp.toLowerCase().trim() === quiz.answer.toLowerCase().trim() ){
				score++;
				n_preguntas--;
				log(`CORRECTO - Lleva  : ${score} aciertos` );
				playOne();
				}

			else{ 
				log('INCORRECTO ');
				log('Fin del examen. Aciertos: ');
				biglog(score, 'magenta');
				rl.prompt();
				}
			});

		}while ( id_0 != id);
		}
	}
	playOne();
};

/**
*Borra el quiz indicado
*@param id Identificador del quiz 
*/
exports.deleteCmd = (rl, id) =>{
	//log('Borrar el quiz indicado.');
	if(typeof id === "undefined") {
		errorlog(`Falta el valor del parámetro id.`);
	}
	else{
		try{
			model.deleteByIndex(id);
		} catch(error){
			errorlog(error.message);
		}
	}
	rl.prompt();
};

/**
*Edita el quiz indicado
*@param id Identificador del quiz 
*/
exports.editCmd = (rl, id) =>{
	//log('Editar el quiz indicado.');
	if(typeof id === "undefined") {
		errorlog(`Falta el valor del parámetro id.`);
		rl.prompt
	}
	else{
		try{
		  const quiz = model.getByIndex(id);
		  
		  process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
		  rl.question(colorize('introduzca una pregunta: ', 'red'), question =>{

		  	process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
			rl.question(colorize('introduzca la respuesta: ', 'red'), answer =>{
			  model.update(id, question, answer);
				log(`Se ha cambiado el quiz: ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer} `);
				rl.prompt();
			});
		});
		} catch(error){
			errorlog(error.message);
			rl.prompt();
		}
	}
	
};

/**
*Muestra los nombres de los autores
*/
exports.creditsCmd = rl =>{
	log('Autores de la práctica.');
    log('Miguel Lozano Torrequebrada');
    log('');
    rl.prompt();
};

/**
*Terminar el programa
*/
exports.quitCmd = rl =>{
	rl.close();
};















