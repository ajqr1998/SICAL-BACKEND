'use strict'

const Airtable = require('airtable');//importar la libreria de airtable
Airtable.configure({
    apiKey: process.env.AIRTABLE_API_KEY//configurar la api key de airtable
});

const baseBodega = Airtable.base(process.env.AIRTABLE_BASE_ID_BODEGA);
const baseProyectos = Airtable.base(process.env.AIRTABLE_BASE_ID_PROYECTOS);
const baseProductos = Airtable.base(process.env.AIRTABLE_BASE_ID_PRODUCTOS);
const baseCompras = Airtable.base(process.env.AIRTABLE_BASE_ID_COMPRAS);

var controller = {
    home: function(req, res){
        return res.status(200).send("<h1>Hola desde el controllador</h1>" + " <h2>Esto es el home</h2>");
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
            const filterFormula = `FIND('${COD_BASE_PRY}', {COD_BASE_PRY})`;
            const ins_cot = await baseBodega('INSUMOS_COT').select({
                filterByFormula: filterFormula
            }).all();
            const map_ins_cot = ins_cot.map(record => {
                return {
                    id: record.id,
                    fields: record.fields
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
            const proveedores = await baseProductos('PROVEEDORES').select().all();
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
                const record = await baseProductos('INSUMOS').create({
                    DESCRIPCION: insumo.fields.DESCRIPCION,
                    NUEVO: true,
                });
                return {
                    id: record.id,
                    cantidad: insumo.fields.COMPRA
                };
            }));

            

            // Crear el pedido
            const createdPedido = await baseBodega('PEDIDOS').create(pedidoData);
            console.log(createdPedido.id);

            // Crear insumos de cotización
            for (const insumo of insumosCotizacion) {
                await baseBodega('INSUMOS_COT_PEDIDO').create({
                    ...insumo.fields,
                    PEDIDO: [createdPedido.id]
                });
            };

            // Crear insumos adicionales
            for (const insumo of insumosAdicionales) {
                await baseBodega('INSUMOS_ADICIONAL').create({
                    ...insumo.fields,
                    PEDIDO: [createdPedido.id] // Relacionar con el pedido creado
                });
            };

            const insNuevosBodega = await Promise.all(insNuevosProductos.map(async (insumo) => {
                let record = undefined;
                while(record === undefined){
                    const records = await baseBodega('INSUMOS').select({
                        filterByFormula: `{RECORD_ID_PRODUCTOS} = "${insumo.id}"`
                    }).all();
                    if (records.length > 0) {
                        record = records[0];
                    } else {
                        record = undefined;
                    }
                }
                return {
                    id: record.id,
                    cantidad: insumo.cantidad
                };
            }));

            //Crear insumos adicionales (insumos que son nuevos)
            for (const insumo of insNuevosBodega) {
                await baseBodega('INSUMOS_ADICIONAL').create({
                    INSUMO: [insumo.id],
                    CANTIDAD: insumo.cantidad,
                    PEDIDO: [createdPedido.id] // Relacionar con el pedido creado
                });
            };
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

            const ins_cot = await baseBodega('INSUMOS_COT_PEDIDO').select({
                filterByFormula: `{PEDIDO} = "${pedido.fields.PEDIDO}"`
            }).all();

            const map_ins_cot = ins_cot.map(record => {
                return {
                    ID: record.id,
                    DESCRIPCION: record.fields.DESCRIPCION,
                    CANTIDAD: record.fields.CANT_ESP,
                    COD_PROV: record.fields.COD_PROV,
                }
            });


            const ins_adi = await baseBodega('INSUMOS_ADICIONAL').select({
                filterByFormula: `{PEDIDO} = "${pedido.fields.PEDIDO}"`
            }).all();

            const map_ins_adi = ins_adi.map(record => {
                return {
                    ID: record.id,
                    DESCRIPCION: record.fields.DESCRIPCION,
                    CANTIDAD: record.fields.CANTIDAD,
                    COD_PROV: record.fields.COD_PROV,
                }
            });

            const pedido_send = {
                ID: pedido.id,
                SUBPROYECTO: pedido.fields.SUBPROYECTO,
                PROYECTO: pedido.fields.PROYECTOS,
                OP: pedido.fields.OP,
                PEDIDO: pedido.fields.PEDIDO,
                INS_COT: map_ins_cot,
                INS_ADI: map_ins_adi,
                FECHA_PEDIDO: pedido.fields.FECHA_PEDIDO,
                TIPO: pedido.fields.TIPO,
                SOLICITANTE_VALUE: pedido.fields.SOLICITANTE_VALUE,
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
                CODIGO: orden.fields.COD_BASE_PRY,
                PROVEEDOR: orden.fields.PROVEEDOR,
                FECHA: orden.fields.CRATED,
                INSUMOS: map_insumos,
                SUBTOTAL: orden.fields.SUBTOTAL,
                IVA: orden.fields.IVA,
                TOTAL: orden.fields.TOTAL,
                TIPO: orden.fields.TIPO,
                COMENTARIOS: orden.fields.COMENTARIOS,
                RESPONSABLE_SUBPROYECTO: orden.fields.RESPONSABLE_SUBPROYECTO,
            }
    
            return res.status(200).send(map_orden);
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    },
    getPedidoByCodigo: async function(req, res){
        try {
            const codigo = req.body.CODIGO;
            console.log(codigo);
            const orden = await baseBodega('PEDIDOS').select({
                filterByFormula: `{PEDIDO} = "${codigo}"`
            }).all();

            if (orden.length === 0) {
                return res.status(404).send({error: "Pedido no encontrado"});
            }

            console.log(orden);

            const pedidoId = orden[0].id;
            return res.status(200).send({ID: pedidoId});
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    },
    updatePedido: async function(req, res){
        try {

            const insCot = req.body.insCot;
            const insAdi = req.body.insAdi;

            for (const insumo of insCot) {
                await baseBodega('INSUMOS_COT_PEDIDO').update(insumo.ID, {
                    CANT_ESP: insumo.CANTIDAD
                });
            }

            for (const insumo of insAdi) {
                await baseBodega('INSUMOS_ADICIONAL').update(insumo.ID, {
                    CANTIDAD: insumo.CANTIDAD
                });
            }
            
            return res.status(200).send({message: "Pedido actualizado"});
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    }
}

module.exports = controller;