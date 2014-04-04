var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

var colorPink = "#cb3594";
var colorRed = "#F00000";
var colorBlue = "#0066FF";
var colorYellow = "#ffcf33";
var colorBlack = "#181818";

var curColor = colorPink;
var clickColor = new Array();
var imageObj = new Image();

var textToFill = '';
var textYLoc = 600;
var textUsed = false;

var MAX_WIDTH = 800;
var MAX_HEIGHT = 600;

var width;
var height;

$(document).ready(function(){
    imageObj.onload = function() { 
        
        width = imageObj.width;
        height = imageObj.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        context.drawImage(imageObj, 0, 0, width, height);
        
        $('canvas').width = width;
        $('canvas').height = height;
    }
    imageObj.src = '';
    
    $('#save').click(function(){
            var dataURL = canvas.toDataURL();
            document.getElementById('canvasImg').src = dataURL;
    });
    
    canvas = document.getElementById('canvas');
    context = canvas.getContext("2d");
    
    $('#textToAdd').keyup(function(){
        textToFill = $('#textToAdd').val();
        redraw();
    });
    

    $('#canvas').mousedown(function(e){
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;

        paint = true;
        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
        redraw();
    });

    $('#canvas').mousemove(function(e){
        if(paint){
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
            redraw();
        }
    }); 

    $('#canvas').mouseup(function(e){
        paint = false;
    });

    $('#canvas').mouseleave(function(e){
        paint = false;
    });
    
    $('#colorRed').click(function() {
        curColor = colorRed;
    });
    $('#colorBlue').click(function() {
        curColor = colorBlue;
    });
    $('#colorYellow').click(function() {
        curColor = colorYellow;
    });
    $('#colorBlack').click(function() {
        curColor = colorBlack;
    });
    $('#colorPink').click(function() {
        curColor = colorPink;
    });
    $('#clearButton').click(function() {
        clearCanvas();
    });
    $('#upload').click(function(){
        upload();
    });
    document.getElementById('filePick').addEventListener('change', handleFileSelect, false);

});

function redraw(){
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.drawImage(imageObj, 0, 0, width, height);
    
    //drawing
    context.lineJoin = "round";
    context.lineWidth = 5;

    for(var i=0; i < clickX.length; i++) {		
        context.beginPath();
        if(clickDrag[i] && i){
            context.moveTo(clickX[i-1], clickY[i-1]);
        }else{
            context.moveTo(clickX[i]-1, clickY[i]);
        }
        context.lineTo(clickX[i], clickY[i]);
        context.closePath();
        context.strokeStyle = clickColor[i];
        context.stroke();
    }
    context.fillStyle = '#333';
    if(textUsed){
        context.fillRect(0, textYLoc-20, 480, 30);  
    }
    
    //typing
    context.font = "15pt Calibri"; 
    context.fillStyle = "#ffffff";
    context.textAlign = 'center';
    var x = canvas.width / 2;
    context.fillText(textToFill, x, textYLoc, 470);

}

function clearCanvas()
{
	context.clearRect(0, 0, canvasWidth, canvasHeight);
    clickX = [];
    clickY = [];
    clickDrag = [];
    clickColor  = [];
    imageObj.src = "";
    document.getElementById('textToAdd').value='';
    textToFill = '';
}

function addClick(x, y, dragging)
{
    if(document.getElementById('draw').checked){
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
        clickColor.push(curColor);
    }else if(document.getElementById('text').checked){
        textYLoc = y;
        textUsed = true;
    }
}

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

      // Only process image files.
      if (!f.type.match('image.*')) {
        continue;
      }

      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          // Render thumbnail.
          var span = document.createElement('span');
            imageObj.src = e.target.result;
         /* span.innerHTML = ['<img class="thumb" src="', e.target.result,
                            '" title="', escape(theFile.name), '"/>'].join('');
          document.getElementById('list').insertBefore(span, null); */
        };
      })(f);

      // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    }
  }

/*function share(){

    var img;
    try {
        img = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
    } catch(e) {
        img = canvas.toDataURL().split(',')[1];
    }
    var w = window.open();
    w.document.write('Uploading to imgur.com...');
    $.ajax({
        url: 'https://api.imgur.com/3/upload.json',
        type: 'POST',
        headers: {
            Authorization: 'Client-ID bd9e5b076b91742'
        },
        data: {
            type: 'base64',
            name: 'img.jpg',
            title: 'Image',
            description: 'Made using http://bryanc208.github.io/Doodle',
            image: img
        },
        dataType: 'json'
    }).success(function(data) {
        var url = 'http://imgur.com/' + data.data.id + '?tags';
        _gaq.push(['_trackEvent', 'neonflames', 'share', url]);
        w.location.href = url;
    }).error(function() {
        alert('Could not reach api.imgur.com. Sorry :(');
        w.close();
        _gaq.push(['_trackEvent', 'neonflames', 'share', 'fail']);
    });
}*/

function upload() {
    var img = canvas.toDataURL("image/png").split(',')[1];
    $.ajax({
        url: 'https://api.imgur.com/3/image',
        type: 'POST',
        headers: { "Authorization": "Client-ID bd9e5b076b91742" },
        dataType: 'json',
        data: {
            image: img
        },
        success: function (response) {
            console.log(response);
        },
        error: function (response) {
            console.log(response);
        }
    });
}
