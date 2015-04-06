//Working with selection based on http://www.script-tutorials.com/html5-image-crop-tool/
// variables
var canvas, ctx;
var image;
var iMouseX, iMouseY = 1;
var theSelection;
var resultParam = -1;

var isMobileDevice =  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function drawImage(img) {
    var canvas = img.canvas;
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0);

    var colors = ["#f00", "#00f", "#0f0", "#ff0", "#0ff", "#f0f"];

    for (var i = 0; i < img.points.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = colors[i];
        ctx.arc(img.points[i].x, img.points[i].y, 10, 0, Math.PI * 2, true);

        ctx.fill();
        ctx.closePath();
    }
}

function dropResults(img) {
    //drop pivots and result picture
    img.points = new Array();
    tryDrawResult();

}

var img1, img2;

function handleFileSelect(file, img) {

    var URL = window.webkitURL || window.URL;
    var url = URL.createObjectURL(file);
    img.src = url;
}

function loadURL(inputId, img) {
    img.src = document.getElementById(inputId).value;
}

function handleFileDrop(evt, img) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    handleFileSelect(files[0], img);
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function countCoef(points1, points2) {

    var coef = new Object;

    A = [
        [points2[0].x, points2[0].y, 1],
        [points2[1].x, points2[1].y, 1],
        [points2[2].x, points2[2].y, 1]
    ];

    Ai = inverseMatrix(A);

    b = [
        [points1[0].x],
        [points1[1].x],
        [points1[2].x]
    ];

    coef.tvx = matrixMultiply(Ai, b);

    b = [
        [points1[0].y],
        [points1[1].y],
        [points1[2].y]
    ];

    coef.tvy = matrixMultiply(Ai, b);

    return coef;

}

function tryDrawResult() {

    canvas.width = img1.width * 1.2; // some reserve size
    canvas.height = img1.height * 1.2;

    if (canvas.height === 0) {
        // XXX: hotfix - otherwise have an error in tab drawing
        canvas.height = 10;
        canvas.width = 10;
    }

    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (typeof img1.points === "undefined" || typeof img2.points === "undefined") {
        return;
    }

    if (img1.points.length >= 3 && img2.points.length >= 3) {

        dx = img1.width * 0.1;
        dy = img1.height * 0.1;

        ctx.save();

        ctx.translate(dx, dy);

        ctx.drawImage(img1, 0, 0);

        //XXX: unnececary count this coef each time when we draw image
        minArrayLength = Math.min(img2.points.length, img1.points.length);
        combinationsNumber = 0;
        coef = new Object;
        coef.tvx = Array(0.0, 0.0, 0.0);
        coef.tvy = Array(0.0, 0.0, 0.0);

        // coun coef using all combinations of 3 points
        for (var i = 0; i < minArrayLength - 2; i++) {
            for (var j = i + 1; j < minArrayLength - 1; j++) {
                arr1 = new Array(img1.points[i], img1.points[j], img1.points[j + 1]);
                arr2 = new Array(img2.points[i], img2.points[j], img2.points[j + 1]);
                coef1 = countCoef(arr1, arr2);
                arr1 = new Array;
                arr2 = new Array;
                for (var k = 0; k < 3; k++) {
                    coef.tvx[k] += (+coef1.tvx[k]);
                    coef.tvy[k] += (+coef1.tvy[k]);
                }
                combinationsNumber++;
            }
        }
        ;

        ctx.transform(
                coef.tvx[0] / combinationsNumber,
                coef.tvy[0] / combinationsNumber,
                coef.tvx[1] / combinationsNumber,
                coef.tvy[1] / combinationsNumber,
                coef.tvx[2] / combinationsNumber,
                coef.tvy[2] / combinationsNumber
                );


        style = document.getElementsByName("resultStyle");
        var useParam = resultParam<0 ? document.getElementById("resultParam").value : resultParam;

        if (style[0].checked) {
            //draw img2 with empty parts (like mosaic)
            rowCount = useParam * 10 + 5;

            dx = img2.width / rowCount;

            isOdd = false;
            for (var x = 0; x <= img2.width; x += dx) {
                for (var y = isOdd ? 0 : dx; y <= img2.height; y += dx * 2) {
                    ctx.drawImage(img2, x, y, dx, dx, x, y, dx, dx);
                }
                isOdd = !isOdd;
            }
            ;
        } else {
            ctx.globalAlpha = useParam;
            ctx.drawImage(img2, 0, 0);
        }
        ctx.restore();
    }
    ;
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// define Selection constructor
function Selection(x, y, w, h) {

    this.hidden = false;

    this.x = x; // initial positions
    this.y = y;
    this.w = w; // and size
    this.h = h;

    this.px = x; // extra variables to dragging calculations
    this.py = y;

    this.csize = 6; // resize cubes size
    this.csizeh = 10; // resize cubes size (on hover)

    this.bHow = [false, false, false, false]; // hover statuses
    this.iCSize = [this.csize, this.csize, this.csize, this.csize]; // resize cubes sizes
    this.bDrag = [false, false, false, false]; // drag statuses
    this.bDragAll = false; // drag whole selection
}

// define Selection draw method
Selection.prototype.draw = function () {

    if (this.hidden) {
        return;
    }

    ctx.strokeStyle = '#f00';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.w, this.h);

    // draw resize cubes
    ctx.fillStyle = '#f00';
    ctx.fillRect(this.x - this.iCSize[0], this.y - this.iCSize[0], this.iCSize[0] * 2, this.iCSize[0] * 2);
    ctx.fillRect(this.x + this.w - this.iCSize[1], this.y - this.iCSize[1], this.iCSize[1] * 2, this.iCSize[1] * 2);
    ctx.fillRect(this.x + this.w - this.iCSize[2], this.y + this.h - this.iCSize[2], this.iCSize[2] * 2, this.iCSize[2] * 2);
    ctx.fillRect(this.x - this.iCSize[3], this.y + this.h - this.iCSize[3], this.iCSize[3] * 2, this.iCSize[3] * 2);
};

function drawScene() { // main drawScene function

    // draw results

    tryDrawResult();

    // draw selection
    theSelection.draw();
}

$(function () {

    $('ul.tabs li:first').addClass('active');
    $('.block article').hide();
    $('.block article:first').show();
    $('ul.tabs li').on('click', function () {
        $('ul.tabs li').removeClass('active');
        $(this).addClass('active');
        $('.block article').hide();
        var activeTab = $(this).find('a').attr('href');
        $(activeTab).show();
        return false;
    });
    var lang = navigator.language /* Mozilla */ || navigator.userLanguage /* IE */;
    lang = lang.substring(0, 2);
    loadBundles(lang);

    document.getElementById('imgfile1').addEventListener('change', function (e) {
        var files = e.target.files;
        handleFileSelect(files[0], img1);
    }, false);
    // document.getElementById('btn_imgurl1').addEventListener('click', function (e) {
    //     loadURL('imgurl1', img1)
    // }, false);
    document.getElementById('imgfile2').addEventListener('change', function (e) {
        var files = e.target.files;
        handleFileSelect(files[0], img2);
    }, false);
    // document.getElementById('btn_imgurl2').addEventListener('click', function (e) {
    //     loadURL('imgurl2', img2)
    // }, false);

    if(isMobileDevice){
        document.getElementById('drop_zone1').style.display = "none";
        document.getElementById('drop_zone2').style.display = "none";
        document.getElementById('way_to_load1').style.display = "none";
        document.getElementById('way_to_load2').style.display = "none";
    }
    else{
       var dropZone = document.getElementById('drop_zone1');
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', function (e) {
            handleFileDrop(e, img1);
        }, false);

        dropZone = document.getElementById('drop_zone2');
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', function (e) {
            handleFileDrop(e, img2);
        }, false); 
    }


    var canvas1 = document.getElementById('canvas_img1');

    canvas1.addEventListener('mouseup', function (evt) {
        var mousePos = getMousePos(canvas1, evt);
        img1.points.push(mousePos);
        drawImage(img1);
        tryDrawResult();
    }, false);

    var canvas2 = document.getElementById('canvas_img2');

    canvas2.addEventListener('mouseup', function (evt) {
        var mousePos = getMousePos(canvas2, evt);
        img2.points.push(mousePos);
        drawImage(img2);
        tryDrawResult();
    }, false);

    img1 = new Image;
    img1.onload = function (e) {
        dropResults(img1);
        drawImage(img1);
    };
    img1.canvas = canvas1;

    img2 = new Image;
    img2.onload = function (e) {
        dropResults(img2);
        drawImage(img2);
    };
    img2.canvas = canvas2;

    // creating canvas and context objects
    canvas = document.getElementById('result_canvas');
    ctx = canvas.getContext('2d');

    // create initial selection
    theSelection = new Selection(10, 10, 200, 200);

    $('#result_canvas').mousemove(function (e) { // binding mouse move event
        var canvasOffset = $(canvas).offset();
        iMouseX = Math.floor(e.pageX - canvasOffset.left);
        iMouseY = Math.floor(e.pageY - canvasOffset.top);

        // in case of drag of whole selector
        if (theSelection.bDragAll) {
            theSelection.x = iMouseX - theSelection.px;
            theSelection.y = iMouseY - theSelection.py;
        }

        for (i = 0; i < 4; i++) {
            theSelection.bHow[i] = false;
            theSelection.iCSize[i] = theSelection.csize;
        }

        // hovering over resize cubes
        if (iMouseX > theSelection.x - theSelection.csizeh && iMouseX < theSelection.x + theSelection.csizeh &&
                iMouseY > theSelection.y - theSelection.csizeh && iMouseY < theSelection.y + theSelection.csizeh) {

            theSelection.bHow[0] = true;
            theSelection.iCSize[0] = theSelection.csizeh;
        }
        if (iMouseX > theSelection.x + theSelection.w - theSelection.csizeh && iMouseX < theSelection.x + theSelection.w + theSelection.csizeh &&
                iMouseY > theSelection.y - theSelection.csizeh && iMouseY < theSelection.y + theSelection.csizeh) {

            theSelection.bHow[1] = true;
            theSelection.iCSize[1] = theSelection.csizeh;
        }
        if (iMouseX > theSelection.x + theSelection.w - theSelection.csizeh && iMouseX < theSelection.x + theSelection.w + theSelection.csizeh &&
                iMouseY > theSelection.y + theSelection.h - theSelection.csizeh && iMouseY < theSelection.y + theSelection.h + theSelection.csizeh) {

            theSelection.bHow[2] = true;
            theSelection.iCSize[2] = theSelection.csizeh;
        }
        if (iMouseX > theSelection.x - theSelection.csizeh && iMouseX < theSelection.x + theSelection.csizeh &&
                iMouseY > theSelection.y + theSelection.h - theSelection.csizeh && iMouseY < theSelection.y + theSelection.h + theSelection.csizeh) {

            theSelection.bHow[3] = true;
            theSelection.iCSize[3] = theSelection.csizeh;
        }

        // in case of dragging of resize cubes
        var iFW, iFH;
        if (theSelection.bDrag[0]) {
            var iFX = iMouseX - theSelection.px;
            var iFY = iMouseY - theSelection.py;
            iFW = theSelection.w + theSelection.x - iFX;
            iFH = theSelection.h + theSelection.y - iFY;
        }
        if (theSelection.bDrag[1]) {
            var iFX = theSelection.x;
            var iFY = iMouseY - theSelection.py;
            iFW = iMouseX - theSelection.px - iFX;
            iFH = theSelection.h + theSelection.y - iFY;
        }
        if (theSelection.bDrag[2]) {
            var iFX = theSelection.x;
            var iFY = theSelection.y;
            iFW = iMouseX - theSelection.px - iFX;
            iFH = iMouseY - theSelection.py - iFY;
        }
        if (theSelection.bDrag[3]) {
            var iFX = iMouseX - theSelection.px;
            var iFY = theSelection.y;
            iFW = theSelection.w + theSelection.x - iFX;
            iFH = iMouseY - theSelection.py - iFY;
        }

        if (iFW > theSelection.csizeh * 2 && iFH > theSelection.csizeh * 2) {
            theSelection.w = iFW;
            theSelection.h = iFH;

            theSelection.x = iFX;
            theSelection.y = iFY;
        }

        drawScene();
    });

    $('#result_canvas').mousedown(function (e) { // binding mousedown event
        var canvasOffset = $(canvas).offset();
        iMouseX = Math.floor(e.pageX - canvasOffset.left);
        iMouseY = Math.floor(e.pageY - canvasOffset.top);

        theSelection.px = iMouseX - theSelection.x;
        theSelection.py = iMouseY - theSelection.y;

        if (theSelection.bHow[0]) {
            theSelection.px = iMouseX - theSelection.x;
            theSelection.py = iMouseY - theSelection.y;
        }
        if (theSelection.bHow[1]) {
            theSelection.px = iMouseX - theSelection.x - theSelection.w;
            theSelection.py = iMouseY - theSelection.y;
        }
        if (theSelection.bHow[2]) {
            theSelection.px = iMouseX - theSelection.x - theSelection.w;
            theSelection.py = iMouseY - theSelection.y - theSelection.h;
        }
        if (theSelection.bHow[3]) {
            theSelection.px = iMouseX - theSelection.x;
            theSelection.py = iMouseY - theSelection.y - theSelection.h;
        }


        if (iMouseX > theSelection.x + theSelection.csizeh && iMouseX < theSelection.x + theSelection.w - theSelection.csizeh &&
                iMouseY > theSelection.y + theSelection.csizeh && iMouseY < theSelection.y + theSelection.h - theSelection.csizeh) {

            theSelection.bDragAll = true;
        }

        for (i = 0; i < 4; i++) {
            if (theSelection.bHow[i]) {
                theSelection.bDrag[i] = true;
            }
        }
    });

    $('#result_canvas').mouseup(function (e) { // binding mouseup event
        theSelection.bDragAll = false;

        for (i = 0; i < 4; i++) {
            theSelection.bDrag[i] = false;
        }
        theSelection.px = 0;
        theSelection.py = 0;
    });

    drawScene();
});

function downloadJPEG() {
    var temp_ctx, temp_canvas;
    temp_canvas = document.createElement('canvas');
    temp_ctx = temp_canvas.getContext('2d');
    temp_canvas.width = theSelection.w;
    temp_canvas.height = theSelection.h;
    theSelection.hidden = true;
    drawScene();
    temp_ctx.drawImage(canvas, theSelection.x, theSelection.y, theSelection.w, theSelection.h, 0, 0, theSelection.w, theSelection.h);
    theSelection.hidden = false;
    drawScene();
    var vData = temp_canvas.toDataURL("image/jpeg");
    
    var win = window.open();

    win.document.body.innerHTML = "<img src='" + vData + "'></img>"; // With correct delimiters
    win.document.close();
}

function downloadGif() {
    var temp_ctx, temp_canvas;
    var encoder = new GIFEncoder();
    encoder.setRepeat(0); //0  -> loop forever
    encoder.setDelay(200); //go to next frame every n milliseconds
    temp_canvas = document.createElement('canvas');
    temp_ctx = temp_canvas.getContext('2d');
    temp_canvas.width = theSelection.w;
    temp_canvas.height = theSelection.h;
    theSelection.hidden = true;

    encoder.start();
    encoder.setSize(theSelection.w, theSelection.h);
    
    for (resultParam = 0; resultParam <= 1; resultParam += 0.1) {
        drawScene();
        temp_ctx.drawImage(canvas, theSelection.x, theSelection.y, theSelection.w, theSelection.h, 0, 0, theSelection.w, theSelection.h);
        encoder.addFrame(temp_ctx);
    }
    
    for (resultParam = 1; resultParam > 0; resultParam -= 0.1) {
        drawScene();
        temp_ctx.drawImage(canvas, theSelection.x, theSelection.y, theSelection.w, theSelection.h, 0, 0, theSelection.w, theSelection.h);
        encoder.addFrame(temp_ctx);
    }

    encoder.finish();


    theSelection.hidden = false;
    resultParam = -1;
    drawScene();
    var binary_gif = encoder.stream().getData(); //notice this is different from the as3gif package!
    var data_url = 'data:image/gif;base64,'+encode64(binary_gif);
    var win = window.open();

    win.document.body.innerHTML = "<img src='" + data_url + "'></img>"; // With correct delimiters
    win.document.close();
    
}

function dropLastPointForImage(img) {
    img.points.pop();
    drawImage(img);
    tryDrawResult();
}

function loadBundles(lang) {

    var translation = translations[lang];

    if (translation === undefined) {
        translation = translations["en"];
    }

    $("#tab1_header").text(translation["tab1_header"]);
    $("#tab2_header").text(translation["tab2_header"]);
    $("#tab3_header").text(translation["tab3_header"]);
    $("#way_to_load1").text(translation["way_to_load"]);
    $("#way_to_load2").text(translation["way_to_load"]);
    $("#drop_zone1").text(translation["drop_zone"]);
    $("#drop_zone2").text(translation["drop_zone"]);
    $("#dropbutton1").val(translation["dropbutton"]);
    $("#dropbutton2").val(translation["dropbutton"]);
    $("#resstyle").text(translation["resstyle"]);
    $("#Mosaic").text(translation["Mosaic"]);
    $("#Transparency").text(translation["Transparency"]);
    $("#styleparam").text(translation["styleparam"]);
    $("#downJPEG").val(translation["downJPEG"]);
    $("#downGIF").val(translation["downGIF"]);
}

var translations = {
    "en": {"tab1_header": "Image 1",
        "tab2_header": "Image 2",
        "tab3_header": "Result",
        "way_to_load": "Ways to load the image:",
        "drop_zone": "Drop a file here",
        "dropbutton": "Drop last marker",
        "resstyle": "Result style:",
        "Mosaic": "Mosaic",
        "Transparency": "Transparency",
        "styleparam": "Style parameter (alpha value or number of pieces in mosaic):",
        "downJPEG": "Save result as jpeg",
        "downGIF" :"Save result as gif"
    },
    "ru": {"tab1_header": "Картинка 1",
        "tab2_header": "Картинка 2",
        "tab3_header": "Результат",
        "way_to_load": "Способы загрузки картинки:",
        "drop_zone": "Перетащите картинку сюда",
        "dropbutton": "Сбросить последний маркер",
        "resstyle": "Стиль результата:",
        "Mosaic": "Мозайка",
        "Transparency": "Прозрачность",
        "styleparam": "Настройка стиля (степень прозрачности или количество элементов мозайки):",
        "downJPEG": "Сохранить как jpeg",
        "downGIF" :"Сохранить как gif"
    }
};