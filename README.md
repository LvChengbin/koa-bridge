# koa-bridge

A simple repeater for Koa for forwarding requests, from client, to another service (or api) with the same request method and headers, queries, body from the client, and response the data, from another server, to client.

## Installation

```js
$ npm i @lvchengbin/koa-bridge --save
```

## Examples

### bridge

```js
const Koa = require( 'koa' );
const request = require( 'request' );
const router = require( '@lvchengbin/koa-router' );
const bridge = require( '@lvchengbin/koa-bridge' );

const app = new Koa();

router.any( '*', '/bridge', async ctx => {
    return bridge( ctx, {
        dest : 'http://127.0.0.1:3000/dest'
    } )
} );

router.any( '*', '/dest', async ctx => {
    ctx.set( 'x-bridge-response', 'yes' );
    ctx.cookies.set( 'n', '1' );
    ctx.body = 'the dest service';
} );


app.listen( 3000 );

request( {
    method : 'POST',
    uri : 'http://127.0.0.1:3000/bridge?==1&y=2'
    headers : {
        cookie : 'name=value; n=v',
        'x-bridge-request' : 'yes'
    },
    body : {
        name : 'bridge'
    },
    json : true
} );
```
In the code above, the `request` method send a `POST` request to `http://127.0.0.1:3000/bridge?==1&y=2` with some `headers` and its `body` as the `content-type` is 'application/json'.
The `bridge` will send the request with taking all properties along to `http://127.0.0.1:3000/dest`, and respond with all data, includes headers, body, from the dest service.

> For `POST` request, `bridge` support forwarding `json`, `urlencoded` and `plain`, request with other type will be taken as `application/json`.

You can specify a field in request body or params as the dest url, default by `__ouri__`, for example:

```js
router.any( '*', '/bridge', async ctx => {
    return bridge( ctx, {
        ouri : '__ouri__'
    } )
} );

request( {
    method : 'GET',
    uri : 'http://127.0.0.1:3000/bridge?==1&y=2&__ouri__=http%3A%2F%2F127.0.0.1%3A3000%2Fdest'
} );
```


You can add some properties before `bridge` send the request to the dest api:

 - headers | `Object` or `Function`
    
    The headers you want to add to the request, if the value is a `Function`, headers will be replaced by the returned value of the function.

 - cookies | `Object` or `Function`
    
    Cookies that you want to add to the request, if the value is a `Function`, all cookies will be replaced by the returned value of the function.

 - body | `Object` or `Function`
 
    The data that you want to add to request body if the request can handle a body ( such as `POST` and `PUT` ). If the value is a `Function`, the return value of the function will overwrite the original body.

 - params | `Object` or `Function`

    Params that you want to add for the request.

```js
router.any( '*', '/bridge', async ctx => {
    return bridge( ctx, {
        headers : {
            'x-custom-header' : 'value'
        },
        cookies : {
            name : 'value'
        },
        body : {
            name : 'value'
        },
        params : {
            name : 'value'
        }
    } );
} );
```
### bridge.request & bridge.response

`bridge.request` and `bridge.response` will support more flexibility.

```js
router.any( '*', '/bridge', async ctx => {
    const response = await bridge.request( ctx, {
        ouri : '__ouri__'
    } );

    ctx.set( 'x-custom-header', 'xxx' );
    return bridge.response( response );
} );
```

