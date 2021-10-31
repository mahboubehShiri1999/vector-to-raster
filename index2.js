var fs = require("fs");
var path = require("path");
var mbgl = require("@mapbox/mapbox-gl-native");
var sharp = require("sharp");
var axios = require("axios");

var config = {
    method: "get",
    responseType: "arraybuffer",
    headers: {
        "x-api-key":
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImRiZWU0YWU4OTk4OTA3MmQ3OTFmMjQ4ZDE5N2VhZTgwZWU2NTUyYjhlYjczOWI2NDdlY2YyYzIzNWRiYThiMzIzOTM5MDkzZDM0NTY2MmU3In0.eyJhdWQiOiI5NDMyIiwianRpIjoiZGJlZTRhZTg5OTg5MDcyZDc5MWYyNDhkMTk3ZWFlODBlZTY1NTJiOGViNzM5YjY0N2VjZjJjMjM1ZGJhOGIzMjM5MzkwOTNkMzQ1NjYyZTciLCJpYXQiOjE1OTA4MjU0NzIsIm5iZiI6MTU5MDgyNTQ3MiwiZXhwIjoxNTkzNDE3NDcyLCJzdWIiOiIiLCJzY29wZXMiOlsiYmFzaWMiXX0.M_z4xJlJRuYrh8RFe9UrW89Y_XBzpPth4yk3hlT-goBm8o3x8DGCrSqgskFfmJTUD2wC2qSoVZzQKB67sm-swtD5fkxZO7C0lBCMAU92IYZwCdYehIOtZbP5L1Lfg3C6pxd0r7gQOdzcAZj9TStnKBQPK3jSvzkiHIQhb6I0sViOS_8JceSNs9ZlVelQ3gs77xM2ksWDM6vmqIndzsS-5hUd-9qdRDTLHnhdbS4_UBwNDza47Iqd5vZkBgmQ_oDZ7dVyBuMHiQFg28V6zhtsf3fijP0UhePCj4GM89g3tzYBOmuapVBobbX395FWpnNC3bYg7zDaVHcllSUYDjGc1A",
        token:
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjlhYmViNWE4YTMwOWQ1ZWE5MWY1NWQwYjNmZDVmMzMxMzcwMDc3OTNkOTVlMWQ0YzZiZTU5NjFlODVkMDRlOGZiZjRmYzJhZmY3YWM1ZTRkIn0.eyJhdWQiOiIxIiwianRpIjoiOWFiZWI1YThhMzA5ZDVlYTkxZjU1ZDBiM2ZkNWYzMzEzNzAwNzc5M2Q5NWUxZDRjNmJlNTk2MWU4NWQwNGU4ZmJmNGZjMmFmZjdhYzVlNGQiLCJpYXQiOjE2MjUwNTE3MjYsIm5iZiI6MTYyNTA1MTcyNiwiZXhwIjoxNjI1MDU1MzI2LCJzdWIiOiIzYzhjYjJhMi0xMzIzLTQ4MmQtODYxMy1iYTdhMWU1MmU4MzkiLCJzY29wZXMiOlsiYmFzaWMiLCJteTphZG1pbiJdfQ.emtQyS6LsmF_-KxX0cMMj0JdVh-sgILcZc1vOA_HGb8mzRpABf9Gpns45hglS9qsMIQTYh38caOIS_zPDQ2jqp6JqMfS6PwgvAN18ALNk65I87n7ndLy5-w3F0pGt-yfwlHks42YsfrcUEwbOAwqGimd7G2XawSSAteldV4btKQw6xdB0JBX_2uOJvj5e1vzugGIzSpivlNx_6i_X7DgNG5q_r5IkCYt822XELPJZXewikUhlNumEDLl58FC1wjDe3K5dFPv_yGlv2fXSCEg_2dEZfhEJsGRx0Sc-8WSMfdKnx-ObswKd6yi6VFoLScYRPW2O1lhFfYTu2J8YMVubw"},
};

var options = {
    request: function (req, callback) {
        console.log("🚀 ~ file: index2.js ~ line 8 ~ req", JSON.stringify(req));

        config.url = req.url;
        axios(config)
            .then(function (response) {
                const data = Buffer.from(response.data, "binary");

                callback(false, { data: data });
            })
            .catch(function (error) {
                console.log(error);
            });
    },
    ratio: 1,
};

var map = new mbgl.Map(options);

map.load(require("./node_modules/test/fixtures/style1.json"));

map.render({ zoom: 10, center: [51.3959, 35.6641] }, function (err, buffer) {
    if (err) throw err;

    map.release();

    var image = sharp(buffer, {
        raw: {
            width: 512,
            height: 512,
            channels: 4,
        },
    });

    // Convert raw image buffer to PNG
    image.toFile("image2.png", function (err) {
        if (err) throw err;
    });
});
