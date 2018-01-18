const https = require( 'https' );
const app = require( './app' );

const request = require( 'supertest' );

const address = ( listen => {
    let port;
    let protocol;

    port = listen.address().port;
    protocol = listen instanceof https.Server ? 'https' : 'http';
    return protocol + '://127.0.0.1:' + port;
} );

describe( 'bridge', () => {
    it( 'Should have returned the response of the dest api set in __ouri__', done => {
        const listen = app.listen();
        request( listen )
            .get( '/b1?__ouri__=' + encodeURIComponent( address( listen ) + '/dest?x=xxx&y=yyy' ) )
            .set( 'x-test-header', 'bridge' )
            .set( 'cookie', 'v1=1; v2=2' )
            .expect( 200 )
            .expect( 'x-bridge-response', 'yes' )
            .expect( 'set-cookie', 'v3=3; path=/; httponly' )
            .expect( {
                method : 'GET',
                x : 'xxx',
                y : 'yyy',
                v1 : 1
            } ).end( err => err ? done.fail( err ) : done() );
    } );

    it( 'Should support setting dest api with "dest"', done => {
        const listen = app.listen();
        const dest = encodeURIComponent( address( listen ) ) + '/dest';

        request( listen )
            .get( '/b2?x=1&y=2&dest=' + dest )
            .expect( 200 )
            .expect( {
                method : 'GET',
                x : 1,
                y : 2
            } ).end( err => err ? done.fail( err ) : done() );
    } );

    it( 'Working under POST request with "content-type" is "application/json"', done => {
        const listen = app.listen();
        request( listen )
            .post( '/b1?__ouri__=' + encodeURIComponent( address( listen ) + '/d2?x=xxx&y=yyy' ) )
            .set( 'x-test-header', 'bridge' )
            .set( 'cookie', 'v1=1; v2=2' )
            .send( { f1 : 'v1' } )
            .expect( 200 )
            .expect( 'x-bridge-response', 'yes' )
            .expect( 'set-cookie', 'v3=3; path=/; httponly' )
            .expect( {
                method : 'POST',
                x : 'xxx',
                y : 'yyy',
                v1 : 1,
                f1 : 'v1',
                ct : 'application/json'
            } ).end( err => err ? done.fail( err ) : done() );
    } );

    it( 'Working under POST request with "content-type" is "application/x-www-form-urlencoded"', done => {
        const listen = app.listen();
        request( listen )
            .post( '/b1?__ouri__=' + encodeURIComponent( address( listen ) + '/d2?x=xxx&y=yyy' ) )
            .set( 'x-test-header', 'bridge' )
            .set( 'cookie', 'v1=1; v2=2' )
            .type( 'form' )
            .send( { f1 : 'v1' } )
            .expect( 200 )
            .expect( 'x-bridge-response', 'yes' )
            .expect( 'set-cookie', 'v3=3; path=/; httponly' )
            .expect( {
                method : 'POST',
                x : 'xxx',
                y : 'yyy',
                v1 : 1,
                f1 : 'v1',
                ct : 'application/x-www-form-urlencoded'
            } ).end( err => err ? done.fail( err ) : done() );
    } );

    it( 'Working under POST request with "content-type" is "text/plain"', done => {
        const listen = app.listen();
        request( listen )
            .post( '/b1?__ouri__=' + encodeURIComponent( address( listen ) + '/d2?x=xxx&y=yyy' ) )
            .set( 'x-test-header', 'bridge' )
            .set( 'cookie', 'v1=1; v2=2' )
            .type( 'text' )
            .send( 'string' )
            .expect( 200 )
            .expect( 'x-bridge-response', 'yes' )
            .expect( 'set-cookie', 'v3=3; path=/; httponly' )
            .expect( {
                method : 'POST',
                x : 'xxx',
                y : 'yyy',
                v1 : 1,
                f1 : 'string',
                ct : 'text/plain'
            } ).end( err => err ? done.fail( err ) : done() );
    } );
} );
