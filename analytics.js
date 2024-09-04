/*!
* Main.js
* HTML5 Game Distribution Analytics
* http://www.gamedistribution.com/
*
* Creates a JavaScript HTML5 Game Distribution API that collects data from games.
*
* Copyright 2010-2017, Reha Biçer & Emre Demir
* License: MIT
*
*/
// Namespace
var _gd_ = _gd_ || {};

// Version number
_gd_.version = 'v501';
/*
Statics methods
*/
_gd_.static = {
    enable: false,
    pingTimeOut: 30000,
    useSsl: false,
    regId: "",
    serverId: "",
    gameId: "",
    sVersion: "v1",
    initWarning: "First, you have to call 'Log' method to connect to the server.",
    gdApi: {},
    enableDebug: false,
    getServerName: function () {
        return (this.useSsl ? "https://" : "http://") + this.regId + "." + this.serverId + ".submityourgame.com/" + this.sVersion + "/";
    }
};
/*
Utility methods
*/
_gd_.utils = {
    encodeUrl: function (url) {
        return encodeURIComponent(url); //.replace(/\?/gi,'%3F').replace(/=/gi,'%3D').replace(/&/gi,'%26');
    },
    escapeHTML: function (s) {
        return s.toString().split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');
    },
    absolutizeUrl: function (url) {
        var el = document.createElement('div');
        el.innerHTML = '<a href="' + this.escapeHTML(url) + '">x</a>';
        return el.firstChild.href;
    },
    getScriptPath: function (scriptNames) {
        var
			i = 0,
			j,
			codePath = '',
			testname = '',
			slashPos,
			filenamePos,
			scriptUrl,
			scriptPath,
			scriptFilename,
			scripts = document.getElementsByTagName('script'),
			il = scripts.length,
			jl = scriptNames.length;

        // go through all <script> tags
        for (; i < il; i++) {
            scriptUrl = scripts[i].src;
            slashPos = scriptUrl.lastIndexOf('/');
            if (slashPos > -1) {
                scriptFilename = scriptUrl.substring(slashPos + 1);
                scriptPath = scriptUrl.substring(0, slashPos + 1);
            } else {
                scriptFilename = scriptUrl;
                scriptPath = '';
            }

            // see if any <script> tags have a file name that matches the 
            for (j = 0; j < jl; j++) {
                testname = scriptNames[j];
                filenamePos = scriptFilename.indexOf(testname);
                if (filenamePos > -1) {
                    codePath = scriptPath;
                    break;
                }
            }

            // if we found a path, then break and return it
            if (codePath !== '') {
                break;
            }
        }

        // send the best path back
        return codePath;
    },
    removeObjectInIE: function (id) {
        var obj = document.getElementById(id);
        if (obj) {
            for (var i in obj) {
                if (typeof obj[i] == "function") {
                    obj[i] = null;
                }
            }
            obj.parentNode.removeChild(obj);
        }
    },
    // ReBuild QueryString for Filter
    buildQueryString: function (url, changedKey, changedKeyValue) {
        var _url = url.split('?');
        var tempQuery = _url[0] + "?";

        if (_url.count > 0) {
            _url = _url[1];
        } else {
            _url = "";
        }

        var sPageURL = _url;
        var sURLVariables = sPageURL.split('&');

        var i = 0;
        var keyFound = false;

        if (sPageURL.length > 0) {
            for (var i = 0; i < sURLVariables.length; i++) {
                var sParameterName = sURLVariables[i].split('=');
                if (sParameterName[0].toLowerCase() == "page") {
                    sParameterName[1] = "0";
                }
                tempQuery += sParameterName[0] + "=" + (sParameterName[0] == changedKey ? changedKeyValue : sParameterName[1]) + (i < sURLVariables.length - 1 ? "&" : "");
                if (sParameterName[0] == changedKey) {
                    keyFound = true;
                }
                i++;
            }
            if (!keyFound) {
                tempQuery += "&" + changedKey + "=" + changedKeyValue;
            }
        }
        else {
            tempQuery += changedKey + "=" + changedKeyValue;
        }
        return tempQuery;
    },

    gotoURL: function (url) {
        $(location).attr('href', url);
    },

    dateTimetoUnix: function (dt) {
        return Math.round((new Date(dt)).getTime() / 1000);
    },

    addCommas: function (nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    },

    UnixToDateTime: function (UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
        return time;
    },

    UnixToDate: function (UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var time = date + ' ' + month + ' ' + year;
        return time;
    },

    number2Date: function (unixtime) {
        var sec = unixtime % 60;
        var min = (unixtime / 60) % 60;
        var hour = (unixtime / 3600) % 60;
        return parseInt(hour) + ":" + parseInt(min) + ":" + parseInt(sec);
    },

    isNull: function (val) {
        return (typeof val == 'undefined') || (val == null);
    },

    getQueryStringParams: function (sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }
    },

    serialize: function (obj) {
        var parts = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
            }
        }
        return parts.join("&");
    },

    fetchData: function (queryString, _data, onDataReceived) {
        fetchTimer = Math.round((new Date()).getTime() / 1000);

        // Attempt to creat the XHR2 object
        var xhr;
        try {
            xhr = new XMLHttpRequest();
        } catch (e) {
            try {
                xhr = new XDomainRequest();
            } catch (e) {
                try {
                    xhr = new ActiveXObject('Msxml2.XMLHTTP');
                } catch (e) {
                    try {
                        xhr = new ActiveXObject('Microsoft.XMLHTTP');
                    } catch (e) {
                        _gd_.utils.log('\nYour browser is not compatible with XHR2');
                    }
                }
            }
        }

        xhr.open('POST', _gd_.static.getServerName(), true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function (e) {
            // Response handlers.
            if(xhr.readyState == 4 && xhr.status == 200){
                var text = xhr.responseText;
                onDataReceived(text);
                _gd_.utils.log("fetchData success: " + text);
            }
            else{
                _gd_.utils.log("Xml fetch failed. Using default values!");
                onDataReceived();
            }
        };
        xhr.onerror = function (data) {
            _gd_.utils.log("fetchData error: " + data);
        };

        xhr.send(this.serialize(_data));
    },

    postData: function (queryString, data, onSuccess, onFailed) {
        fetchTimer = Math.round((new Date()).getTime() / 1000);
        var jqxhr = $.post(_gd_.static.getServerName() + "?t=" + fetchTimer + "&" + queryString, data)
          .done(function (data) {
              _gd_.utils.log("postData success: " + data);
          })
          .fail(function (data) {
              _gd_.utils.log("postData fail: " + data);
          });
    },

    log: function (msg) {
        if (_gd_.static.enableDebug) {
            console.log(msg);
        }
    },

    getCookie: function (key) {
        var name = key + "_" + _gd_.static.gameId + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
        }
        return 1;
    },

    setCookie: function (key, value) {
        var d = new Date();
        var exdays = 30;
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = key + "_" + _gd_.static.gameId + "=" + value + "; " + expires;
    },

    sessionId: function () {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 32; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return (text);
    },

    ajax: function (method, queryString, _data, onDataReceived, onError) {
        fetchTimer = Math.round((new Date()).getTime() / 1000);
        // Attempt to creat the XHR2 object
        var xhr;
        try {
            xhr = new XMLHttpRequest();
        } catch (e) {
            try {
                xhr = new XDomainRequest();
            } catch (e) {
                try {
                    xhr = new ActiveXObject('Msxml2.XMLHTTP');
                } catch (e) {
                    try {
                        xhr = new ActiveXObject('Microsoft.XMLHTTP');
                    } catch (e) {
                        _gd_.utils.log('\nYour browser is not compatible with XHR2');
                    }
                }
            }
        }

        xhr.open(method, queryString, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function (e) {
            // Response handlers.
            if(xhr.readyState == 4 && xhr.status == 200){
                var text = xhr.responseText;
                _gd_.utils.log("fetchData success: " + text);
                if (typeof (onDataReceived) !== "undefined") onDataReceived(text);
            }
            else{
                _gd_.utils.log("Xml fetch failed. Using default values!");
                onDataReceived();
            }
        };
        xhr.onerror = function (data) {
            _gd_.utils.log("fetchData error: " + data);
            if (typeof (onError) !== "undefined") onError(data);
        };

        xhr.send(this.serialize(_data));
    },

    parseXml: function(xml) {
        var dom = null;
        if (window.DOMParser) {
            try {
                dom = (new DOMParser()).parseFromString(xml, "text/xml");
            }
            catch (e) { dom = null; }
        }
        else if (window.ActiveXObject) {
            try {
                dom = new ActiveXObject('Microsoft.XMLDOM');
                dom.async = false;
                if (!dom.loadXML(xml)) // parse error ..
                    window.alert(dom.parseError.reason + dom.parseError.srcText);
            }
            catch (e) { dom = null; }
        }
        else
            alert("cannot parse xml string!");
        return dom;
    },

    xml2obj: function (xml, tab) {
        var X = {
            toObj: function(xml) {
                var o = {};
                if (xml.nodeType==1) {
                    if (xml.attributes.length)
                        for (var i=0; i<xml.attributes.length; i++)
                            o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
                    if (xml.firstChild) { // element has child nodes ..
                        var textChild=0, cdataChild=0, hasElementChild=false;
                        for (var n=xml.firstChild; n; n=n.nextSibling) {
                            if (n.nodeType==1) hasElementChild = true;
                            else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++;
                            else if (n.nodeType==4) cdataChild++; // cdata section node
                        }
                        if (hasElementChild) {
                            if (textChild < 2 && cdataChild < 2) {
                                X.removeWhite(xml);
                                for (var n=xml.firstChild; n; n=n.nextSibling) {
                                    if (n.nodeType == 3)  // text node
                                        o["#text"] = X.escape(n.nodeValue);
                                    else if (n.nodeType == 4)  // cdata node
                                        o["#cdata"] = X.escape(n.nodeValue);
                                    else if (o[n.nodeName]) {  // multiple occurence of element ..
                                        if (o[n.nodeName] instanceof Array)
                                            o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                        else
                                            o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                    }
                                    else  // first occurence of element..
                                        o[n.nodeName] = X.toObj(n);
                                }
                            }
                            else { // mixed content
                                if (!xml.attributes.length)
                                    o = X.escape(X.innerXml(xml));
                                else
                                    o["#text"] = X.escape(X.innerXml(xml));
                            }
                        }
                        else if (textChild) { // pure text
                            if (!xml.attributes.length)
                                o = X.escape(X.innerXml(xml));
                            else
                                o["#text"] = X.escape(X.innerXml(xml));
                        }
                        else if (cdataChild) { // cdata
                            if (cdataChild > 1)
                                o = X.escape(X.innerXml(xml));
                            else
                                for (var n=xml.firstChild; n; n=n.nextSibling)
                                    o["#cdata"] = X.escape(n.nodeValue);
                        }
                    }
                    if (!xml.attributes.length && !xml.firstChild) o = null;
                }
                else if (xml.nodeType==9) { // document.node
                    o = X.toObj(xml.documentElement);
                }
                else
                    alert("unhandled node type: " + xml.nodeType);
                return o;
            },
            toJson: function(o, name, ind) {
                var json = name ? ("\""+name+"\"") : "";
                if (o instanceof Array) {
                    for (var i=0,n=o.length; i<n; i++)
                        o[i] = X.toJson(o[i], "", ind+"\t");
                    json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
                }
                else if (o == null)
                    json += (name&&":") + "null";
                else if (typeof(o) == "object") {
                    var arr = [];
                    for (var m in o)
                        arr[arr.length] = X.toJson(o[m], m, ind+"\t");
                    json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
                }
                else if (typeof(o) == "string")
                    json += (name&&":") + "\"" + o.toString() + "\"";
                else
                    json += (name&&":") + o.toString();
                return json;
            },
            innerXml: function(node) {
                var s = ""
                if ("innerHTML" in node)
                    s = node.innerHTML;
                else {
                    var asXml = function(n) {
                        var s = "";
                        if (n.nodeType == 1) {
                            s += "<" + n.nodeName;
                            for (var i=0; i<n.attributes.length;i++)
                                s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                            if (n.firstChild) {
                                s += ">";
                                for (var c=n.firstChild; c; c=c.nextSibling)
                                    s += asXml(c);
                                s += "</"+n.nodeName+">";
                            }
                            else
                                s += "/>";
                        }
                        else if (n.nodeType == 3)
                            s += n.nodeValue;
                        else if (n.nodeType == 4)
                            s += "<![CDATA[" + n.nodeValue + "]]>";
                        return s;
                    };
                    for (var c=node.firstChild; c; c=c.nextSibling)
                        s += asXml(c);
                }
                return s;
            },
            escape: function(txt) {
                return txt.replace(/[\\]/g, "\\\\")
                    .replace(/[\"]/g, '\\"')
                    .replace(/[\n]/g, '\\n')
                    .replace(/[\r]/g, '\\r');
            },
            removeWhite: function(e) {
                e.normalize();
                for (var n = e.firstChild; n; ) {
                    if (n.nodeType == 3) {
                        if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
                            var nxt = n.nextSibling;
                            e.removeChild(n);
                            n = nxt;
                        }
                        else
                            n = n.nextSibling;
                    }
                    else if (n.nodeType == 1) {  // element node
                        X.removeWhite(n);
                        n = n.nextSibling;
                    }
                    else                      // any other node
                        n = n.nextSibling;
                }
                return e;
            }
        };
        if (xml.nodeType == 9) // document node
            xml = xml.documentElement;
        /*
            Return Xml to Json
        var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
        return "{" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "}";
        */

        return X.toObj(X.removeWhite(xml));
    }

};


/*
    Channel
*/
_gd_.logchannel = {
    initialTimeout: 0,
    callbackParam: "",
    postObj: {},
    init: function () {
        if (_gd_.static.enable) {
            this.initialTimeout = setInterval(this.timerHandler.bind(this), _gd_.static.pingTimeOut);
        }
    },
    timerHandler: function (e) {
        if (_gd_.static.enable) {
            _gd_.utils.log("timerHandler: " + this.initialTimeout);

            var actionArray = _gd_.logger.ping();
            if (_gd_.logrequest.Pool.length > 0) {
                actionArray = _gd_.logrequest.Pool.shift();
            }

            this.postObj.cbp = this.callbackParam;
            try {
                this.postObj.act = JSON.stringify(actionArray);
                _gd_.utils.fetchData("", this.postObj, this.onCompleted);
                _gd_.utils.log('Send action: ' + this.postObj.act);
            }
            catch (e) {
                _gd_.utils.log('Send error: ' + e);
            }
        }
    },

    /* Events */
    onCompleted: function (data) {
        if (data != null && data != '') {
            try {
                var vars = JSON.parse(data);
                _gd_.logrequest.doResponse(vars);
                this.callbackParam = vars.cbp;
            }
            catch (e) {
                _gd_.utils.log('onCompleted Error: ' + e);
                _gd_.logger.visit();
            }
        }
    }
};

/*
    Logger
*/
_gd_.logger = {
    init: function (gameId, regId) {

        if (_gd_.static.enable) {
            _gd_.utils.log("API is already Initilized.");
        } else {
            var gameserver = regId.toLowerCase().split("-");
            _gd_.static.serverId = gameserver.splice(5, 1)[0];
            _gd_.static.regId = gameserver.join("-");
            _gd_.static.gameId = gameId;

            _gd_.logchannel.postObj.gid = gameId;
            _gd_.logchannel.postObj.ref = _gd_.static.gdApi.href; //window.location.href;
            _gd_.logchannel.postObj.sid = _gd_.utils.sessionId();
            _gd_.logchannel.postObj.ver = _gd_.version;

            _gd_.static.enable = true;

            _gd_.logger.visit();

            _gd_.logchannel.init();
            _gd_.utils.log("Game Distribution HTML5 API Init");
        }
    },
    visit: function () {
        if (_gd_.static.enable) {
            var sendObj = {};
            sendObj.action = "visit";
            sendObj.value = parseInt(_gd_.utils.getCookie("visit"));
            sendObj.state = parseInt(_gd_.utils.getCookie("state"));
            _gd_.logrequest.pushLog(sendObj);
        }
    },

    play: function () {
        if (_gd_.static.enable) {
            var sendObj = {};
            sendObj.action = "play";
            sendObj.value = _gd_.logger.incPlay();
            _gd_.logrequest.pushLog(sendObj);
        }
    },

    customlog: function (_key) {
        if (_gd_.static.enable) {
            if (_key != "play" || _key != "visit") {
                var customValue = _gd_.utils.getCookie(_key);
                if (customValue == 0) {
                    customValue = 1;
                    _gd_.utils.setCookie(_key, customValue);
                }

                var sendObj = {};
                sendObj.action = "custom";
                sendObj.value = new Array({ key: _key, value: customValue });
                _gd_.logrequest.pushLog(sendObj);
            }
        }
    },

    incPlay: function () {
        var play = _gd_.utils.getCookie("play");
        play++;
        _gd_.utils.setCookie("play", play);
        return parseInt(play);
    },

    ping: function () {
        if (_gd_.static.enable) {
            var sendObj = {};
            sendObj.action = "ping";
            sendObj.value = "ping";
            return sendObj;
        }
    }
}
/*
    LogRequest
*/
_gd_.logrequest = {
    Pool: [],

    pushLog: function (_pushAction) {
        for (var i = 0; i < this.Pool.length; i++) {
            if (this.Pool[i].action == _pushAction.action) {
                if (this.Pool[i].action == "custom" && this.Pool[i].value[0].key == _pushAction.value[0].key) {
                    this.Pool[i].value[0].value++;
                } else {
                    this.Pool[i].value = _pushAction.value;
                }
                break;
            }
        }
        if (i == this.Pool.length) this.Pool.push(_pushAction);
        return;
    },

    doResponse: function (_data) {
        switch (_data.act) {
            case "cmd":
                var sendObj = {};
                switch(_data.res) {
                    case "visit":
                        _gd_.logger.visit();
                        break;
                    /*
                    case "url":
                        sendObj.action = "cbp";
                        sendObj.value = OpenURL(_data.dat.url,_data.dat.target,_data.dat.reopen);
                        this.pushLog(sendObj);						
                        break;
                    case "js":
                        sendObj.action = "cbp";
                        var _CallJS:Object = CallJS(_data.dat.jsdata);
                        sendObj.value = _CallJS.response;
                        sendObj.result = _CallJS.cresult;
                        this.pushLog(sendObj);						
                        break;
                    */
                }						
                break;				
            case "visit":
                if (_data.res == _gd_.logchannel.postObj.sid) {
                    var state = parseInt(_gd_.utils.getCookie('state'));
                    state++;
                    _gd_.utils.setCookie('visit',0);
                    _gd_.utils.setCookie('state', state);
                }
                break;
            case "play":
                if (_data.res == _gd_.logchannel.postObj.sid) {
                    _gd_.utils.setCookie('play', 0);
                }
                break;
            case "custom":
                if (_data.res == _gd_.logchannel.postObj.sid) {
                    _gd_.utils.setCookie(_data.custom, 0);
                }
                break;
				
        }
    }

}

/*
 Banner
*/
_gd_.banner = {
    BannerConfig: null,
    bannerRequestURL: "",
    init: function (onBannerConfig) {
        if (_gd_.static.gdApi != null)
        {
            this.bannerRequestURL = (_gd_.static.useSsl ? "https://" : "http://") + _gd_.static.serverId + ".bn.submityourgame.com/" + _gd_.static.gameId + ".xml?ver="+_gd_.version + "&url="+ _gd_.static.gdApi.href;
            _gd_.utils.ajax("POST",this.bannerRequestURL,"",this.onDataRecieved);
            BannerConfig = onBannerConfig;
        }
    },
    onDataRecieved: function (data) {
        var dom = _gd_.utils.parseXml(data);
        var obj = _gd_.utils.xml2obj(dom);
         if (BannerConfig!=null && data != null) BannerConfig(obj);
         else BannerConfig();
    }
}