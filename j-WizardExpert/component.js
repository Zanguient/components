COMPONENT('wizardexpert', 'validate:1', function(self, config, cls) {

	var cls2 = '.' + cls;
	var container;
	var skip, current;

	self.make = function() {

		var scr = self.find('script');
		if (scr.length) {
			self.rebind(scr.html(), true);
			scr.remove();
		}

		self.aclass(cls);

		self.append('<div class="{0}-container"></div>'.format(cls));
		container = self.find(cls2 + '-container');

		self.event('click', 'button', function() {
			var t = this;
			switch (t.name) {
				case 'back':
				case 'next':
					self.navigate(t.name);
					break;
				case 'go':
					break;
			}
		});

		var $path = self.makepath(config.output);

		self.watch(config.output, function(path) {
			var length = $path.length + 1;
			var step = path.substring(length, length + current.length);
			if (step === current)
				setTimeout2(self.ID + 'watcher', self.validateforce, 500, null, step);
		});
	};

	self.validateforce = function(step) {

		var curr = self.steps[step];
		var cannext = curr.validate !== false && config.validate ? CAN(self.makepath(config.output + '.' + step), ['@visible', '@enabled']) : true;
		var tmp, id;

		if (config.back) {
			tmp = self.steps[curr.prev];
			if (tmp)
				tmp.enabled = true;
			SET(self.makepath(config.back), tmp);
		}

		if (config.next) {
			id = self.steps[step].next ? self.steps[step].next : null;
			tmp = id ? self.steps[id] : null;
			if (tmp) {
				tmp.prev = step;
				tmp.enabled = cannext;
				tmp.id = id;
			}
			SET(self.makepath(config.next), tmp);
		}
	};

	self.finish = function() {
		config.exec && EXEC(self.makepath(config.exec), GET(self.makepath(config.output)));
		history.length = 0;
		skip = true;
		self.set('');
	};

	self.navigate = function(type, id) {
		var tmp, step;

		switch (type) {

			case 'back':
				tmp = current ? self.steps[current] : null;
				if (tmp && tmp.prev) {
					self.render(tmp.prev);
					skip = true;
					self.set(tmp || '');
				}
				break;

			case 'next':
				step = self.steps[current];
				if (step.next) {
					self.render(step.next);
					skip = true;
					self.set(id);
				} else
					self.finish();

				break;

			case 'go':
				step = self.meta[id];
				break;
		}
	};

	self.rebind = function(code, init) {
		self.steps = new Function('return ' + code.trim())();
		var keys = Object.keys(self.steps);
		for (var i = 0; i < keys.length; i++)
			self.steps[keys[i]].id = keys[i];
		!init && self.refresh();
	};

	self.setup = function(id) {
		var step = self.steps[id];
		if (step && step.element) {
			if (!step.$init) {
				step.init && SEEX(self.makepath(step.init), step);
				step.$init = true;
			}
			step.refresh && SEEX(self.makepath(step.refresh), step);
		}
	};

	self.render = function(id) {

		if (id === 'NEXT' || id === 'BACK') {
			self.navigate(id.toLowerCase());
			return;
		}

		var selector = '> ' + cls2 + '-step';
		var step = self.steps[id];
		if (!step) {
			container.find(selector).aclass('hidden');
			return;
		}

		current = id;

		if (step.imported) {
			var arr = container.find(selector);
			for (var i = 0; i < arr.length; i++) {
				var el = $(arr[i]);
				var hidden = el.attrd('id') !== id;
				el.tclass('hidden', hidden);
				setTimeout2(self.ID + 'watcher', self.validateforce, 100, null, id);
			}
		} else {
			var el = step.element = $(document.createElement('DIV'));
			el.attrd('scope', self.makepath(config.output + '.' + id) + '__isolated:1');
			el.attrd('id', id);
			el.aclass(cls + '-step hidden');
			container[0].appendChild(el[0]);
			IMPORT(step.url, el, function() {
				step.path = self.makepath(config.output + '.' + step.id);
				step.imported = true;
				self.setup(id);
				self.render(id);
			});
		}
	};

	self.setter = function(value) {

		if (skip) {
			skip = false;
			return;
		}

		if (value)
			self.render(value);
	};

});