var fs = require('fs');
var path = require('path');
var mbgl = require('@mapbox/mapbox-gl-native');
var sharp = require('sharp');
const express = require('express');
const PNG = require('pngjs').PNG;
const imageConversion = require("image-conversion")
var stream = require('stream');


const app = express();


var options = {
    request: function(req, callback) {
        fs.readFile(path.join(__dirname, 'test', req.url), function(err, data) {
            callback(err, { data: data });
        });
    },
    ratio: 1
};

var map = new mbgl.Map(options);

map.load(require('./node_modules/test/fixtures/style.json'));
function getImage(callback) {
    // console.log(map.)
    // return map.getAsFile()
    // map.render()
    map.render({zoom: 0, width: 512, height: 512, channels: 4}, function (err, buffer) {
        if (err) throw err;

        // console.log()
        // map.release();

        var image = sharp(buffer, {
            raw: {
                width: 512,
                height: 512,
                channels: 4
            }
        })
        //callback(buffer)

        // Convert raw image buffer to PNG
        image.toFile('image.png', function (err) {
            if (err) throw err;
        });



        // console.log(image.toFormat('png'))
        // callback(buffer);
        // return buffer;
    });
}
// function toBase64(arr) {
//   //arr = new Uint8Array(arr) if it's an ArrayBuffer
//   return btoa(
//       arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
//   );
// }


// function printImageBuffer(buffer) {
//   try {
//     var png = PNG.sync.read(buffer);
//     let buff = this.printer.printImageBuffer(png.width, png.height, png.data);
//     this.append(buff);
//     return buff;
//   } catch(error) {
//     throw error;
//   }
// }

app.get('/', (req, res) => {
    getImage(function(buffer){
        //res.contentType('image/png')
        res.set('Content-Type', `image/png`)
        //res.header('Access-Control-Allow-Origin', '*');
        //res.type('application/octet-stream');

        // res.writeHead(200, {'Content-Type': 'image/png' });
        // res.end(buffer, 'binary');
        // console.log(buffer.toString('base64'))
        // var encodedBuffer = buffer.toString('base64');
        //const buff = Buffer.from(buffer, "base64");
        //console.log(buffer.constructor.name)
        //console.log(typeof (buffer))


        // if (buffer instanceof object) {
        //   console.log('obj')
        // }
        // const bufferImage = require("buffer-image");

        // (async () => {
        //   const image = await bufferImage(Buffer.from(buffer));

        // const result = await bufferImage.from(image)
        // console.log(result.toString())
        //=> "Hello World"
        // res.send(image);
        // })()

        // res.write(buffer,'binary');
        // res.end(null, 'binary');

        // var fileContents = Buffer.from(buffer, "base64");
        // console.log(fileContents)
        //
        // var readStream = new stream.PassThrough();
        // readStream.end(fileContents);

        // response.set('Content-disposition', 'attachment; filename=' + fileName);
        // res.set('Content-Type', 'text/plain');

        // readStream.pipe(res);


        res.sendFile(path.join(__dirname, './image.png'));
    });
});

const port =  4000;
app.listen(port, ()=>console.log(`listening on port ${port}`))








