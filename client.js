var image_height=0;
var image_width = 0;
var MAX_IMAGES = 150;
$.embedly.defaults.key = api_key;
function processEmbed(data){
  var embed = data['embed'];
  var url = data['url'];
  var div = document.createElement("div");
  div.className = 'pic';
  div.innerHTML = '<a target="_blank" href="'+url+'" ><img width="100px" src="'+crop(embed['thumbnail_url'])+'"></a>';
  $div = $(div);

  $div.data("title", embed['title']);
  $div.data("url", url);
  $div.data("thumbnail_url", embed['thumbnail_url']);
  $div.data("description", embed['description']);

  /* Include a tooltip on hover
  $tooltip = $("#tooltip");
  $div.mouseover(function(e){
    $tooltip.html("<a href="+url+"></a>")
    .css("top", ($(window).height()/3)+"px")
    .css("left",($(window).width()/3)+"px")
    .css("opacity", 0.9);
    $("#tooltip a").embedly({
      query: {maxheight: 400}
    });
  });

  $div.mouseout(function(e){
    $tooltip.css("opacity", 0);
  });
  */

  var w = Math.random()*($(window).width()-200)-200;
  $div.css({top: image_height+"px", left: w});
  $("#info").css({top: $(window).height() -100 + "px"});

  $("#content").append($div);

  $div.animate({left: "+="+ 100, opacity: 1}, 2000, "linear", function(){
    $(this).animate({left: "+="+ 100, opacity: 1}, 2000, "linear", function(){
      $(this).animate({left: "+="+ 100, opacity: 0.0}, 2000, "linear", function(){
        $(this).remove();
      });
    });
  });

  image_height+=100;
  if(image_height> $(window).height()){image_height=0;}
}

function crop(src){
  var call = "http://i.embed.ly/1/display/crop?url=";
  call+= encodeURIComponent(src);
  call+="&key="+api_key+"&width=100&height=100";
  return call;
}

function getPopular(){
  titles = [];
  $(".pic").each(function(index, val){titles.push($(val).data("title"))});
  title_freqs = (mode(titles));
  displayTitles(topTitles(title_freqs));
}

function displayTitles(titles){
  var index = 0;
  var title_urls = {};
  for(var i in titles){
    $(".pic").each(function(index, val){
      if(titles[i]=== $(val).data("title")){
        title_urls[titles[i]]= $(val).data("url");
      }
    });
  }
  for(var i in titles){
    setTimeout(function(){displayTitle(titles[index], index+1, title_urls[titles[index]])
      index+=1;
    }, i*8000);
  }
  setTimeout(function(){getPopular()}, 8000*titles.length);
}

function displayTitle(title, index, url){
  var div = document.createElement("a");
  div.className = 'sign';
  div.setAttribute("target", "_blank");
  div.innerHTML = "<span class='rank'>Trending </span>"+title;
  div.href = url;
  $div = $(div);

  $("#content").append($div);
  var htext = Math.floor(Math.random() * ($(window).height()-500)/100)*100+200;
  var w = $(window).width() - 400;
  $div.css({top: 10+"px", opacity: 0.0, left: w + "px"});

  $div.animate({opacity: 1}, 1500, function(){
    $(this).animate({opacity: 1}, 1000, function(){
      $(this).animate({opacity: 0.0}, 3000, function(){
        $(this).remove();
      });
    });
  });
}

function mode(array){
  if(array.length == 0)
    return null;
  var modeMap = {};
  var maxEl = array[0], maxCount = 1;
  for(var i = 0; i < array.length; i++){
    var el = array[i];
    if(modeMap[el] == null)
      modeMap[el] = 1;
    else
      modeMap[el]++;
  }
  return modeMap;
}

function topTitles(modeMap){
  var val = 0;
  var maxVal =0;
  ordering = []
    for (key in modeMap){
      if(maxVal < modeMap[key]){
        maxVal =modeMap[key]
      }
    }
  for(var i = maxVal; maxVal >1; maxVal--){
    for (key in modeMap){
      if(maxVal === modeMap[key]){
        modeMap[key] =0;
        ordering.push(key);
      }
    }
  }
  return ordering.slice(0,10);
}

$(document).ready(function(){
  var socket = io.connect('http://'+window.location.hostname);
  socket.on('stream', function (data) {
    if(data['data']['embed'] && data['data']['embed']["thumbnail_url"]!=""
      && $("#content div").length <MAX_IMAGES
      ){
      processEmbed(data['data']);
    }
  });
  setTimeout(function(){getPopular()}, 10000);
  $('img').error(function() {
    $(this).remove();
  });
});
