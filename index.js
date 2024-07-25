'use strict'

//cargar el modulo dotenv para poder utilizar las variables de entorno
require('dotenv').config();

const Airtable = require('airtable');//importar la libreria de airtable
const port = process.env.PORT || 3000;//puerto en el que se ejecutara la aplicacion

const  app = require('./app');//importar el archivo app.js

Airtable.configure({
    apiKey: process.env.AIRTABLE_API_KEY//configurar la api key de airtable
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);//configurar la base de datos de airtable


// Verificar la conexión a Airtable
base('CRM').select({
    maxRecords: 1
}).firstPage((err, records) => {
    if (err) {
        console.error('Error al conectar con Airtable:', err);
        return;
    }
    console.log('La conexión a Airtable se ha realizado correctamente');

    // Si la conexión a Airtable es correcta, entonces se ejecuta el servidor
    app.listen(port, '0.0.0.0', () => {
        console.log('El servidor está corriendo en el puerto' + port);
    });
});

