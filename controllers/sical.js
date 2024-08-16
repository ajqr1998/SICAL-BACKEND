'use strict'

const Airtable = require('airtable');//importar la libreria de airtable
Airtable.configure({
    apiKey: process.env.AIRTABLE_API_KEY//configurar la api key de airtable
});

const baseBodega = Airtable.base(process.env.AIRTABLE_BASE_ID_BODEGA);
const baseProyectos = Airtable.base(process.env.AIRTABLE_BASE_ID_PROYECTOS);
const baseCompras = Airtable.base(process.env.AIRTABLE_BASE_ID_COMPRAS);
const baseVentas = Airtable.base(process.env.AIRTABLE_BASE_ID_VENTAS);

var controller = {
    home: function(req, res){
        return res.status(200).send("<h1>Hola desde el controllador</h1>" + " <h2>Esto es el home</h2>");
    },
    reporteVentas: async function(req, res){
        try {
            const ANIO = req.body.ANIO;
            const MES = req.body.MES;
            let registrosJson = [];

            // Función para procesar cada página de registros
            const fetchPage = async (page) => {
                return new Promise((resolve, reject) => {
                    page.eachPage(function page(records, fetchNextPage) {
                        records.forEach(record => {
                            const registro = {
                                COTIZACION_APROBADA: record.get('COTIZACION_APROBADA_REPORTE'),
                                NOMBRE_PRY: record.get('NOMBRE_PRY'),
                                F_GANADA: record.get('F_GANADA'),
                                PARTICIPANTES: record.get('PARTICIPANTES'),
                                TOTAL_SIN_IVA: record.get('TOTAL_SIN_IVA'),
                                RENTABILIDAD: record.get('RENTABILIDAD'),
                                PARTICIPACION: record.get('PARTICIPACION'),
                                TOTAL_PARTICIPACION: record.get('TOTAL_PARTICIPACION'),
                                PORCENTAJE_COMISION: record.get('PORCENTAJE_COMISION'),
                                COMISION_VENTAS: record.get('COMISION_VENTAS'),
                                ESTADO_COMISION_VENTAS: record.get('ESTADO_COMISION_VENTAS'),
                                ESTADO: record.get('ESTADO'),
                                COTIZADOR: record.get('COTIZADOR_REPORTE'),
                            };
                            registrosJson.push(registro);
                        });
                        fetchNextPage();
                    }, function done(err) {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            };

            // Espera a que todas las páginas sean procesadas
            await fetchPage(baseVentas('COMISIONES').select({
                filterByFormula: `AND({MES} = ${MES}, {ANIO} = ${ANIO}, {ETAPA} = '05 - ASIGNACION', FIND('APROBADO', {ESTADO_COTIZACION}))`
            }));

            let agrupacionTemporal = {};

            // Itera sobre registrosJson para agrupar las cotizaciones
            registrosJson.forEach(registro => {
                const cotizador = registro.COTIZADOR;
                if (!agrupacionTemporal[cotizador]) {
                    agrupacionTemporal[cotizador] = [];
                }
                agrupacionTemporal[cotizador].push(registro);
            });

            // Convierte el objeto agrupacionTemporal en el arreglo deseado
            let resultado = Object.keys(agrupacionTemporal).map(cotizador => {
                return {
                    COTIZADOR: cotizador,
                    COMISIONES: agrupacionTemporal[cotizador]
                };
            });

            // Devuelve la respuesta exitosa
            return res.status(200).send(resultado);
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    },
    reporteProyectos: async function(req, res){
        try {
            const ANIO = req.body.ANIO;
            const MES = req.body.MES;
            let registrosJson = [];

            // Función para procesar cada página de registros
            const fetchPage = async (page) => {
                return new Promise((resolve, reject) => {
                    page.eachPage(function page(records, fetchNextPage) {
                        records.forEach(record => {
                            const registro = {
                                PROYECTOS: record.get('PROYECTOS_REPORTE'),
                                SUBPROYECTO: record.get('SUBPROYECTO'),
                                AREA: record.get('AREA_REPORTE'),
                                TOTAL_SIN_IVA_SUBPRY: record.get('TOTAL_SIN_IVA_SUBPRY'),
                                RENTABILIDAD_VENTAS: record.get('RENTABILIDAD_VENTAS'),
                                RENTABILIDAD_MINIMA: record.get('RENTABILIDAD_MINIMA'),
                                RENTABILIDAD_PROYECTO: record.get('RENTABILIDAD_PROYECTO'),
                                VALIDAR_RENTABILIDAD: record.get('VALIDAR_RENTABILIDAD'),
                                PORCENTAJE_PARTICIPACION: record.get('PORCENTAJE_PARTICIPACION'),
                                PORCENTAJE_COMISION: record.get('PORCENTAJE_COMISION'),
                                PORCENTAJE_FINAL_COMISION: record.get('PORCENTAJE_FINAL_COMISION'),
                                COMISION_SUBPRY: record.get('COMISION_SUBPRY'),
                                ETAPA_PROYECTO: record.get('ETAPA_PROYECTO'),
                                F_CIERRE_PROYECTO: record.get('F_CIERRE_PROYECTO'),
                                ESTADO_SUBPROYECTO: record.get('ESTADO_SUBPROYECTO'),
                                PRY_CERRADO: record.get('PRY_CERRADO'),
                                ESTADO_COMISION_PROYECTOS: record.get('ESTADO_COMISION_PROYECTOS'),
                                ESTADO_ACTIVIDADES: record.get('ESTADO_ACTIVIDADES'),
                                RESPONSABLE: record.get('RESPONSABLE_SPRY_REPORTE')
                            };
                            registrosJson.push(registro);
                        });
                        fetchNextPage();
                    }, function done(err) {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            };

            // Espera a que todas las páginas sean procesadas
            await fetchPage(baseProyectos('SUBPROYECTOS').select({
                filterByFormula: `AND({MES} = ${MES}, {ANIO} = ${ANIO}, {ETAPA_PROYECTO} = '04 - CIERRE')`
            }));

            let agrupacionTemporal = {};

             // Itera sobre registrosJson para agrupar las cotizaciones
            registrosJson.forEach(registro => {
                const responsable = registro.RESPONSABLE;
                if (!agrupacionTemporal[responsable]) {
                    agrupacionTemporal[responsable] = [];
                }
                agrupacionTemporal[responsable].push(registro);
            });

            // Convierte el objeto agrupacionTemporal en el arreglo deseado
            let resultado = Object.keys(agrupacionTemporal).map(responsable => {
                return {
                    RESPONSABLE: responsable ,
                    SUBPROYECTOS: agrupacionTemporal[responsable ]
                };
            });

            // Devuelve la respuesta exitosa
            return res.status(200).send(resultado);

        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    },
    getProyectos: async function(req, res){
        try {
            const proyectos = await baseProyectos('PROYECTOS').select().all();
            const map_proyectos = proyectos.map(record => {
                return record.fields.PROYECTO;
            });
            return res.status(200).send(map_proyectos);
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    },
    getPersonal: async function(req, res){
        try {
            const personal = await baseBodega('PERSONAL').select().all();
            const map_personal = personal.map(record => {
                return {
                    ID: record.id,
                    PERSONAL: record.fields.PERSONAL
                };
            });
            return res.status(200).send(map_personal);
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    },
    getSubproyectos: async function(req, res){
        try {
            const proyecto = req.body.PROYECTO;
            const subproyectos = await baseBodega('SUBPROYECTOS').select({
                filterByFormula: `{PROYECTOS} = "${proyecto}"`
            }).all();
            const map_subproyectos = subproyectos.map(record => {
                return {
                    ID: record.id,
                    fields: record.fields
                };
            });
            return res.status(200).send(map_subproyectos);
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    },
    getInsCot: async function(req, res){
        try {
            const COD_BASE_PRY = req.body.COD_BASE_PRY;
            const ESTADO = true;
            const filterFormula = `AND(FIND('${COD_BASE_PRY}', {COD_BASE_PRY}), {APROBADO_COT} = ${ESTADO ? 1 : 0})`;
            const ins_cot = await baseVentas('DET_NIV2_MAT_INS').select({
                filterByFormula: filterFormula
            }).all();
            const map_ins_cot = ins_cot.map(record => {
                return {
                    id: record.fields.RECORD_ID_INSUMO && record.fields.RECORD_ID_INSUMO.length > 0 ? record.fields.RECORD_ID_INSUMO[0] : undefined,
                    fields: {
                        INSUMOS: record.fields.INSUMOS_TEXT,
                        DESCRIPCION: record.fields.DESCRIPCION && record.fields.DESCRIPCION.length > 0 ? record.fields.DESCRIPCION[0] : undefined,
                        CANT_ESP: record.fields.CANTIDAD,
                        PROVEEDOR: record.fields.PROVEEDORES && record.fields.PROVEEDORES.length > 0 ? record.fields.PROVEEDORES[0] : undefined,
                        PVP: record.fields.PVP,
                        COD_PROV: record.fields.COD_PROV && record.fields.COD_PROV.length > 0 ? record.fields.COD_PROV[0] : undefined,
                    }
                }
            });
            return res.status(200).send(map_ins_cot);
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    },
    getInsAdi: async function(req, res){

        try {
            const proveedor = req.body.PROVEEDOR;
            const categoria = req.body.CATEGORIA;
            let filterFormula;
            let ins_adi;

            if (proveedor && proveedor !== "" && categoria && categoria !== "") {
                // Ambos filtros tienen valores
                filterFormula = `AND({PROVEEDOR} = '${proveedor}', {CATEGORIA} = '${categoria}')`;
                ins_adi = await baseBodega('INSUMOS').select({
                    filterByFormula: filterFormula
                }).all();
            } else if (proveedor && proveedor !== "") {
                // Solo el filtro de proveedor tiene valor
                filterFormula = `{PROVEEDOR} = '${proveedor}'`;
                ins_adi = await baseBodega('INSUMOS').select({
                    filterByFormula: filterFormula
                }).all();
            } else if (categoria && categoria !== "") {
                // Solo el filtro de categoría tiene valor
                filterFormula = `{CATEGORIA} = '${categoria}'`;
                ins_adi = await baseBodega('INSUMOS').select({
                    filterByFormula: filterFormula
                }).all();
            } else {
                // Ambos filtros son cadenas vacías, traer todos los registros
                ins_adi = await baseBodega('INSUMOS').select().all();
            }


            const map_ins_adi = ins_adi.map(record => {
                return {
                    id: record.id,
                    fields: record.fields
                }
            });
            return res.status(200).send(map_ins_adi);
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    },
    getProveedores: async function(req, res){
        try {
            const proveedores = await baseBodega('PROVEEDORES').select().all();
            const map_proveedores = proveedores.map(record => {
                return record.fields.PROVEEDOR;
            });
            return res.status(200).send(map_proveedores);
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    },

    crearPedido: async function(req, res){
        try {
            const pedidoData = req.body.pedido.fields;
            const insumosCotizacion =  req.body.insumosCotizacion;
            const insumosAdicionales =  req.body.insumosAdicionales;
            const insumosNuevos =  req.body.insumosNuevos;
            const insumosNuevosIds = [];

            const insNuevosProductos = await Promise.all(insumosNuevos.map(async (insumo) => {
                const record = await baseBodega('INSUMOS').create({
                    DESCRIPCION: insumo.fields.DESCRIPCION,
                    NUEVO: true,
                    MODELO: insumo.fields.MODELO,
                    MARCA: insumo.fields.MARCA,
                },{typecast: true});
                return {
                    id: record.id,
                    cantidad: insumo.fields.COMPRA
                };
            }));

            // Crear el pedido
            const createdPedido = await baseBodega('PEDIDOS').create(pedidoData);

            // Crear insumos de cotización
            for (const insumo of insumosCotizacion) {
                await baseBodega('INSUMOS_PEDIDOS').create({
                    ...insumo.fields,
                    PEDIDO: [createdPedido.id]
                });
            };

            // Crear insumos adicionales
            for (const insumo of insumosAdicionales) {
                await baseBodega('INSUMOS_PEDIDOS').create({
                    ...insumo.fields,
                    PEDIDO: [createdPedido.id] // Relacionar con el pedido creado
                });
            };

            //Crear insumos adicionales (insumos que son nuevos)
            for (const insumo of insNuevosProductos){
                await baseBodega('INSUMOS_PEDIDOS').create({
                    INSUMO: [insumo.id],
                    CANTIDAD: insumo.cantidad,
                    PEDIDO: [createdPedido.id] // Relacionar con el pedido creado
                });
            }

            return res.status(200).send({id: createdPedido.id, codigo:createdPedido.fields.PEDIDO});

        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    },

    getPedido: async function(req, res){
        try {
            const id = req.params.id;

            const pedido = await baseBodega('PEDIDOS').find(id);
            console.log(pedido.fields);

            const ins_adi = await baseBodega('INSUMOS_PEDIDOS').select({
                filterByFormula: `{PEDIDO} = "${pedido.fields.PEDIDO}"`
            }).all();

            const map_ins_adi = ins_adi.map(record => {
                let nuevo;
                if(record.fields.NUEVO[0]){
                    nuevo = record.fields.NUEVO[0];
                } else {
                    nuevo = false;
                }
                return {
                    ID: record.id,
                    DESCRIPCION: record.fields.DESCRIPCION,
                    CANTIDAD: record.fields.CANTIDAD,
                    COD_PROV: record.fields.COD_PROV,
                    COD_SICAL: record.fields.COD_SICAL,
                    NUEVO: nuevo,
                    
                }
            });

            const pedido_send = {
                ID: pedido.id,
                SUBPROYECTO: pedido.fields.SUBPROYECTO,
                PROYECTO: pedido.fields.PROYECTOS,
                OP: pedido.fields.OP,
                PEDIDO: pedido.fields.PEDIDO,
                INS_ADI: map_ins_adi,
                FECHA_PEDIDO: pedido.fields.FECHA_PEDIDO,
                TIPO: pedido.fields.TIPO,
                SOLICITANTE_VALUE: pedido.fields.SOLICITANTE_VALUE,
                NOMBRE_PRY: pedido.fields.NOMBRE_PRY,
                ESTADO_APROBACION: pedido.fields.ESTADO_APROBACION,
            }

            return res.status(200).send(pedido_send);
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }      
    },
    getOrdenCompra : async function(req, res){
        try {
            const id = req.params.id;
            const orden = await baseCompras('ORDEN_COMPRA').find(id);
            
            const insumos = await baseCompras('INSUMOS').select({
                filterByFormula: `{ORDEN_COMPRA} = "${orden.fields.CODIGO}"`
            }).all();

            const map_insumos = insumos.map(record => {
                return {
                    ID: record.id,
                    DESCRIPCION: record.fields.DESCRIPCION,
                    CANTIDAD: record.fields.COMPRA,
                    PVP: record.fields.PVP,
                    PRECIO_TOTAL: record.fields.PRECIO_TOTAL,
                    COD_PROV: record.fields.COD_PROV
                }
            });

            const map_orden = {
                ID: orden.id,
                CODIGO: orden.fields.CODIGO,
                PROVEEDOR: orden.fields.PROVEEDOR_TMP,
                TELEFONO_PROV: orden.fields.TELEFONO_PROV,
                RUC_PROV: orden.fields.RUC_PROV,
                DIRECCION_PROV: orden.fields.DIRECCION_PROV,
                CORREO_PROV: orden.fields.CORREO_PROV,
                FECHA_EMISION: orden.fields.FECHA_EMISION,
                INSUMOS: map_insumos,
                SUBTOTAL: orden.fields.SUBTOTAL,
                IVA: orden.fields.IVA,
                TOTAL: orden.fields.TOTAL,
                TIPO: orden.fields.TIPO_PEDIDO && orden.fields.TIPO_PEDIDO.length > 0 ? orden.fields.TIPO_PEDIDO[0] : undefined,
                COMENTARIOS: orden.fields.COMENTARIOS,
                RESPONSABLE_SUBPROYECTO: orden.fields.RESPONSABLE_SUBPROYECTO,

            }
    
            return res.status(200).send(map_orden);
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    },
    getPedidosBySolicitante: async function(req, res){
        try {
            const solicitante = req.body.SOLICITANTE;
            const estado = 'REVISION';

            const pedidos = await baseBodega('PEDIDOS').select({
                filterByFormula: `AND({SOLICITANTE} = "${solicitante}", {ESTADO_APROBACION} = "${estado}")`
            }).all();

            const map_pedidos = pedidos.map(record => {
                return {
                    ID: record.id,
                    PEDIDO: record.fields.PEDIDO,
                }
            });

            return res.status(200).send(map_pedidos);
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    },
    updatePedido: async function(req, res){
        try {

            const insAdi = req.body.insAdi;
            const pedidoId = req.body.pedidoId;

            await baseBodega('PEDIDOS').update(pedidoId,{
                ESTADO_APROBACION: 'PENDIENTE'
            });

            for (const insumo of insAdi) {
                await baseBodega('INSUMOS_PEDIDOS').update(insumo.ID, {
                    CANTIDAD: insumo.CANTIDAD
                });
            }
            
            return res.status(200).send({message: "Pedido actualizado"});
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    },
    CrearOrdenesCompra: async function(req, res){
        try {
            const ordenes = req.body.ordenes;
            const insumos = req.body.insumos;

            return res.status(200).send({message: "Ordenes de compra creadas"});
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    },
    updateOrdenCompra: async function(req, res){
        try {
            const ordenId = req.params.id;

            const proveedorRecords = await baseCompras('PROVEEDORES').select({
                filterByFormula: `{PROVEEDOR} = 'SUMELEC'`
            }).firstPage();

            const proveedor = proveedorRecords[0].id;

            await baseCompras('ORDEN_COMPRA').update(ordenId, {
                PROVEEDOR: [proveedor]
            });

            return res.status(200).send({message: "Orden de compra actualizada"});
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    },
    getPedidoOC: async function(req, res){
        try {
            const id = req.params.id;
            const pedido = await baseCompras('PEDIDOS').find(id);

            const insumos = await baseCompras('INSUMOS').select({
                filterByFormula: `{PEDIDOS} = "${pedido.fields.PEDIDO}"`
            }).all();

            const map_insumos = insumos.map(record => {
                return {
                    ID: record.id,
                    DESCRIPCION: record.fields.DESCRIPCION,
                    CANTIDAD: record.fields.COMPRA,
                    PVP: record.fields.PVP,
                    PRECIO_TOTAL: record.fields.PRECIO_TOTAL,
                    COD_PROV: record.fields.COD_PROV,
                    PROVEEDOR: record.fields.PROVEEDOR
                }
            });

            const pedido_send = {
                ID: pedido.id,
                PEDIDO: pedido.fields.PEDIDO,
                NOMBRE_PRY: pedido.fields.NOMBRE_PRY,
                PROYECTO: pedido.fields.PROYECTOS,
                SUBPROYECTO: pedido.fields.SUBPROYECTO,
                OP: pedido.fields.OP,
                INSUMOS: map_insumos,
                TIPO: pedido.fields.TIPO,
                SOLICITANTE: pedido.fields.SOLICITANTE,
            }

            return res.status(200).send(pedido_send);
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }      
    }
}

module.exports = controller;