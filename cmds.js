
const Sequelize = require('sequelize');
const {log, biglog, errorlog, colorize} = require("./out");
const {models} = require('./model');


/**
*Muestra la ayuda
*/
exports.helpCmd = (socket,rl) =>{
	log(socket,'h|help - Muestra esta ayuda.');
  	log(socket,'list - Listar los quizzes existentes.');
  	log(socket,'show <id> - Muestra la pregunta y la respuesta el quiz indicado.');
  	log(socket,'add - Añadir un nuevo quiz interactivamente.');
  	log(socket,'delete <id> - Borrar el quiz indicado.');
  	log(socket,'edit <id> - Editar el quiz indicado');
  	log(socket,'test <id> - Probar el quiz indicado');
  	log(socket,'p|play - Jugar a preguntar aleatoriamente todos los quizzes.');
  	log(socket,'credits - Créditos.');
  	log(socket,'q|quit - Salir del programa.');
  	rl.prompt();
};


/**
*Muestra los quizzes existentes
*/
exports.listCmd = (socket,rl) =>{

	models.quiz.findAll()
	.each(quiz => {
		log(socket,`[${colorize(quiz.id, 'magenta')}]: ${quiz.question} `);
	})
	.catch(error => {
		errorlog(socket,error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

/*Esta funcion devuelve una promesa que:
*  -Valida que se ha introducido un valor para el parametro.
*  -Convierte el parametro en un numero entero.
*Si todo va bien, la promesa se satisface y devuelve el valor de id a usar.
*
*@param id Parametro con el índice a validar .
*/
const validateId = id => {
	
	return new Sequelize.Promise((resolve , reject) => {
		if (typeof id === "undefined") {
			reject(new Error (`Falta el parámetro <id>. `));
		} else{
			id = parseInt(id);    //Coger la parte entera y descartar lo demás
			if (Number.isNaN(id)) {
				reject(new Error (`El valor del parámetro <id> no es un número. `));
			} else{
				resolve(id);
			}
		}
	});
};




/**
*Muestra el quiz indicado
*@param rl Objeto readline usado para implementar el CLI.
*@param id Identificador del quiz a mostrar
*/
exports.showCmd = (socket,rl, id) =>{
	//log('Mostrar el quiz indicado.');
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe un quiz asociado al id: ${id}.`);
		}
		log(socket,`[${colorize(quiz.id, 'magenta')}]: ${quiz.question}  ${colorize(' => ', 'magenta')} ${quiz.answer} `);
	})
	.catch(error => {
		errorlog(socket,error.message);
	})
	.then(() => {
		rl.prompt();
	});
	
};


/**
*Esta funcion convierte la llamada rl.question (callbacks) en una basada en promesas
*Devuelve una promesa cuando se cumple, proporciona el texto introducido
*La llamada a then que hay que hacer es ----> .then(answer => {...})
*También colorea en rojo el texto de la pregunta, elimina espacios al primcipio y final
*/
const makeQuestion = (rl, text) => {
	return new Sequelize.Promise ((resolve, reject) => {
		rl.question(colorize(text, 'red'), answer => {
			resolve(answer.trim());
		})
	});
};


/**
*Añade un quiz
*Pregunta la pregunta y la respuesta del quiz
*/
exports.addCmd = (socket,rl) =>{
	//log('Añadir un nuevo quiz.');
	makeQuestion(rl, 'Introduzca una pregunta: ')
	.then(q => {
		return makeQuestion(rl, 'Introduzca una respuesta: ')
		.then(a => {
			return {question: q, answer: a};
		});
	})

	.then(quiz => {
		return models.quiz.create(quiz);
	})
	.then(quiz => {
		log(socket,` ${colorize('Se ha añadido: ', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer} `);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog(socket,'el quiz es erroneo:');
		error.errors.forEach(({message}) => errorlog(socket,message));
	})
	.catch (error => {
		errorlog(socket,error.message);
	})
	.then (() => {
		rl.prompt();
	});	
	
};



/**
*Te pregunta el quiz indicado
*@param id Identificador del quiz a mostrar
*/
exports.testCmd = (socket,rl, id) =>{
		 
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe un quiz asociado al id: ${id}.`);
		}
		return makeQuestion(rl,` ${quiz.question} ?`)
		.then(a => {
		  	if (quiz.answer.toLowerCase().trim() == a.toLowerCase().trim()){
				log(socket,`Su respuesta es:`);
				log(socket,'Correcta', 'green');
				
			}else {
				log(socket,`Su respuesta es:`);
				log(socket,'Incorrecta', 'red');
				
			}

		})
	})	
	.catch(error => {
	errorlog(socket,error.message);
	})

	.then(() => {
		rl.prompt();
	});



	// if(typeof id === "undefined") {
	// 	errorlog(`falta el valor del parámetro id.`);
	// 	rl.prompt();
	// }
	// else{
	// 	try{
	// 	const quiz = model.getByIndex(id);
				
	// 		rl.question(` ${colorize(quiz.question, 'red')}${colorize('?', 'red')} `, resp => {
	// 			if( resp.toLowerCase().trim() === quiz.answer.toLowerCase().trim() ){
	// 				log(`Su respuesta es:`);
	// 				biglog('Correcta', 'green');
	// 				rl.prompt();
	// 			}
	// 			else{ 
	// 				log(`Su respuesta es:`);
	// 				biglog('Incorrecta', 'red');
	// 				rl.prompt();
	// 			}
	// 		});
		
	// 	}catch (error){
	// 		errorlog(error.message);
	// 		rl.prompt();
	// 	}
	// }	
};	


/**
*Pregunta los quizzes existentes en orden aleatorio.
*Se gana si se contesta correctamente a todos.
*/
exports.playCmd = (socket,rl) =>{
	//Cargar en un array todas las preguntas que hay
	//pregubatrlas luego de forma aleatoria
	//orientandolo a promesas
	

	let score = 0;
	
	models.quiz.findAll()
	.each(quiz => {
		// if(score === models.quiz.count()){
			
		// 	log('Fin del examen. Aciertos: ');
		// 	log(score, 'magenta')
		// 	rl.prompt();
		// }else{
			return makeQuestion(rl,` ${quiz.question}?`)
			.then(a => {
			  	if (quiz.answer.toLowerCase().trim() == a.toLowerCase().trim()){
					score++;
					log(socket,`Su respuesta es:`);
					log(socket,'Correcta', 'green');
					log(socket,`Lleva  : ${score} aciertos` );
					
				}else {
					log(socket,`Su respuesta es:`);
					log(socket,'Incorrecta', 'red');
					log(socket,'Fin del examen. Aciertos: ');
	 				log(socket,score, 'magenta');

				}
			})
		//}
	})
	
	.catch(error => {
		errorlog(socket,error.message);
	})

	.then(() => {
		log(socket,'Fin del examen. Aciertos: ');
		log(socket,score, 'magenta');
		rl.prompt();
	});

 };	






// 	let id = 300;
// 	n_preguntas = sequelize.models.quiz.count();
// 	let score = 0;
// 	let toBeResolved = [];
// 	for (i=0; i< n_preguntas; i++){  //para recorrer array metiendo id
// 		toBeResolved[i] = i;
// 	};
// 	//log(`${toBeResolved[0]} ${toBeResolved[1]} ${toBeResolved[2]} ${toBeResolved[3]}`);
// 	const playOne = () => {
// 	if(n_preguntas === 0){
// 		log('No hay nada más que preguntar');
// 		log('Fin del examen. Aciertos: ');
// 		biglog(score, 'magenta')
// 		rl.prompt();
// 	}else{
// 		let id_0 =Math.floor( Math.random() * n_preguntas);
		
// 		do{
// 		id = id_0;  //Cogemos un id al azar
// 		let quiz = model.getByIndex(id); //Sacamos el quiz de dicho id
// 		delete toBeResolved[id] //la quitamos del array
		
// 		rl.question(` ${colorize(quiz.question, 'red')}${colorize('?', 'red')} `, resp => {
// 			if( resp.toLowerCase().trim() === quiz.answer.toLowerCase().trim() ){
// 				score++;
// 				n_preguntas--;
// 				log(`CORRECTO - Lleva  : ${score} aciertos` );
// 				playOne();
// 				}

// 			else{ 
// 				log('INCORRECTO ');
// 				log('Fin del examen. Aciertos: ');
// 				biglog(score, 'magenta');
// 				rl.prompt();
// 				}
// 			});

// 		}while ( id_0 != id);
// 		}
// 	}
// 	playOne();


/**
*Borra el quiz indicado
*@param id Identificador del quiz 
*/
exports.deleteCmd = (socket,rl, id) =>{

	validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error => {
		errorlog(socket,error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

/**
*Edita el quiz indicado
*@param id Identificador del quiz 
*/
exports.editCmd = (socket,rl, id) =>{

	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe un quiz asociado al id: ${id}.`);
		}
		process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
		return makeQuestion(rl, 'Introduzca una pregunta: ')
		.then (q => {
		  	process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
			return makeQuestion(rl, 'Introduzca la respuesta: ')
			then (a => {
				quiz.question =q;
				quiz.answer = a;
				return quiz;
			});
		});
	})	
	.then(quiz => {
		return quiz.save();
	})	
	.then(quiz => {
		log(socket,`Se ha cambiado el quiz: ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer} `);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog(socket,'El quiz es erroneo:');
		error.errors.forEach(({message}) => errorlog(message));
	})
	.catch(error => {
		errorlog(socket,error.message);
	})
	.then(() => {
		rl.prompt();
	});

};
		  
/**
*Muestra los nombres de los autores
*/
exports.creditsCmd = (socket,rl) =>{
	log(socket,'Autores de la práctica.');
    log(socket,'Miguel Lozano Torrequebrada');
    log(socket,'Carlos Gutierrez de la Azuela');
    rl.prompt();
};

/**
*Terminar el programa
*/
exports.quitCmd = (socket,rl) =>{
	rl.close();
	socket.end();
};















