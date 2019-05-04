/***********************************************************
 *  共通ライブラリ                                         *
 *  Copyright (c) 2019 @Hamache9801                        *
 *  Released under the MIT license                         *
 *  http://opensource.org/licenses/mit-license.php         *
 ***********************************************************/
module.exports = (function(){
    "use strict";

    const utill = require('util')
        , crypto = require("crypto")
        , http = require('http')
        , config = require('config');

    //console.log用定数
    const black   = '\u001b[30m'
        , red     = '\u001b[31m'
        , green   = '\u001b[32m'
        , yellow  = '\u001b[33m'
        , blue    = '\u001b[34m'
        , magenta = '\u001b[35m'
        , cyan    = '\u001b[36m'
        , white   = '\u001b[37m'
        , reset   = '\u001b[0m';

    return {
        inspect :
            function(value){
                console.log(utill.inspect(value));
            },
        getHash :
             function(target){
                var sha = crypto.createHmac('sha256', config.hashSecretKey);
                sha.update(target);
                return sha.digest('hex');
            },
        getMD5Hash :
            function (src){
                var md5hash = crypto.createHash('md5');
                md5hash.update(src, 'binary');
                return md5hash.digest('hex');
            },
        setConsolelog :
            function(req, msg){
                var s = '';
                if (msg === undefined){
                    msg = req.headers['x-forwarded-for'] + ' ' + req.headers['user-agent'];
                }

                //表示時間
                var dt = new Date();
                var formatted = dt.toFormat("YYYY/MM/DD HH24:MI:SS ");

                switch (req.method){
                    case 'GET':
                        s = '[CALL] ' + formatted + '[' + green   + req.method + reset + '] ' + req.url + ': ';
                        break;
                    case 'POST':
                        s = '[CALL] ' + formatted + '[' + magenta + req.method + reset + '] ' + req.url + ': ';
                        break;
                    default:
                        break;
                        s = '[CALL] ' + formatted + '[' + yellow  + req.method + reset + '] ' + req.url + ': ' ;
                }

                console.log(s + msg);
                return;
            },
        setConsoleInfo:
            function(msg){
                //表示時間
                var dt = new Date();
                var formatted = dt.toFormat("YYYY/MM/DD HH24:MI:SS ");
                var s = '[\u001b[32mINFO\u001b[0m] ' + formatted;

                console.log(s + msg);
                return;
            },
        addMinutes :
            function(date, minutes){
                return new Date(date.getTime() + minutes * 60000);
            },
        wget :
            function(url, saveto){
                var outFile = fs.createWriteStream(saveto);

                var req = http.get(url,
                    function (res) {
                        res.pipe(outFile);
                        res.on('end',
                                function () {
                                    outFile.close();
                                }
                              ); 
                    }
                   );
                return;
            }
    }
})();
