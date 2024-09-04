function GameDistributionAds(game,config) {
    var adsManager=null;
    var adsLoader;
    var adsDisplayContainer;
    var adsLinearCounter = 0;
    var adsNonLinearCounter = 0;
    var container = config.container;
    var videoContent = config.videoContent;
    var controlsHeight = 0;
    var tagId = null;
    var log = config.log;
    var minAdsBreak = config.minAdsBreak != null ? parseInt(config.minAdsBreak)*60000 : 30000;//ms
    var fullscreenExited;
    var ads = {};
    var gdp=new GDP({log:config.log});

    var dfp = config.dfp;
    dfp.iu ="/40643032/1//G//H//"+dfp.affialateId;
    var lastPauseTime = 0;
    function makeGuid(id){
        return id.substring(0,8)+"-"+id.substring(8,12)+"-"+id.substring(12,16)+"-"+id.substring(16,20)+"-"+id.substring(20,32);
    }
    function init() {

        if(typeof google==='undefined'){
            game.play();
            return;
        }

        //if (clientHeight() <= 280) fullscreenfn();

        google.ima.settings.setVpaidAllowed(true);
        google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
        adsDisplayContainer = new google.ima.AdDisplayContainer(container);

        // Initialize the container. Must be done via a user action on mobile devices.
        adsDisplayContainer.initialize();

        //game.on('ended', contentEndedListener);
        //game.load();
        // Create ads loader.
        adsLoader = new google.ima.AdsLoader(adsDisplayContainer);

        // Listen and respond to ads loaded and error events.
        adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, onAdsManagerLoaded, false);
        adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);

        window.onresize = onResize;
    }
    function onAdsManagerLoaded(adsManagerLoadedEvent) {

        log("onAdsManagerLoaded");

        var adsRenderingSettings = new google.ima.AdsRenderingSettings();
        adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
        adsRenderingSettings.useStyledNonLinearAds=true;
        adsRenderingSettings.AUTO_SCALE=true;
        adsRenderingSettings.autoAlign=true;

        // videoContent should be set to the content video element.
        adsManager = adsManagerLoadedEvent.getAdsManager(videoContent, adsRenderingSettings);

        // Add listeners to the required events.
        adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
        adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, onContentPauseRequested);
        adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, onContentResumeRequested);
        adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onAdsLoaded);
        adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, onAdsStarted);
        adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, onAdsCompleted);
        // vpaid ads never call complete event. So, change it with all_ads_completed
        // https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdEvent.Type.ALL_ADS_COMPLETED


        adsManager.addEventListener(google.ima.AdEvent.Type.USER_CLOSE, onAdsUserClosed);
        adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPED, onAdsSkipped);

        try {
            // Initialize the ads manager. Ad rules playlist will start at this time.
            adsManager.init(clientWidth(), clientHeight(), google.ima.ViewMode.NORMAL);
            // Call play to start showing the ad. Single video and overlay ads will
            // start at this time; the call will be ignored for ad rules.
            adsManager.start();
        } catch (adError) {
            // An error may be thrown if there was a problem with the VAST response.
            game.play();
        }
    }

    function requestAds(isPreroll,adtagData) {
        // Ads is enabled
        if(typeof google==='undefined'|| (config.demoMode!=1&&!dfp.adsEnabled)){
            game.play();
            return;
        }

        if (navigator.userAgent.indexOf('Crosswalk') !== -1 || typeof window.cordova !== 'undefined') {
            // we are in a cordova app, let's not show ads
            game.play();
            return;
        }
        if ((typeof ads.lastAdsRequestTime) !== 'undefined') {
            var elapsed = (new Date()).valueOf() - ads.lastAdsRequestTime.valueOf();
            if (elapsed < minAdsBreak){
                game.play();
                return;
            }
        }
        ads.lastAdsRequestTime = new Date();

        if(adsManager!=null){
            adsManager.destroy();
            adsManager=null;
        }

        if(typeof adsLoader!=='undefined'){
            adsLoader.contentComplete();
        }

        if (typeof adsLoader === 'undefined') init();

        if (typeof adsLoader !== 'undefined') {
            delete ads.current;
        }

        if(adtagData){
          requestAdsInternal2(isPreroll,adtagData.AdTagId);
        }
        else if(tagId){
          requestAdsInternal2(isPreroll,tagId);
        }
        else{

          var tagPageUrl = getParentDomain();
          var tagUrl = 'https://pub.tunnl.com/at?id='+dfp.gameId+'&pageurl='+tagPageUrl+'&type=1&time='+new Date().toDateString();
          // Try to send out a game play to new Tunnl
          makeHttpRequest('GET', tagUrl, null, function(_data) {
            var adTagId;
            if (_data) {
              _data = JSON.parse(_data);
              adtagData = _data;
              tagId = _data.AdTagId;
              requestAdsInternal2(isPreroll,tagId);
            }
          });

          // requestAdsInternal2(isPreroll);
        }
    }
    function requestAdsInternal2(isPreroll,adTagId) {
      var adTagUrl;
      var adsRequest = new google.ima.AdsRequest();

      if(adTagId != null && adTagId != ""){
        adTagUrl = "https://pub.tunnl.com/opp?tid="+adTagId+"&player_width=640&player_height=480&page_url="+encodeURIComponent(getParentUrl())+"&game_id="+dfp.gameId+"";
      }
      else{
        adTagUrl="https://adtag.tunnl.com/adsr?";
        adTagUrl+="pa=1&";
        adTagUrl+="c=4&";
        adTagUrl+="sz=640x480&";
        adTagUrl+="a="+dfp.affialateId+"&";
        adTagUrl+="gameid="+dfp.gameId+"&";

        if(isPreroll && isMobilePlatform()){ // to solve video ad problem on mobile games, request image for preroll
          adTagUrl+="ad_type=image&";
          adTagUrl+="gametype=html5_ext&";
        }
        else{
          adTagUrl+="ad_type=video_image&";
        }
        adTagUrl+="adapter=off&";
        adTagUrl+="mfb=2&";
        adTagUrl+="page_url="+encodeURIComponent(getParentUrl())+"";
      }

        adsRequest.adTagUrl =adTagUrl;
        adsRequest.linearAdSlotWidth = clientWidth();
        adsRequest.linearAdSlotHeight = clientHeight();
        adsRequest.nonLinearAdSlotWidth = clientWidth()*0.80;
        adsRequest.nonLinearAdSlotHeight =clientHeight()*0.80;
        adsRequest.forceNonLinearFullSlot = true;
        adsRequest.disableCompanionAds = true;

        adsLoader.requestAds(adsRequest);
    }

    function getRequestSize(){

        var w = clientWidth();
        var h = clientHeight();

        var curDim = { w: 0, h: 0 };

        var dims = [{ w: 300, h: 250 }, { w: 336, h: 280 },{ w: 640, h: 480 }, { w: 728, h: 480 }];

        for (var i = 0; i < dims.length; i++) {
            var dim = dims[i];
            if (w >= dim.w && h >= dim.h && dim.w >= curDim.w && dim.h >= curDim.h) {
                curDim = dim;
            }
        }

        if (curDim.w == 0) {
            return {w:640,h:480};
        }
        else return curDim;
    }
    function resize(ad) {

        if (typeof ad === 'undefined')
            resetContainer(false);
        else if (ad.isLinear())
            resetContainer(true);
        else {
            var w = clientWidth();
            var h = clientHeight();

            var aw = ad.getWidth();
            var ah = ad.getHeight();

            if (aw == 0) aw = w;
            if (ah == 0) ah = h;

            resetContainer(true, aw, ah + 10, parseInt((w - aw) / 2), (h - (controlsHeight + ah + 10 + 20)));
        }
    }
    function resetContainer(active, width, height, left, top) {

        if (container) {
            container.style.position = 'absolute';
            container.style.backgroundColor = 'transparent';
            container.style.width = typeof width === 'undefined'
                ? (clientWidth() + 'px')
                : (width + 'px');
            container.style.height = typeof height === 'undefined'
                ? (clientHeight() + 'px')
                : (height + 'px');
            container.style.left = typeof left === 'undefined' ? '0' : left +
                'px';
            container.style.top = typeof top === 'undefined' ? '0' : top + 'px';
            container.style.zIndex = active ? 10000 : -100;
            container.style.display = active ? 'block' : 'none';
        }

        if (adsManager !=null)
            adsManager.resize(typeof width === 'undefined' ? clientWidth() : width, typeof height === 'undefined' ? clientHeight() : height, google.ima.ViewMode.NORMAL);
    }
    function resumeContentAfterError() {
        log("resumeContentAfterError");
        //player.on("playing",playing());
        game.play();
    }
    function playing() {
        log("playing");
    }
    function onAdError(adErrorEvent) {

        var adsErrorCode=adErrorEvent.getError().getErrorCode();

        //var failedCount=gdp.error(adsErrorCode,dfp.affialateId)

        //log("ads","error", adErrorEvent.getError().toString());

        if(_gd_ga){
            _gd_ga('gd.send',{
                hitType: 'event',
                eventCategory: 'Ad',
                eventAction: 'Error: '+ adsErrorCode,
                eventLabel: dfp.gameId.replace(/-/g,"")
            });
        }


        resetContainer(false);
        //resetControls(true);

        if (typeof ads.current !== 'undefined') {
            resumeContentAfterError();

            delete ads.current;
            delete ads.lastAdsRequestTime;
        }
        else {
            //game.play();
        }

        //if(adsManager)
        //    adsManager.destroy();
        game.play();
    }
    function onAdsLoaded(adEvent) {
        var ad = adEvent.getAd();

        log("onAdsLoaded", ad.getContentType(), ad.isLinear(), ad.isSkippable(), ad.getWidth(), ad.getHeight());

        if(_gd_ga){
            _gd_ga('gd.send',{
                hitType: 'event',
                eventCategory: 'Ad',
                eventAction: 'Loaded: '+ ad.getContentType(),
                eventLabel: dfp.gameId.replace(/-/g,"")
            });
        }


        game.pause();

        ads.current = ad;
        fullscreenExited = false;

        if (!ad.isLinear()) adsNonLinearCounter++;
        else { adsLinearCounter++; }

        resize(ads.current);
        if (ad.isLinear()) {
            //resetControls(false);
        }
    }

    function onAdsStarted(adEvent) {
        var ad = adEvent.getAd();
        var contentType = ad.getContentType();
        log("ads","started",contentType);

        if(_gd_ga){
            _gd_ga('gd.send',{
                hitType: 'event',
                eventCategory: 'Ad',
                eventAction: 'Started',
                eventLabel: dfp.gameId.replace(/-/g,"")
            });
        }


        //gdp.success(dfp.affialateId);

        // ios
        if (contentType.indexOf("video/") != 0) {
            if (videoContent.webkitExitFullscreen) {
                //game.pause();
                videoContent.webkitExitFullscreen();
                fullscreenExited = true;
            }
        }
    }
    function onAdsCompleted(adEvent) {
        var ad = adEvent.getAd();

        //log("ads","completed",totalAds());
        if(_gd_ga){
            _gd_ga('gd.send',{
                hitType: 'event',
                eventCategory: 'Ad',
                eventAction: 'Completed',
                eventLabel: dfp.gameId.replace(/-/g,"")
            });
        }


        adClosed(ad);
    }
    function onAdsUserClosed(adEvent) {
        var ad = adEvent.getAd();

        if(_gd_ga){
            _gd_ga('gd.send',{
                hitType: 'event',
                eventCategory: 'Ad',
                eventAction: 'UserClosedAd',
                eventLabel: dfp.gameId.replace(/-/g,"")
            });
        }
        //log("ads","user_closed",totalAds());
        adClosed(ad);
    }
    function onAdsSkipped(adEvent) {
        var ad = adEvent.getAd();
        //log("ads","skipped",totalAds());
        if(_gd_ga){
            _gd_ga('gd.send',{
                hitType: 'event',
                eventCategory: 'Ad',
                eventAction: 'Skipped',
                eventLabel: dfp.gameId.replace(/-/g,"")
            });
        }
        adClosed(ad);
    }
    function adClosed(ad) {
        //log("adClosed");
        ads.lastAdsRequestTime = new Date();

        game.play();

        resetContainer(false);

        delete ads.current;
    }

    function contentEndedListener() {
        log("contentEndedListener");
        if (typeof adsLoader !== 'undefined')
            adsLoader.contentComplete();
    };
    function onContentPauseRequested() {
        log("onContentPauseRequested");

        //game.off('ended', contentEndedListener);
        //lastPauseTime = game.currentTime();
        //game.pause();

        log("pause", lastPauseTime);
    }
    function onContentResumeRequested() {

        log("onContentResumeRequested");
        fullscreenExited = false;

        //game.on('ended', contentEndedListener);
        //game.src(contentSrc);
        //game.on('loadedmetadata', loadedMetadataHandler);
        //game.load();

        //showControlsfn();
    }
    function loadedMetadataHandler() {

        log("loadedMetadataHandler", lastPauseTime);

        if (videoContent.seekable.length) {
            // Video is in a seekable state
            if (videoContent.seekable.end(0) > lastPauseTime) {
                // We can seek to the last pause time
                log(lastPauseTime);
                //game.currentTime(lastPauseTime);
                //game.off('loadedmetadata', loadedMetadataHandler);
                game.play();
            }
        } else {
            // Video isn't seekable yet, try again in 100ms
            setTimeout(loadedMetadataHandler, 100);
        }
    }

    function onResize() {
        resize(ads.current);
    }
    function clientWidth() {
        return document.documentElement.clientWidth;
    }
    function clientHeight() {
        return document.documentElement.clientHeight;
    }
    function totalAds() {
        return adsLinearCounter + adsNonLinearCounter;
    }
    function isMobilePlatform() {
        return (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) ||
            (navigator.userAgent.toLowerCase().indexOf('android') > -1);
    }
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    function getParentUrl() {
        return  (window.location != window.parent.location) ? document.referrer : document.location.href;
    }
    function makeHttpRequest(method, url, data, callback) {
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

    xhr.open(method, url, true);
    if(method === 'POST')
      xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function(e) {
      // Response handlers.
      if (xhr.readyState == 4 && xhr.status == 200) {
        var text = xhr.responseText;
        callback(text);
        _gd_.utils.log('fetchData success: ' + text);
      }
    };
    xhr.onerror = function(data) {
      _gd_.utils.log('fetchData error: ' + data);
      callback();
    };

    if(method === 'POST')
      xhr.send(JSON.stringify(data));
    else
      xhr.send();

  }
  function getParentDomain() {
    var refer = (window.location != window.parent.location)
        ? document.referrer.split('/')[2]
        : document.location.host;
    var url = refer.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
    return url;
  }

    return {
        requestAds: requestAds,
        totalAds: totalAds,
        init: init
    };
}

function GDP(config) {

    var UNDEFINED = 'undefined';

    var version = 10;
    var clientApi = 4;
    var req = 1;

    var sessionOpened = false;

    config = config || {};

    var log = config.log;

    var gdp = {g: 0, i: 0, l: 3, n: 1, m: 5, su: 3, sui: 1, ed: 1, edd: 1, lt: 2000, lp: false, lv: 0, gdpi: ""};

    gdp = get("gdp", gdp);
    gdp.s = gdp.s || [];
    gdp.su = gdp.su || 3;
    gdp.sui = gdp.sui || 1;
    gdp.ed = gdp.ed || 1;
    gdp.edd = gdp.edd || 1;
    gdp.lt = gdp.lt || 3000;
    gdp.lp = gdp.lp == true;
    gdp.gdpi = gdp.gdpi || "";
    gdp.lv = gdp.lv || 0;

    var adsPriceLevelRequested = gdp.l;
    var oldAdsPriceLevelRequested = gdp.l;
    var adsRetryCount = 0;
    var oldAdsRetryCount = 0;

    var uri = "https://adtag.tunnl.com/collect";

    function session() {
        if (sessionOpened) return;

        sessionOpened = true;

        $.get(uri, {v: version, a: clientApi, e: 3, g: gdp.g, l: 0, r: 0});

        if (log !== UNDEFINED)
            log("gdp.session");
    }

    function request(callback, aid) {

        adsPriceLevelRequested = get("gdp.l", gdp.l);

        $.ajax({
            url: uri,
            data: {v: version, a: clientApi, aid: aid},
            timeout: gdp.lt,
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            success: function (data) {

                if (typeof data === "string")
                    data = JSON.parse(data);

                if (data.i != gdp.i) {
                    gdp = data;
                    set("gdp", gdp);

                    adsPriceLevelRequested = gdp.l;
                    set("gdp.l", adsPriceLevelRequested);
                }

                callback(adsPriceLevelRequested, req, gdp.lv);
                req++;
            },
            error: function () {
                callback(adsPriceLevelRequested, req, gdp.lv);
                req++;
            }
        });
    }

    function success(aid) {

        oldAdsPriceLevelRequested = adsPriceLevelRequested;

        set("gdp.ed", gdp.ed);
        var su = get("gdp.su", gdp.su);
        su--;
        if (su <= 0) set("gdp.su", gdp.su);
        else set("gdp.su", su);

        if (gdp.lp) {
            adsPriceLevelRequested += 1;
            if (adsPriceLevelRequested > gdp.m) adsPriceLevelRequested = gdp.n;
            set('gdp.l', adsPriceLevelRequested);
        }
        else if (su <= 0) {
            adsPriceLevelRequested += gdp.sui;
            if (adsPriceLevelRequested > gdp.m) adsPriceLevelRequested = gdp.m;
            // START
            if (adsPriceLevelRequested < gdp.n) adsPriceLevelRequested = gdp.m;
            // END
            set('gdp.l', adsPriceLevelRequested);
        }

        oldAdsRetryCount = adsRetryCount;

        $.ajax({
            url: uri,
            data: {
                v: version,
                a: clientApi,
                e: 1,
                g: gdp.g,
                l: oldAdsPriceLevelRequested,
                r: oldAdsRetryCount,
                lv: gdp.lv,
                aid: aid,
                gdpi: gdp.gdpi
            },
            timeout: gdp.lt,
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true
        });

        adsRetryCount = 0;
        req = 1;
    }

    function error(adsErrorCode, aid) {

        var oldAdsPriceLevelRequested = adsPriceLevelRequested;

        //if (adsErrorCode == 1009)
        //{
        set("gdp.su", gdp.su);
        var ed = get("gdp.ed", gdp.ed);
        ed--;
        if (ed <= 0) set("gdp.ed", gdp.ed);
        else set("gdp.ed", ed);

        if (gdp.lp) {
            adsPriceLevelRequested += 1;
            if (adsPriceLevelRequested > gdp.m) adsPriceLevelRequested = gdp.n;
            set('gdp.l', adsPriceLevelRequested);
        }
        else if (ed <= 0) {
            adsPriceLevelRequested -= gdp.edd;

            if (adsPriceLevelRequested < gdp.n) adsPriceLevelRequested = gdp.n;
            // START
            if (adsPriceLevelRequested > gdp.m) adsPriceLevelRequested = gdp.n;
            // END
            set('gdp.l', adsPriceLevelRequested);
        }
        //}

        adsRetryCount++;

        $.ajax({
            url: uri,
            data: {
                v: version,
                a: clientApi,
                e: 0,
                g: gdp.g,
                l: oldAdsPriceLevelRequested,
                r: adsErrorCode,
                lv: gdp.lv,
                aid: aid,
                gdpi: gdp.gdpi
            },
            timeout: gdp.lt,
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true
        });

        if (log !== UNDEFINED)
            log("gdp.error." + gdp.g, 'l:' + oldAdsPriceLevelRequested, 'r:' + adsRetryCount);

        return adsRetryCount;
    }

    function reset() {
        adsRetryCount = 0;
        req = 0;
    }

    var storageAvailabe = (function () {
        try {
            localStorage.setItem('h_testKey', '1');
            localStorage.removeItem('h_testKey');
            return true;
        } catch (e) {
            return false;
        }
    })();

    function get(key, defaultValue) {
        if (!storageAvailabe) {
            return defaultValue;
        }

        if (typeof defaultValue !== 'undefined')
            return localStorage.getItem(key) || defaultValue;
        else
            return localStorage.getItem(key);
    }

    function set(key, value) {
        if (storageAvailabe) {
            return;
        }

        try {
            localStorage.setItem('h_' + key, value);
        } catch (e) {}
    }

    return {
        request: request,
        error: error,
        success: success,
        reset: reset
    }
}