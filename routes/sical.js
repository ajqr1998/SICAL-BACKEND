'use strict'
var express = require('express');
var SicalContoller = require('../controllers/sical')
var router = express.Router();

//Home
router.get('/', SicalContoller.home);

//Obtener todos los proyectos
router.get('/proyectos', SicalContoller.getProyectos);

//Obtener los subproyectos de un proyecto
router.post('/subproyectos', SicalContoller.getSubproyectos);

//Obtener los insumos cotizados de un proyecto
router.post('/inscot', SicalContoller.getInsCot);

//Obtener los insumos adicionales para un proyecto
router.post('/insadi', SicalContoller.getInsAdi);


//Obtener un pedido
router.get('/pedido/:id', SicalContoller.getPedido);  

//Obtener proveedores
router.get('/proveedores', SicalContoller.getProveedores);

//Crear un pedido
router.post('/crear-pedido', SicalContoller.crearPedido);

//Obtener una orden de compra
router.get('/orden-compra/:id', SicalContoller.getOrdenCompra);



module.exports = router;