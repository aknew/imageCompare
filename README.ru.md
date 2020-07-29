Сравнение изображений
============

Простенькая программа по совмещению двух картинок. Принцип действия очень простой - если у нас есть три точки на одной картинке и соответствующие им три на другой, то мы можем сделать из них систему линейных уравнений, где в качестве неизвестных будут параметры аффинного преобразования, а в качестве коэффициентов - координаты точек.  Выбор этих точек остается за пользователем.
Изначально написана на js просто потому как работает везде, но есть и вариант для iOS на swift

[Рабочая web-версия](http://aknew.github.io/imageCompare/ImageComporation.html")

[Ветка с обсуждением на coins.su]("http://coins.su/forum/topic/122674-programmka-dlya-bystrogo-vyravnivaniyasravneniya-monet/)

<p><a href="https://itunes.apple.com/us/app/image-superposition/id1226666996?mt=8" style="display:inline-block;overflow:hidden;background:url(https://linkmaker.itunes.apple.com/assets/shared/badges/en-us/appstore-lrg.svg) no-repeat;width:135px;height:40px;background-size:contain;"></a></p>

<iframe id="ytplayer" type="text/html" width="640" height="360"
  src="https://www.youtube.com/embed//GvfVq6NqFiU"
  frameborder="0"></iframe>

### Used sources:

[ualgebra.js](https://github.com/plainas/ualgebra.js) для решения СЛАУ

[Табы на HTML5, CSS3 и jQuery](http://codepen.io/CesarGabriel/pen/tKaxq)

[Сохранение в GIF](https://github.com/antimatter15/jsgif)

[Выбор области](http://www.script-tutorials.com/html5-image-crop-tool)
