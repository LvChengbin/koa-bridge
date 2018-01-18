const Koa = require( 'koa' );
const Router = require( '@lvchengbin/koa-router' );
const bridge = require( '../index' );
const body = require( 'koa-bodyparser' );

const app = new Koa();
const router = new Router( app );


app.use( body( {
    enableTypes : [ 'form', 'json', 'text' ]
} ) );


router.any( '*', '/b1', async ctx => {
    return bridge( ctx );
} );

router.any( '*', '/dest', async ctx => {
    ctx.set( 'x-bridge-response', 'yes' );
    ctx.cookies.set( 'v3', 3 );
    ctx.body = {
        method : ctx.method,
        x : ctx.query.x,
        y : ctx.query.y,
        v1 : ctx.cookies.get( 'v1' )
    };
} );

router.any( '*', '/d2', async ctx => {
    ctx.set( 'x-bridge-response', 'yes' );
    ctx.cookies.set( 'v3', 3 );
    ctx.body = {
        method : ctx.method,
        x : ctx.query.x,
        y : ctx.query.y,
        v1 : ctx.cookies.get( 'v1' ),
        f1 : ctx.request.body.f1 || ctx.request.body,
        ct : ctx.request.headers[ 'content-type' ]
    };
} );

router.any( '*', '/b2', async ctx => {
    await bridge( ctx, {
        dest : ctx.query.dest
    } );
} )

module.exports = app;
