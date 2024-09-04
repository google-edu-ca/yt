/*
 * Game Distribution 2010-2017
 */
(function(window) {

  var UNDEFINED = 'undefined';
  var adsManager;
  var adsEnabled = false;
  var prerollEnabled = true;
  var gameId;
  var tagUrl,adtagData;
  var affialateId;
  var midrollTimeout = 0;
  var adBlock = true;
  //var gdgaUUID = 'UA-102700627-1'; // test account
  var gdgaUUID = 'UA-102601800-1'; // live account
  var gdApi = window['gdApi'];
  var settings = gdApi.q[0][0];
  gdApi.href = getParentUrl(); //window.location.href;

  // AdBlock Checker
  loadScript('adframe.js', function() {
    adBlock = false;
  }, function() {
    adBlock = true;
    console.log('GD Banner not initiliazed! Because of AdBlocker');
  });

  init();

  function init() {
    if (typeof _gd_ga === UNDEFINED) {
      (function(i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function() {
          (i[r].q = i[r].q || []).push(arguments);
        }, i[r].l = 1 * new Date();
        a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m);
      })(window, document, 'script',
          '', '_gd_ga');

      _gd_ga('create', gdgaUUID, {'name': 'gd'}, 'auto');
      _gd_ga('gd.send', 'pageview');

      var s = document.createElement('script');
      s.innerHTML = 'var DS_OPTIONS={id: \'GAMEDISTRIBUTION\',success: function(id) {_gd_ga(\'gd.set\', \'userId\', id); _gd_ga(\'gd.set\', \'dimension1\', id);}}';
      document.head.appendChild(s);

      (function(window, document, element, source) {
        var ds = document.createElement(element),
            m = document.getElementsByTagName(element)[0];
        ds.type = 'text/javascript';
        ds.async = true;
        ds.src = source;
        m.parentNode.insertBefore(ds, m);
      })(window, document, 'script',
          'main.min.js');
    }
    // JQUERY
    if (typeof $ === UNDEFINED) {
      loadScript('jquery-2.1.4.min.js', function() {
        init();
      });
      return;
    }
    // JQUERY Md5 Plugin
    if (typeof calcMD5 === UNDEFINED) {
      loadScript('md5.js', function() {
        init();
      });
      return;
    }
    // Analytics
    if (typeof _gd_ === UNDEFINED) {
      loadScript('analytics.js',
          function() {
            //loadScript("../libs/gd/analytics.js", function () {
            init();
          });
      return;
    }


    // Ads
    if (!adBlock && typeof GameDistributionAds === UNDEFINED) {
      loadScript('ads.js', function() {
        // loadScript("../libs/gd/ads.js", function () {
            init();
          });
      return;
    }
    // All Done
    if (typeof(settings.gameId) !== UNDEFINED &&
        typeof(settings.userId) !== UNDEFINED) {
      try {
        _gd_['static'].gdApi = gdApi;
        _gd_['static'].useSsl = ('https:' == document.location.protocol);
        _gd_.logger.init(settings.gameId, settings.userId);
        _gd_.banner.init(onBannerConfig);
        gdApi.play = _gd_.logger.play;
        gdApi.customLog = _gd_.logger.customlog;

        if (typeof (settings.onInit) !== UNDEFINED) {
          var o = [
            '%c %c %c GameDistribution Html5 Api | v1.4.3 24102017 | %c %c %c http://tunnl.com',
            'background: #9854d8',
            'background: #6c2ca7',
            'color: #ffffff; background: #450f78;',
            'background: #6c2ca7',
            'background: #9854d8',
            'background: #ffffff'];
          settings.onInit(
              {Code: 100, Msg: 'GameDistribution Html5 Api initialized.'});
          console.log.apply(console, o);
          _gd_ga('gd.send', {
            hitType: 'event',
            eventCategory: 'API',
            eventAction: 'Init',
            eventLabel: settings.gameId,
          });
        }

      } catch (e) {
        onError(e);
      }
    } else {
      onError('You need to define GameId and PublisherId.');
    }
  }

  function showBannerInternal(data) {
    adsManager.requestAds(false,adtagData);

    _gd_ga('gd.send', {
      hitType: 'event',
      eventCategory: 'Ad',
      eventAction: 'Requested Midroll',
      eventLabel: settings.gameId,
    });
  }

  function onBannerConfig(data) {
    if (data) {
      // Init Ads
      var adsContainer = document.createElement('div');
      adsContainer.setAttribute('id', 'ads-container');
      adsContainer.style.position = 'absolute;';
      document.body.appendChild(adsContainer);
      var videoContainer = document.createElement('video');
      videoContainer.style.display = 'none';
      document.body.appendChild(videoContainer);
      document.body.style.padding = '0px';
      document.body.style.margin = '0px';
      document.documentElement.style.padding = '0px';
      document.documentElement.style.margin = '0px';
      document.documentElement.style.overflow = 'hidden';
      //console.log(data);
      // Set defaults, which could be overwritten.
      var defaults = {
        adsEnabled: true,
        prerollEnabled: true,
        midrollTimeout: 2,
        gameId: '',
        affialateId: '',
      };
      // Create options by extending defaults with the passed in arguments.

      if (typeof (data.cfg) !== UNDEFINED && typeof(data.cfg.f) !== UNDEFINED) {
        adsEnabled = false;
      } else {
        adsEnabled = data.row['0'].act;
        prerollEnabled = data.row['0'].pre === '1';
        midrollTimeout = data.row['0'].sat;
        gameId = data.row['0'].uid;
        affialateId = data.row['0'].aid;

        //APPLY NEW TAG STRATEGY HERE
        var newReportUrls = [
          'kizi.com',
          'loola.com',
          'hellokids.com',
          'yepi.com',
          'spele.nl',
          'funnygames.nl',
          'oyungemisi.com',
          'spele.be',
          'spielspiele.de',
          'zigiz.com',
          'gembly.com',
          'keygames.com',
          'jouerjouer.com',
          'spiels.at',
          'spiels.ch',
          'hryhry.net',
          'pelaaleikkia.com',
          'waznygry.pl',
          'nyckelspel.se',
          'minigioco.it',
          '1001igry.ru',
          'clavejuegos.com',
          'kilitoyun.com',
          'jogojogar.com',
          'starbie.co.uk',
          'games.co.za',
          'spelletjesoverzicht.nl',
          'cadajogo.com',
          'cadajogo.com.br',
          'cadajeugo.es',
          'funny-games.co.uk',
          'funnygames.at',
          'funnygames.be',
          'funnygames.biz',
          'funnygames.ch',
          'funnygames.cn',
          'funnygames.co.id',
          'funnygames.com.br',
          'funnygames.com.co',
          'funnygames.com.mx',
          'funnygames.com.tr',
          'funnygames.dk',
          'funnygames.es',
          'funnygames.eu',
          'funnygames.fi',
          'funnygames.fr',
          'funnygames.gr',
          'funnygames.hu',
          'funnygames.ie',
          'funnygames.in',
          'funnygames.ir',
          'funnygames.it',
          'funnygames.jp',
          'funnygames.kr',
          'funnygames.lt',
          'funnygames.no',
          'funnygames.org',
          'funnygames.ph',
          'funnygames.pk',
          'funnygames.pl',
          'funnygames.pt',
          'funnygames.ro',
          'funnygames.ru',
          'funnygames.se',
          'funnygames.us',
          'stratego.com',
          'governorofpoker.com',
          'governorofpoker4.net',
          'vooxe.video',
          'gamedistribution.com',
          'vooxe.com',
          'bgames.com'
        ];
        var newReportGames = [
          "00140aa90c8a49c3a711ac20c644ff6a",
          "015bbadfcafb4374813f8803b1737222",
          "016fc432beed445cb953b2d5172f80c9",
          "04257f926e0a4ca5a246769e359d5d2e",
          "054bf2e6cb4a46afb3fca913cc74d643",
          "095def4e5b50476fb49a35bfb0b943af",
          "0be90c46947c40a4af8a2bd2a8f36cf3",
          "0e69f524bfd44219a53decec2a947938",
          "0e9740e72bf147c0bc0dfbfe9ce3fb98",
          "0f56004ab0d8420b8c0d7bfea8781a21",
          "104b7f960ee04492a1a04b1cd718f640",
          "118aae37035d44d5bcdb17e443787a9d",
          "127c290309bb4b7096dab06c711ad58e",
          "14a6a32cd96f4acaa04f5440ffe9a865",
          "170792b03e1e4dfa84191342903b1ce0",
          "1b05720348e145ccbe69a28a062d0220",
          "1dc177bea99a4450ba95ffb2a22bccfd",
          "206c5623d58b412d85246eecd5852443",
          "210802df55454737b3ef7f901c0de8d3",
          "2164c0f43b21402a900136688bdf3b6c",
          "23a719c3577c4bd5902b17577bd97d24",
          "25a66b4cf54245c88237c7e5a154f315",
          "25df790acc154934a752b53dc14b2381",
          "265047b7c859491bbe2cc21b281e6c76",
          "27673bc45d2e4b27b7cd24e422f7c257",
          "2bc1ccb7ed7547dd8c43da459bf99dd2",
          "2c3a4762932e474ebf78124c4de3fbf0",
          "2dae86bfcac842a3adf93ba9c1b6c67d",
          "2eb790244e784a31afb4d67171f506f7",
          "34b65ebf985443deafb2bffb755e13dd",
          "366339a14dc44cf7aef67d1d18fd4710",
          "37a33e600d81432cb15674e35c5f1246",
          "3b56718d228d4317af566eb1d73b1f75",
          "3ceba4ca1f4445278513232043d103ae",
          "3dad3b5e9ee945fab703fd92486e39ca",
          "3de0c1fd03414f92b4324ebfe54fc562",
          "3f00785d4f604d6db42830b7393b515a",
          "3f21bdf56f534cb0b408e661936004c1",
          "405c00612981466cbc5d9dcef4214811",
          "42b13228239d41d4b88f5aa6199d37cf",
          "49258a0e497c42b5b5d87887f24d27a6",
          "49f678c1fe4e4807814e04d9ca0e2acd",
          "4b4ac998ef6c43958f82bb3a9819d2f3",
          "4d5559bdd7fe492f95dafdd233a582ea",
          "4ef417494f3b4770b3cea7e8f3ea004d",
          "502af82350a44582b6e51d467285a8c0",
          "50f2195e9bf5435eaf85d692f5e84e07",
          "50f47e5966b1442da8f24dfe020c5b31",
          "55140c6e61264a218f7bf228f136454b",
          "553949bb2a284dda91b17d118b4ccb17",
          "5641e1f8019d48c1ac7a45b4fe588034",
          "5720633fecd545a188471d3ce7a7bbeb",
          "58bede42d60b4e648053a57e6b14ddba",
          "5ed3b1c510c3400db0ef580c60cbcdca",
          "5efeabe0ca1b459f9ebb7e215326b68d",
          "621e0ccd95d84033ae633e628b552cac",
          "6223b98714cc4b429cb1cce3e2928b66",
          "6248cc415c3f4de2bdaefe544617a092",
          "647536adcfa040668029eae70c72ce33",
          "67fbae06de8a4cf68e773c5291953319",
          "68ac1f7590ef439e92765e4199779d65",
          "6984522dd6714dd8b92b5285c6bc0ceb",
          "6a1005ef145c4366a26fd2058c375e7b",
          "6c38a6b5247341ec9086e821f3bffa96",
          "6c6632c5975c49f383774d51ed8eaa5d",
          "6c92804773b447f2aa4916ed6664513e",
          "6e510f4f493b41d4ac67bb70d052a454",
          "70f9fcac98f44c84b9d7e7a09c0834a5",
          "73d0591c6f0046729441a47247112c5c",
          "762c932b4db74c6da0c1d101b2da8be6",
          "79458ce8cd0141cab6b93fcefce78923",
          "79b12f0056524b33bc95fb1cdb1492c0",
          "7a150efd02ca4ba285ef56be1367210e",
          "7a174a197cea4039ad4b8cb65880de7c",
          "7a93800bd9e143c8b7c1490a16608df2",
          "7beb594936bd4e65b3e20c81b299fe68",
          "7ebd9713cf7d41be80c5d8b8c87786fa",
          "7fbce90e7db74cf3817cbfac0e6684c2",
          "8198902ff8ae4fd7a29208013eb9d072",
          "82f3e60625c0476980e80df7348c58f4",
          "83ad7a853feb492f84c73177d7ac9702",
          "8b63540b9b7549aaa044fcae7dfae2fe",
          "8d264713bcbe49458d3ecdad8eb2a11c",
          "8e9afb9200cb453ea6ad1e9213c150b1",
          "8ea3227da34148c8b61633b5b2121196",
          "8f1a09c833e04627ae3d99cc4456dc6f",
          "8f41a80064d3435fae16fcb4906b0321",
          "919e83dbc31749e1a54787e656ce513b",
          "9252f32face14296a09725012315ca2e",
          "92a81cc3a9da4cde89a418ae6bd4b4c4",
          "9467420d5c84482e9087276338a3a7b1",
          "9473e43b5d5c4e2eb5a57bc3f8075eda",
          "9592dff9e99548ab94dad2849a0a36df",
          "98f0d5f93731b7f3186531c37cca0945",
          "9c5394804a214a089b19a735817e7c54",
          "9fbc51ea9f3941ebbd50667bbeb1e6e9",
          "9ff7dcfb58974b72a0f4b3b0257594b7",
          "a258c3f728e94547aefed425dcffafca",
          "a29572408f554053a31af5dca3b7e014",
          "a36eff65463f47b2b1017fc027041ebc",
          "a3bb020cbb834234afaffc5df7a3dd0c",
          "a72950d6b65d493d972644c47a988192",
          "a7f5393b417346268657f3bd67eac24e",
          "a8c1906fe6db458080dd17b299d5f79f",
          "a90bd3f1fba643828ccfb0109b41a252",
          "aa269c091dc14e9a8fc7d472f775d8ec",
          "ab4cd1057489401899c5b8f1e050070f",
          "af2ff2835f2145d3b2a7e5eb1ed0d011",
          "b23deb025996424da64cf8f8cf986fd8",
          "b3de01f161214a7f8d6a65ddb315cf38",
          "b847628a0c004b0b916064a98034747d",
          "bda1b58b9fb64a53b25a1b429ebb81cf",
          "c3d4e42d74c94be0a88d3510f68032a2",
          "c418646ba9c748ed95765343496310ab",
          "c62ced3539b74e148cb7d8b63a224942",
          "c9aaa3b81a8a4e9e8e16a23a577454c1",
          "cb097ba6249148ecbb3dd3fdfd21260b",
          "cbfc8ae26e2542c7a4609ba2a1ad8183",
          "cf3fa9bfffc3471092893ed989d739f9",
          "cf7c8d8d0bb342eeb1e6d56f2d9ed1c8",
          "d213abe854d74cdda9e613644fb7a58c",
          "d3cd7323dc38417c90e37f0ec4c3f548",
          "d89e2d24d66e4bcb9f1b7a9e9881c702",
          "d91c765ad7f5498580e19f6a24f2cf6f",
          "da317f74759443f6b48d93b22464db8b",
          "e0978d8fd1d14975b74779d547bbf389",
          "e2d52ec69741485a8f08a36545f1b8fd",
          "e7ed48f6f8be41fd98c35c5ccb8fece7",
          "e882702b27904e4e967d9bf589324461",
          "ed40354e856f4aae8ccac8b98d70dec3",
          "f019f89676b04eceb4e67bb238de1f74",
          "f21530a41fcc4719b8610d2e648f27db",
          "f2597208f84e4bf996d0f71d02d350a4",
          "f85e3e02194545208fa52da0c0992362",
          "f8ca5cbf53244d7ca088d5ca8a1e0fb1"
        ];
        var tagPageUrl = getParentDomain();
        if (newReportUrls.indexOf(tagPageUrl) > -1 && newReportGames.indexOf(gameId.replaceAll("-","")) > -1) {
          tagUrl = 'https://pub.tunnl.com/at?id='+gameId+'&pageurl='+tagPageUrl+'&type=1&time='+new Date().toDateString();
          // Try to send out a game play to new Tunnl
          makeHttpRequest('GET', tagUrl, null, function(_data) {
            var adTagId;
            if (_data) {
              _data = JSON.parse(_data);
              adtagData = _data;
              adTagId = _data.AdTagId;

              // Send out a game play to new Tunnl.
              (new Image()).src = 'https://pub.tunnl.com/DistEvent?tid=' +
                  adTagId + '&game_id=' + gameId + '&disttype=1&eventtype=1';
            }
          });
        }
        // END OF TAG CODES
      }
      // Send out a game play.
      (new Image()).src = 'https://analytics.tunnl.com/collect?type=html5&evt=game.play&uuid=' +
          gameId + '&aid=' + affialateId;

      if (!adBlock) {
        adsManager = new GameDistributionAds(
            {
              play: onResumeGame,
              pause: onPauseGame,
            },
            {
              container: adsContainer,
              videoContent: videoContainer,
              demoMode: 0,
              minAdsBreak: midrollTimeout,
              log: _gd_.utils.log,
              dfp: {
                adsEnabled: adsEnabled,
                gameId: gameId,
                affialateId: affialateId,
                parentUrl: gdApi.href,
              },
            });

        // Enabled for Preroll?
        if (adsEnabled && prerollEnabled) {
          adsManager.requestAds(true, adtagData); // isPreroll is true

          _gd_ga('gd.send', {
            hitType: 'event',
            eventCategory: 'Ad',
            eventAction: 'Requested Preroll',
            eventLabel: settings.gameId,
          });

        } else {
          onResumeGame();
        }

        // Show Banner
        gdApi.showBanner = showBannerInternal;
      } else {
        onResumeGame();
      }
    }

    else {
      gdApi.showBanner = function() {
        onResumeGame();
        _gd_.utils.log('Problem occured fetching xml data!');
      };
    }
  }

  function onPauseGame(data) {
    try {
      if (typeof (settings.resumeGame) !== UNDEFINED &&
          settings.resumeGame !== null) {
        settings.pauseGame();

        _gd_ga('gd.send', {
          hitType: 'event',
          eventCategory: 'Game',
          eventAction: 'Pause',
          eventLabel: settings.gameId,
        });
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  function onResumeGame(data) {
    try {
      if (typeof (settings.pauseGame) !== UNDEFINED &&
          settings.pauseGame !== null) {
        settings.resumeGame();
        _gd_ga('gd.send', {
          hitType: 'event',
          eventCategory: 'Game',
          eventAction: 'Resume',
          eventLabel: settings.gameId,
        });
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  function onError(data) {
    try {
      if (typeof(settings.onError) !== UNDEFINED) {
        settings.onError({Code: 404, Data: data});
        _gd_ga('gd.send', {
          hitType: 'event',
          eventCategory: 'API',
          eventAction: 'Error',
          eventLabel: settings.gameId,
          eventValue: 404,
        });
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  function getParentDomain() {
    var refer = (window.location != window.parent.location)
        ? document.referrer.split('/')[2]
        : document.location.host;
    var url = refer.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
    return url;
  }

  function getParentUrl() {
    // If the referrer is gameplayer.io, else we just return href.
    // The referrer can be set by Spil games.
    if (document.referrer.indexOf('gameplayer.io') !== -1) {
      // now check if ref is not empty, otherwise we return a default.
      var defaultUrl = 'https://gamedistribution.com/';
      if (document.referrer.indexOf('?ref=') !== -1) {
        var returnedResult = document.referrer.substr(document.referrer.indexOf(
            '?ref=') + 5);

        if (returnedResult !== '') {
          if (returnedResult === '{portal%20name}' ||
              returnedResult === '{portal name}') {
            returnedResult = defaultUrl;

          } else if (returnedResult.indexOf('http') !== 0) {
            returnedResult = 'http://' + returnedResult;
          }
        }
        else {
          returnedResult = defaultUrl;
        }

        return returnedResult;

      } else {
        return defaultUrl;
      }
    }
    else {
      if (document.referrer != null && document.referrer !== '') {
        return document.referrer;
      }
      return document.location.href;
    }

  }

  function extendDefaults(source, properties) {
    var property;
    for (property in properties) {
      if (properties.hasOwnProperty(property)) {
        source[property] = properties[property];
      }
    }
    return source;
  }

  function loadScript(url, callback, callbackError) {

    var script = document.createElement('script');
    script.type = 'text/javascript';

    if (script.readyState) {  //IE
      script.onreadystatechange = function() {
        if (script.readyState == 'loaded' ||
            script.readyState == 'complete') {
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {  //Others
      script.onload = function() {
        callback();
      };

      script.onerror = function() {
        if (typeof callbackError !== UNDEFINED)
          callbackError();
      };
    }

    script.src = url;

    document.getElementsByTagName('head')[0].appendChild(script);
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

  String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
  };

})(window);