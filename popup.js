
function addChild(node) {
    node.parent = this
    this.children.push(node)
    this.children_elem.appendChild(node.elem)
}

function remove() {
    console.log('call remove')      
    console.log(this)      
    // make a copy. this.children will be modified during iteration when
    // children remove themselves.
    var children = this.children.slice(0)
    for (var i in children) {
        console.log('remove child ' + i)
        children[i].remove()
    }
    this.parent.children_elem.removeChild(this.elem)

    if (!this.domain && this.tab) {
        console.log('remove tab')
        console.log(this.tab)
        chrome.tabs.remove(this.tab.id);
    }

    var i = this.parent.children.indexOf(this)
    if (i != -1) {
        console.log('remove ' + i)      
        this.parent.children.splice(i, 1)
    }
}

function Node(tab, domain) {
    this.tab = tab
    this.domain = domain
    this.children = []
    this.addChild = addChild
    this.remove = remove

    this.elem = document.createElement('table')
    this.elem.setAttribute('class', 'node')
  
    // table structure
    var row1 = document.createElement('tr')
    this.elem.appendChild(row1)
    var cell1 = document.createElement('td')
    cell1.setAttribute('class', 'cell1')
    cell1.setAttribute('colspan', '2')
    row1.appendChild(cell1)

    var row2 = document.createElement('tr')
    this.elem.appendChild(row2)
    var cell2 = document.createElement('td')
    cell2.width = 20
    row2.appendChild(cell2)
    var cell3 = document.createElement('td')
    row2.appendChild(cell3)

    this.title = cell1
    this.padding = cell2
    this.children_elem = cell3

    // close button
    var xbutton = document.createElement('img')
    xbutton.setAttribute('class', 'xbutton')
    xbutton.onclick = remove.bind(this)
    xbutton.src = X_SRC
    xbutton.style.visibility = 'hidden'
    xbutton.show = function () {
        xbutton.style.visibility = 'visible'
    }
    xbutton.hide = function () {
        xbutton.style.visibility = 'hidden'
    }
    cell1.appendChild(xbutton)
    cell1.onmouseover = xbutton.show
    cell1.onmouseleave = xbutton.hide

    // fav icon and title for tab node
    console.log(this.domain)
    if (this.domain) {
        var fav = document.createElement('img')
        fav.src = tab.favIconUrl
        cell1.appendChild(fav)

        var title = document.createElement('span')
        title.setAttribute('class', 'title')
        title.innerHTML = tab.domain
        console.log('show domain node')
        console.log(tab.domain)
        title.onclick = selecttab.bind(title, tab.id);
        cell1.appendChild(title)
    } else if (this.tab) {
        var fav = document.createElement('img')
        fav.src = tab.favIconUrl
        cell1.appendChild(fav)

        var title = document.createElement('span')
        title.setAttribute('class', 'title')
        title.innerHTML = tab.title
        title.onclick = selecttab.bind(title, tab.id);
        cell1.appendChild(title)
    }
}

byProperty = function(prop) {
    console.log('construct cmp func');
    return function(a,b) {
        console.log("cmp");
        if (typeof a[prop] == "number") {
            return (a[prop] - b[prop]);
        } else {
            return ((a[prop] < b[prop]) ? -1 : ((a[prop] > b[prop]) ? 1 : 0));
        }
    };
}

byKey = function(key) {
    console.log('construct cmp func');
    return function(a,b) {
        console.log("key cmp");
        var s = key(a);
        var t = key(b);
        console.log('compare these:');
        console.log(s);
        console.log(t);
        result = ((s < t) ? -1 : ((s > t) ? 1 : 0));
        console.log(result);
        return result;
    };
}

function sortIntoGroups(tabs) {
    console.log('sort')
    var result = []
    if (tabs.length == 0) {
        console.log(result)
        return result
    }
    var group = []
    for (var i in tabs) { 
        if (i > 0 && tabs[i].domain != tabs[i-1].domain) {
            result.push(group)
            group = []
        }
        group.push(tabs[i])
    }
    result.push(group)
    console.log(result)
    return result
}

// input: array of tabs
function show(tabs) {
    // sort by pinned : unpinned
    var pinned = [];
    var unpinned = [];
    for (var i in tabs) {
        var tab = tabs[i];
        if (tab.pinned)
            pinned.push(tab);
        else
            unpinned.push(tab);
    }
    // keep pinned tabs fixed
    pinned.sort(byKey(function(x) { return x.old_index }));
    tabs_pinned_unpinned = pinned.concat(unpinned);
    console.log('pinned unpinned sort');
    console.log(tabs_pinned_unpinned);
    var tab_section = document.getElementById('tabs');

    var root = new Node(null)

    console.log('pinned')
    console.log(pinned)
    pinned_groups = sortIntoGroups(pinned)
    for (var i in pinned_groups) {
        var group = pinned_groups[i]
        var node = null;
        if (group.length > 1) {
            node = new Node(group[0], true)
            node.domain = true
            for (var i in group) {
                var tab = group[i]
                node.addChild(new Node(tab, false))
            }
        } else {
            node = new Node(group[0], false)
        }
        root.addChild(node)
    }

    console.log('unpinned')
    console.log(unpinned)
    unpinned_groups = sortIntoGroups(unpinned)
    for (var i in unpinned_groups) {
        var group = unpinned_groups[i]
        var node = null
        if (group.length > 1) {
            var node = new Node(group[0], true)
            for (var i in group) {
                var tab = group[i]
                node.addChild(new Node(tab), false)
            }
        } else {
            var node = new Node(group[0], false)
        }
        root.addChild(node)
    }

    /*
    for (var i in tabs_pinned_unpinned) {
        var tab = tabs_pinned_unpinned[i];
        console.log(tab);
        console.log('display tab id: ' + tab.id);

        root.addChild(new Node(tab))
        //console.log(tabs[i].title);
        //console.log("id " + tabs[i].id);
        //console.log("parent " + tabs[i].openerTabId);
        //console.log(tabs[i].url);
        var xbutton = document.createElement('img');
        xbutton.setAttribute('class', 'xbutton');
        xbutton.src = x_src;
        xbutton.onclick = closetab.bind(xbutton, tab.id);
        xbutton.id = "x" + tab.id;
        //xbutton.innerHTML = "x";

        var fav = document.createElement('img');
        fav.id = 'fav' + tab.id;
        fav.src = tab.favIconUrl;

        var elem = document.createElement('span');
        elem.setAttribute('class', 'title');
        elem.id = tab.id;
        elem.onclick = selecttab.bind(elem, tab.id);
        elem.innerHTML = tab.title;

        var br = document.createElement('br');
        br.id = "br" + tab.id;

        tab_section.appendChild(xbutton);
        tab_section.appendChild(fav);
        tab_section.appendChild(elem);
        tab_section.appendChild(br);
    }
    */

    // shrink indent at root level
    root.padding.width = 0
    tab_section.appendChild(root.elem)
    console.log(root)
}

function selecttab(id) {
    console.log('select ' + id);
    chrome.tabs.get(id, function(tab) {
      chrome.tabs.highlight({windowId: chrome.windows.WINDOW_ID_CURRENT, tabs: tab.index}, function(){})
    });
    //chrome.tabs.get(id, function(tab){console.log('highlight ' + tab.id); tab.highlighted = true;});
}

function clear() {
    document.getElementById('tabs').innerHTML = '';
}

function removeBar(id) {
    console.log('remove from html ' + id);
    var elem = document.getElementById(id);
    elem.parentNode.removeChild(elem);
    var elem = document.getElementById("x" + id);
    elem.parentNode.removeChild(elem);
    var elem = document.getElementById("br" + id);
    elem.parentNode.removeChild(elem);
    var elem = document.getElementById("fav" + id);
    elem.parentNode.removeChild(elem);
}

function closetab(id) {
    console.log('close ' + id);
    chrome.tabs.remove(id);
    removeBar(id);
}

function numPinned(tabs) {
    var pinned = 0;
    for (i in tabs) {
        if (tabs[i].pinned) {
            pinned++;
        }
    }
    return pinned;
}

function move(tabs) {
    console.log('move tabs');
    console.log(tabs);
    var pinned = numPinned(tabs);
    var pinned_moved = 0;
    var unpinned_moved = 0;
    for (i in tabs) {
        var tab = tabs[i];
        if (tab.pinned) {
            chrome.tabs.move(tab.id, {index: pinned_moved});
            pinned_moved++;
        } else {
            chrome.tabs.move(tab.id, {index: pinned + unpinned_moved});
            unpinned_moved++;
        }
    }
}

function domainTree() {
  var tabs = [];
  for (var id in BKG.TABS) {
    var tab = BKG.TABS[id];
    tabs.push(tab);
  }
  tabs.sort(byKey(function(x) { return x.domain }));
  var root = new node();
  var lastdomain = null;
  for (var tab in tabs) {
    if (!lastdomain || tab.domain != lastdomain) {
      var child = node();
      child.fav = tab.favIconUrl;
      root.children.push(child);
    } else {
      child.children.push(tab);
    }
  }
}

function sortByDomain(tabs) {
    console.log('sort by domain');
    clear();
    for (var i in tabs) {
        var tab = tabs[i]
        console.log(tab)
        tab.domain = BKG.getDomain(tab.url)
    }
    tabs.sort(byKey(function(x) { return x.domain }));
    show(tabs);
    move(tabs);
}

function sortByIndex(tabs) {
    console.log('sort by index');
    clear();
    for (var i in tabs) {
        var tab = tabs[i]
        console.log(tab)
        tab.domain = BKG.getDomain(tab.url)
    }
    tabs.sort(byKey(function(x) { return x.index }));
    show(tabs);
    move(tabs);
}

function login() {
    console.log('call login');
    var page = document.createElement('iframe');
    page.setAttribute('width', '320');
    page.setAttribute('height', '240');
    page.setAttribute('frameborder', '0');
    page.setAttribute('allowfullscreen', 'true');
    var src = 'http://youtv.elasticbeanstalk.com/login';
    console.log(src);
    page.setAttribute('src', src);
    document.body.appendChild(page);
}

function addVideo(videoId) {
    //videoId = "GjpA7GE9wXI";
    console.log('addVideo ' + videoId);
    $.ajax({
        type: "GET",
        url: "http://youtv.elasticbeanstalk.com/userId",
        data: {},
        dataType: "json",
        contentType: 'application/json',
        success : function(response) {
            if ('userId' in response) {
                console.log('I am user ' + response.userId);
                $.ajax({
                    type: "POST",
                    url: "http://youtv.elasticbeanstalk.com/video",
                    data: {
                        "userId": response.userId,
                        "url": videoId,
                        "title": "Dummy title",
                    },
                    //dataType: "json",
                    //contentType: 'application/json',
                    success : function(response) {
                        console.log('add video call succeeded');
                              },
                    error : function(response) {
                        console.log('add video call failed');
                    }
                });
            } else {
                login();                 
                //addVideo();
            }
        },
        error : function(response) {
            console.log('get_user_id call failed');
        }
    });
}

function DOMContentLoadedListener() {
    console.log('in listener')

chrome.tabs.getSelected(null, function(tab) {
    console.log('popup.js: sending a request')
    chrome.tabs.sendMessage(tab.id, {method: "getText"}, function(response) {
        console.log('got responce')
        console.log('response:')
        console.log(response)
        //if(response.method=="getText"){
        console.log(response);
        if (response.length > 0) {
            for (var i in response) {
                var uri = response[i];
                console.log(uri);

                var video = document.createElement('iframe');
                video.setAttribute('width', '320');
                video.setAttribute('height', '240');
                video.setAttribute('frameborder', '0');
                video.setAttribute('allowfullscreen', 'true');
                var videoId = uri.substring(uri.lastIndexOf('=') + 1);
                var src = 'https://www.youtube.com/embed/' + videoId;
                console.log(src);
                video.setAttribute('src', src);
                document.body.appendChild(video);

                var button = document.createElement('button');
                button.setAttribute('height', '30px');
                button.setAttribute('width', '40px');
                console.log('binding videoId ' + videoId);
                button.onclick = addVideo.bind(null, uri);
                button.innerText = 'Add';
                document.body.appendChild(button);
            }
        } else {
            document.body.innerText = 'No video on page. :-(';
        }
    });
});

}

document.addEventListener('DOMContentLoaded', DOMContentLoadedListener);
