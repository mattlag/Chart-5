
	var dayms = 86400000;	// milliseconds per day

	// -------------
	// Chart5 Object
	// -------------
	function chart5(data, pcan, title){

		// Settings
		this.chart_pxpadding = 80;				// Space between the canvas edge and the chart graphics
		this.chart_pxwidth = (800-(80*2));		// Width of the chart graphics - total width = 2*pxpadding + pxwidth
		this.chart_pxheight = 400;				// Height of the chart graphics
		this.chart_color = "rgb(51,150,238)";			// Accent Color
		this.chart_color_light = "rgb(204,231,256)";	// Light Accent Color
		this.chart_color_dark = "rgb(0,90,170)";		// Dark Accent Color
		this.chart_showaverage = true;		// Shows a chart_color_light bar across the whole chart that represents the average of the data
		this.xaxis_labeljump = "week";		// "day", "week", or "month" - skips labeling every day if set to week or month
		this.yaxis_divisions = 10;			// Number of Y Axis labels
		this.yaxis_autocalculate = true;	// Automatically calculate the y axis range
		this.yaxis_minval = 0;				// Manually set the y axis minimum value (calculated automatically otherwise)
		this.yaxis_maxval = 100;			// Manually set the y axis maximum value (calculated automatically otherwise)

		// Internal Properties
		this.data = data;
		this.title = title;
		this.canvas = pcan;
		this.canvas.onmousemove = mouseMove(this);
		this.canvas.onmouseout = mouseOut(this);
		this.ctx = this.canvas.getContext("2d");
		this.chart_average = 0;
		this.datemin = 9999999999999;
		this.datemax = 0;
		this.xaxis_numunits = 7;
		this.xaxis_unitpxsize = (this.chart_pxwidth / (this.xaxis_numunits-1));
		this.yaxis_labeljump = (this.yaxis_maxval - this.yaxis_minval) / this.yaxis_divisions;
		this.yaxis_numunits = this.yaxis_maxval - this.yaxis_minval;
		this.yaxis_unitpxsize = this.chart_pxheight / this.yaxis_numunits;

		// Functions
		this.draw = drawChart5;
		this.drawAxis = drawAxis;
		this.drawData = drawData;
		this.drawAverage = drawAverage;
		this.drawDataPoint = drawDataPoint;
		this.dateWithinBounds = dateWithinBounds;
		this.setDateBounds = setDateBounds;
		this.drawLine = drawLine;
		this.autoCalculateYAxisMaxes = autoCalculateYAxisMaxes;

		// Set up Data and Axis
		if(this.yaxis_autocalculate) { this.autoCalculateYAxisMaxes(); }
		this.setDateBounds(false,false);
	}

	function mouseMove(dataobject){
		return function(ev){
			var mousex = 0;
			var mousey = 0;
			if (ev.layerX || ev.layerX) { // Firefox
				mousex = ev.layerX;
				mousey = ev.layerY;
			}

			if (ev.offsetX || ev.offsetX) { // IE, Chrome, (Opera?)
				mousex = ev.offsetX;
				mousey = ev.offsetY;
			}

			var mx1 = mousex - dataobject.chart_pxpadding;
			var mx = ( (mx1/dataobject.xaxis_unitpxsize)*dayms ) + dataobject.datemin;
			for(var d in dataobject.data){
				if(dataobject.dateWithinBounds(d)){
					if( (mx > new Date(roundDate(d)).getTime()) && (mx < (new Date(roundDate(d)).getTime()+dayms)) ){
						dataobject.drawData(d);
						return;
					}
				}
			}

			dataobject.drawData(0);
		};
	}

	function mouseOut(dataObject){ return function(ev){dataObject.drawData(0);}; }

	function drawChart5(){
		// Setup Chart Canvas
		this.canvas.height = (this.chart_pxheight + (this.chart_pxpadding*2));
		this.canvas.width = (this.chart_pxwidth + (this.chart_pxpadding*2));
		this.ctx.fillStyle = "white";
		this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

		// Title
		this.ctx.textBaseline = "top";
		this.ctx.font = "40px sans-serif";
		this.ctx.fillStyle = this.chart_color;
		this.ctx.fillText(this.title,this.chart_pxpadding*0.75-2,0);

		// Data
		if (this.chart_showaverage) this.drawAverage();
		this.drawAxis();
		this.drawData(0);
		this.canvas.onmousemove({"layerX":0});
	}

	function drawAverage(){
		var count = 0;
		var total = 0;
		var inst = 0;
		for(var d in this.data){
			if(this.dateWithinBounds(d)){
				inst = this.data[str(d)];
				if(inst !== "") total += inst;
				count++;
			}
		}
		var avval = total / count;
		this.chart_average = avval;
		var ydistance = this.chart_pxpadding+(this.chart_pxheight-((avval-this.yaxis_minval)*this.yaxis_unitpxsize));
		this.ctx.fillStyle = this.chart_color_light;
		this.ctx.fillRect(this.chart_pxpadding, ydistance, (this.chart_pxwidth+this.xaxis_unitpxsize+1), (this.chart_pxheight-ydistance+this.chart_pxpadding));
	}

	function drawData(dhilight){
		var barcolor = this.chart_color;
		for(var d in this.data){
			if(this.dateWithinBounds(d)){
				barcolor = (d == dhilight? this.chart_color_dark : this.chart_color);
				this.drawDataPoint(d, barcolor);
			}
		}

		this.ctx.fillStyle = "white";
		this.ctx.fillRect(this.chart_pxpadding*0.75-2, 50, this.chart_pxwidth, 25);

		this.ctx.textBaseline = "top";
		this.ctx.font = "16px sans-serif";
		this.ctx.fillStyle = "gray";

		var txt1 = "average";
		var txt2 = Math.round(this.chart_average*10)/10;

		if(dhilight){
			//var txt1 = (new Date(dhilight).toDateString());
			txt1 = dhilight;
			txt2 = this.data[str(dhilight)];
		}
		this.ctx.fillText(txt1,this.chart_pxpadding*0.75-2,55);
		this.ctx.fillStyle = this.chart_color_dark;
		this.ctx.fillText(txt2,200,55);

	}

	function drawDataPoint(d, pcolor){
		var dval = this.data[str(d)];
		var adjdate = roundDate(d);

		var xdistance = this.chart_pxpadding+(((adjdate-this.datemin)/(this.datemax-this.datemin))*(this.chart_pxwidth+this.xaxis_unitpxsize));
		var ydistance = this.chart_pxpadding+(this.chart_pxheight-((dval-this.yaxis_minval)*this.yaxis_unitpxsize));

		this.ctx.fillStyle = pcolor;
		this.ctx.fillRect(xdistance, ydistance, this.xaxis_unitpxsize+0.5, (this.chart_pxheight-ydistance+this.chart_pxpadding));
	}

	function dateWithinBounds(d){return((new Date(d).getTime()<=this.datemax)&&(new Date(d).getTime()>=this.datemin));}

	function drawAxis(){
		var ch = this.chart_pxheight;
		var cw = this.chart_pxwidth;
		var pad = this.chart_pxpadding;
		var hash = pad/4;

		// draw X axis
		this.ctx.font = "12px sans-serif";
		this.ctx.fillStyle = "gray";
		this.ctx.strokeStyle = "#dddddd";
		var ldate = this.datemin + dayms;
		var label = "na";
		var currx = pad;
		var currmo = "";
		var currdate = new Date();
		var xlabel1 = pad+ch+(hash*1.5);
		var xlabel2 = pad+ch+(hash*2.5);

		if((this.xaxis_labeljump == "day")||(this.xaxis_labeljump == "week")){
			var xj = 1;
			if(this.xaxis_labeljump == "week") xj = 7;

			for(var ix1=0; ix1<this.xaxis_numunits; ix1+=xj){
				currdate = new Date(ldate);
				currx = (ix1*this.xaxis_unitpxsize)+pad;
				var imo = currdate.toDateString().split(" ")[1];

				if(ix1===0){
					this.ctx.fillText(imo, currx, xlabel2, pad);
				}

				label = currdate.getDate();
				this.drawLine(currx,pad+ch,currx,pad+ch+hash);
				this.ctx.fillText(label, currx, xlabel1, pad);
				ldate += (xj*dayms);

				if(imo != currmo){
					currmo = imo;
					this.ctx.fillText(currmo, currx, xlabel2, pad);
				}

			}
		} else {
			for(var ix2=0; ix2<this.xaxis_numunits; ix2+=1){
				currdate = new Date(ldate);
				currx = (ix2*this.xaxis_unitpxsize)+pad;
				if(ix2===0){
					label = currdate.toDateString().split(" ")[1];
					this.drawLine(currx,pad+ch,currx,pad+ch+hash);
					this.ctx.fillText(label, currx, xlabel1, pad);
					this.ctx.fillText(currdate.getFullYear(), currx, xlabel2, pad);
				} else if (currdate.getDate() == 1) {
					label = currdate.toDateString().split(" ")[1];
					this.drawLine(currx,pad+ch,currx,pad+ch+hash);
					this.ctx.fillText(label, currx, xlabel1, pad);
					if(label == "Jan"){
						this.ctx.fillText(currdate.getFullYear(), currx, xlabel2, pad);
					}
				}
				ldate += dayms;
			}
		}

		// draw Y axis
		this.ctx.textBaseline = "middle";
		this.ctx.font = "12px sans-serif";
		this.ctx.fillStyle = "gray";
		this.ctx.strokeStyle = "#dddddd";
		label = this.yaxis_maxval;
		var curry = pad;

		for(iy=0; iy<=this.yaxis_numunits; iy+=this.yaxis_labeljump){
			curry = (iy*this.yaxis_unitpxsize)+pad;
			this.drawLine((pad-hash),curry,pad+cw+this.xaxis_unitpxsize+hash,curry);
			this.ctx.fillText(Math.round(label*100)/100, 10, curry, pad);
			label -= this.yaxis_labeljump;
		}
	}

	function setDateBounds(pmin,pmax){
		if((!pmin&&!pmax)){
			for(var d in this.data){
				this.datemin = Math.min(this.datemin, roundDate(new Date(d).getTime()) );
				this.datemax = Math.max(this.datemax, (roundDate(new Date(d).getTime()) + dayms) );
			}
		} else {
			if(pmin) this.datemin = roundDate(new Date(pmin).getTime());
			if(pmax) this.datemax = roundDate(new Date(pmax).getTime()) + dayms;
		}

		this.xaxis_numunits = (Math.round((this.datemax - this.datemin)/dayms));
		this.xaxis_unitpxsize = (this.chart_pxwidth / (this.xaxis_numunits-1));
	}

	function autoCalculateYAxisMaxes(){
		this.yaxis_minval = 9999999999999;
		this.yaxis_maxval = -9999999999999;

		for(var k in this.data){
			this.yaxis_minval = Math.min(this.yaxis_minval, this.data[k]);
			this.yaxis_maxval = Math.max(this.yaxis_maxval, this.data[k]);
		}

		this.yaxis_labeljump = (this.yaxis_maxval - this.yaxis_minval) / this.yaxis_divisions;
		this.yaxis_numunits = this.yaxis_maxval - this.yaxis_minval;
		this.yaxis_unitpxsize = this.chart_pxheight / this.yaxis_numunits;
	}

	// -------------
	// Helper Functions
	// -------------
	function drawLine(x1,y1,x2,y2){
		x1 = makeCrisp(x1);
		x2 = makeCrisp(x2);
		y1 = makeCrisp(y1);
		y2 = makeCrisp(y2);

		this.ctx.beginPath();
		this.ctx.moveTo(x1,y1);
		this.ctx.lineTo(x2,y2);
		this.ctx.stroke();
		this.ctx.closePath();
	}

	function makeCrisp(num){return (Math.round(num)+0.5);}
	function str(num){return (num+='');}
	function num(str){return (str*1);}
	function roundDate(d){return new Date(d).setHours(0,0,0,0);}
