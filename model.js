
const fs = require("fs");

//nombre del fichero donde se guardan las preguntas
const DB_FILENAME = "quizzes.json";


//Modelo de datos
//En esta variable se mantienen todos los quizzes
//Es un array de objetos, donde cada objeto tiene los atributos question
//y answer para guardar el texto
//
//al arrancar la aplicación, esta variable contiene estas cuatro preguntas 
//pero al final se llama a load() para cargar las nuevas preguntas 
//guardadas en DB_FILENAME.
let quizzes = [
	{
		question: "Capital de Italia",
		answer: "Roma"		
	},
	{
		question: "Capital de Francia",
		answer: "París"
			
	},
	{
		question: "Capital de España",
		answer: "Madrid"
		
	},
	{
		question: "Capital de Portugal",
		answer: "Lisboa"
		
	}];

const load = () => {
  fs.readFile(DB_FILENAME, (err, data) => {
	if(err){
		//la primera vez no existe fichero
		if(err.code === "ENOENT"){ //ese codigo es: "no existe el fichero"
			save(); //Valores iniciales
			return;
		}
		throw err;
	}
	let json = JSON.parse(data);
	if(json){
		quizzes = json;
	}
  });
};

const save = () => {
	fs.writeFile(DB_FILENAME,
		JSON.stringify(quizzes),
		err => {
			if(err) throw err;
		});
};
	                                                                            
exports.count = () => quizzes.length;

//Añadir un quiz al array quizzes
exports.add = (question, answer) => {
	quizzes.push({
		question: (question || "").trim(),
		answer: (answer || "").trim()
	});
	save();
};

//Actualiza el quiz situado en la posición index.
exports.update = (id, question, answer) => {
	const quiz = quizzes [id];
	if(typeof quiz === "undefined") {
		throw new Error(`El valor del parámetro id no es válido.`);
	}
	quizzes.splice(id, 1, {
		question: (question || "").trim(),
		answer: (answer || "").trim()
	});
	save();
};

//Devuelve todos los quizzes existentes
exports.getAll = () => JSON.parse(JSON.stringify(quizzes));

//Devuelve un clon del quiz en la posición dada
exports.getByIndex = id => {
	const quiz = quizzes[id];
	if(typeof quiz === "undefined") {
		throw new Error(`El valor del parámetro id no es válido.`);
	}
	return JSON.parse(JSON.stringify(quiz));
};


//Elimina el quiz en la posición dada
exports.deleteByIndex = id => {
	const quiz = quizzes[id];
	if (typeof quiz === "undefined"){
		throw new Error(`El valor del parámetro id no es válido.`);
	}
	quizzes.splice(id, 1);
	save();
};

load();