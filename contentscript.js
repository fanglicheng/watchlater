
function getAllElementsWithAttribute(attribute)
{
  var matchingElements = [];
  var allElements = document.getElementsByTagName('*');
  for (var i = 0, n = allElements.length; i < n; i++)
  {
    if (allElements[i].getAttribute(attribute))
    {
      // Element exists with attribute. Add to array.
      matchingElements.push(allElements[i]);
    }
  }
  return matchingElements;
}

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
