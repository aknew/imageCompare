imageCompare
============

Small javascript app for quick compare two images (mainly coins images)

Main idea - if we have two images and want compare it, we need align it first via translating, scaling and rotation. In javascript we have setTransform method of canvas' context that can do this transformation, but we need parameters for it. The simplest way to get it is note 3 equal points in each image. When we now it, we can write lineart equation system based on [transfom formula](http://www.bucephalus.org/text/CanvasHandbook/CanvasHandbook.html#settransform-a-b-c-d-e-f).

[Workable online version](http://aknew.github.io/imageCompare/ImageComporation.html)

[Disscusion on collectors' forum coins.su (in Russian)](http://coins.su/forum/topic/122674-programmka-dlya-bystrogo-vyravnivaniyasravneniya-monet/)

Also I have written an iOS version

<p><a href="https://itunes.apple.com/us/app/image-superposition/id1226666996?mt=8" style="display:inline-block;overflow:hidden;background:url(https://linkmaker.itunes.apple.com/assets/shared/badges/en-us/appstore-lrg.svg) no-repeat;width:135px;height:40px;background-size:contain;"></a></p>
<iframe id="ytplayer" type="text/html" width="640" height="360"
  src="https://www.youtube.com/embed//GvfVq6NqFiU"
  frameborder="0"></iframe>

### Used sources:

[ualgebra.js](https://github.com/plainas/ualgebra.js) is used for solving equation system

[Tabs with HTML5, CSS3 and jQuery](http://codepen.io/CesarGabriel/pen/tKaxq)

[Save to GIF](https://github.com/antimatter15/jsgif)

[Working with selection](http://www.script-tutorials.com/html5-image-crop-tool)
