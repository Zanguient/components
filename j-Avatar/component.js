COMPONENT('avatar', function(self) {

	var backgrounds = '#1abc9c,#2ecc71,#3498db,#9b59b6,#34495e,#16a085,#2980b9,#8e44ad,#2c3e50,#f1c40f,#e67e22,#e74c3c,#d35400,#c0392b'.split(',');
	var themes = {};

	self.readonly();
	self.singleton();

	window.avatarerror = function(image) {
		var img = $(image);
		var el = img.parent().get(0);
		el.$avatar = false;
		el.$avatarerror = true;
		el = $(el);
		el.attr('title', img.attr('title'));
		self.create(el);
	};

	self.rebind = function(el) {
		var jq = el ? el.find('.avatar') : $('.avatar');
		jq.each(function() {
			!this.$avatar && self.create($(this));
		});
	};

	self.create = function(el) {

		var theme = el.attrd('a') || el.attrd('avatar') || 'default';
		var options = themes[theme];
		if (!options)
			return false;

		var url = el.attrd('a-url') || el.attrd('avatar-url');
		var dom = el.get(0);
		var name = dom.$avatarerror ? el.attr('title') : el.text();

		dom.$avatar = true;

		if (dom.$avatarerror) {
			url = '';
		} else {
			var cls = el.attrd('a-class') || el.attrd('avatar-class') || options.class;
			cls && el.tclass(cls);
		}

		el.aclass('ui-avatar-theme-' + theme);

		if (url) {
			el.html('<img src="{0}" alt="{1}" title="{1}" border="0" onerror="avatarerror(this)" />'.format(url, name));
		} else {

			var arr = name.trim().split(' ');
			var initials = ((arr[0] || '').substring(0, 1) + (arr[1] || '').substring(0, 1)).toUpperCase();

			var css = {};
			var can = false;

			if (!options.background) {
				css.background = backgrounds[name.length % backgrounds.length];
				can = true;
			}

			if (!options.color) {
				can = true;
				css.color = self.colorize(backgrounds[name.length % backgrounds.length], options.lighten);
			}

			can && el.css(css);
			el.attr('title', name);
			el.html(initials);
		}
	};

	self.register = function(id, options) {
		options = options.parseConfig('lighten:80;size:50;radius:100;weight:bold;font:Arial');
		themes[id] = options;
		var builder = [];
		var name = '.ui-avatar-theme-' + id;
		builder.push('display:block;width:{0}px;height:{0}px;text-align:center;vertical-align:middle;font-style:normal;font-size:{1}px;line-height:{2}px'.format(options.size, Math.floor(options.size / 2.5), (options.size + Math.floor(options.size / 20))));
		options.radius && builder.push('border-radius:{0}px'.format(options.radius));
		options.weight && builder.push('font-weight:' + options.weight);
		options.font && builder.push('font-family:' + options.font);
		options.background && builder.push('background:' + options.background);
		options.weight && builder.push('font-weight:{0}'.format(options.weight));
		options.color && builder.push('color:' + options.color);
		var css = name + '{' + builder.join(';') + '}';
		builder = [];
		builder.push('width:{0}px;height:{0}px;'.format(options.size));
		options.radius && builder.push('border-radius:{0}px'.format(options.radius));
		css += '\n' + name + ' img{' + builder.join(';') + '}';
		CSS(css, 'avatar-' + id);
		setTimeout2(self.id + 'rebind', self.rebind, 100, 5);
	};

	self.refresh = self.rebind;

	self.make = function() {
		self.register('default', '');
		self.on('component', function(component) {
			setTimeout2(self._id, function() {
				component.element && self.rebind(component.element);
			}, 150);
		});
		setTimeout2(self._id + 'rebind', self.rebind, 100, 5);
	};

	// Thank to Chris Coyier (https://css-tricks.com/snippets/javascript/lighten-darken-color/)
	// LightenDarkenColor
	self.colorize = function(col, amt) {
		var pound = false;
		if (col[0] == '#') {
			col = col.slice(1);
			pound = true;
		}
		var num = parseInt(col,16);
		var r = (num >> 16) + amt;
		if (r > 255)
			r = 255;
		else if (r < 0) r = 0;
		var b = ((num >> 8) & 0x00FF) + amt;
		if (b > 255)
			b = 255;
		else if (b < 0)
			b = 0;
		var g = (num & 0x0000FF) + amt;
		if (g > 255)
			g = 255;
		else if (g < 0)
			g = 0;
		return (pound ? '#': '') + (g | (b << 8) | (r << 16)).toString(16);
	};
});