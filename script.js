var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

var clickColor = new Array();
var imageObj = new Image();

var textToFill = '';
var textYLoc = 600;
var textUsed = false;

var MAX_WIDTH = 800;
var MAX_HEIGHT = 600;

var width;
var height;

var currentStep = 0;
var lastStep = 0;
var differences = [];
var curColor = "#222222"

$(document).ready(function(){
    $('#colorSelector').css('backgroundColor', curColor);
    //color picker
    $('#colorSelector').ColorPicker({
        color: '#222222',
        onShow: function (colpkr) {
            $(colpkr).fadeIn(500);
            return false;
        },
        onHide: function (colpkr) {
            $(colpkr).fadeOut(500);
            return false;
        },
        onChange: function (hsb, hex, rgb) {
            curColor = "#" + hex;
            $('#colorSelector').css('backgroundColor', curColor);
            $("#draw").prop("checked", true);
        }
    });
    
    imageObj.onload = function() { 
        //maintaining aspect ratio
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
            $('#canvasImg').src = dataURL;
    });
        
    canvas = document.getElementById('canvas');
    context = canvas.getContext("2d");
    
        
    $('#textToAdd').keyup(function(){
        textToFill = $('#textToAdd').val();
        redraw();
    });
    
    
/*
    $(document).keyup(function(e){
        if(e.shiftKey){
            text = String.fromCharCode(e.keyCode);
        }else{
            text = String.fromCharCode(e.keyCode).toLowerCase();
        }
        if(e.keyCode === 8){
            text[text.length]='';
        }
        textToFill += text;
    });
*/


    $('#canvas').mousedown(function(e){
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;
        console.log(mouseX);
        console.log(mouseY);

        paint = true;
        if(document.getElementById('draw').checked){
            currentStep = clickX.length;
        }
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
        if(document.getElementById('draw').checked){
            lastStep = clickX.length;
            differences.push(lastStep-currentStep);
        }   
    });

    $('#canvas').mouseleave(function(e){
        paint = false;
        if(document.getElementById('draw').checked){
            lastStep = clickX.length;
            differences.push(lastStep-currentStep);
        }
    });
    
    $('#clearButton').click(function() {
        clearCanvas();
    });
    
    $('#upload').click(upload);
    
    document.getElementById('filePick').addEventListener('change', handleFileSelect, false);

    //undo
    $("#undo").click(function(){
        for(var i=0; i<=differences[differences.length-1]; i++){
        clickX.pop();
        clickY.pop();
        clickDrag.pop();
        clickColor.pop();
        }
        redraw();
        differences.pop();
    });
    
});

function redraw(){
    context.save();
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
    context.restore();
    //drawing textbox
    context.fillStyle = '#333';
    if(textUsed){
        context.fillRect(0, textYLoc-20, width, 30);  
    }
    
    //typing
    context.font = "15pt Calibri"; 
    context.fillStyle = "#ffffff";
    context.textAlign = 'center';
    var x = canvas.width / 2;
    context.fillText(textToFill, x, textYLoc+2, 470);
    
    
}

function clearCanvas()
{
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    clickX = [];
    clickY = [];
    clickDrag = [];
    clickColor  = [];
    imageObj.src = "";
    document.getElementById('textToAdd').value='';
    textToFill = '';
    restorePoints = [];
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
        $("#textToAdd").css("width", width);
        $("#textToAdd").css("top", textYLoc+61);
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

function upload() {
    alert("upload!");
    var img = canvas.toDataURL("image/png").split(',')[1];
    $.ajax({
        url: 'https://api.imgur.com/3/image',
        type: 'POST',
        headers: { "Authorization": "Client-ID bd9e5b076b91742" },
        dataType: 'json',
        data: {
            image: img
        },
        success: function (data) {
            var url = 'http://imgur.com/' + data.data.id + '?tags';
            $("<a>").html(url).attr("href", url).appendTo($("#container"));
        },
        error: function (response) {
            console.log(response);
        }
    });
}
