COMPONENT('planner', 'days:# days,# day,# days,# days;parent:parent', function(self, config) {

	var cls = 'ui-planner';
	var cls2 = '.' + cls;
	var events = {};
	var todayposition = 0;
	var dayscount = 0;
	var scrolldays;
	var scrollcalendar;

	self.resize = function() {

		var tmp;
		var parent = config.parent;

		if (parent === 'window') {
			tmp = $(W);
		} else if (parent === 'parent')
			tmp = self.parent();
		else
			tmp = self.closest(parent);

		var dw = 20;
		var WW = tmp.width();
		var WH = tmp.height();
		var width = ((dayscount + 1) * dw) + 5;

		scrolldays.css('width', WW);
		scrolldays.parent().css('width', WW);
		scrolldays.find(cls2 + '-days').css('width', width);
		self.find('svg').css('width', width);
		self.find(cls2 + '-calendar').css('height', WH - self.find(cls2 + '-dayscontainer').height());
		self.scrollbar.resize();
	};

	self.resize2 = function() {
		setTimeout2(self.ID, self.resize, 200);
	};

	self.make = function() {

		self.aclass(cls);
		self.append('<div class="{0}-dayscontainer"><div class="{0}-daysscrollbar"><div class="{0}-days"></div></div></div><div class="{0}-calendar"><svg width="6000" height="6000" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="{1}" width="20" height="20" patternunits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke-width="2" shape-rendering="crispEdges" /></pattern></defs><rect width="100%" height="100%" fill="url(#{1})" shape-rendering="crispEdges" /><line x1="100" y1="0" x2="100" y2="6000" stroke="red" stroke-width="3"></line><g class="{0}-fills"></g></svg></div>'.format(cls, self.ID));
		self.scrollbar = new SCROLLBAR(self.find(cls2 + '-calendar'), { visibleY: true, visibleX: true });

		scrolldays = self.find(cls2 + '-daysscrollbar');

		var scrolltarget = 0;
		var doscrolltimeout;

		var doscroll = function() {
			scrolltarget = 0;
			doscrolltimeout = null;
		};

		var onscroll = config.scroll ? GET(config.scroll) : null;

		scrollcalendar = self.find('.ui-scrollbar-area');
		scrollcalendar.on('scroll', function() {
			if (!scrolltarget || scrolltarget === 1) {
				scrolltarget = 1;
				scrolldays[0].scrollLeft = this.scrollLeft;
				onscroll && onscroll(this.scrollTop);
				doscrolltimeout && clearTimeout(doscrolltimeout);
				doscrolltimeout = setTimeout(doscroll, 500);
			}
		});

		scrolldays.on('scroll', function() {
			if (!scrolltarget || scrolltarget === 2) {
				scrolltarget = 2;
				scrollcalendar[0].scrollLeft = this.scrollLeft;
				doscrolltimeout && clearTimeout(doscrolltimeout);
				doscrolltimeout = setTimeout(doscroll, 500);
			}
		});

		events.mmove = function(e) {
			var x = events.x - e.pageX;
			var max = 22;
			if (x > max)
				x = max;
			if (x < -max)
				x = -max;
			scrollcalendar[0].scrollLeft += x;
		};

		self.event('click', cls2 + '-item', function() {
			var el = $(this);
			config.exec && SEEX(config.exec, self.get().items.findItem('id', el.attrd('id')), el);
		});

		self.event('mousedown mouseup', function(e) {
			switch (e.type) {
				case 'mousedown':
					events.x = e.pageX;
					events.y = e.pageY;
					events.sx = scrollcalendar[0].scrollLeft;
					events.sy = scrollcalendar[0].scrollTop;
					self.find('svg').on('mousemove', events.mmove);
					break;
				case 'mouseup':
					self.find('svg').off('mousemove', events.mmove);
					break;
			}
		});

		var o = W.OP ? W.OP : $(W);
		o.on('resize', self.resize2);
	};

	self.destroy = function() {
		var o = W.OP ? W.OP : $(W);
		o.off('resize', self.resize2);
	};

	self.configure = function(key, value) {
		switch (key) {
			case 'days':
				config[key] = value.split(',');
				break;
		}
	};

	self.setter = function(value) {

		if (value == null)
			return;

		// value.year
		// value.items

		var beg = new Date(value.year, 0, 1);
		var end = new Date(value.year, 11, 31);
		var day = 1000 * 60 * 60 * 24;
		var days = (end - beg) / day;
		var positions = {};

		var eldays = self.find(cls2 + '-days');
		var builder = [];
		var counter = 0;
		var months = [];
		var monthscount = 0;
		var index = 0;
		var today = +NOW.add('1 day').format('yyyyMMdd');
		var year = NOW.getFullYear();

		todayposition = 0;

		for (var i = 0; i < days; i++) {

			var dt = beg.add(i + ' day');
			var daytype = dt.getDay();
			var num = +dt.format('yyyyMMdd');

			if (!todayposition && (today === num || num > today))
				todayposition = counter;

			var cur = dt.getDate();
			if (cur === 1 && i) {
				months.push('<div class="{0}-month" style="width:{1}px"><b>{2}</b> / {3}</div>'.format(cls, Math.ceil(index * 20), (monthscount + 1).padLeft(2, '0'), MONTHS[monthscount]));
				monthscount++;
				index = 0;
			}

			// Is weekend?
			if (daytype === 0 || daytype === 6)
				continue;

			positions[num] = counter;
			builder.push('<div class="{0}-day">{2}<span>{1}</span></div>'.format(cls, DAYS[daytype].substring(0, 2).toUpperCase(), cur));
			counter++;
			index++;
		}

		months.push('<div class="{0}-month" style="width:{1}px"><b>{2}</b> / {3}</div>'.format(cls, Math.ceil(index * 20), monthscount + 1, MONTHS[monthscount]));
		dayscount = counter;
		eldays.html('<div class="{0}-months">{1}</div><div>{2}</div>'.format(cls, months.join(''), builder.join('')));
		self.resize();

		todayposition = (todayposition - 1) * 20;
		self.find('line').attr('x1', todayposition + 1).attr('x2', todayposition + 1).tclass('hidden', year !== value.year);

		builder = [];

		var g = self.find(cls2 + '-fills');
		g.empty();

		var df = 'yyyyMMdd';

		for (var i = 0; i < value.items.length; i++) {
			var item = value.items[i];
			var beg = +item.dtbeg.format(df);
			var end = +item.dtend.add('1 day').format(df);

			if (!positions[beg])
				beg = +item.dtbeg.add('1 day').format(df);

			if (!positions[beg])
				beg = +item.dtbeg.add('2 days').format(df);

			if (!positions[end])
				end = +item.dtend.add('2 days').format(df);

			if (!positions[end])
				end = +item.dtend.add('3 days').format(df);

			var h = 20;
			var t = i * h;
			var l = positions[beg] * 20;
			var w = (positions[end] || dayscount) * 20;
			var padding = 4;
			var ll = w;

			item.isinprogress = today >= beg && today <= end;
			item.isstarted = today >= beg;

			var gg = g.asvg('g').aclass(cls + '-item').attrd('id', item.id);

			gg.asvg('rect').attr('x', l + padding).attr('width', w - l - (padding * 2)).attr('y', t + padding + 1).attr('height', h - (padding * 2)).attr('fill', item.color).attr('opacity', 0.4).attr('rx', 2).attr('ry', 2).attrd('id', item.id).asvg('title').text(item.title);

			if (item.progress) {
				w = w - l - (padding * 2);
				w = (item.progress / 100) * w;
				gg.asvg('rect').attr('x', l + padding).attr('width', w).attr('y', t + padding + 1).attr('height', h - (padding * 2)).attr('fill', item.color).attr('rx', 2).attr('ry', 2).asvg('title').text(item.title);
			}

			item.duration = Math.ceil((item.dtend - item.dtbeg) / 1000 / 60 / 60 / 24);

			// var d = config.days;
			gg.asvg('text').attr('x', l + padding + 4).attr('y', t + padding + 10).aclass('svg-text').text(item.name); //.text(item.duration.pluralize(d[0], d[1], d[2], d[3]));

			if (item.progress < 10)
				ll += 4;

			gg.asvg('text').attr('x', ll + 1).attr('y', t + padding + 10).aclass('svg-percentage').text(item.progress + '%');
		}

		if (value.year === NOW.getFullYear()) {
			setTimeout(function() {
				$(scrollcalendar).animate({ scrollLeft: (todayposition - (WW / 2)) + 100 }, 300); // 100 is half of 200 because 200px is margin
			}, 500);
		}

		config.exec && SEEX(config.exec, null);
	};

});