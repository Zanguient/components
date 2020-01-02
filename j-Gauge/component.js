COMPONENT('gauge', 'decimals:1;format:{0}%;text:1;colors:30 #8CC152,40 #EDBC5A,30 #DB3737', function(self, config, cls) {

	var cls2 = '.' + cls;
	var svg;

	function Donut(cx, cy, radius, data) {

		function arcradius(cx, cy, radius, degrees) {
			var radians = (degrees - 90) * Math.PI / 180.0;
			return { x: cx + (radius * Math.cos(radians)), y: cy + (radius * Math.sin(radians)) };
		}

		var decimals = 4;
		var total = 0;
		var arr = [];
		var beg = -90;
		var end = 0;
		var count = 0;

		for (var i = 0; i < data.length; i++)
			total += data[i].value;

		for (var i = 0; i < data.length; i++) {
			var item = data[i];
			var tmp = {};

			var p = (((item.value + 1) / total) * 100).floor(2);

			count += p;

			if (i === length - 1 && count < 100)
				p = p + (100 - count);

			end = beg + ((180 / 100) * p);
			tmp.index = i;
			tmp.value = item.value;
			tmp.data = item;

			var b = arcradius(cx, cy, radius, end);
			var e = arcradius(cx, cy, radius, beg);
			var la = 0;

			tmp.d = ['M', b.x.floor(decimals), b.y.floor(decimals), 'A', radius, radius, 0, la, 0, e.x.floor(decimals), e.y.floor(decimals)].join(' ');
			arr.push(tmp);
			beg = end;
		}

		return arr;
	}

	self.redraw = function() {
		svg.empty();

		var colors = config.colors.split(',');
		var color = [];
		var data = [];
		var centerX = 150;
		var centerY = 150;
		var radius = 120;

		for (var i = 0; i < colors.length; i++) {
			var c = colors[i].trim().split(' ');
			data.push({ value: +c[0] });
			color.push(c[1]);
		}

		var arr = Donut(centerX, centerY, radius, data);
		for (var i = 0; i < arr.length; i++) {
			var item = arr[i];
			svg.asvg('<g><path d="{0}" stroke="{1}" fill="none" stroke-width="25" /></g>'.format(item.d, color[i]));
		}
		config.text && svg.asvg('<g><text x="150" y="105" font-size="30" text-anchor="middle"></text></g><g transform="translate(0,-10)" class="{0}-pointer"><path d="M150 20 L145 145 L155 145 Z" class="{0}-value" transform="rotate(0)" /><circle cx="150" cy="150" r="10"></circle></g>'.format(cls));
	};

	self.make = function() {
		self.aclass(cls);
		self.append('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 300 150"></svg>');
		svg = self.find('svg');
		self.redraw();
	};

	self.setter = function(value) {

		if (value > 100)
			value = 100;
		else if (!value)
			value = 0;

		var max = 180;
		var deg = ((max / 100) * value) - (max / 2);

		self.find(cls2 + '-value').stop().animate({ diff: deg }, { step: function(val) {
			this.setAttribute('transform', 'rotate(' + val + ')');
		}, duration: 300 });

		config.text && (self.find('text')[0].textContent = config.format.format(value.format(config.decimals)));
	};

});