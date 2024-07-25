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

            // Crear insumos nuevos
            for (const insumo of insumosNuevos) {
                await baseBodega('INSUMOS_NUEVOS').create({
                    ...insumo.fields,
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
            console.log(id);

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

            const ins_new = await baseBodega('INSUMOS_NUEVOS').select({
                filterByFormula: `{PEDIDO} = "${pedido.fields.PEDIDO}"`
            }).all();

            const map_ins_new = ins_new.map(record => {
                return {
                    ID: record.id,
                    DESCRIPCION: record.fields.DESCRIPCION,
                    CANTIDAD: record.fields.COMPRA,
                    PROVEEDOR: record.fields.PROVEEDOR,
                    MODELO: record.fields.MODELO,
                    MARCA: record.fields.MARCA,
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
                INS_NEW: map_ins_new,
                INS_ADI: map_ins_adi,
                FECHA_PEDIDO: pedido.fields.FECHA_PEDIDO,
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
            console.log(id);

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
                }
            });

            const map_orden = {
                ID: orden.id,
                CODIGO: orden.fields.COD_BASE_PRY,
                PROVEEDOR: orden.fields.PROVEEDOR,
                FECHA: orden.fields.CRATED,
                INSUMOS: map_insumos,
                TOTAL: orden.fields.TOTAL
            }
    
            return res.status(200).send(map_orden);
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error.message});
        }
    }
}

module.exports = controller;