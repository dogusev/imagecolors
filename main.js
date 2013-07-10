var im = require('imagemagick');

// exported module
module.exports = {

    /**
     * extract the top 24 colors of an image file
     *
     * Usage:
     *
     * var colormatch = require('colormatch');
     * var colors = colormatch.extract('photo.jpg', function(err, data){
     *     if (!err){
     *         console.log(data);
     *     }
     * });
     *
     * @param [String] image
     * @param [Function] callback
     */
    extract: function(image, callback){

        // call imagemagick
        im.convert(
            [src, '+dither', '-colors', 24, '-depth', 8, '-format', '#%c"', 'histogram:info:'],
            function(err, stdout){
                if (err){

                    // imagemagick error
                    callback(err, undefined);

                } else {

                    // clean up histogram
                    var histogram = stdout.trim().replace(/^[^\s]+(.*)[^\s]+$/m, '$1').split('\n').pop();

                    // read unique colors
                    var colors = [];
                    var total = 0;
                    histogram.forEach(function(colordata){

                        // imagemagick color output
                        var colordata = colordata.replace(/\s+/g, '');
                        var match = /(\d+):\(([\d,]+)\)#([A-F0-9]+)srgb\(([\d,]+)/.exec(colordata);
                        if (!match){

                            // imagemagick black output (gets handled differently)
                            match = /(\d+):\(([\d,]+)\)#(000000)(bl)/.exec(colordata);
                            if (match){
                                match[2] = '0,0,0';
                            }

                        }

                        // push colors
                        if (match){
                            var count = parseInt(match[1], 10);
                            colors.push({
                                hex     : match[3],
                                rgb     : match[2].split(',').map(function(x){return parseInt(x)}),
                                count   : count
                            });
                            total += count;
                        }

                    });

                    // calculate pixel percentage
                    colors.forEach(function(color){
                        color.percentage = Math.round(((color.count/total)*100)*100)/100;
                    });

                    // done
                    callback(undefined, colors);

                }
            }
        );

    }
};
