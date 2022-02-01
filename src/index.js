//this file load a base map, add a layer on it and then make image from it then send it to user
//! Import nodejs modules
const path = require('path');

//! Import third-party modules
const express = require('express');
const sharp = require('sharp');
const axios = require("axios");
const mbgl = require('@mapbox/mapbox-gl-native');
require('dotenv').config();

//! Other imports
var baseLayerDescriptor = process.env.BASE_LAYER_DESCRIPTOR;
var baseLayerJson = require('./layers/'.concat(baseLayerDescriptor).concat('.json'));

//! Global settings
const port = 4000;
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var hasOverlay = process.env.HAS_OVERLAY;
var baseLayerLink = process.env.BASE_LAYER_LINK;

const app = express();

//set overlay json file
if (hasOverlay) {
    overlayDescriptor = process.env.OVERLAY_DESCRIPTOR;
    overlayLink = process.env.OVERLAY_LINK;
    overlayJson = require('./layers/'.concat(overlayDescriptor).concat('.json'));
    //replace host from overlay
    stringifiedOverlay = JSON.stringify(overlayJson);
    hostReplacedOverlay = stringifiedOverlay.replace('hostAndUri', overlayLink);
    var overlay = JSON.parse(hostReplacedOverlay);
}

//replace host from base layer
stringifiedBaseLayer = JSON.stringify(baseLayerJson);
hostReplacedBaseLayer = stringifiedBaseLayer.replace(/host/g, baseLayerLink);
var base = JSON.parse(hostReplacedBaseLayer);

const config = {
    method: "get",
    responseType: "arraybuffer",
    headers: {
        "x-api-key": process.env.MAPIR_API_KEY
    },
};

//create new map
var mapOptions = {
    request: function (req, callback) {
        config.url = req.url;
        axios(config)
            .then((response) => {
                console.log("file: index.js ~ line 50 ~ mapData: ", response.data);
                const data = Buffer.from(response.data, "binary");
                console.log("file: index.js ~ line 52 ~ req url: ", req.url);
                callback(false, {data: data});
            }).catch((error) => {
            console.log("file: index.js ~ line 46 ~ base layer face with error: ", error.response);
            callback(true, {data: Buffer.from([])})
            if (error.response != null
                && error.response.status === 404) return '404';
        });
    },
    ratio: 1
};
var map = new mbgl.Map(mapOptions);


//create image by loading base map and add a layer if exists
function getImage(callback, z, lon, lat, w, h) {
    map.load(base);
    console.log('base map loaded successfully');

//add layer if exists
    if (hasOverlay) {
        Object.entries(overlay.sources).forEach(source => {
            const [id, sourceData] = source;
            map.addSource(id, sourceData);
        });
        overlay.layers.forEach(layer => {
            delete layer.minzoom;
            map.addLayer(layer);
        });

    }
//rendering the map and make image
    try {
        console.log('try rendering the map');
        map.render({zoom: z, center: [lon, lat], width: w, height: h}, (err, buffer) => {
                if (err) {
                    console.log('rendering the map faced with error');
                    throw err;
                } else {
                    try {
                        const image = sharp(buffer, {
                            raw: {
                                width: parseInt(w),
                                height: parseInt(h),
                                channels: 4
                            }
                        });

                        image.toFile(path.join(__dirname, 'image.png'), (err) => {
                            if (err) {
                                console.log('making file faced error: ', err);
                                throw err;
                            }
                            callback(buffer);
                        });
                    } catch (e) {
                        console.log('making image faced error: ', e);
                    }
                }
            }
        );
    } catch (e) {
        console.log('render the map failed : ', e);
    }
}


//routes
app.get('/:z/:lon/:lat', (req, res) => {
    try {
        console.log('call function: getImage');
        getImage(
             (buffer)=> {
                res.set('Content-Type', `image/png`);
                res.sendFile(path.join(__dirname, 'image.png'));
            },
            req.params.z,
            req.params.lon,
            req.params.lat,
            req.query.width,
            req.query.height,
        );
    } catch (error) {
        console.log('error occurred in getImage function');
        res.status(500).send('error');
    }

});


app.listen(port, () => console.log(`listening on port ${port}`));