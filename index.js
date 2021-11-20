var fs = require('fs');
require('dotenv').config();
var path = require('path');
var mbgl = require('@mapbox/mapbox-gl-native');
var sharp = require('sharp');
var axios = require("axios");
var my_overlay = require('./test/fixtures/overlay.json');
var BASE_LAYER_LINK = process.env.BASE_LAYER_LINK
var OVERLAY_LINK = process.env.OVERLAY_LINK
var OVERLAY_ID = process.env.OVERLAY_ID
var base_layer = require(`./test/fixtures/min-poi.json`)
var ov2_layer = require('./test/fixtures/ov2.json');


// var base = require(`./test/fixtures/${s}.json`)
var stringified = JSON.stringify(base_layer);
stringified = stringified.replace(/host/g, BASE_LAYER_LINK);
var base = JSON.parse(stringified);

var str = JSON.stringify(my_overlay);
str = str.replace('host', OVERLAY_LINK);
str = str.replace('overlayId', OVERLAY_ID);
var overlay = JSON.parse(str);


const express = require('express');

const app = express();
//token and api-key from dev.map.ir with behdasht user
var config = {
    method: "get",
    responseType: "arraybuffer",
    headers: {
        "x-api-key": process.env.MAPIR_API_KEY
        // "token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjljYmU1MmRmYTliNjBjNTAxYTQwYjcwOGYwYTg3NjJhNDhkYzc1NWIxMWZjYjAwYzFjNTFlZTJkYWE1ZDE0MjJhMzFkYzY4MTk3ZmY0NGQ2In0.eyJhdWQiOiIxIiwianRpIjoiOWNiZTUyZGZhOWI2MGM1MDFhNDBiNzA4ZjBhODc2MmE0OGRjNzU1YjExZmNiMDBjMWM1MWVlMmRhYTVkMTQyMmEzMWRjNjgxOTdmZjQ0ZDYiLCJpYXQiOjE2MzY5NzA1NTgsIm5iZiI6MTYzNjk3MDU1OCwiZXhwIjoxNjM2OTc0MTU4LCJzdWIiOiI5YmY2NjkyOS0xOWMxLTRiOWUtODFiNS03Y2Y5OThiN2I0YjIiLCJzY29wZXMiOlsiYmFzaWMiLCJteTphZG1pbiJdfQ.q77KRacmIbqeoFL2-951e5AR_d2S-PtVd0aWuMfcHXr_5jwR9492tQAGEBTiC_H682ltQtaNBpRf365JnFDwF8lU3ZkHNtMkgnvvbWo35PVnaQvXSc70c0zXOnHtSLEgz-V9KWC9pv_fsfLN_mcqELTMOTHmleXL1FfN6is7p8qz-VMqtL79S5SrSNmKTeNbWk65Zff46ANypZ51rp2oO7kI3KbMFUEXdwsK_71Ws1KzTgxIEmkg4EowB8gLu3Fmy6vb_IJT1Vhd3JcmMoiRPN42sIUQtXkXetrEICi50lfm5R_ZxQxyhc_ilLc-aFMW2LzGmppD0oCX5rGK805K5A"
    },
};

var options = {
    request: function (req, callback) {
        // console.log("🚀 ~ file: index2.js ~ line 8 ~ req", JSON.stringify(req));
        config.url = req.url;
        axios(config)
            .then(function (response) {
                console.log(response.data)
                const data = Buffer.from(response.data, "binary");
                console.log("🚀 ~ file: index2.js ~ line 29 ~ req", req.url);
                callback(false, {data: data});
            }).catch(function (error) {
            console.log('base layer error')

            console.log(error.response)
            callback(true, {data: Buffer.from([])})
            if (error.response.status === 404) return '404';
            // console.log(error.response)
        });
    },
    ratio: 1
};

var map = new mbgl.Map(options);




    function getImage(callback, z, lon, lat, w, h, s) {
    map.load(base);
    console.log('loading map')

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


    // Object.entries(ov2.sources).forEach((source) => {
    //     const [id, sourceData] = source;
    //     map.addSource(id, sourceData);
    //     console.log('source added')
    // });
    // // console.log(Object.entries(overlay.layers))
    //
    // ov2.layers.forEach(layer => {
    //     delete layer.minzoom
    //     map.addLayer(layer);
    //     console.log('layer added')
    // });

    // console.log('before render')
    try {
        console.log('try rendering')
        map.render({zoom: z, center: [lon, lat], width: w, height: h}, function (err, buffer) {
                // console.log('render')
                if (err) {
                    console.log('render function stopped');
                    throw err;
                } else {
                    console.log('render success');
                    try {
                        console.log('image sharp')
                        const image = sharp(buffer, {
                            raw: {
                                width: parseInt(w),
                                height: parseInt(h),
                                channels: 4
                            }
                        })
                        console.log('make image file')

                        image.toFile('image.png', function (err) {
                            if (err) {
                                console.log('image to file error')
                                console.log(err)
                                throw err;
                            }
                            console.log('image to file before callback')

                            callback(buffer)
                            console.log('image to file finished')

                        });
                    } catch (e) {
                        console.log('image to file error')
                        console.log(e)
                    }


                }
            }
        );
    } catch (e) {
        console.log('render error')
        console.log(e)
    }


}


app.get('/:z/:lon/:lat', (req, res) => {
    try {
        var get =
            //     axios({
            //     method: 'get',
            //     url: 'https://my-dev.map.ir/tile/layers/348faa5a-1ec6-46f4-abfe-922b271a58f7@EPSG:3857@pbf/1/1/1.pbf',
            //     headers: {
            //         'x-api-key': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjdhNjhmNTI5NWJlNTk2NTAxZWM0NjMwYjI0Y2EzNjU0M2ZhMTZmYWFiNmM5OThkNGEzOWZkMDllMjQ2OTY1OTQyYmYxYTc1NTcxOGM0MGRjIn0.eyJhdWQiOiIxNDYiLCJqdGkiOiI3YTY4ZjUyOTViZTU5NjUwMWVjNDYzMGIyNGNhMzY1NDNmYTE2ZmFhYjZjOTk4ZDRhMzlmZDA5ZTI0Njk2NTk0MmJmMWE3NTU3MThjNDBkYyIsImlhdCI6MTU5ODkzOTg0MCwibmJmIjoxNTk4OTM5ODQwLCJleHAiOjE2MDE2MjE4NDAsInN1YiI6IiIsInNjb3BlcyI6WyJiYXNpYyJdfQ.Qyhr8Ruo6IBvs3jR2GH_b1yq_Q5L60UyziISfgbfkmN7TEG6Jj_9n06j0ChpeXv2HAgmBR2qnyClcuVVZgnssFHnOJ0lC_jRieJrzRtASBgC-6ekOK-82kNXm7CGlRiBujV5TegHweyU7iYv_Y_MA4Oy_SjUfBoVHvpAIawxtgnPnpC-u49vVa-nCCDrO-hr72H1K8yxT-SaFUVP61kz5QR9KCSIxihD0Wac3MlBmiG9nW4TAb120UGb603LkKD-4xRM-ywofbQttWGeF6w8X3XrTT4jqxaIfN4fmlaC7e049kEgcMjKOyiTMcn5KO7_hTAcYneKX8STkox-2X0I-g',
            //         'token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6Ijk3ZTgyNmE3N2E4ODQ3ZDI3MGM5YmU1ODUxNzVhNmUzYzQyODJiODczNzdkNjMzOWJjZjdkMjIxOWVjZGI5MjUyNGNjYjE4ZWI0OWU3MjQzIn0.eyJhdWQiOiIxIiwianRpIjoiOTdlODI2YTc3YTg4NDdkMjcwYzliZTU4NTE3NWE2ZTNjNDI4MmI4NzM3N2Q2MzM5YmNmN2QyMjE5ZWNkYjkyNTI0Y2NiMThlYjQ5ZTcyNDMiLCJpYXQiOjE2MzY3OTQ5MTEsIm5iZiI6MTYzNjc5NDkxMSwiZXhwIjoxNjM2Nzk4NTExLCJzdWIiOiI5YmY2NjkyOS0xOWMxLTRiOWUtODFiNS03Y2Y5OThiN2I0YjIiLCJzY29wZXMiOlsiYmFzaWMiLCJteTphZG1pbiJdfQ.PvJd2mgIuGqaeDud3DpYjWVXu-an-tSuqIBEBjSktpG8_pQj0cr4yx8EybUgWMqz_ABojmVbLIsaUHriy-3M2OWLcXgEwwjY7p2j00Qfxd35VzlH-wzRyIaDAL7hDNrFGKQLS45sRNPmSbVIY_DykkCNw_XjDAEpyA-ek2aN076KmaP7IruoyRP5XlUdnhC-J2U8JuYgiWIpwOzl7eOFZ411GwNGjfb-j6qpLTVorOHNd24RGXdfdHhxeJJK-dtIemRcf9Ly_IT2EME9NIRe-yoJpJGiCL0t1GZCa8S_6wDy43khdeKqhyGloKi9V8d_u6mJq-IltjPAldezAlDIkg',
            //         'Content-Type': 'application/json'
            //     }
            // })
            //     .then(function (response) {
            //         console.log('ok');
            console.log('call get image')
        getImage(function (buffer) {
            // console.log('buffer');
            // console.log(buffer.toJSON());
            res.set('Content-Type', `image/png`)
            res.sendFile(path.join(__dirname, './image.png'))
        }, req.params.z, req.params.lon, req.params.lat, req.query.width, req.query.height, req.query.style)
        // }
        // )
    } catch (error) {
        console.log('error occurred in tile server')
        res.status(500).send('error')
    }

});

const port = 4000;
app.listen(port, () => console.log(`listening on port ${port}`))








