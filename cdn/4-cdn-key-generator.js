module.exports = {
    // PART 4: Here you have to fix the Web Cache Poisoning vulnerability.
    // This is the function that our CDN uses to create the cache-key.
    // As can be seen, it returns just the URL right now. This means that the header
    // 'background-color' is an unkeyed header. Can you fix it?

    //Hint: to see if a specific header is present, you can use requestHeaders.hasOwnProperty('HEADERNAME')
    //To access this value, you can use requestHeaders['HEADERNAME']
    getCacheKey: function(url, requestHeaders) {
        key = url;
        return key;
    }
}