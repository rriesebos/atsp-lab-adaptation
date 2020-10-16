module.exports = {
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
    filterShouldHeadersBeCached: function (headers) {
        // Here, a mapping of `string header -> arr(string) whitelistedvalues` should be specified as an array of strings
        // When at least one of them is present in the specified type of header, it means the response should be cached.
        // Note: the empty string acts as a wildcard -- cache everything!

        const headerWhitelist = {
            "content-type": ["text/css", "application/javascript", "image/jpeg", "image/png", "text/html"]
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
}