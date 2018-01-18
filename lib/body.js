const parse = require( 'co-body' );
const types = require( './types' );
const asyncBusboy = require( 'async-busboy' );

async function body( ctx ) {
    if( ctx.request.is( types.json ) ) {
        return await parse.json( ctx );
    }

    if( ctx.request.is( types.form ) ) {
        return await parse.form( ctx );
    }

    if( ctx.request.is( types.text ) ) {
        return await parse.text( ctx ) || '';
    }

    if( ctx.request.is( types.multipart ) ) {
        return await asyncBusboy( ctx.req );
    }

    return {};
}

module.exports = body;
