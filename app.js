require('date-utils');
const config = require('config');

if (!config.http_listen_port) {throw 'config `http_listen_port` is not set';}

util = require('./lib/common-utils.js')
    , http = require('http')
    , https = require('https')
    , express = require('express')
    , app = express();

//httpsリダイレクト設定
app.use (function (req, res, next) {
    if (config.use_https_redirect) {
        if (req.secure) {
            next();
        } else {
            var redirect_host = '';

            if (req.headers['x-forwarded-host']) {
                redirect_host = req.headers['x-forwarded-host'];
            } else {
                redirect_host = req.headers.host;
            }
            res.redirect('https://' + redirect_host + req.url);
        }
    } else {
        next();
    }
});

//最新の位置情報を取得
app.get('/api/latest', function(req, res){
    util.setConsolelog(req, ' user:' + req.query.user);

    var url = 'https://imacocokun.appspot.com/b/latest.json';
    var schema;

    if (/^https:.*$/.test(url)) {
        schema = https;
    } else if (/^http:.*$/.test(url)) {
        schema = http;
    } else {
        console.log('err');
        return;
    }

    schema.get(url, function(resp){
        var body = '';
        resp.setEncoding('utf8');

        resp.on('data', function(chunk){
            body += chunk;
        });
        resp.on('end', function(resp){
            if (body.length == 0){
                console.log('null');
                return;
            }

            try{
                var json = JSON.parse(body);
                var points = json.locations;
                var latest_points = [];

                //位置情報保存
                for (var x = 0; x < points.length; x++){
                    var locinfo = {};
                    locinfo.valid          =  true;
                    locinfo.user           =  points[x].name;
                    locinfo.nickname       =  points[x].nickname;
                    locinfo.lat            =  parseFloat(points[x].latE6) / 1000000;
                    locinfo.lon            =  parseFloat(points[x].lonE6) / 1000000;
                    locinfo.dir            =  points[x].dir;
                    locinfo.altitude       =  0;
                    locinfo.velocity       =  0;
                    locinfo.type           =  0;
                    locinfo.flag           = '1';
                    locinfo.saved          = '0';
                    locinfo.ustream_status = 'offline';
                    locinfo.private_mode   = '0';

                    latest_points.push(locinfo);
                }

                var latest = {};

                latest.result = 1;
                latest.points = latest_points;

                res.send(JSON.stringify(latest)); 

            } catch(e){
                res.send(JSON.stringify(e)); 
                console.log('/api/latest/ error!!');
            }
        });
    }).on('error', function(e){
        console.log(e.message); //エラー時
    });
});

try{
    //サーバー起動(http)
    http.createServer(app).listen(config.http_listen_port, function(){
        util.setConsoleInfo('api proxy server (http) listening on port: ' + config.http_listen_port);
    });
} catch(e){
    console.log(e);
}
