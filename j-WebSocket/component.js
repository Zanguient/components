COMPONENT('websocket', 'reconnect:3000;encoder:true', function(self, config) {

	var ws, url;
	var queue = [];
	var sending = false;

	self.online = false;
	self.readonly();
	self.nocompile && self.nocompile();

	self.make = function() {
		url = (config.url || '').env(true);
		if (!url.match(/^(ws|wss):\/\//))
			url = (location.protocol.length === 6 ? 'wss' : 'ws') + '://' + location.host + (url.substring(0, 1) !== '/' ? '/' : '') + url;
		setTimeout(self.connect, 500);
		self.destroy = self.close;

		$(W).on('offline', function() {
			self.close();
		});

		$(W).on('online', function() {
			setTimeout(self.connect, config.reconnect);
		});

	};

	self.send = function(obj) {
		var data = JSON.stringify(obj);
		if (config.encoder)
			queue.push(encodeURIComponent(data));
		else
			queue.push(data);
		self.process();
		return self;
	};

	self.process = function(callback) {

		if (!ws || !ws.send || sending || !queue.length || ws.readyState !== 1) {
			callback && callback();
			return;
		}

		sending = true;
		var async = queue.splice(0, 3);

		async.wait(function(item, next) {
			if (ws) {
				ws.send(item);
				setTimeout(next, 5);
			} else {
				queue.unshift(item);
				next();
			}
		}, function() {
			callback && callback();
			sending = false;
			queue.length && self.process();
		});
	};

	self.close = function(isClosed) {
		if (!ws)
			return self;
		self.online = false;
		ws.onopen = ws.onclose = ws.onmessage = null;
		!isClosed && ws.close();
		ws = null;
		self.isonline(false);
		return self;
	};

	self.isonline = function(is) {
		if (config.online)
			self.EXEC(config.online, is);
		else
			EMIT('online', is);
	};

	function onClose(e) {

		if (e.code === 4001) {
			location.href = location.href + '';
			return;
		}

		e.reason && WARN('WebSocket:', config.encoder ? decodeURIComponent(e.reason) : e.reason);
		self.close(true);
		setTimeout(self.connect, config.reconnect);
	}

	function onMessage(e) {

		var data;

		try {
			data = PARSE(config.encoder ? decodeURIComponent(e.data) : e.data);
		} catch (e) {
			return;
		}

		if (config.message)
			self.EXEC(config.message, data);
		else
			EMIT('message', data);
	}

	function onOpen() {
		self.online = true;
		self.process(function() {
			self.isonline(true);
		});
	}

	self.connect = function() {
		ws && self.close();
		setTimeout2(self.ID, function() {
			ws = new WebSocket(url.env(true));
			ws.onopen = onOpen;
			ws.onclose = onClose;
			ws.onmessage = onMessage;
		}, 100);
		return self;
	};
});