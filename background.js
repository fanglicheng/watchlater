//console.log('run background page');

// map from tab id to tab object
var TABS = {};

function updateIcon() {
  chrome.browserAction.setIcon({path:"icon" + current + ".png"});
  current++;

  if (current > max)
    current = min;
}

function callback(tab) {
}

function closeTab(tab) {
    chrome.tabs.remove(tab.id);
}

function closeSelectedTab() {
    console.log('close selected tab');
    chrome.tabs.getSelected(null, closeTab);
    //chrome.tabs.remove(tid) 
}

function pinTab(tab) { 
    console.log('pin tab');
    // Toggle the pinned status
    chrome.tabs.update(tab.id, {'pinned': !tab.pinned});
}

function pinTabListener(request, sender, sendResponse) {
    console.log('heard');
    if (request.toggle_pin) {
        // Get the currently selected tab
        chrome.tabs.getSelected(null, pinTab);
    }
}

function sortTabInfo(a, b) {
    return b.lastUse - a.lastUse;
}

function currentTime() {
    var date = new Date();
    return date.getTime(); 
}

function pruneTabs() {
    console.log('prune'); 
    tab_arr = [];
    for (var tid in tabs) {
        tab_arr.push(tabs[tid]);
    }
    tab_arr.sort(sortTabInfo);
    console.log(tab_arr.length + ' tabs');
    console.log(max_tab);
    if (tab_arr.length > max_tab) {
        console.log('really prune'); 
        console.log(tab_arr.length); 
        console.log(tab_arr); 
        while (tab_arr.length > max_tab) {
            var t = tab_arr.pop();
            console.log('kill ' + t.id); 
            chrome.tabs.remove(t.id);  // triggers remove handler
            console.log('closed');
        }
    }
}

var TLDs = ["ac", "ad", "ae", "aero", "af", "ag", "ai", "al", "am", "an", "ao",
"aq", "ar", "arpa", "as", "asia", "at", "au", "aw", "ax", "az", "ba", "bb",
"bd", "be", "bf", "bg", "bh", "bi", "biz", "bj", "bm", "bn", "bo", "br", "bs",
"bt", "bv", "bw", "by", "bz", "ca", "cat", "cc", "cd", "cf", "cg", "ch", "ci",
"ck", "cl", "cm", "cn", "co", "com", "coop", "cr", "cu", "cv", "cx", "cy",
"cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "edu", "ee", "eg", "er", "es",
"et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf",
"gg", "gh", "gi", "gl", "gm", "gn", "gov", "gp", "gq", "gr", "gs", "gt", "gu",
"gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in",
"info", "int", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jobs", "jp",
"ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb",
"lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me",
"mg", "mh", "mil", "mk", "ml", "mm", "mn", "mo", "mobi", "mp", "mq", "mr",
"ms", "mt", "mu", "museum", "mv", "mw", "mx", "my", "mz", "na", "name", "nc",
"ne", "net", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "org",
"pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "pro", "ps", "pt",
"pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se",
"sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "st", "su", "sv",
"sy", "sz", "tc", "td", "tel", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn",
"to", "tp", "tr", "travel", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "us",
"uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws",
"xn--0zwm56d", "xn--11b5bs3a9aj6g", "xn--3e0b707e", "xn--45brj9c",
"xn--80akhbyknj4f", "xn--90a3ac", "xn--9t4b11yi5a", "xn--clchc0ea0b2g2a9gcd",
"xn--deba0ad", "xn--fiqs8s", "xn--fiqz9s", "xn--fpcrj9c3d", "xn--fzc2c9e2c",
"xn--g6w251d", "xn--gecrj9c", "xn--h2brj9c", "xn--hgbk6aj7f53bba",
"xn--hlcj6aya9esc7a", "xn--j6w193g", "xn--jxalpdlp", "xn--kgbechtv",
"xn--kprw13d", "xn--kpry57d", "xn--lgbbat1ad8j", "xn--mgbaam7a8h",
"xn--mgbayh7gpa", "xn--mgbbh1a71e", "xn--mgbc0a9azcg", "xn--mgberp4a5d4ar",
"xn--o3cw4h", "xn--ogbpf8fl", "xn--p1ai", "xn--pgbs0dh", "xn--s9brj9c",
"xn--wgbh1c", "xn--wgbl6a", "xn--xkc2al3hye2a", "xn--xkc2dl3a5ee0h",
"xn--yfro4i67o", "xn--ygbi2ammx", "xn--zckzah", "xxx", "ye", "yt", "za", "zm",
"zw"].join()

function getDomain(url){
    var i = url.indexOf('//');
    if (i != -1) {
      url = url.substr(i+2);
    }
    i = url.indexOf('/');
    if (i != -1) {
      url = url.substr(0, i);
    }
    return url
    var parts = url.split('.');
    if (parts[0] === 'www' && parts[1] !== 'com'){
        parts.shift()
    }
    var ln = parts.length
      , i = ln
      , minLength = parts[parts.length-1].length
      , part

    // iterate backwards
    while(part = parts[--i]){
        // stop when we find a non-TLD part
        if (i === 0                    // 'asia.com' (last remaining must be the SLD)
            || i < ln-2                // TLDs only span 2 levels
            || part.length < minLength // 'www.cn.com' (valid TLD as second-level domain)
            || TLDs.indexOf(part) < 0  // officialy not a TLD
        ){
            return part
        }
    }
}

function addTab(tab) {
    tab.createTime = currentTime();
    tab.lastUse = currentTime();
    tab.domain = getDomain(tab.url);
    TABS[tab.id] = tab;
    console.log(tab);
}

function createHandler(tab) {
    addTab(tab);
}

function removeHandler(tabId, removeInfo) {
    delete TABS[tabId];
}

function selectionChangeHandler(tabId, selectInfo) {
    //tabs[tabId].lastUse = currentTime();
}

function updateHandler(tabId, changeInfo, tab) {
    //TODO: creation time is also wrongly updated
    addTab(tab);
    /*
    if ('pinned' in changeInfo) {
        console.log('pinning changed');
        if (changeInfo.pinned) {
            console.log('pinned');
            removeTab(tabId);
        } else {
            console.log('unpinned');
            addTab(tabId);
        }
    } else {
        console.log('other update');
    }
    */
}

function updateIndex(tabs) {
    for (var i in tabs) {
        var tab = tabs[i]
        TABS[tab.id].index = tab.index
    }
}

function moveHandler(tabId, info) {
    console.log('move handler triggered');
    console.log(info);
    // update all indices
    chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, updateIndex);
}

//function detachHandler(tabId, detachInfo) {
//    delete tabs[tabId];
//}

//function attachHandler(tabId, attachInfo) {
//    tabs[tabId] = currentTime();
//}

/*
chrome.tabs.getAllInWindow(null, function(tabs) {
    for (var i=0; i<tabs.length; i++) {
        tab = tabs[i];
        if (!tab.pinned) {
            console.log('add tab ' + tab.id);
            addTab(tab.id);
        }
    }
});
*/

function initTabs(tabs) {
    for (var i = 0; i < tabs.length; i++) {
        addTab(tabs[i]);
    }
}

//chrome.browserAction.onClicked.addListener(closeSelectedTab);

//chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, initTabs);

//chrome.extension.onRequest.addListener(pinTabListener);
//chrome.tabs.onCreated.addListener(createHandler);
//chrome.tabs.onRemoved.addListener(removeHandler);
//chrome.tabs.onUpdated.addListener(updateHandler);
//chrome.tabs.onMoved.addListener(moveHandler);
//chrome.tabs.onSelectionChanged.addListener(selectionChangeHandler);
//chrome.tabs.onAttached.addListener(attachHandler);
//chrome.tabs.onDetached.addListener(detachHandler);
//updateIcon();
