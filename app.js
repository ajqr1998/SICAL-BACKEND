'use strict'

var express = require('express');//Cargar el modulo de express
var sical_routes = require('./routes/sical');//Cargar el archivo que contiene las rutas de la aplicacion
var bodyParser = require('body-parser');//Cargar el modulo de body-parser para trabajar con peticiones POST y PUT
const cors = require('cors');//Cargar el modulo de cors para permitir el acceso a la API desde cualquier origen

//servidor que se va a encargar de recibir las peticiones y enviar las respuestas
var app = express();

const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? process.env.PROD_FRONTEND_URL : process.env.DEV_FRONTEND_URL,
    credentials: true
};

app.use(cors(corsOptions));//Permitir el acceso a la APi solo desde el frontend

// Analizar solicitudes con contenido tipo application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Analizar solicitudes con contenido tipo application/json
app.use(bodyParser.json());

//configurar las cabeceras http
// app.use((req,res,next)=>{
//     //permitir el acceso a todos los dominios
//     res.header('Access-Control-Allow-Origin','*');
//     //Se define los encabezados que los clientes pueden usar en las solicitudes HTTP.
//     res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, X-Request-With,Content-Type,Accept, Access-Control-Allow,Request-Method');
//     //Se define los metodos que los clientes pueden usar en las solicitudes HTTP.
//     res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS,PUT,DELETE');
//     //Para clientes que utilizan allow en vez de Access-Control-Allow-Methods
//     res.header('Allow','GET,POST,OPTIONS,PUT,DELETE');//
//     // Manejar solicitudes OPTIONS
//     // if (req.method === 'OPTIONS') {
//     //     return res.status(200).end();
//     // }
//     next();
// });

//Rutas de la aplicacion
//Las rutas de la aplicacion estan definidas en el archivo scaneq.js de la carpeta routes
app.use('/', sical_routes);

//Exportar el modulo app para que pueda ser utilizado en otros archivos
module.exports = app;
