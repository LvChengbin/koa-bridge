const { URL } = require( 'url' );
const qs = require( 'querystring' );
const request = require( 'request-promise-native' );
const cookie = require( 'cookie' );
const is = require( '@lvchengbin/is' );
const parser = require( './lib/body' );
const types = require( './lib/types' );

async function bridge( ctx, opt = {} ) {
    const response = await bridge.request( ctx, opt );
    return bridge.response( ctx, response ).then( () => response );
}

bridge.request = async ( ctx, opt = {} ) => {
    let uri = '', ouri;

    const dest = opt.dest || null;

    let body = ctx.request.body || await parser( ctx );

    if( dest ) {
        uri = dest ;
        if( opt.keepPath ) {
            uri = dest + ctx.request.path;
        }
        uri += '?' + ctx.request.querystring;
    } else {
        ouri = opt.ouri || '__ouri__';

        if( ctx.method === 'POST' ) {
            uri = body.ouri;
        }

        if( !uri ) {
            uri = ctx.query[ ouri ];
        }
    }

    uri = new URL( uri );

    let headers = Object.assign( {}, ctx.request.headers, {
        host : uri.host
    } );

    if( is.function( opt.headers ) ) {
        headers = opt.headers( headers, ctx );
    } else {
        Object.assign( headers, opt.headers || {} );
    }

    let params = qs.parse( uri.search.substr( 1 ) );
    
    if( ouri ) {
        delete params[ ouri ];
    }

    if( is.function( opt.params ) ) {
        params = opt.params( params, ctx );
    } else {
        Object.assign( params, opt.params || {} );
    }

    uri.search = qs.stringify( params );

    let jar = headers.cookie ? cookie.parse( headers.cookie ) : {};

    if( is.function( opt.cookies ) ) {
        jar = opt.cookies( jar, ctx );
    } else {
        Object.assign( jar, opt.cookies || {} );
    }

    const cookies = [];

    for( let name in jar ) {
        cookies.push( cookie.serialize( name, jar[ name ] ) );
    }
    headers.cookie = cookies.join( '; ' );

    let resolveWithFullResponse = true;

    if( opt.fullResponse === false ) {
        resolveWithFullResponse = false;
    }

    if( ctx.method === 'GET' || ctx.method === 'HEAD' ) {
        return request( {
            method : ctx.method,
            uri : uri.href,
            headers,
            resolveWithFullResponse
        } );
    }

    const ct = headers[ 'content-type' ] || 'application/json';

    let type = 'json';

    for( let item in types ) {
        if( types[ item ].indexOf( ct ) > -1 ) {
            type = item;
            break;
        }
    }

    /**
     * remove the "content-length" in header, or something will 
     */
    delete( headers[ 'content-length' ] );

    if( is.function( opt.body ) ) {
        body = opt.body( body, ctx );
    } else {
        // if the type of request body is text/plain
        if( is.string( opt.body ) ) {
            body = opt.body;
        } else {
            Object.assign( body, opt.body || {} );
        }
    }

    const options = { 
        method : ctx.method,
        uri : uri.href,
        headers,
        resolveWithFullResponse
    };

    switch( type ) {
        case 'form' :
            options.body = qs.stringify( body );
            break;
        case 'text' :
            options.body = body;
            break;
        case 'json' :
        default :
            /**
             * remove the "content-type" in header, because the "request" will add header according to the way the request being sent.
             */
            delete( headers[ 'content-type' ] );
            options.body = body;
            options.json = true;
            break;
    }

    return request( options );
};

bridge.response = ( ctx, response ) => {
    for( let attr in response.headers ) {
        ctx.set( attr, response.headers[ attr ] );
    }
    ctx.body = response.body;
    return Promise.resolve();
};

module.exports = bridge;
