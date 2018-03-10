
const Sequelize = require('sequelize');
const {log, biglog, errorlog, colorize} = require("./out");
const {models} = require('./model');

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
*Muestra los quizzes existentes
*/
exports.listCmd = rl =>{

	models.quiz.findAll()
	.each(quiz => {
		log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question} `);
	})
	.catch(error => {
		errorlog(error.message);
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
	
	return new Sequelize.Promise ((resolve, reject) => {
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
exports.showCmd = (rl, id) =>{
	//log('Mostrar el quiz indicado.');
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe un quiz asociado al id: ${id}.`);
		}
		log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question}  ${colorize(' => ', 'magenta')} ${quiz.answer} `);
	})
	.catch(error => {
		errorlog(error.message);
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
exports.addCmd = rl =>{
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
		log(` ${colorize('Se ha añadido: ', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer} `);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog('el quiz es erroneo:');
		error.errors.forEach(({message}) => errorlog(message));
	})
	.catch (error => {
		errorlog(error.message);
	})
	.then (() => {
		rl.prompt();
	});	
	
};



/**
*Te pregunta el quiz indicado
*@param id Identificador del quiz a mostrar
*/
exports.testCmd = (rl, id) =>{
	//Validar el id
	//obtener la pregunta como en edit
	//comprobar que este bien
	
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
					log('Correcta', 'green');
					rl.prompt();
				}
				else{ 
					log(`Su respuesta es:`);
					log('Incorrecta', 'red');
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
	//Cargar en un array todas las preguntas que hay
	//pregubatrlas luego de forma aleatoria
	//orientandolo a promesas




};

/**
*Borra el quiz indicado
*@param id Identificador del quiz 
*/
exports.deleteCmd = (rl, id) =>{

	validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

/**
*Edita el quiz indicado
*@param id Identificador del quiz 
*/
exports.editCmd = (rl, id) =>{

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
		log(`Se ha cambiado el quiz: ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer} `);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog('El quiz es erroneo:');
		error.errors.forEach(({message}) => errorlog(message));
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});

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















