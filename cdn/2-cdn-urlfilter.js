module.exports = {
    // PART 2: This function should return true/false, based on whether some URL requires caching or not
    filterShouldURLBeCached:
        function (url) {
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
}