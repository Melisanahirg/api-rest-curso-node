const express = require('express');
const Joi = require('joi');
const config = require('config');
const app = express();


app.use(express.json()); //Esto es un middleware
app.use (express.urlencoded({extended:true})); //Esto es un middleware que sirve para usar otro tipo de formato (lo utilice para agregar info a la BD mediante un formulario)

//---------------------- CONFIGURACION DE ENTORNOS -------------------------------//

console.log('Aplication: ' + config.get('nombre'));
console.log('BD Server: ' + config.get('configDB.host'));



//---------------------- BASE DE DATOS -------------------------------//
const usuarios = [
    {id:1, nombre:'Melisa'},
    {id:2, nombre:'Leandro'},
    {id:3, nombre:'Uma'}
];


//---------------------- PETICIONES GET -------------------------------//Las peticiones GET son para traer informacion de la BD
app.get('/', (req, res) => {  //Crear una peticion GET
    res.send('Hola mundo desde express');
    
});

app.get('/api/usuarios', (req, res) => { 
    res.send(usuarios);
});

app.get('/api/usuarios/:id', (req, res) =>{ //crea una funcion para traer de una base de datos, un parametro en comun escrito en la direccion 
    //let usuario = usuarios.find( u => u.id === parseInt(req.params.id));//busca id en la BD para machearlo con el id (parametro) de la direccion
    let usuario = existeUsuario(req.params.id)
    if(!usuario){
     res.status(404).send('El usuario no fue encontrado')   
    } res.send(usuario);
});

//---------------------- PETICIONES POST -------------------------------// Las peticiones POST son para agregar a la BD
app.post('/api/usuarios', (req, res) => { 

    // if (!req.body.nombre || req.body.nombre.length <= 2){ //VALIDACIÓN SENCILLA para comprobar que los datos ingresados son correctos
    //     res.status(400).send('Debe tener un nombre mayor a 2 letras');
    //     return;
    // }

    // const schema = Joi.object({ // VALIDACION de datos CON JOI mediante esquemas
    //     nombre: Joi.string().min(3).required() //NOMBRE requiere que sea un string, minimo de 3 letras, y tiene que ser requerido
    // });


    const {error, value} = validaUsuario(req.body.nombre) ; // desestructuro  en {error} y {value} para poder validar
    if(!error){ // si el error no existe, entonces crear un nuevo usuario
        const usuario = {// crea un nuevo usuario 
            id: usuarios.length + 1, //Suma 1 al id, ej: id:3 // id:4
            nombre: value.nombre
        };
        usuarios.push(usuario); //Agrega el nuevo usuario al array de usuarios
        res.send(usuario);
    } else{ // si existe el error entonces mostrar el error correspondiente.
        const mensaje = error.details[0].message
        res.status(400).send(mensaje);
    }

});

//---------------------- PETICIONES PUT -------------------------------// Las peticiones PUT sirven para actualizar la BD

app.put('/api/usuarios/:id', (req, res) =>{ 

    let usuario = existeUsuario(req.params.id)//Primero debemos corroborar si el usuario(id) existe
    if(!usuario) {
        res.status(404).send('El usuario no fue encontrado')
        return;
    };   
    
    // const schema = Joi.object({ //Segundo debemos validar el nombre(el parametro usado)
    //     nombre: Joi.string().min(3).required() 
    // });
    
    const {error, value} = validaUsuario(req.body.nombre); 
    if(error){ //solo validamos si existe un error, no quiero agregar un nuevo usuario
        const mensaje = error.details[0].message
        res.status(400).send(mensaje);
        return;
    };

    usuario.nombre = value.nombre //Tercero guardamos el nuevo nombre escrito en {value} en el nombre del usuario de la BD
    res.send(usuario);
    
});


//---------------------- PETICIONES DELETE -------------------------------// Las peticiones DELETE sirven para borrar un elemento de la BD

app.delete('/api/usuarios/:nombre', (req, res) => {
    
    let usuario = existeNombreUsuario(req.params.nombre)//Primero debemos corroborar si el usuario(nombre) existe
    if(!usuario) {
        res.status(404).send('El usuario no fue encontrado')
        return;
    };   

    const index = usuarios.indexOf(usuario); //eliminamos mediante el paramentro(nombre) el objeto completo del array
    usuarios.splice(index, 1);
    res.send(usuarios);
});


//---------------------- FUNCIONES VARIAS PARA FALICITAR LA LECTURA DEL CODIGO ----------------------------//

function existeUsuario(id) {
    return (usuarios.find( u => u.id === parseInt(id)))
};

function existeNombreUsuario(name) {
    return (usuarios.find( u => u.nombre === name))
};

function validaUsuario(nom){
    const schema = Joi.object({ 
        nombre: Joi.string().min(3).required() 
    })
    return (schema.validate({ nombre: nom }));
}




//---------------------- CREAR UN PUERTO ----------------------------//
const port = process.env.PORT || 3000; //A veces se esta utilizando un puerto, entonces agrega otro Ó deja el que ya está
app.listen(port, () => { //Crear un puerto para enviar la peticion GET
    console.log(`Escuchando en el puerto ${port}...`);
})