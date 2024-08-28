'use strict'
var express = require('express');
var SicalContoller = require('../controllers/sical')
var router = express.Router();

//Home
router.get('/', SicalContoller.home);

//Obtener reportes enviando el año y el mes
router.post('/reporte', SicalContoller.reporteVentas);

//Obtener reportes de proyectos enviando el año y el mes
router.post('/reporte-proyectos', SicalContoller.reporteProyectos);

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

//Obtener el personal de SICAL
router.get('/personal', SicalContoller.getPersonal);

//Obtener pedidos por solicitante
router.post('/pedido', SicalContoller.getPedidosBySolicitante);

//Update pedido
router.put('/pedido', SicalContoller.updatePedido);

//Update orden de compra por id como parametro
router.put('/orden-compra/:id', SicalContoller.updateOrdenCompra);

//get pedido de compras
router.get('/pedido-compras/:id', SicalContoller.getPedidoOC);

//*************  Cotizacion  **************
//get Cotizacion
router.get('/cotizacion/:id', SicalContoller.getCotizacion);

//crear Cotizacion
router.post('/cotizacion', SicalContoller.crearCotizacion);

//*************  Requerimientos  **************
//get Requerimientos
router.get('/requerimientos', SicalContoller.getRequerimientos);


module.exports = router;