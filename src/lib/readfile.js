var topojson = require('topojson'),
    toGeoJSON = require('togeojson'),
    shp = require('shpjs'),
    osm2geojson = require('osm-and-geojson').osm2geojson;

module.exports.readDrop = readDrop;
module.exports.readFile = readFile;

function readDrop(callback) {
    return function() {
        if (d3.event.dataTransfer) {
            d3.event.stopPropagation();
            d3.event.preventDefault();
            var f = d3.event.dataTransfer.files[0];
            readFile(f, callback);
        }
    };
}

function readFile(f, callback) {

    var reader = new FileReader();
    var fileType = detectType(f);
    reader.onload = function(e) {

        if (!fileType) {
            return callback({
                message: 'Could not detect file type'
            });
        } else if (fileType === 'kml') {
            var kmldom = toDom(e.target.result);
            if (!kmldom) {
                return callback({
                    message: 'Invalid KML file: not valid XML'
                });
            }
            var warning;
            if (kmldom.getElementsByTagName('NetworkLink').length) {
                warning = {
                    message: 'The KML file you uploaded included NetworkLinks: some content may not display. ' +
                      'Please export and upload KML without NetworkLinks for optimal performance'
                };
            }
            callback(null, toGeoJSON.kml(kmldom), warning);
        } else if (fileType === 'xml') {
            var xmldom = toDom(e.target.result);
            if (!xmldom) {
                return callback({
                    message: 'Invalid XML file: not valid XML'
                });
            }
            callback(null, osm2geojson(xmldom));
        } else if (fileType === 'gpx') {
            callback(null, toGeoJSON.gpx(toDom(e.target.result)));
        } else if (fileType === 'geojson') {
            try {
                gj = JSON.parse(e.target.result);
                if (gj && gj.type === 'Topology' && gj.objects) {
                    var collection = { type: 'FeatureCollection', features: [] };
                    for (var o in gj.objects) collection.features.push(topojson.feature(gj, gj.objects[o]));
                    callback(null, collection);
                } else {
                    callback(null, gj);
                }
            } catch(err) {
                alert('Invalid JSON file: ' + err);
                return;
            }
        } else if (fileType === 'dsv') {
            csv2geojson.csv2geojson(e.target.result, {
                delimiter: 'auto'
            }, function(err, result) {
                if (err) {
                    return callback({
                        type: 'geocode',
                        result: result,
                        raw: e.target.result
                    });
                } else {
                    return callback(null, result);
                }
            });
        } else if (fileType === 'zip') {
            shp(e.target.result).then(function(result){
                callback(null,result);
            },function(err){
                callback({
                    type: 'shapefile',
                    result: err,
                    raw: e.target.result
                });
            });
        }
    };
    if (fileType === 'zip') {
        reader.readAsArrayBuffer(f);
    } else {
        reader.readAsText(f);
    }
    function toDom(x) {
        return (new DOMParser()).parseFromString(x, 'text/xml');
    }

    function detectType(f) {
        var filename = f.name ? f.name.toLowerCase() : '';
        function ext(_) {
            return filename.indexOf(_) !== -1;
        }
        if (f.type === 'application/vnd.google-earth.kml+xml' || ext('.kml')) {
            return 'kml';
        }
        if (ext('.gpx')) return 'gpx';
        if (ext('.geojson') || ext('.json')) return 'geojson';
        if (f.type === 'text/csv' || ext('.csv') || ext('.tsv') || ext('.dsv')) {
            return 'dsv';
        }
        if (ext('.xml') || ext('.osm')) return 'xml';
        if (ext('.zip')) return 'zip';
    }
}
