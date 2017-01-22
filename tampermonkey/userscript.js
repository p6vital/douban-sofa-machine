// ==UserScript==
// @name Douban Sofa Machine
// @namespace http://ligeleng.net/
// @version 0.1
// @description Douban Sofa
// @author LGL
// @include /^https?:\/\/(www\.)?douban\.com(\/\w+(\/)?)+\?(debug=(\w+))\w*/
// @require https://unpkg.com/react@15/dist/react.js
// @require https://unpkg.com/react-dom@15/dist/react-dom.js
// @require https://unpkg.com/babel-standalone@6/babel.min.js
// @resource layoutCss https://raw.githubusercontent.com/p6vital/douban-sofa-machine/master/tampermonkey/debug-nav.css
// @resource reactJsx https://gist.githubusercontent.com/p6vital/8ca3fb3c2b22ddb757e53bde334e7917/raw/970d0bc4c07fd194187f24cb59f400edb342e24d/douban-sofa-machine.jsx
// @grant GM_addStyle
// @grant GM_getResourceText
// ==/UserScript==

(function() {
    'use strict';

    // Inject CSS
    var layoutCss = GM_getResourceText("layoutCss");
    GM_addStyle(layoutCss);

    // Util functions
    window.DoubanUtils = (function() {
        var getParameterByName = function (name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        };

        var debugMode = getParameterByName('debug');

        var updateQueryStringParameter = function(uri, key, value) {
            var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";
            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            } else {
                return uri + separator + key + "=" + value;
            }
        };

        var getCkValue = function getCkValue() {
            var href = $('a[href*="ck="]').attr('href');
            var ck = getParameterByName('ck', href);

            return ck;
        };

        var getUserId = function() {
            var data = JSON.parse($('a[data-moreurl-dict*="\"uid\""]').attr('data-moreurl-dict'));

            if (data) {
                return data.uid;
            }
        };

        var addComment = function(threadUrl, comment) {
            var postUrl = threadUrl + 'add_comment';

            var headers = {
                'content-type': 'application/x-www-form-urlencoded'
            };

            var data = {
                ck: getCkValue(),
                rv_comment: comment,
                start: 0,
                submit_btn: '加上去',
            };

            console.log('Posting to ' + postUrl + ' with ' + JSON.stringify({
                headers: headers,
                data: data
            }, null, 2));

            $.ajax({
                url: postUrl,
                type: 'POST',
                headers: headers,
                data: data,
                success: function() {
                    console.log('Successfully replied to ' + postUrl);
                },
                error: function() {
                    console.log('Failed to reply to ' + postUrl);
                }
            });
        };

        return {
            getParameterByName:getParameterByName,
            debugMode:debugMode,
            updateQueryStringParameter:updateQueryStringParameter,
            getCkValue:getCkValue,
            getUserId:getUserId,
            addComment:addComment,
        };
    })();

    window.DoubanSofaUtils = (function() {
        var sofaStarted = false;

        var startSofa = function(debugArgs, countdownCallback, completeCallback) {
            if (!sofaStarted) {
                sofaStarted = true;

                console.log('Start Sofa!');

                countDownAndRefresh(
                    debugArgs.refreshRate,
                    function(secLeft){
                        console.log('Second left: ' + secLeft);
                        if (typeof countdownCallback === 'function') {
                            countdownCallback(secLeft);
                        }
                    },
                    function() {
                        var commentIdx = parseInt(DoubanUtils.getParameterByName('commentIdx'), 10) || 0;
                        var urlArgs = sofaCurrentPage(0, debugArgs.comments, commentIdx, completeCallback);
                        console.log('Completed.');
                        return urlArgs;
                    },
                    function() {
                        return !sofaStarted;
                    },
                    {
                        startSofa: 1,
                    }
                );
            }
        };

        var stopSofa = function(stopCallback) {
            sofaStarted = false;

            console.log('Stop Sofa!');

            if (typeof stopCallback === 'function') {
                stopCallback();
            }
        };

        var getNewThreads = function(threshold) {
            var newThreads = [];

            var rows = $('#group-topics').find('table.olt tbody').first().children().each(function() {
                var tds = $(this).children('td');

                var title = $(tds[0]).find('a').html();
                if (!title) {
                    return;
                }
                var author = $(tds[1]).find('a').html();
                if (!author) {
                    return;
                }

                var countString = $(tds[2]).html();
                var count = (countString && countString.trim()) ? parseInt(countString.trim()) : 0;

                var post = {
                    title: title,
                    link: $(tds[0]).find('a').attr('href'),
                    author: author,
                    replyCount: count,
                    lastReplayDate: $(tds[3]).html(),
                };

                if (post.replyCount <= threshold) {
                    newThreads.push(post);
                }
            });

            return newThreads;
        };

        var sofaCurrentPage = function (threshold, comments, commentIdx, completeCallback, isTest) {
            var newThreads;

            if (isTest) {
                newThreads = [{
                    title: 'Test Thread',
                    link: 'https://www.douban.com/group/topic/96284389/',
                    author: 'Test Author',
                    replyCount: 0,
                    lastReplayDate: 'Test Date',
                }];
            } else {
                newThreads = getNewThreads(threshold);
            }

            console.log('New Thread: ' + JSON.stringify(newThreads, null, 2));

            var repliedThreadLinks = [];
            for (var i = 0; i < newThreads.length; i++) {
                var newThread = newThreads[i];
                console.log('Replying to : ' + JSON.stringify(newThread, null, 2));
                DoubanUtils.addComment(newThread.link, comments[commentIdx]);
                commentIdx = (commentIdx + 1) % comments.length;
                repliedThreadLinks.push(newThread.link);
            }

            if (typeof completeCallback === 'function') {
                completeCallback(repliedThreadLinks);
            }

            return {
                commentIdx: commentIdx,
            };
        };

        var countDownAndRefresh = function(secondLeft, countDownCallBack, completeCallback, stopCheckFunc, additionParams, hash) {
            if (stopCheckFunc()) {
                return;
            }

            if (typeof countDownCallBack === 'function') {
                countDownCallBack(secondLeft);
            }

            if (secondLeft > 0) {
                setTimeout(function() {
                    countDownAndRefresh(secondLeft - 1, countDownCallBack, completeCallback, stopCheckFunc, additionParams, hash);
                }, 1000);
            } else {
                var href = window.location.href;

                if (typeof completeCallback === 'function') {
                    var urlArgs = completeCallback();
                    for (var urlKey in urlArgs) {
                        href = DoubanUtils.updateQueryStringParameter(href, urlKey, urlArgs[urlKey]);
                    }
                }

                console.log('Refreshing page..');


                if (additionParams) {
                    for (var name in additionParams) {
                        href = DoubanUtils.updateQueryStringParameter(href, name, additionParams[name]);
                    }
                }

                if (hash) {
                    href = href.split('#')[0] + '#' + hash;
                }

                window.location.href = href;
            }
        };

        return {
            startSofa: startSofa,
            stopSofa: stopSofa,
        };
    })();

    // Inject HTML
    $('#db-global-nav').before('<div id="debug-nav"><div>');

    // Initialize
    var reactJsx = GM_getResourceText("reactJsx");
    var compiledReactJs = Babel.transform(reactJsx, { presets: ['react','es2015'] });

    eval(compiledReactJs.code);

    if (DoubanUtils.getParameterByName('startSofa')) {
        $('#db-start-button').click();
    }


})();
