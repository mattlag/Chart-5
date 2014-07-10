# chart5.js
A bit of javascript that takes daily data in an object (javascript date / value) and uses HTML5 canvas to draw a chart.  See example.html to see it in use.

Here is an example of how it would be set up:
```html

<!DOCTYPE html>
<html>
<head>
<script src="raindata.js"></script>
<script src="chart5.js"></script>
<script>
	function init(){
		var ctx5y = document.getElementById("yearsgraph");
		var c5y = new chart5(raindata, ctx5y, "2009 & 2010");
		c5y.setDateBounds("2009-01-01", "2010-12-31");
		c5y.xaxis_labeljump = "month";
		c5y.draw();
			
		var ctx5m = document.getElementById("monthsgraph");
		var c5m = new chart5(raindata, ctx5m, "2010 Quarter 1");
		c5m.setDateBounds("2010-01-01", "2010-03-31");
		c5m.xaxis_labeljump = "week";
		c5m.draw();
		
		var ctx5w = document.getElementById("weeksgraph");
		var c5w = new chart5(raindata, ctx5w, "January 2010");
		c5w.setDateBounds("2010-01-01", "2010-01-29");
		c5w.xaxis_labeljump = "day";
		c5w.draw();
	}	
</script>
</head>
<body onload="init();">
	<canvas id="yearsgraph"></canvas><br>
	<canvas id="monthsgraph"></canvas><br>
	<canvas id="weeksgraph"></canvas><br>
</body>
</html>

```

Creating these graphs and customizing them are fairly simple.  A constructor function takes the Data, Element ID, and Chart Title as arguments, and returns a chart object.  This chart object can have its properties modified, then you can call the draw() method, which will update the chart.  A simple interaction feature would be to hook the setDateBounds() method up to a control that also calls draw() – this would dynamically change the date range.

Each graph can have the following characteristics customized:
 
* Height and Width
* Light, Medium, and Dark accent colors
* Showing an average for the displayed data range
* Customizing the X and Y labels and increments
	
## License
Copyright (C) 2014 Matthew LaGrandeur, released under [GPL 3.0](https://www.gnu.org/licenses/gpl-3.0-standalone.html)

## Author
| ![Matthew LaGrandeur's picture](https://1.gravatar.com/avatar/f6f7b963adc54db7e713d7bd5f4903ec?s=70) |
|---|
| [Matthew LaGrandeur](http://mattlag.com/) |
| matt[at]mattlag[dot]com |



