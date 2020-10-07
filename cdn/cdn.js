const express = require('express')
var http = require('http')

const app = express();
const port = 3001;
const cors = require('cors');

app.use(cors());
//app.use(cors({ origin: '*' }))

function getOptions(request) {
    if(request.url === "/")
        request.url = "/index.html";

    if(!request.url.startsWith("/api"))
        request.url = '/user-portal' + request.url;

    return {
        // host to forward to
        host: 'front-end',
        // port to forward to
        port: 80,
        // path to forward to
        path: request.url,
        // request method
        method: request.method,
        // headers to send
        headers: request.headers,
    };
}

function forwardRequest(options, response) {
    return http
        .request(options, proxiedResponse => {
            // set encoding
            proxiedResponse.setEncoding('utf8');

            // set headers based on proxied response
            for(var key in proxiedResponse.headers) {
                if(proxiedResponse.headers.hasOwnProperty(key)) {
                    response.header(key, proxiedResponse.headers[key]);
                }
            }

            // wait for data
            proxiedResponse.on('data', chunk => {
                response.write(chunk);
            });

            proxiedResponse.on('close', () => {
                // closed, let's end client request as well
                response.end();
            });

            proxiedResponse.on('end', () => {
                // finished, let's finish client request as well
                response.end();
            });
        })
        .on('error', e => {
            // we got an error
            console.log(e.message);
            try {
                // attempt to set error message and http status
                response.writeHead(500);
                response.write(e.message);
            } catch (e) {
                // ignore
            }
            response.end();
        });
}

app.all('/*', function(request, response) {
    const options = getOptions(request);

    console.log("Forwarding URL: " + request.url + " to: " + options.host + ":" + options.port + options.path);

    const proxiedRequest = forwardRequest(options, response);

    // Terminate the current request
    proxiedRequest.end();
})

app.listen(port, () => console.log(`CDN running on port ${port}`))