const express = require('express');
var http = require('http');
var crypto = require('crypto');

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

// PART 1: This function is used to turn the general caching mechanism for the CDN on/off
function isCachingEnabled() {
    return false;
}

// PART 2: This function should return true/false, based on whether some URL requires caching or not
function filterShouldURLBeCached(url) {
    // Here, a list of extensions should be specified as an array of strings
    // When at least one of them is present at the trail of the URL, caching will be enabled.
    // Note: the empty string acts as a wildcard -- cache everything!
    const whitelist = [""];

    for(i = 0; i < whitelist.length; i++) {
        extension = whitelist[i];
        if(url.endsWith(extension))
            return true;
    }

    // CDN has not found a cachable extension, so do not cache this request!
    return false;
}

// PART 3: This function should return true/false, based on whether a request should be cached using the RESPONSE headers.
// For example, argument can take the form of:
// {
//     server: 'nginx/1.18.0',
//     date: 'Fri, 09 Oct 2020 11:28:37 GMT',
//     'content-type': 'text/html',
//     'content-length': '4208',
//     'last-modified': 'Fri, 09 Oct 2020 09:06:02 GMT',
//     connection: 'close',
//     etag: '"5f8027fa-1070"',
//     'accept-ranges': 'bytes'
// }
function filterShouldHeadersBeCached(headers) {
    // Here, a mapping of `string header -> arr(string) whitelistedvalues` should be specified as an array of strings
    // When at least one of them is present in the specified type of header, it means the response should be cached.
    // Note: the empty string acts as a wildcard -- cache everything!

    const headerWhitelist = {
        "content-type": [""]
    };

    // Works as an OR, one match is enough to enable caching
    for(var headerKey in headerWhitelist) {
        var whitelistedValuesForHeaderKey = headerWhitelist[headerKey];

        // Loop over all possible whitelist-values, to see if one of them matches
        for(i = 0; i < whitelistedValuesForHeaderKey.length; i++) {
            whitelistedValue = whitelistedValuesForHeaderKey[i];
            if(headers.hasOwnProperty(headerKey) && headers[headerKey].includes(whitelistedValue))
                return true;
        }
    }

    // CDN has not found a whitelisted header value, so do not cache this response!
    return false;
}

function shouldRequestBeCached(request, response) {
    return isCachingEnabled()
        && filterShouldURLBeCached(request.url)
        && filterShouldHeadersBeCached(response.headers);
}

app.all('/*', function(request, response) {
    const options = getOptions(request);

    if(sendCachedResponse(request, response)) {
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
                    cacheRequest(request.url, proxiedResponse.headers, output);
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

function cacheRequest(url, headers, body) {
    console.log("Response is being cached: " + url);
    cache[url] = {
        createdTimestamp: Date.now(),
        headers: headers,
        body: body
    };
}

function sendCachedResponse(request, response) {
    if(!cache.hasOwnProperty(request.url))
        return false;
    cachedObj = cache[request.url];

    // Check if cache still valid
    if(Date.now() - cachedObj.createdTimestamp > cacheValidTime * 1000) {
        // Cache is present, but expired!
        delete cache[request.url];
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