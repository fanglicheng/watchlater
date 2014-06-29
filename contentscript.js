$(document).ready(function() {
        function addButton() {

            var videoId = null;
            var videos = this.getElementsByTagName('video');
            for (var i in videos) {
                var video = videos[i];
                if (video.baseURI) {
                    var uri = video.baseURI;
                    console.log(uri);
                    videoId = uri.substring(uri.lastIndexOf('=') + 1);
                    console.log(this.videoId);
                    break;
                }
            }
            
            console.log('add button');
            var square_side = Math.min($(this).width(), $(this).height());
            var button_side = Math.floor(square_side * 0.2);
            var button_margin = Math.floor(square_side * 0.05);
            var button_radius = Math.floor(square_side * 0.04);
            var button_border = Math.floor(square_side * 0.01);
            this.button = $("<div class='overlay' </div>").css({
                          'z-index': 3000,
                          'position': 'absolute',
                          'background-color': '#20d420',
                          'opacity': 0.5,
                          'border': '2px solid white',
                          'border-radius': button_radius,
                          'top': button_margin,
                          'left': $(this).width() - button_side - button_margin,
                          'width': button_side,
                          'height': button_side
                          });
            this.button.hover(function () {
                console.log('hover');
            });
            this.button.click(function () {
                console.log('click');
                console.log('addVideo ' + videoId);
                $.ajax({
                    type: "POST",
                    url: "http://youtv.elasticbeanstalk.com/video",
                    data: {
                        "website": "youtube",
                        "videoid": videoId,
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
            });
            this.button.hide().appendTo($(this));
            $(this).mouseenter(
                    function () {
                        console.log('mouseenter');
                        $(this.button).fadeIn(100);
                    });
            $(this).mouseleave(
                    function () {
                        console.log('mouseleave');
                        $(this.button).fadeOut(100);
                    });
        }


        console.log($('.html5-video-container'));
        for (var i in $('.html5-video-container')) {
            console.log(i);
        }

        $('.html5-video-container').each(addButton);
        $('.yt-uix-simple-thumb-wrap').each(addButton);
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('request received:')
        console.log(request)
        if(request.method == "getText"){
            console.log('sending response');
            //var response = {data: document.all[0].innerText,
            //                method: "getText"};
            var videos = document.getElementsByTagName('video')
            var response = []
            console.log(videos)
            for (var i in videos) {
                var video = videos[i];
                if (video.baseURI) {
                    response.push(video.baseURI)
                }
            }
            console.log(response)
            sendResponse(response); //same as innerText
            console.log('finished sending response');
        }
    }
);
console.log('content script injected')
