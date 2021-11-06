var fs = require('fs');
var path = require('path');
var mbgl = require('@mapbox/mapbox-gl-native');
var sharp = require('sharp');
var axios = require("axios");
var overlay = require('./test/fixtures/overlay.json');

// console.log(overlay)
const express = require('express');
const app = express();

var config = {
    method: "get",
    responseType: "arraybuffer",
    headers: {
        token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQ4OTUxOTkzMTFlNjMyNzFlYzRjMjRiMGMxODE5Nzg0ZjA1OGIyN2ZhZDk4MjE4Mjc2NWFjMGQ1ZTYwMWE4YTlmZDY5ZGYzYzRhNmI0N2MzIn0.eyJhdWQiOiIxIiwianRpIjoiZDg5NTE5OTMxMWU2MzI3MWVjNGMyNGIwYzE4MTk3ODRmMDU4YjI3ZmFkOTgyMTgyNzY1YWMwZDVlNjAxYThhOWZkNjlkZjNjNGE2YjQ3YzMiLCJpYXQiOjE2MjgzMTcyNzYsIm5iZiI6MTYyODMxNzI3NiwiZXhwIjoxNjI4MzIwODc2LCJzdWIiOiIzYzhjYjJhMi0xMzIzLTQ4MmQtODYxMy1iYTdhMWU1MmU4MzkiLCJzY29wZXMiOlsiYmFzaWMiLCJteTphZG1pbiJdfQ.gAj0T6378PjSLjTelGWGKM_BDzjOqQIE12jIMvaELpTQtfsZ9mkWJHwPLRus859rPh747fKMzmz4TFwavmAq_MLPXZC8guIMmI7Pc9EcdSEI8CkYSA2gEA3FIVEi0Sfe5GkswpQuFRNlQFZPmD6Mb6MyaWovjsXwwTCJiw_ZFG4c69-J8Gbuyg_W-Y_0dt3jexdSnbA6UKKpdZ1QoUAu1rArokEcFpWfNfquJJQrdJYQTKTkbrjIlR1qrpUmbrRhq0wOLuEAccTcO-5SsN1awzpHf-hZpmQCm6qxmmQTlpa_13IhbPXLI4WNUUKlk4TjzStMDyPJLNhQL2JXVtpPPw",
        "x-api-key": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjRlZDdkNGRhMzU1OTE0MWQ2YWUwOWRkMDZkZWZmOWUwYWQ2Mjg3OWRiMDc4Yjg3ZDIzNGE5MDVmYmVjOWY4NWYxNzM2YWIwNDY5ZmViNzJmIn0.eyJhdWQiOiIxNDg4MCIsImp0aSI6IjRlZDdkNGRhMzU1OTE0MWQ2YWUwOWRkMDZkZWZmOWUwYWQ2Mjg3OWRiMDc4Yjg3ZDIzNGE5MDVmYmVjOWY4NWYxNzM2YWIwNDY5ZmViNzJmIiwiaWF0IjoxNjI2NjgzOTExLCJuYmYiOjE2MjY2ODM5MTEsImV4cCI6MTYyOTI3NTkxMSwic3ViIjoiIiwic2NvcGVzIjpbImJhc2ljIl19.GgbeiZp5JQB9lmxsoDgGFNayZXCmAQJNXO34oHMyTrbszkMZpBw7dM2TsQDsC9T7xxD4nn-01orySyhReZlcKnnEMxXUezGR8PNAEeKEGRDaw3Ho5wRgwaZOR4zGPgCFV8IVwbZmNflZf-iWPLgJTNgrDmucjUcKJHAFkyzgS3CCmsYCEIlVAvWrGZbAs239A4mV6jMwqq-3JtmqponsJqyihwvyNG63GSlwSqgKdoaXPIT_2-hpO_Dk0O30YUtbGFbvw7QsV_scfDbQX5kEWEFlUkJpbH-ZcD7Ks2nzGZOcxKekb43ELWlt1lt6J79up2z1pq-hk6cpiuu7ZulMiQ"
            // "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImRiZWU0YWU4OTk4OTA3MmQ3OTFmMjQ4ZDE5N2VhZTgwZWU2NTUyYjhlYjczOWI2NDdlY2YyYzIzNWRiYThiMzIzOTM5MDkzZDM0NTY2MmU3In0.eyJhdWQiOiI5NDMyIiwianRpIjoiZGJlZTRhZTg5OTg5MDcyZDc5MWYyNDhkMTk3ZWFlODBlZTY1NTJiOGViNzM5YjY0N2VjZjJjMjM1ZGJhOGIzMjM5MzkwOTNkMzQ1NjYyZTciLCJpYXQiOjE1OTA4MjU0NzIsIm5iZiI6MTU5MDgyNTQ3MiwiZXhwIjoxNTkzNDE3NDcyLCJzdWIiOiIiLCJzY29wZXMiOlsiYmFzaWMiXX0.M_z4xJlJRuYrh8RFe9UrW89Y_XBzpPth4yk3hlT-goBm8o3x8DGCrSqgskFfmJTUD2wC2qSoVZzQKB67sm-swtD5fkxZO7C0lBCMAU92IYZwCdYehIOtZbP5L1Lfg3C6pxd0r7gQOdzcAZj9TStnKBQPK3jSvzkiHIQhb6I0sViOS_8JceSNs9ZlVelQ3gs77xM2ksWDM6vmqIndzsS-5hUd-9qdRDTLHnhdbS4_UBwNDza47Iqd5vZkBgmQ_oDZ7dVyBuMHiQFg28V6zhtsf3fijP0UhePCj4GM89g3tzYBOmuapVBobbX395FWpnNC3bYg7zDaVHcllSUYDjGc1A",
    },
};

var options = {
    request: function (req, callback) {
       // console.log("🚀 ~ file: index2.js ~ line 8 ~ req", JSON.stringify(req));
        config.url = req.url;
        console.log('llllll',config.url)
        axios(config)
            .then(function (response) {
                const data = Buffer.from(response.data, "binary");
                console.log("🚀 ~ file: index2.js ~ line 29 ~ req", req.url);
                callback(false, {data: data});
            })
            .catch(function (error) {
                // console.log(Object.keys(error));
                // if (error.response.statu
                // sCode === 404) return;
                callback(true, {data: Buffer.from([])})
                if(error.response.status === 404) return;
                console.log('error',error);
            });

    },
    ratio: 1
};

var map = new mbgl.Map(options);


function getImage(callback, z, lon, lat, w, h, s) {

    map.load(require(`./test/fixtures/${s}.json`));

    Object.entries(overlay.sources).forEach((source) => {
        const [id, sourceData] = source;
        map.addSource(id, sourceData);
        console.log('source added')
    });
    // console.log(Object.entries(overlay.layers))

    overlay.layers.forEach(layer => {
        delete layer.minzoom
        map.addLayer(layer);
        console.log('layer added')
    });

    // console.log('before render')

    map.render({zoom: z,center:[lon,lat],width:w, height:h}, function (err, buffer) {
        // console.log('render')
        if (err) throw err;
        const image = sharp(buffer, {
            raw: {
                width: parseInt(w),
                height: parseInt(h),
                channels: 4
            }
        })




        // map.addSource(id, {
        //     // type: 'image',
        //
        //     "type": "image",
        //     "url": `http://localhost:8080?width=${w}&height=${h}&zoom_level=${z}&center=${lon},${lat}`,
        //     "tileSize": 256,
        //     coordinates: [
        //         [180,-90],
        //         [180,90],
        //         [-180,90],
        //         [-180, -90]
        //
        //     ]
        // });

        // map.addLayer({
        //     id: 'radar-layer',
        //     'type': 'raster',
        //     'source': 'some id',
        //     'paint': {
        //         'raster-fade-duration': 0
        //     }
        // });
   // console.log( 'layers:',map.addlayer({
   //     'id': 'maine',
   //     'type': 'fill',
   //     'source': 'maine', // reference the data source
   //     'layout': {},
   //     'paint': {
   //         'fill-color': '#0080ff', // blue color fill
   //         'fill-opacity': 0.5
   //     }
   // }));


        image.toFile('image.png', function (err) {
            if (err) throw err;
            callback(buffer)
        });


    });



}


app.get('/:z/:lon/:lat', (req, res) => {
    var get = getImage(function (buffer) {
        // get.then(()=>{
        res.set('Content-Type', `image/png`)
        res.sendFile(path.join(__dirname, './image.png'))
        // })
    },req.params.z,req.params.lon, req.params.lat,req.query.width, req.query.height,req.query.style)
});

const port = 4000;
app.listen(port, () => console.log(`listening on port ${port}`))








