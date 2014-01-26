imageCompare
============

Small javascript app for quick compare two images (mainly coins images)

Main idea - if we have two images and want compare it, we need align it first via translating, scaling and rotation. In javascript we have setTransform method of canvas' context that can do this transformation, but we need parameters for it. The simplest way to get it is note 3 equal points in each image. When we now it, we can write lineart equation system based on [transfom formula](http://www.bucephalus.org/text/CanvasHandbook/CanvasHandbook.html#settransform-a-b-c-d-e-f).


[ualgebra.js](https://github.com/plainas/ualgebra.js) is used in this project for solve this equation system