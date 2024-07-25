'use strict'

//Cargar el modulo de express
var express = require('express');

//Cargar el archivo que contiene las rutas de la aplicacion
var sical_routes = require('./routes/sical');

//Cargar el modulo de body-parser para trabajar con peticiones POST y PUT 
var bodyParser = require('body-parser');

//servidor que se va a encargar de recibir las peticiones y enviar las respuestas
var app = express();

// Analizar solicitudes con contenido tipo application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Analizar solicitudes con contenido tipo application/json
app.use(bodyParser.json());

//configurar las cabeceras http
app.use((req,res,next)=>{
    //permitir el acceso a todos los dominios
    res.header('Access-Control-Allow-Origin','*');
    //Se define los encabezados que los clientes pueden usar en las solicitudes HTTP.
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, X-Request-With,Content-Type,Accept, Access-Control-Allow,Request-Method');
    //Se define los metodos que los clientes pueden usar en las solicitudes HTTP.
    res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS,PUT,DELETE');
    //Para clientes que utilizan allow en vez de Access-Control-Allow-Methods
    res.header('Allow','GET,POST,OPTIONS,PUT,DELETE');//
    // Manejar solicitudes OPTIONS
    // if (req.method === 'OPTIONS') {
    //     return res.status(200).end();
    // }
    next();
});

//Rutas de la aplicacion
//Las rutas de la aplicacion estan definidas en el archivo scaneq.js de la carpeta routes
app.use('/', sical_routes);

//Exportar el modulo app para que pueda ser utilizado en otros archivos
module.exports = app;
