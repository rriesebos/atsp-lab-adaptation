const express = require('express');
var http = require('http');
var crypto = require('crypto');
var cdnEnabler = require('./1-cdn-enabler');
var urlFilter = require('./2-cdn-urlfilter');
var headerFilter = require('./3-cdn-headerfilter');
var keyGenerator = require('./4-cdn-key-generator');

const app = express();
const port = 3001;
const cors = require('cors');
const cacheValidTime = 15 * 60; // 15 minutes

app.use(cors());
app.use(express.urlencoded());
app.use(express.json());
app.set('etag', false);
//app.use(cors({ origin: '*' }))

var cache = {};

function shouldRequestBeCached(request, response) {
    return cdnEnabler.isCachingEnabled()
        && urlFilter.filterShouldURLBeCached(request.url)
        && headerFilter.filterShouldHeadersBeCached(response.headers);
}

app.all('/*', function(request, response) {
    if(request.url === "/clear") {
        console.log("Cache is being cleared!");
        cache = {};
        response.json({
            success: true
        });
        return;
    }

    const options = getOptions(request);

    if(sendCachedResponse(request, options, response)) {
        console.log("URL served from CDN Cache: " + request.url);
        return;
    }

    console.log("Forwarding URL: " + request.url + " to: " + options.host + ":" + options.port + options.path);
    const proxiedRequest = forwardRequest(request, options, response);

    // Terminate the current request
    proxiedRequest.end();
})

function getOptions(request) {
    if(request.url === "/")
        request.url = "/index.html";

    if(!request.url.startsWith("/api"))
        request.url = '/user-portal' + request.url;

    requestHeaders = {
        host: 'localhost',
        connection: 'close',
        'cache-control': 'no-cache',
        origin: 'http://localhost',
        pragma: 'no-cache'
    };
    if(request.headers.hasOwnProperty("content-length"))
        requestHeaders['content-length'] = request.headers["content-length"];
    if(request.headers.hasOwnProperty("user-agent"))
        requestHeaders['user-agent'] = request.headers["user-agent"];
    if(request.headers.hasOwnProperty("content-type"))
        requestHeaders['content-type'] = request.headers["content-type"];
    if(request.headers.hasOwnProperty("accept"))
        requestHeaders['accept'] = request.headers["accept"];
    if(request.headers.hasOwnProperty("accept-encoding"))
        requestHeaders['accept-encoding'] = request.headers["accept-encoding"];
    if(request.headers.hasOwnProperty("accept-language"))
        requestHeaders['accept-language'] = request.headers["accept-language"];
    if(request.headers.hasOwnProperty("cookie"))
        requestHeaders['cookie'] = request.headers["cookie"];
    if(request.headers.hasOwnProperty("background-color")) {
        requestHeaders['background-color'] = request.headers["background-color"];;
    }

    return {
        // host to forward to
        host: 'front-end',
        // port to forward to
        port: 80,
        // path to forward to
        path: request.url,
        // request method
        method: request.method,
        headers: requestHeaders
    };
}

function forwardRequest(request, options, response) {
    var serverRequest = http
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
            output = '';
            proxiedResponse.on('data', chunk => {
                response.write(chunk);
                output += chunk;
            });

            proxiedResponse.on('close', () => {
                // closed, let's end client request as well
                response.end();
            });

            proxiedResponse.on('end', () => {
                // finished, let's finish client request as well
                response.end();

                // Cache the request if required
                if(shouldRequestBeCached(request, proxiedResponse)) {
                    // Cache the request
                    cacheRequest(request.url, proxiedResponse.headers, options.headers, output);
                }

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

    // If post request, post the data now
    if(request.hasOwnProperty("body"))
        serverRequest.write(JSON.stringify(request.body));

    // The CDN always returns that the browser may not cache, for demonstration purposes
    response.set('Cache-Control', 'no-store');

    return serverRequest;
}

function cacheRequest(url, headers, requestHeaders,body) {
    cachekey = keyGenerator.getCacheKey(url, requestHeaders);
    if (requestHeaders.hasOwnProperty('background-color')) {
        //key = key+requestHeaders['background-color'];
    }
    console.log("Response is being cached: " + cachekey);
    cache[cachekey] = {
        createdTimestamp: Date.now(),
        headers: headers,
        body: body
    };
}

function sendCachedResponse(request, options, response) {
    cachekey = keyGenerator.getCacheKey(request.url, options.headers);
    if (options.headers.hasOwnProperty('background-color')) {
        //key = key+requestHeaders['background-color'];
    }
    if(!cache.hasOwnProperty(cachekey))
        return false;
    cachedObj = cache[cachekey];

    // Check if cache still valid
    if(Date.now() - cachedObj.createdTimestamp > cacheValidTime * 1000) {
        // Cache is present, but expired!
        delete cache[cachekey];
        return false;
    }

    // Cache is valid, now sending response
    // Sending headers
    for(var key in cachedObj.headers) {
        if(cachedObj.headers.hasOwnProperty(key)) {
            response.header(key, cachedObj.headers[key]);
        }
    }

    // Send data
    response.write(cachedObj.body);

    // Close
    response.end();
    return true;
}

app.listen(port, () => console.log(`CDN running on port ${port}`))