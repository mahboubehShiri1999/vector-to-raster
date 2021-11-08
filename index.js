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
        token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6Ijg5OGNkYzY0Y2Q3OTA3NzE0MmJhNWNhNjM2MmUzOGY4ZTIwODhhZGYwYjc2MTQ1MzBkMTEyZThlYzFlZmFjYmMxMzg1MDNhY2E5YmY0ZTc2In0.eyJhdWQiOiIxIiwianRpIjoiODk4Y2RjNjRjZDc5MDc3MTQyYmE1Y2E2MzYyZTM4ZjhlMjA4OGFkZjBiNzYxNDUzMGQxMTJlOGVjMWVmYWNiYzEzODUwM2FjYTliZjRlNzYiLCJpYXQiOjE2MzYzNzMyOTUsIm5iZiI6MTYzNjM3MzI5NSwiZXhwIjoxNjM2Mzc2ODk1LCJzdWIiOiI5YmY2NjkyOS0xOWMxLTRiOWUtODFiNS03Y2Y5OThiN2I0YjIiLCJzY29wZXMiOlsiYmFzaWMiLCJteTphZG1pbiJdfQ.o74MccXdlrTHY0s3_eUfvtfBxd3TQqztuvPv4d9ECusJKqELpzGOiFHrTFW7TpsesbHdHGLASv8s4zZfOCysgDmNNbnTyaUkwnWZ9FLlHo8Onk3UNKReuiQ9K4vo9H8STFAxDN9tFhrYSm3-R2RQJYTgUQH0xHwsTltcaLpbxycZsgKmbs13eXkIDAlKm2qe9LFdsc3e6-8HpMNrCiguHfoVpG8ossZNxLrvkiAXtpP_c0ntbExObAaWYh7yQU5RjE0CKZV4IwxogAQOGM8r6jtbhQIPDw1gx3aU3B0awYKZkTQHIZcVEE-2uTRPKtDU-_ynKQvWmQXtY2zO2Rtp1w",
        "x-api-key": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjdhNjhmNTI5NWJlNTk2NTAxZWM0NjMwYjI0Y2EzNjU0M2ZhMTZmYWFiNmM5OThkNGEzOWZkMDllMjQ2OTY1OTQyYmYxYTc1NTcxOGM0MGRjIn0.eyJhdWQiOiIxNDYiLCJqdGkiOiI3YTY4ZjUyOTViZTU5NjUwMWVjNDYzMGIyNGNhMzY1NDNmYTE2ZmFhYjZjOTk4ZDRhMzlmZDA5ZTI0Njk2NTk0MmJmMWE3NTU3MThjNDBkYyIsImlhdCI6MTU5ODkzOTg0MCwibmJmIjoxNTk4OTM5ODQwLCJleHAiOjE2MDE2MjE4NDAsInN1YiI6IiIsInNjb3BlcyI6WyJiYXNpYyJdfQ.Qyhr8Ruo6IBvs3jR2GH_b1yq_Q5L60UyziISfgbfkmN7TEG6Jj_9n06j0ChpeXv2HAgmBR2qnyClcuVVZgnssFHnOJ0lC_jRieJrzRtASBgC-6ekOK-82kNXm7CGlRiBujV5TegHweyU7iYv_Y_MA4Oy_SjUfBoVHvpAIawxtgnPnpC-u49vVa-nCCDrO-hr72H1K8yxT-SaFUVP61kz5QR9KCSIxihD0Wac3MlBmiG9nW4TAb120UGb603LkKD-4xRM-ywofbQttWGeF6w8X3XrTT4jqxaIfN4fmlaC7e049kEgcMjKOyiTMcn5KO7_hTAcYneKX8STkox-2X0I-g"
            // "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImRiZWU0YWU4OTk4OTA3MmQ3OTFmMjQ4ZDE5N2VhZTgwZWU2NTUyYjhlYjczOWI2NDdlY2YyYzIzNWRiYThiMzIzOTM5MDkzZDM0NTY2MmU3In0.eyJhdWQiOiI5NDMyIiwianRpIjoiZGJlZTRhZTg5OTg5MDcyZDc5MWYyNDhkMTk3ZWFlODBlZTY1NTJiOGViNzM5YjY0N2VjZjJjMjM1ZGJhOGIzMjM5MzkwOTNkMzQ1NjYyZTciLCJpYXQiOjE1OTA4MjU0NzIsIm5iZiI6MTU5MDgyNTQ3MiwiZXhwIjoxNTkzNDE3NDcyLCJzdWIiOiIiLCJzY29wZXMiOlsiYmFzaWMiXX0.M_z4xJlJRuYrh8RFe9UrW89Y_XBzpPth4yk3hlT-goBm8o3x8DGCrSqgskFfmJTUD2wC2qSoVZzQKB67sm-swtD5fkxZO7C0lBCMAU92IYZwCdYehIOtZbP5L1Lfg3C6pxd0r7gQOdzcAZj9TStnKBQPK3jSvzkiHIQhb6I0sViOS_8JceSNs9ZlVelQ3gs77xM2ksWDM6vmqIndzsS-5hUd-9qdRDTLHnhdbS4_UBwNDza47Iqd5vZkBgmQ_oDZ7dVyBuMHiQFg28V6zhtsf3fijP0UhePCj4GM89g3tzYBOmuapVBobbX395FWpnNC3bYg7zDaVHcllSUYDjGc1A",
    },
};

var options = {
    request: function (req, callback) {
       // console.log("🚀 ~ file: index2.js ~ line 8 ~ req", JSON.stringify(req));
        config.url = req.url;
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








