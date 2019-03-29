(function( window ) {
	var Walnut = function(selector,context){
		return new Walnut.fn.init( selector, context );
	}
	Walnut.fn = Walnut.prototype = {
		each: function(fn){
			for(var i = 0 ,len = this.length; i<len; i++){
				fn.call(this[i],i);
			}
		},
		parent: function(){
			var elements = [];
			this.each(function(){
				elements.push(this.parentNode);
			})
			return w.makeWalnut(elements, 'duplicate');
		},
		parents: function(selector, until){
			var elements = [];
			this.each(function(){
				var p = this.parentNode;
				while(p && p.nodeType!==9){
					if (w.isEqual(p,selector)){
						elements.push(p);
						if (!until) break;
					}
					p = p.parentNode;
				}
			})
			return w.makeWalnut(elements, 'duplicate');
		},
		children: function(selector){
			var elements = [];
			this.each(function(){
				elements = Array.prototype.concat.apply(elements,this.children);
			})
			return selector ? w.filter(elements,selector) : w.makeWalnut(elements);
		},
		find: function(selector){
			if (!selector) return finds;
			var elements = [];
			this.each(function(){
				elements = Array.prototype.concat.apply(elements,this.querySelectorAll(selector));
			})
			return w.makeWalnut(elements, 'duplicate');
		},
		siblings: function(selector){
			var elements = [];
			this.each(function(){
				var n = this.parentNode.firstChild;
				for ( ; n; n = n.nextSibling ) {
					if ( n.nodeType===1 && n!==this && (!selector||w.isEqual(n,selector)) ) {
						elements.push(n);
					}
				}
			})
			return w.makeWalnut(elements, 'duplicate');
		},
		prev: function(until){
			// until为复数选择，可设置为num个数
			var elements = [];
			this.each(function(){
				var n = this.previousSibling;
				for ( var num=0; n; n = n.previousSibling ) {
					if (n.nodeType === 1) {
						elements.push(n);
						if (!until || until===++num) break;
					}
				}
			})
			return w.makeWalnut(elements, 'duplicate');
		},
		next: function(until){
			var elements = [];
			this.each(function(){
				var n = this.nextSibling;
				for ( var num=0; n; n = n.nextSibling ) {
					if (n.nodeType === 1) {
						elements.push(n);
						if (!until || until===++num) break;
					}
				}
			})
			return w.makeWalnut(elements, 'duplicate');
		},
		eq: function(n){
			return this[n] ? Walnut(this[n]) : Walnut();
		},
		filter: function(selector){
			return w.filter(this, selector);
		},
		not: function(selector){
			return w.filter(this, selector, true);
		},
		index:function(){
			var prev=this[0].previousSibling;
			var i = 0;
			while(prev){
				if(prev.nodeType===1){
					i++;
				}
				prev=prev.previousSibling;
			}
			return i;
		},
		hasClass: function(cName){
			return this[0] ? !!this[0].className.match( new RegExp( "(\\s|^)" + cName + "(\\s|$)") ) : false;
		},
		addClass: function(cName){
			this.each(function(){
				if( !Walnut(this).hasClass(cName) ){
					this.className += (this.className ? ' ' : '') + cName;
				}
			})
			return this;
		},
		removeClass: function(cName){
			this.each(function(){
				if( Walnut(this).hasClass(cName) ){
					this.className = this.className.replace( new RegExp( "(\\s|^)" + cName + "(\\s|$)" ), " " ).replace(/(^\s+)|(\s+$)/g,'');
				}
			})
			return this;
		},
		css: function (prop, value) {
			if (!value) {
				if (typeof prop === 'object') {
					this.each(function (){
						for(var i in prop){
							this.style[i] = prop[i];
						}
					});
				}else{
					return this.length ? w.getStyle(this[0],prop) : "";
				}
			}else{
				this.each(function (){
					this.style[prop] = value;
				});
			}
			return this;
		},
		attr :function(prop, value){
			if (!value) {
				if (typeof prop === 'object') {
					this.each(function (){
						for(var i in prop){
							this.setAttribute(i,prop[i]);
						}
					});
				}else{
					return this[0] ? this[0].getAttribute(prop) : '';
				}
			}else{
				this.each(function (){
					this.setAttribute(prop,value);
				});
			}
			return this;
		},
		data: function(prop, value){
			if (!value) {
				if (typeof prop === 'object') {
					this.each(function (){
						setCache(this, prop);
					});
				}else{
					return this[0] ? w.getData(this[0],prop) : '';
				}
			}else{
				this.each(function (){
					setCache(this, prop, value);
				});
			}
			return this;
		},
		show: function (){
			this.each(function (){
				this.style.display = '';
				if (w(this).css('display')=='none') this.style.display = "block";
			});
			return this;
		},
		hide: function (){
			this.each(function (){
				this.style.display = 'none';
			})
			return this;
		},
		clone: function(deep){
			var clone = this[0] ? this[0].cloneNode(deep) : 0;
			return Walnut(clone)
		},
		text: function(str){
			if (str===undefined){
				return this[0] ? w.getText(this[0]) : '';
			}
			return this.empty().append(document.createTextNode(str));
		},
		html: function(str){
			if (str===undefined){
				return this[0] ? this[0].innerHTML : '';
			}
			this.each(function(){
				w.event.removeAll(this);
				var nodename = this.nodeName.toLowerCase();
				if (nodename=='table') {
					var div = document.createElement('div');
					div.innerHTML = '<table>' + str + '</table>'
					this.replaceChild(div.firstChild.firstChild, this.firstChild)
				}else if (nodename=='tbody'){
					var div = document.createElement('div');
					div.innerHTML = '<table>' + str + '</table>'
					this.parentNode.replaceChild(div.firstChild.firstChild, this)
				}else{
					this.innerHTML = str;
				}
			})
			return this;
		},
		append: function(html){
			if (html.nodeType) {
				this.each(function(){
					this.appendChild(html);
				})
			}else{
				var divTemp = document.createElement("div"), nodes = null
					, fragment = document.createDocumentFragment();
				divTemp.innerHTML = html;
				nodes = divTemp.childNodes;
				this.each(function(){
					for (var i=0, length=nodes.length; i<length; i++) {
					   fragment.appendChild(nodes[i].cloneNode(true));
					}
					this.appendChild(fragment, this.firstChild);
				})
				nodes = null;
				fragment = null;
			}
			return this;
		},
		prepend: function(html){
			if (html.nodeType) {
				this.each(function(){
					this.insertBefore(html,this.firstChild);
				})
			}else{
				this.each(function(){
					var divTemp = document.createElement("div"),
						nodes = null,
						fragment = document.createDocumentFragment();
					divTemp.innerHTML = html;
					nodes = divTemp.childNodes;
					for (var i=0, length=nodes.length; i<length; i++) {
					   fragment.appendChild(nodes[i].cloneNode(true));
					}
					this.insertBefore(fragment, this.firstChild);
					nodes = null;
					fragment = null;
				})
			}
			return this;
		},
		remove: function(){
			this.each(function(){
				w.event.removeAll(this, 'contain_this');
				delete w.cache[this[w_mark]];
				this.parentNode.removeChild(this);
			})
		},
		empty: function(){
			this.each(function(){
				w.event.removeAll(this);
				try{
					this.innerHTML = '';
				}catch(e){
					while (this.firstChild) {
						this.removeChild(this.firstChild);
					}
				}
			})
			return this;
		},
		on: function (type, selector, fn){
			this.each(function () {
				if (fn) {
					w.event.add(this,type,fn,selector);
				}else{
					w.event.add(this,type,selector);
				}
			});
			return this;
		},
		off: function(type, fn){
			this.each(function(){
				w.event.remove(this, type ,fn);
			})
			return this;
		},
		animate: function(cssEnd, time ,callback){
			this.each(function(){
				var elem = this, cssBegin = {};
				for(var i in cssEnd){
					var style = w.getStyle(this,i),num = parseFloat(style);
					if(!num&&num!==0) continue;
					if (cssEnd[i].indexOf('%')>-1) {
						this.style[i] = num + '%';
						num = num===0 ? 0 : num*num/parseFloat(w.getStyle(this,i));
						cssBegin[i] = {
							num: num,
							unit: '%',
							range: parseFloat(cssEnd[i]) - num
						};
					}else{
						cssBegin[i] = {
							num: num,
							unit: style ? style.replace(/-?[\d\.]*/g,'') : '',
							range: parseFloat(cssEnd[i]) - num
						};
					}
				}
				w.animateGo(elem,cssBegin,cssEnd,time,callback);
			})
			return this;
		},
		offset: function(){
			var top = 0,
				left = 0,
				elem = this[0];
			if (!elem) return;
			while(elem.offsetParent) {
				top += elem.offsetTop;
				left += elem.offsetLeft;
				elem = elem.offsetParent;
			}
			return {top: top,left: left}
		}
	}
	var init = Walnut.fn.init = function(selector,context) {
		if(!selector) return this;
		if(typeof selector === "string") {
			selector = selector.trim();
			if (/[\s\.>]/.test(selector)) {
				return w.makeWalnut(document.querySelectorAll(selector));
			}
			if (selector.charAt(0) == '#') {
				if (selector = document.getElementById(selector.substring(1))) {
					return w.makeWalnut( [selector] );
				}
				return this;
			}else{
				return w.makeWalnut(document.getElementsByTagName(selector));
			}
		}else if (typeof selector === "function") {
			w.event.add(window,'load',selector);
		}else if (selector.nodeType) {
			this[0] = selector;
			this.length = 1;
			return this;
		}
	};
	init.prototype = Walnut.fn;
	window.w = window.walnut = Walnut;

	// 生成Walnut实例
	Walnut.makeWalnut = function(arr, duplicate){
		var created = Walnut(), idx = 0;
		for(var i = 0 ,len = arr.length; i<len; i++){
			if (!duplicate || arr[i] && !w.contains(created, arr[i])) {
				created[idx] = arr[i];
				created.length = ++idx;
			}
		}
		return created;
	}
	// 判断元素是否符合选择器
	Walnut.isEqual = function(elem, selector) {
		if (selector.nodeType) return elem===selector;
		var arr = selector.split(',');
		for (var i = arr.length - 1; i >= 0; i--) {
			var type = arr[i].charAt(0);
			if(type==='#' && "#"+elem.id===selector || type==='.' && w(elem).hasClass(arr[i].substring(1)) || elem.tagName.toLowerCase() === arr[i]){
				return true;
			}
		}
		return false;
	}
	// 根据 selector 过滤元素
	Walnut.filter = function(elements, selector, not){
		var unique = [], len = elements.length;
		for(var i=0 ; i<len; i++){
			var same = w.isEqual(elements[i],selector);
			if ((same&&!not) || (!same&&not)) {
				unique.push(elements[i]);
			}
		}
		return w.makeWalnut(unique);
	}
	// 判断集合中是否存在元素
	Walnut.contains = function(arr, elem){
		for(var i = 0 ,len = arr.length; i<len; i++){
			if (arr[i] === elem) {
				return true;
			}
		}
	}
	// 获取文本内容
	Walnut.getText = function(elem) {
		var name = elem.nodeName.toLowerCase();
		return (name==="input" || name==="textarea") ? elem.value : (elem.textContent||elem.innerText);
	}
	// 获取元素样式
	Walnut.getStyle = function(elem, attr) {
		if (window.getComputedStyle) {
			if (elem.ownerDocument.defaultView.opener) {
				var style = elem.ownerDocument.defaultView.getComputedStyle(elem,null)[attr];
			}else{
				var style = window.getComputedStyle(elem,null)[attr];
			}
		}else{
			var style = elem.currentStyle[attr];
		}
		if ((attr=='width'||attr=='height')&&style=='auto') {
			var clientRect = elem.getBoundingClientRect();
			return (style == "width" ? clientRect.right - clientRect.left : clientRect.bottom - clientRect.top) + "px";
		}
		return style;
	}
	// 获取数据类型
	Walnut.getType = function(obj) {
		if ( obj == null ) return obj + "";
		try{
			return typeof obj === "object" || typeof obj === "function" ? w_typeof[ toString.call(obj) ] || "object" : typeof obj;
		}catch(e){
			return obj.join ? 'array' : typeof obj;
		}
	}
	// 获取缓存数据
	Walnut.getData = function(elem, key) {
		try{
			return w.cache[elem[w_mark]].data[key];
		}catch(e){
			return elem.getAttribute('data-'+key) || '';
		}
	}
	Walnut.each = function(obj, callback){
		var len = obj.length;
		if (Walnut.getType( obj ) == 'array') {
			for (var i = 0 ; i < len; i++ ) {
				var value = callback.call(obj[i], i, obj[i]);
				if (value===false) break;
			}
		} else {
			for ( i in obj ) {
				var value = callback.call(obj[i], i, obj[i]);
				if (value===false) break;
			}
		}
		return obj;
	}
	Walnut.cache = {};
	var expando = 0;
	var w_mark = 'walnut_' + new Date().getTime()%1019;
	var w_typeof = {};
	function setCache(elem, prop, value){
		var key = elem[w_mark], data;
		if (!key) {
			key = elem[w_mark] = ++expando+'';
			w.cache[key] = {};
		}else if (!w.cache[key]){
			w.cache[key] = {};
		}
		if (prop) {
			if ( !(data=w.cache[key].data) ) data = w.cache[key].data = {};
			if (value) {
				data[prop] = value;
			}else{
				for(var i in prop){
					data[i] = prop[i];
				}
			}
		}
		return w.cache[key];
	}
	Walnut.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
		w_typeof["[object "+name+"]"] = name.toLowerCase();
	})
	Walnut.each({
		slideDown: "show",
		slideUp: "hide",
		slideToggle: "toggle",
		fadeIn: "show",
		fadeOut: "hide",
		fadeToggle: "toggle"
	}, function( name, props ) {
		Walnut.fn[ name ] = function(ms) {
			this.each(function(){
				var do_show = w.getStyle(this,'display')=='none';
				if (do_show&&props=='hide' || !do_show&&props=='show') return;
				var elemData = setCache(this);
				if (!elemData.animated) {
					elemData.animated = {doing:false,stack:[]};
				}else if (elemData.animated.stack.length && elemData.animated.doing){
					elemData.animated.doing = false;
					elemData.animated.stack.shift();
				}else{
					elemData.animated.stack.push([name,ms]);//待执行动画
					return;
				}
				var type = name.slice(0,4);
				var cssText = this.style.cssText;
				if (type=='fade') {
					ms = ms || 321;
					var cssData = {'opacity':this.style['opacity']};
					var cssEnd = {'opacity': do_show ? 1 : 0};
					if (do_show){
						this.style['opacity'] = '0';
						this.style.filter = 'alpha(opacity=0)';
					}else{
						this.style['opacity'] = '1';
						this.style.filter = 'alpha(opacity=100)';
					}
				}else{
					ms = ms || 123;
					var cssData = {
						'height': this.style['height'],
						'overflow': this.style['overflow'],
						'margin-top': this.style['margin-top'],
						'margin-bottom': this.style['margin-bottom'],
						'padding-top': this.style['padding-top'],
						'padding-bottom': this.style['padding-bottom']
					}
				}
				this.style['overflow'] = 'hidden';
				this.style['display'] = '';
				if (w.getStyle(this,'display')=='none') {
					this.style.display = "block";
				}
				if (type=='slid'){
					var cssEnd = {
						'height': '0px',
						'margin-top': '0px',
						'margin-bottom': '0px',
						'padding-top': '0px',
						'padding-bottom': '0px'
					}
				}
				var cssBegin = {};
				if (do_show && type=='slid') {
					for(var i in cssEnd){
						cssBegin[i] = {
							num: 0,
							unit: 'px',
							range: parseFloat(w.getStyle(this,i))
						};
					}
					this.style['height'] = '0px';
				}else{
					for(var i in cssEnd){
						var style = w.getStyle(this,i), num = parseFloat(style);
						if((!num && num!==0) || (!do_show&&num===0)) continue;
						var range_end = do_show ? 1 : 0;
						cssBegin[i] = {
							num: num,
							unit: style ? style.replace(/[-\d\.]*/g,'') : '',
							range: range_end-num
						};
					}
				}
				w.animateGo(this,cssBegin,cssEnd,ms,function(){
					this.style.cssText = cssText;
					this.style.display = do_show ? "block" : "none";
				})
			})
		};
	})
	Walnut.each(['scrollTop','scrollLeft'],function( i, name ){
		Walnut.fn[ name ] = function(end_to, speed) {
			end_to = Number(end_to)>0 ? Number(end_to) : 0;
			this.each(function(){
				var _this = this;
				var temp = this[name];
				var diff = end_to - temp;
				if (diff){
					var num = diff*16/(speed||16);
					var timer = setInterval(function(){
						temp += num;
						if (temp>=end_to&&diff>0 || temp<=end_to&&diff<0) {
							_this[name] = end_to;
							clearInterval(timer);
						}else{
							_this[name] = temp;
						}
					},16)
				}
			})
		}
	})
	Walnut.each(["blur", "focus", "focusin", "focusout", "load", "resize", "scroll", "unload", "click", "dblclick", "mousedown", "mouseup", "mousemove", "mouseover", "mouseout", "mouseenter", "mouseleave", "change", "select", "submit", "keydown", "keypress", "keyup", "error", "contextmenu"], function( i, name ) {
		Walnut.fn[ name ] = function(fn) {
			return this.on( name, null, fn);
		};
	})
	Walnut.addEvent = function(obj,etype,fn){
		if (etype==='mousewheel' && Walnut.broswerType==="火狐"){
			etype = 'DOMMouseScroll';
		}
		if(obj.addEventListener){
			obj.addEventListener(etype,fn,false);
		}else{
			obj.attachEvent('on'+etype,fn);
		}
	}
	Walnut.removeEvent = function(obj,etype,fn){
		if (etype==='mousewheel' && Walnut.broswerType==="火狐"){
			etype = 'DOMMouseScroll';
		}
		if (obj.removeEventListener){
			obj.removeEventListener(etype, fn, false);
		}else if (obj.detachEvent){
			obj.detachEvent("on" + etype, fn);
		}
	}
	Walnut.event = {
		add: function(obj,etype,fn,selector){
			var type = etype.split('.'), events, eventHandle;
			etype = type[0];
			if (selector) {
				eventHandle = function(event){
					var elem = event.srcElement ? event.srcElement : event.target;
					var pElem = w(elem).parents(selector);
					if (Walnut.isEqual(elem,selector)){
						fn.call(elem, event);
					}else if (pElem.length && Walnut.contains(eventHandle.elem.querySelectorAll(selector),pElem[0])) {
						fn.call(pElem[0], event);
					}
				}
				eventHandle.elem = obj;
			}else if(obj.addEventListener){
				eventHandle = fn;
			}else{
				eventHandle = function(event){
					fn.call(eventHandle.elem,event);
				}
				eventHandle.elem = obj;
			}
			var eventData = {
				type: type[0],
				selector: selector||obj.id||obj.className||'',
				namespace: type[1]||'',
				handler: eventHandle
			}
			var elemData = setCache(obj);
			if (!(events = elemData.events)) {
				events = elemData.events = {};
			}
			if (!events[type[0]]) events[type[0]] = [];
			events[type[0]].push(eventData);

			w.addEvent(obj,etype,eventHandle);
			obj = null;
		},
		remove: function(elem, type, fn){
			if (fn) return w.removeEvent(elem, type, fn);
			var events, hasEvents=0, mark = elem[w_mark];
			if (mark && w.cache[mark] && (events = w.cache[mark].events)) {
				for(var i in events){
					hasEvents++;
					var handlers = events[i];
					for(var j=0; j<handlers.length; j++){
						if (!type || handlers[j].type==type || handlers[j].namespace==type) {
							w.removeEvent(elem, handlers[j].type, handlers[j].handler);
							handlers.splice(j,1);
							if (!handlers.length) {
								hasEvents--;
								delete events[i];
								break;
							}
							j--;
						}
					}
				}
				if (!hasEvents) delete w.cache[mark].events;
			}
		},
		removeAll: function(pElem,contain_this){
			if (contain_this) this.remove(pElem);
			w.each(pElem.getElementsByTagName('*'), function(i,elem){
				var mark = elem[w_mark];
				if (mark && w.cache[mark] && w.cache[mark].events) {
					w.event.remove(elem);
					delete w.cache[elem[w_mark]];
				}
			})
		}
	}
	Walnut.animateGo = function(elem,cssBegin,cssEnd,time,callback){
		var start;
		var act = function(timestamp){
			if (!start) start = timestamp;
			var progress = timestamp - start;
			if (time > 0 && progress < time) {
				for(var i in cssBegin){
					if (cssBegin[i].range) {
						var value = cssBegin[i].num + (progress/time)*cssBegin[i].range;
						elem.style[i] = value + cssBegin[i].unit;
						if (i=='opacity') {
							elem.style.filter = 'alpha(opacity='+value*100+')';
						}
					}
				}
				requestAnimationFrame(act);
			}else {
				for(var i in cssBegin){
					elem.style[i] = cssEnd[i];
					if (i=='opacity') {
						elem.style.filter = 'alpha(opacity='+cssEnd[i]*100+')';
					}
				}
				var mark = elem[w_mark];
				if (callback) callback.call(elem);
				if (!w.cache[mark]) return;
				// 有等待的动画时继续执行
				var state = w.cache[mark].animated;
				if (state && state.stack.length) {
					state.doing = true;
					var name = state.stack[0][0], ms = state.stack[0][1];
					w(elem)[name](ms);
				}else if(state){
					delete w.cache[mark].animated;
				}
			}
		}
		requestAnimationFrame(act);
	}
	Walnut.stopPropagate = function(event){
		var e = event || window.event;
		if(e.stopPropagation) {
			e.stopPropagation();
		}else{
			e.cancelBubble = true;
		}
	}
	Walnut.preventDefault = function(event){
		var e = event || window.event;
		if(e.preventDefault()) {
			e.preventDefault();
		}else{
			e.returnValue = false;
		}
	}
	Walnut.reg = {
		'sora':/^\s*$/,
		'mobile':/^1[3-9]\d{9}$/,
		'phone':/^(0\d{2,3}-?)?\d{7,8}$/,
		'email':/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
	}
	//设备信息
	Walnut.device = function(){
		var deviceObj={
			os:"",
			android:false,
			androidVersions:"",
			ios:false,
			iosType:"",
			iosVersions:"",
			broswerType:"",
			GPU:"",
			dips:""
		}
		if(navigator.appName == "Microsoft Internet Explorer"){
			var v = navigator.userAgent.match(/IE\s\d+/);
			if(v){
				return parseInt(v[0].substring(3));
			}else{
				return "IE暂不支持该方法";
			}
		}else{
			var u = navigator.userAgent.toLowerCase();
			var canvas = document.createElement('canvas');
			var gl = canvas.getContext('experimental-webgl');
			if(u.indexOf("window") > -1){
				deviceObj.os = "windows";
			}
			if(u.indexOf("mac os x") > -1) {
				deviceObj.os = "mac";
			}
			if(u.indexOf("linux") > -1) {
				deviceObj.os = "linux";
			}
			if(u.indexOf('android')>-1 || u.indexOf('linux') > -1){
				deviceObj.android = true;
				deviceObj.androidVersions = u.toLowerCase().match(/android (.*?);/)[1];
			}
			if(u.indexOf('iPhone') > -1){
				deviceObj.ios = true;
				deviceObj.iosVersions = u.toLowerCase().match(/cpu iphone os (.*?) like mac os/)[1].replace(/_/g,".");
			}
			deviceObj.broswerType = u.indexOf('baiduboxapp') > 0 ? "手机百度":u.indexOf('micromessenger') > 0?"微信内置":u.indexOf("baidubrowser") > 0?"百度浏览器":u.indexOf("ucbrowser") > 0?"uc":u.indexOf("mqqbrowser") > 0?"qq浏览器":u.indexOf("qhbrowser") > 0?"360浏览器":u.indexOf("chrome") > 0?"chrome":u.indexOf("firefox") > 0?"火狐":"safari or others";
			if (deviceObj.GPU == "") {
				var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
				deviceObj.GPU = debugInfo == null ? 'unknown' : gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
			}
			deviceObj.dips = Math.floor(Math.max(screen.width, screen.height) * (window.devicePixelRatio || 1));
			return deviceObj;
		}
	};
	//横竖屏判断
	Walnut.screenRotate = function(){
		if(screen.width>screen.height){
			return "Landscape";
		}else{
			return "Portrait";
		}
	};
	//开关
	Walnut.switchBtn = function(obj,act){
		act = act || "active";
		if(w(obj).hasClass(act)){
			w(obj).removeClass(act)
		}else{
			w(obj).addClass(act)
		}
	};
	//步进器
	Walnut.changeNum = function(obj,num,minnum,maxnum){
		minnum = minnum || 0;
		maxnum = maxnum || 100;
		var inp = w(obj).parent()[0].getElementsByTagName("input")[0];
		var count = parseInt(inp.value);
		count += parseInt(num);
		inp.value = count;
		if(count < parseInt(minnum + Math.abs(num))){
			inp.value = minnum;
		}
		if(count > parseInt(maxnum - Math.abs(num))){
			inp.value = maxnum;
		}
	};
	//步进器输入验证
	Walnut.inputKeyup = function(obj,len,minnum,maxnum){
		len = len || 3;
		minnum = minnum || 0;
		maxnum = maxnum || 100;
		obj.setAttribute("maxlength",len);
		var count = parseInt(obj.value);
		if(count == "" || count < minnum || isNaN(count)){
			obj.value = minnum;
		}
		if(count >= maxnum){
			obj.value  = maxnum;
		}
		obj.value = parseInt(obj.value);
	};
	//单选
	Walnut.singleSelect = function(obj,act){
		act = act || "active"
		var c = obj.parentNode.children;
		for(var i = 0; i < c.length; i++){
			w(c[i]).removeClass(act)
		}
		w(obj).addClass(act)
	};
	//多选 && 多级列表
	Walnut.oldMultiSelect = function(obj,act){
		act = act || "active"
		this.switchBtn(obj,act);
		if(w(obj).hasClass("check_all")){
			var all = obj.parentNode.parentNode;
			var check_btn = all.querySelectorAll(".check_btn");
			if(w(obj).hasClass(act)){
				for(var i = 0; i<check_btn.length; i++){
					w(check_btn[i]).addClass(act);
				}
			}else{
				for(var i = 0; i<check_btn.length; i++){
					w(check_btn[i]).removeClass(act);
				}
			}
		}else{
			var check_parent = obj.parentNode;
			var check_sib = w(check_parent).siblings()[0].children;
			var classArr = [];
			var all = obj.parentNode.parentNode.parentNode;
			var check_all = all.querySelector(".check_all");
			var check_group = all.querySelectorAll(".check_group");
			var check_btn = all.querySelectorAll(".check_btn");
			var groupArr = [];
			for(var i=0; i< check_parent.children.length; i++){
				if(w(check_parent.children[i]).hasClass(act)){
					classArr[classArr.length] = check_parent.children[i];
				}
			}
			if(check_parent.children.length == classArr.length){
				for(var i=0; i<check_sib.length; i++){
					w(check_sib[i]).addClass(act);
				}
			}else{
				for(var i=0; i<check_sib.length; i++){
					w(check_sib[i]).removeClass(act);
				}
			}
			if(check_all){
				for(var i=0; i< check_group.length; i++){
					if(w(check_group[i]).hasClass(act)){
						groupArr[groupArr.length] = check_group[i];
					}
				}
				if(check_group.length == groupArr.length){
					w(check_all).addClass(act);
				}else{
					w(check_all).removeClass(act);
				}
			}
		}
	};
	//居中状态弹框
	Walnut.lucencyAlert = function(str,s){
		var _this = this;
		s = s || 1500;
		if(_this.alert_flag){
			_this.alert_flag = false;
			w(".lucency_remind").show();
			w(".lucency_alert").css("display","inline-block");
			w(".lucency_alert")[0].innerHTML = str;
			var timer = setTimeout(function(){
				w(".lucency_remind").hide();
				w(".lucency_alert").hide();
				clearTimeout(timer);
				_this.alert_flag = true;
			},s)
		}
	};
	//顶部状态弹框
	Walnut.statusAlert = function(str,bool,s){
		var _this = this;
		s = s || 1500;
		if(_this.alert_flag){
			_this.alert_flag = false;
			if(bool){
				w(".status_alert").addClass("icon-TipsSuccessful");
				w(".status_remind").show();
				w(".status_alert").css("display","inline-block");
				w(".status_alert").css("background","#23AD3E");
				w(".status_alert")[0].innerHTML = str;
			}else{
				w(".status_alert").addClass("icon-TipsError");
				w(".status_remind").show();
				w(".status_alert").css("display","inline-block");
				w(".status_alert").css("background","#F44024");
				w(".status_alert")[0].innerHTML = str;
			}
			var timer = setTimeout(function(){
				w(".status_remind").hide();
				w(".status_alert").hide();
				clearTimeout(timer);
				_this.alert_flag = true;
			},s)
		}
	};
	//页面消蓝块（和contentEditable冲突,开启后同样禁止光标复制操作）
	Walnut.removeBlue = function(){
		document.onselectstart = new Function("return false");
	};
	//下拉监听
	Walnut.linsenLi = function(obj){
		var _this = this;
		_this.singleSelect(obj);
		var top = obj.parentNode.parentNode;
		var sele = top.querySelector(".list_selected");
		var list = top.querySelector(".select_list");
		sele.innerHTML = obj.innerHTML;
	};
	//状态弹层
	Walnut.statusPopups = function(ele,str){
		$(".walnut_masking").hide();
		$(".walnut_popup").hide();
		if(!ele) var ele = ".popup_box";
		str = str || "您有未保存的更改，您确定要离开此页面吗？";
		w(".walnut_masking").show();
		w(ele).show();
		if(w(ele).find(".popup_body_content").length>0){
			w(ele).find(".popup_body_content")[0].innerHTML = str;
		}
		var heigh = w(ele)[0].offsetHeight/-2  + "px";
		w(ele).css("marginTop",heigh);

	};
	//图库弹层
	Walnut.imgPopups = function(ele,box,bg){
		if(!ele) var ele = ".pic_module";
		if(!box) var box = ".img_preview";
		w(ele).show();
		w(".walnut_masking").show();


		w(ele).find(".walnut_li").find(".active").removeClass('active');
		w(ele).on('mouseover','.walnut_li',function(){
			w(this).find('.img_bottom').show().parents(".walnut_li").siblings().find(".img_bottom").hide();
			w(".walnut_li").find(".active").parents(".img_bottom").show();
		})
		w(ele).on('mouseout','.walnut_li',function(){
			w(this).find(".select_imgwrap").hasClass("active") ? w(this).find(".img_bottom").show() : $(this).find(".img_bottom").hide();
		})
		w(ele).on('click',function(e){
			var target= e .target || e .srcElement;
			if(w(target).parents(".walnut_li").length > 0 || w(target).hasClass("walnut_li")){
				if(w(target).hasClass('remove_imgwrap')){
					w(target).parents(".pic_module").find(".own_content").find(".walnut_li").length > 0 ? w(target).parents(".pic_module").find(".normal_guide").hide() : w(target).parents(".pic_module").find(".normal_guide").show();
					w.stopPropagate(e);
				}else if(w(target).hasClass('walnut_li')){
					w(".img_bottom").hide();
					w(".pic_m_body").find(".active").removeClass("active");
					w(target).find(".select_imgwrap").addClass("active");
					w(target).find('.img_bottom').show();
				}else{
					w(".img_bottom").hide();
					w(".pic_m_body").find(".active").removeClass("active");
					w(target).parents(".walnut_li").find(".select_imgwrap").addClass("active");
					w(target).parents(".walnut_li").find('.img_bottom').show();
				}
			}
		})
		w(ele).find(".walnut_save").each(function(){
			this.onclick = function(){
				var _this = this;
				var act = w(_this).parents(".walnut_popup").find(".walnut_page").find(".active");
				var bg_src = "";
				if(act.length == 1){
					bg_src = act.parents('.walnut_li').find('img')[0].src;
					w(box)[0].src = bg_src;
					w(box)[0].setAttribute("data-src",bg_src);
					w(bg).css({"background":"url("+bg_src+")","background-size":"100% 100%"});
					w.shut();
				}else{
					w.lucencyAlert("请选择邀请框图案");
				}
			}
		})
	};
	//弹层关闭
	Walnut.shut = function(){
		w(".walnut_masking").hide();
		w(".walnut_popup").hide();
	};

	//多级列表
	Walnut.multiSelect = function(obj){
		function outerAdd(upper_dd){
			//递归判断上层分组是否全选
			if(upper_dd.tagName.toLowerCase()==='dd') {
				var upper_dt = upper_dd.parentNode.children[0];
				var is_check = true;
				var next = w(upper_dt).next()[0];
				while(next){
					var sibling_dt = next.children[0].children[0];
					aa = next
					if (!w(sibling_dt).hasClass('icon-CheckboxSeleted')) {
						is_check = false;
						break;
					}
					next = w(next).next()[0];
				}
				if (is_check){
					w(upper_dt).addClass('icon-CheckboxSeleted');
					outerAdd(upper_dd.parentNode.parentNode)
				}
			}
		}
		function outerRemove(upper_dd){
			while(upper_dd.tagName.toLowerCase()==='dd') {
				var upper_dt = upper_dd.parentNode.children[0];
				w(upper_dt).removeClass('icon-CheckboxSeleted');
				upper_dd = upper_dd.parentNode.parentNode;
			}
		}
		function innerChange(dd,is_check){
			while(dd){
				if (w(dd).hasClass('check_group')) {
					var arr = dd.querySelectorAll('.check_btn');
					for (var i = arr.length - 1; i >= 0; i--) {
						if (is_check) {
							w(arr[i]).addClass('icon-CheckboxSeleted');
						}else{
							w(arr[i]).removeClass('icon-CheckboxSeleted');
						}
					}
				}else{
					if (is_check) {
						w(dd).addClass('icon-CheckboxSeleted');
					}else{
						w(dd).removeClass('icon-CheckboxSeleted');
					}
				}
				dd = w(dd).next()[0];
			}
		}
		var _obj = w(obj);
		if (obj.tagName.toLowerCase()==='dt') {
			if (_obj.hasClass('icon-CheckboxSeleted')) {
				innerChange(_obj.next()[0],true);//向下全部选中
				outerAdd(obj.parentNode.parentNode);//向上判断
			}else{
				innerChange(_obj.next()[0],false);//向下全部取消
				outerRemove(obj.parentNode.parentNode)//向上分组取消全选
			}
		}else{
			var first_dt = obj.parentNode.children[0];
			if (_obj.hasClass('icon-CheckboxSeleted')) {
				var is_check = true;
				var next = w(first_dt).next()[0];
				while(next){
					if (!w(next).hasClass('icon-CheckboxSeleted')) {
						is_check = false;
						break;
					}
					next = w(next).next()[0];
				}
				if (is_check) {
					w(first_dt).addClass('icon-CheckboxSeleted');
					outerAdd(obj.parentNode.parentNode);//向上判断
				}else{
					w(first_dt).removeClass('icon-CheckboxSeleted');
				}
			}else{
				w(first_dt).removeClass('icon-CheckboxSeleted');
				outerRemove(obj.parentNode.parentNode);//向上分组取消全选
			}
		}
	};
	//复制到粘贴板
	Walnut.copyTag = function(obj){
		w(obj).next()[0].select();
		document.execCommand("Copy"); // 执行浏览器复制命令
		w.lucencyAlert("已复制好，可贴粘")
	};


	Walnut.v = "1.0.0";
	Walnut.alert_flag = true;
	Walnut.device = Walnut.device();
	Walnut.screendeg = Walnut.screenRotate();


	//方法事件绑定
	w(function(){
		w(".walnut_reset").on("click",function(){
			w.shut();
		})
		w(".walnut_close").on("click",function(){
			w.shut();
		})
		w(".walnut_pic_style").on("click",function(){
			w.singleSelect(this,"active");
			var index = w(this).index();
			w(this).parents(".walnut_popup").find(".walnut_page").eq(index).show().siblings().hide();
			if(index == 1){
				var mod = w(this).parents(".pic_module");
				mod.find(".own_content").find(".walnut_li").length > 0 ? mod.find(".normal_guide").hide() : mod.find(".normal_guide").show();
			}
		})
		//单选
		w(".radio_btn").on("click",function(){
			w.singleSelect(this,"icon-RadioSelected")
		})
		//开关
		w(".main_switch").on("click",function(){
			w.switchBtn(this,"is_off")
		})
		//选项卡
		w(".tab_event").on("click",function(){
			w.singleSelect(this)
		})
		// 下拉菜单
		w(".select_box").on("click",".select_arrow",function(e){
			w.stopPropagate(e);
			$(".select_arrow").not(this).parent(".select_box").find(".select_list").hide();
			w(this).parent().find(".select_list").css("display") == "none" ? w(this).parent().find(".select_list").slideDown(200) : w(this).parent().find(".select_list").slideUp(200);
		})
		//下拉菜单-扩展
		w(".select_extend").on('click',function(e){
			w.stopPropagate(e);
			var speed = ~~this.getAttribute('slide_speed');
			w(".select_list").hide();
			w(".select_extend").not(this).find('.select_content').hide();
			w(this).find('.select_content').slideToggle(speed);
		})
		//点击空白区域触发
		w(document).on("click",function(e){
			w(".select_list").hide();
			w(".select_content").hide();
			w(".time_select_box").hide();
		})
	});
	// 头部标题栏滚动字幕
	Walnut.headerRoll = function(speed,pause,res){
		// speed->滚动速度;pause->停顿时间;res->json数组;
		var html='';
		var ele=document.getElementById('header_roll_box');
		var ress=eval("(" + res + ")");
		w.each(ress,function(i,item){
			html+='<p><a>'+item.account+'</a><span> 开通了'+item.meal_name+'</span></p>';
		})
		w('#header_roll_box').html(html+html);
		var t;  
		var p = false;
		var top=ele.offsetTop;
		ele.onmouseover = function() {  
			p = true;  
		}  
		ele.onmouseout = function() {  
			p = false;  
		}  
		function roll_start() {  
			t = setInterval(scrolling,speed);  
		} 
		function scrolling() {
			if(!p){
				top--;
				ele.style.top= top+'px';
				if(top%28==0){
					if(ele.offsetTop <= -(ele.offsetHeight/2)){
						top=0;
						ele.style.top= '0px';
					}
					clearInterval(t);
					setTimeout(roll_start,pause);
				} 
			}  
		}  
		setTimeout(roll_start,pause);
	}

	// time-picker (hour & minute)
	Walnut.timePicker = function(ele){
		var _elem = w(ele);
		if (!_elem.length) return;
		var hours_html = "";
		var mins_html = "";
		var o = "";
		for(var i = 0; i < 24 ; i++){
			o = i;
			if( i <= 9 ) i = '0'+i;
			hours_html += '<li data-num='+o+'>'+i+'</li>';
		}
		for(var j = 0; j < 60 ; j++){
			o = j;
			if( j <= 9 ) j = '0'+j;
			mins_html += '<li data-num='+o+'>'+j+'</li>';
		}
		_elem.find('.time_hours').html(hours_html);
		_elem.find('.time_mins').html(mins_html);

		// 时间选择
		w(".time_select").on("click","input",function(e){
			w.stopPropagate(e);
			var sele_box = w(this).parent().find(".time_select_box");
			w(".time_select_box").not(sele_box[0]).slideUp(200);
			sele_box.slideToggle();
			// 置入时间
			var d = new Date();
			var hour,min,new_hour,new_min;
			if(this.value == ""){
				hour = parseInt(d.getHours());
				min = parseInt(d.getMinutes());
			}else{
				hour = parseInt(this.value.substring(0,2));
				min = parseInt(this.value.substring(3));
			}
			new_hour = w(this).parents(".set_time").find(".time_hours").find('li').eq(hour)[0];
			new_min = w(this).parents(".set_time").find(".time_mins").find('li').eq(min)[0];
			w(this).parents(".set_time").find(".time_hours").scrollTop(hour * 24 +1,200);
			w(this).parents(".set_time").find(".time_mins").scrollTop(min * 24 +1,200);
			w.singleSelect(new_hour);
			w.singleSelect(new_min);
		})
		w(".time_select").on("click","li",function(e){
			w.stopPropagate(e);
			var _this = this;
			var t = "";
			var inp = w(_this).parents(".set_time").find("input")[0];
			var oul = _this.parentNode;
			var new_t = inp.value,hour,min;
			w.singleSelect(this);
			var scroll_t = _this.getAttribute("data-num") * 24 +1;
			w(_this).parent().scrollTop(scroll_t,200);
			var h = w(this).parents(".time_select_box").find(".time_hours").find(".active").html();
			var m = w(this).parents(".time_select_box").find(".time_mins").find(".active").html();
			t = h+ ':' +m;
			inp.value = t;
		})
	}

	// 插件-拖动排序
	Walnut.fn.tjgSortable = function(opts){
		var options={
			target:'li',		//被拖动的元素--默认为下一级<li>标签;
			touchElem:false,	//触发拖动元素--可设置为target的子元素;
			active:true,		//是否激活拖动功能;
			filter:'',			//不触发拖动元素;
			callback:false		//拖放完成执行回调;
		};
		for(var o in options){
			if (opts&&opts[o]!==undefined) {
				options[o] = opts[o];
			}
		}
		this.activate = function(){
			options.active = true;
		}
		this.disable = function(){
			options.active = false;
		}
		var me = this;
		this.each(function(){
			var upElem = this;
			upElem.onselectstart = function(){
				if (options.active===true) return false;
			}
			var touchElem = options.touchElem ? options.touchElem : options.target;
			w(upElem).on('mousedown',touchElem,function(e){
				var e = e || window.event;
				var pageX = e.pageX || e.clientX;
				var pageY = e.pageY || e.clientY;
				var targetElem = e.srcElement ? w(e.srcElement) : w(e.target);
				if (options.active !== true || e.button === 2 || options.filter&&targetElem.hasClass(options.filter)) return;
				var onto_this = options.touchElem ? w(this).parents(options.target) : w(this);
				var oldIndex = onto_this.index(),
					temp = onto_this.clone(true),
					myLeft =  onto_this[0].offsetLeft,
					myTop =  onto_this[0].offsetTop - upElem.scrollTop,
					XXX = pageX - myLeft,
					YYY = pageY - myTop,
					up_width = upElem.offsetWidth,
					up_height = upElem.offsetHeight,
					width = onto_this[0].offsetWidth,
					height = onto_this[0].offsetHeight;
				temp.addClass("temp_moving");
				w(upElem).append(temp[0]);
				temp.css({'position':"absolute",'top':myTop+"px",'left':myLeft+"px",'width':width+"px",'zIndex':"999"});
				onto_this.addClass("dropping_item");
				if (window.getSelection) {
					window.getSelection().removeAllRanges();
				}
				w(document).on("mousemove.dragSort",function(e){
					var e = e || window.event;
					var pageX = e.pageX || e.clientX;
					var pageY = e.pageY || e.clientY;
					temp.css({'left':pageX-XXX+"px",'top':pageY-YYY+"px"});
					var cursorX = pageX-XXX+width/2;
					var cursorY = pageY-YYY+height/2;
					var x_out = cursorX - upElem.offsetLeft;
					var y_out = cursorY - upElem.offsetTop;
					if (x_out<0 || x_out>up_width || y_out<0 || y_out>up_height) return;
					if (y_out <= height/2) upElem.scrollTop -= height/5;
					if (y_out >= up_height-height/2) upElem.scrollTop += height/5;
					w(upElem).find(options.target).each(function(idx){
						if (!w(this).hasClass('temp_moving')) {
							var top = this.offsetTop - upElem.scrollTop;
							var left = this.offsetLeft;
							if (cursorX>left && cursorX<left+width && cursorY>top+height/5 && cursorY<top+height*4/5) {
								if (onto_this.index()<idx) {
									var p = onto_this[0].parentNode;
									p.insertBefore(onto_this[0],this.nextSibling);
									return false;
								}else if (onto_this.index()>idx){
									var p = onto_this[0].parentNode;
									p.insertBefore(onto_this[0],this);
									return false;
								}
							}
						}
					})
				})
				w(document).on("mouseup.dragSort",function(){
					me.disable();
					w(document).off('dragSort');
					temp.animate({"left":onto_this[0].offsetLeft+"px","top":onto_this[0].offsetTop-upElem.scrollTop+"px"},200,function(){
						w(this).remove();
						onto_this.removeClass('dropping_item');
						var newIndex = onto_this.index();
						var is_change = newIndex==oldIndex? false : true;
						me.activate();
						if (options.callback) options.callback.call(onto_this,is_change,newIndex,oldIndex);
						onto_this = null;
					});
				});
			})
		})
		return this;
	}
	// 插件-日期选择器
	Walnut.datePicker = function(opts){
		var id = opts.id,
			value = opts.value,
			format = opts.format || "YYYY-MM-DD",
			menu_btn = opts.menu_btn || [],
			minDate = opts.minDate || "1900-01-01",
			maxDate = opts.maxDate || "2099-12-31",
			callback = opts.callback;
		if (!/^(yyyy(-mm(-dd)?)?(\shh(:mm(:ss)?)?)?)(\s\1)?$/i.test(format)) {
			console.error('format error このばか');
			return;
		}
		var dateElem = w('#'+id);
		if (!dateElem.length) return;

		var m_days = [31,28,31,30,31,30,31,31,30,31,30,31],
			date_select, date_show, is_double, date_range_start, time_start, time_end, timer, lengths, minTime, maxTime;
		initDate();
		function initDate(opts_new){
			var reset = false;
			if (opts_new) {
				if (!/^(yyyy(-mm(-dd)?)?(\shh(:mm(:ss)?)?)?)(\s\1)?$/i.test(opts_new.format)) {
					return;
				}
				reset = true;
				value = opts_new.value || 'today';
				format = opts_new.format;
				if (opts_new.minDate) minDate = opts_new.minDate;
				if (opts_new.maxDate) maxDate = opts_new.maxDate;
				if (opts_new.callback) callback = opts_new.callback;
			}
			var now = new Date(),
				today = [now.getFullYear(),now.getMonth(),now.getDate()],
				today_str = today[0]+'-'+fillString(today[1]+1,2)+'-'+fillString(today[2],2);
			date_select = [];
			date_show = [];
			is_double = /^yyyy.*yyyy/i.test(format) ? 1 : 0;
			date_range_start = '';
			timer = /hh/i.test(format) ? format.replace(/\shh(:mm(:ss)?)?/g,'') : 0;
			time_start = '00:00:00';
			time_end = '23:59:59';
			lengths = (timer||format).match(/[ymd]+/gi).length;
			minDate = fillDateDay(minDate.replace(/today/gi,today_str), lengths*3/(is_double+1)+1);
			maxDate = fillDateDay(maxDate.replace(/today/gi,today_str), lengths*3/(is_double+1)+1);
			minTime = new Date(minDate.split('-').join('/')).getTime();
			maxTime = new Date(maxDate.split('-').join('/')).getTime();
			if (minTime>maxTime) maxTime = minTime = 0;
			if(opts_new) {
				initTimer();
			}else{
				initHtml();
			}
			setDateValue(value,reset);
			var val = value ? getDateString(date_select) : '';
			dateElem[0].firstChild.value = val;
			if (opts_new&&callback) callback(val, 'reset');
		}
		function initHtml(){
			var css_double = is_double ? ' wt_calendar_double' : '',
				is_small = opts.small_size ? ' wt_calendar_small' : '';
			var date_html = '<input type="text" class="wt_calendar_input"><i class="iconfont icon-Date" style="position:absolute;top:2px;bottom:2px;right:1px;font-size:25px;line-height:24px;background:#fff;"></i>';
			date_html += '<div class="wt_calendar_content hidden'+css_double+is_small+'"><div class="wt_calendar_box">';
			date_html += '<div class="wt_calendar_top"><i class="fl wt_calendar_change_y wt_calendar_prev iconfont icon-zuiqian"></i><i class="fl wt_calendar_change_m wt_calendar_prev iconfont icon-xiangqian"></i><span class="wt_calendar_y"></span><span class="wt_calendar_m"></span><i class="fr wt_calendar_change_y wt_calendar_next iconfont icon-zuihou"></i><i class="fr wt_calendar_change_m wt_calendar_next iconfont icon-xianghou"></i></div><div class="wt_calendar_left"><table class="wt_calendar_table"><thead><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead><tbody></tbody></table><ul class="wt_calendar_ul_y_m"></ul><div class="wt_calendar_timer hidden timer_start"></div></div></div>';
			if (is_double) {
				date_html += '<div class="wt_calendar_box"><div class="wt_calendar_top"><i class="fl wt_calendar_change_y wt_calendar_prev iconfont icon-zuiqian"></i><i class="fl wt_calendar_change_m wt_calendar_prev iconfont icon-xiangqian"></i><span class="wt_calendar_y"></span><span class="wt_calendar_m"></span><i class="fr wt_calendar_change_y wt_calendar_next iconfont icon-zuihou"></i><i class="fr wt_calendar_change_m wt_calendar_next iconfont icon-xianghou"></i></div><div class="wt_calendar_right"><table class="wt_calendar_table"><thead><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead><tbody></tbody></table><ul class="wt_calendar_ul_y_m"></ul><div class="wt_calendar_timer hidden timer_end"></div></div></div>';
			}
			var words = {clear:'清除',today:'现在',confirm:'确认'};
			date_html += '<div class="wt_calendar_bottom clearfix"><div class="fr btn_chain">';
			for(var i=0;i<menu_btn.length;i++){
				// if (!is_double && menu_btn[i]=='confirm') continue;
				if (words[menu_btn[i]]) date_html += '<span class="gray_btn wt_calendar_'+menu_btn[i]+'">'+words[menu_btn[i]]+'</span>';
			}
			date_html += '</div></div></div>';
			dateElem.html(date_html);
			if (timer) {
				initTimer();
			}else if (!dateElem.find('.gray_btn').length) {
				dateElem.find('.wt_calendar_bottom').remove();
			}
		}
		function is_leap(year) {  //判断是否为闰年
			return (year%100==0?res=(year%400==0?1:0):res=(year%4==0?1:0));
		}
		function fillString(num, length) {
			return (Array(length).join('0') + num).slice(-length);
		}
		function fillDateDay(str, maxLen) {
			var pattern = 'yyyy-01-01';
			for(var i=0; i<10; i++){
				if (!str[i]) str += pattern[i];
			}
			if (maxLen) str = str.substring(0,maxLen);
			return str;
		}
		function setDateNow() {
			var now = new Date(),
				today = [now.getFullYear(),now.getMonth(),now.getDate()],
				idx = 0,i = 0;
			for( ; i<lengths; i++){
				if (is_double && i*2==lengths) idx = 0;
				date_select[i] = date_show[i] = today[idx];
				idx++;
			}
			if (timer) {
				if (is_double) {
					time_start = '00:00:00';
					time_end = fillString(now.getHours(),2)+':'+fillString(now.getMinutes(),2)+':'+fillString(now.getSeconds(),2);
				}else{
					time_start = fillString(now.getHours(),2)+':'+fillString(now.getMinutes(),2)+':'+fillString(now.getSeconds(),2);
				}
				var timer_len = format.split(' ')[3].length;
				time_start = time_start.substring(0,timer_len);
				time_end = time_end.substring(0,timer_len);
			}
		}
		function setDateValue(str,reset) {
			str = str.replace(' ~ ',' ');
			if (!/^(\d{4}(-\d{2}(-\d{2}(\s\d{2}(:\d{2}){0,2})?)?)?)(\s\d{4}(-\d{2}(-\d{2}(\s\d{2}(:\d{2}){0,2})?)?)?)?$/i.test(str) || str.length!==format.length) {
				if (!reset || value=='today') {
					return setDateNow();
				}else{
					setDateNow();
					dateElem[0].firstChild.value = getDateString(date_select);
					return;
				}
			}
			if (timer) {
				var timeArr = str.split(' ');
				time_start = timeArr[1];
				str = timeArr[0];
				if (is_double) {
					str += ' '+timeArr[2];
					time_end = timeArr[3];
				}
			}
			if (minTime||maxTime) {
				var dd = str.split(' ');
				var d1 = dd[0].split('-').join('/');
				str = minTime>new Date(d1).getTime() ? minDate : maxTime<new Date(d1).getTime() ? maxDate : d1;
				if (is_double) {
					var d2 = dd[1].split('-').join('/');
					str += ' ';
					str += minTime>new Date(d2).getTime() ? minDate : maxTime<new Date(d2).getTime() ? maxDate : d2;
				}
			}
			var arr = str.match(/\d{4}|\d{2}/g).map(Number);
			if (is_double && lengths>2) {
				arr[1] = arr[1] ? arr[1]-1 : 0;
				arr[lengths/2+1] = arr[lengths/2+1] ? arr[lengths/2+1]-1 : 0;
			}else if (!is_double && lengths>1){
				arr[1] = arr[1] ? arr[1]-1 : 0;
			}
			for(var i=0; i<lengths; i++){
				date_select[i] = date_show[i] = arr[i];
			}
		}
		function getDateString(arr,no_time) {
			var str = '';
			var has_m = is_double&&lengths>2||!is_double&&lengths>1 ? true : false;
			if (is_double) {
				for(var i=0; i<arr.length; i++){
					var d = has_m && (i==1||i==(lengths/2+1)) ? arr[i]+1 : arr[i];
					str += d<10 ? '0'+d : d;
					if (i==lengths/2-1) {
						if (timer&&!no_time) str += ' '+time_start;
						str += ' ~ ';
					}else if(i!==lengths-1){
						str += '-';
					}else{
						if (timer&&!no_time) str += ' '+time_end;
					}
				}
			}else{
				for(var i=0; i<arr.length; i++){
					var d = has_m&&i==1 ? arr[i]+1 : arr[i];
					str += d<10 ? '0'+d : d;
					if(i!==lengths-1){
						str += '-';
					}else if (timer&&!no_time) {
						str += ' '+time_start;
					}
				}
			}
			return str;
		}
		function set_y_m_d(first,is_right,idx_y) {
			var next_idx = ((is_right+1)%2)*lengths/2;
			var next_box = [date_show[next_idx], date_show[next_idx+1]];
			if (is_double) {
				var left_right = idx_y ? -1 : 1;
				if (date_show[0]>=date_show[lengths/2]){
					date_show[next_idx] = date_show[idx_y];
					if (date_show[1]>=date_show[lengths/2+1]) {
						date_show[next_idx+1] = date_show[1+idx_y] + left_right;
						if (date_show[next_idx+1] > 11) {
							date_show[lengths/2] += 1;
							date_show[lengths/2+1] = 0;
						}
						if (date_show[next_idx+1] < 0) {
							date_show[0] -= 1;
							date_show[1] = 11;
						}
						date_range_start = '';
					}
				}
				dateElem.find('.wt_calendar_y')[0].innerHTML = date_show[0]+"年";
				dateElem.find('.wt_calendar_m')[0].innerHTML = date_show[1]+1+"月";
				dateElem.find('.wt_calendar_y')[1].innerHTML = date_show[lengths/2]+"年";
				dateElem.find('.wt_calendar_m')[1].innerHTML = date_show[lengths/2+1]+1+"月";

				if (lengths < 6) {
					if (date_select[lengths/2-1]==date_select[lengths-1]) date_show[lengths-1] = date_show[lengths/2-1];
					dateElem.find('.wt_calendar_m').hide();
					dateElem.find('.wt_calendar_change_m').hide();
					var type_y_m = lengths==2 ? 'y' : 'm';
					show_year_month(0,type_y_m);
					show_year_month(1,type_y_m);
					return;
				}
				dateElem.find('.wt_calendar_ul_y_m').removeClass('appear');
				dateElem.find('.wt_calendar_m').show();
				calendar(date_show[idx_y],date_show[1+idx_y] ,is_right);
				// 相邻的面板跟随变动
				if (first || date_show[next_idx]!==next_box[0] || date_show[next_idx+1]!==next_box[1]) {
					calendar(date_show[next_idx],date_show[next_idx+1] ,(is_right+1)%2);
				}
				if(!date_range_start) updateRangeDate();
				dateElem.find('.iconfont').show();
			}else{
				dateElem.find('.wt_calendar_y')[0].innerHTML = date_show[0]+"年";
				dateElem.find('.wt_calendar_m')[0].innerHTML = date_show[1]+1+"月";
				if (lengths===3){
					dateElem.find('.wt_calendar_ul_y_m').removeClass('appear');
					dateElem.find('.wt_calendar_m').show();
					calendar(date_show[0], date_show[1]);
				}else{
					dateElem.find('.wt_calendar_m').hide();
					dateElem.find('.wt_calendar_change_m').hide();
					var type_y_m = lengths==1 ? 'y' : 'm';
					show_year_month(0,type_y_m);
				}
			}
		}
		function show_year_month(is_right,type_y_m){
			var ul = dateElem.find('.wt_calendar_ul_y_m').eq(is_right);
			var idx_y = is_right*lengths/2;
			ul.addClass('appear');
			var li_html = '';
			if (type_y_m=='y') {
				var is_last = is_double&&lengths===2||lengths===1;
				var y = ~~(date_show[idx_y]/12)*12;
				for(var i=0; i<12; i++){
					var walnut_date = i+y;
					var li_disabled = is_last&&is_disabled(walnut_date+'') ? ' li_disabled' : '';
					if (i+y == date_select[idx_y]) {
						li_html += '<li><span class="wt_calendar_li li_on" walnut_date="'+walnut_date+'">'+walnut_date+'</span></li>';
					}else{
						li_html += '<li><span class="wt_calendar_li'+li_disabled+'" walnut_date="'+walnut_date+'">'+walnut_date+'</span></li>';
					}
				}
				dateElem.find('.wt_calendar_y')[is_right].innerHTML = y+'年'+' ~ '+(y+11)+'年';
			}else {
				var is_last = is_double&&lengths===4||!is_double&&lengths===2;
				for(var i=0; i<12; i++){
					var m = i<9 ? '0'+(i+1) : (i+1);
					var walnut_date = date_show[idx_y] + '-' + m;
					var li_disabled = is_last&&is_disabled(date_show[idx_y]+'/'+m) ? ' li_disabled' : '';
					if (i == date_show[1+idx_y] && date_select[idx_y] == date_show[idx_y]) {
						li_html += '<li><span class="wt_calendar_li li_on" walnut_date="'+walnut_date+'">'+(i+1)+'月</span></li>';
					}else{
						li_html += '<li><span class="wt_calendar_li'+li_disabled+'" walnut_date="'+walnut_date+'">'+(i+1)+'月</span></li>';
					}
				}
			}
			ul[0].innerHTML = li_html;
		}
		function calc_year_month(y_m,obj){
			var w_obj = w(obj);
			if (w_obj.hasClass('li_disabled')) return;
			var li_on = dateElem.find('.li_on');
			if (is_double) {
				if (li_on.length === 1 && date_range_start) {
					var date_end = obj.getAttribute('walnut_date');
					if (y_m=='y') {
						if (date_range_start>date_end) {
							date_select = [date_end,date_range_start];
						}else{
							date_select = [date_range_start,date_end];
						}
					}else{
						var m_start = date_range_start.split('-').map(Number);
						var m_end = date_end.split('-').map(Number);
						if (m_start[0]>m_end[0] || m_start[0]==m_end[0]&&m_start[1]>m_end[1]) {
							date_select = m_end.concat(m_start);
						}else{
							date_select = m_start.concat(m_end);
						}
						date_select[1] -= 1;
						date_select[3] -= 1;
					}
					if (dateElem.find('.wt_calendar_confirm').length) {
						w_obj.addClass('li_on');
					}else{
						set_value(getDateString(date_select));
					}
					date_range_start = '';
				}else{
					li_on.removeClass('li_on');
					w_obj.addClass('li_on');
					date_range_start = obj.getAttribute('walnut_date');
				}
			}else{
				date_select[0] = date_show[0];
				if (y_m=='m') {
					date_select[1] = date_show[1];
				}
				if (dateElem.find('.wt_calendar_confirm').length){
					li_on.removeClass('li_on');
					w_obj.addClass('li_on');
				}else{
					set_value(getDateString(date_select));
				}
			}
		}
		function calcPosition(){
			var daterBox = dateElem.find('.wt_calendar_content');
			var input_wid = dateElem[0].clientWidth;
			var input_hei = dateElem[0].clientHeight;
			var win_wid = Math.min(document.documentElement.clientWidth, document.body.clientWidth);
			var win_hei = Math.min(document.documentElement.clientHeight, document.body.clientHeight);
			var con_wid = parseInt(daterBox.css('width'));
			var con_hei = parseInt(daterBox.find('.wt_calendar_left').css('height'));
			con_hei += dateElem.find('.wt_calendar_bottom').length ? 90 : 40;
			var offsetXY = dateElem.offset();
			var pageYOffset = window.pageYOffset||document.documentElement.scrollTop;
			// console.log(input_wid,'--input_wid',input_hei,'--input_hei')
			// console.log(win_wid,'--win_wid',win_hei,'--win_hei')
			// console.log(con_wid,'--con_wid',con_hei,'--con_hei')
			// console.log(offsetXY,'--offsetXY')
			// console.log(pageYOffset,'--pageYOffset')

			var cssLeft = offsetXY.left+con_wid+2-win_wid;
			var cssTop = offsetXY.top-pageYOffset+con_hei-win_hei+input_hei;
			if (cssLeft>0) {
				daterBox.addClass('show_left');
			}else{
				daterBox.removeClass('show_left');
			}
			if (cssTop>0 && offsetXY.top-pageYOffset>con_hei) {
				daterBox.addClass('show_above');
			}else{
				daterBox.removeClass('show_above');
			}
		}
		function calc_prev_date(month,fc_week){
			month = month<0 ? 11 : month;
			var month_days = m_days[month];
			return month_days-fc_week+1;
		}
		function is_disabled(str){
			var time = new Date(str).getTime();
			return time<minTime || time > maxTime;
		}
		function updateRangeDate(){
			var a = getDateString(date_select).replace(/\s\d{2}(:\d{2}){0,2}(?!\d)/g,'').split(' ~ ');
			var t1 = new Date(a[0].split('-').join('/'));
			var t2 = new Date(a[1].split('-').join('/'));
			dateElem.find(".wt_calendar_box").find('.wt_calendar_day').each(function(){
				var str = this.getAttribute('walnut_date').split('-').join('/');
				var time = new Date(str);
				if (time>=t1 && time<=t2) {
					w(this).addClass('day_in_range');
				}
			})
		}
		function calendar(year,month,is_right_idx){
			var fc_day = new Date(year,month,1);// 当月第一天
			var fc_week = fc_day.getDay();// 第一天星期几
			m_days[1] = 28+is_leap(year);// 每个月的天数
			var idx,date_num;
			var days_html = '';

			var prev_y = year,
				prev_m = month-1,
				next_y = year,
				next_m = month+1;
			if (prev_m<0) {
				prev_y -= 1;
				prev_m = 11;
			}else if(next_m==12){
				next_y += 1;
				next_m = 0;
			}
			var first_day = calc_prev_date(month-1,fc_week);
			for(var i=0; i<6; i++) { // 表格的行
				days_html += '<tr>';
				for(var k=0; k<7; k++) { // 表格每行的单元格
					idx = i*7 + k; // 单元格自然序列号
					date_num = idx - fc_week + 1; // 计算日期

					var css_day_fill = '',
						css_day_disabled = '',
						css_day_on = '',
						date_td = '',
						date_str = getDateString(date_select,'no_time');
					if (i==0 && k<fc_week) {
						date_num = first_day+k;
						css_day_fill = ' wt_calendar_fill_prev';
						var date_td = prev_y+'-'+fillString(prev_m+1,2)+'-'+fillString(date_num,2);
						if (is_right_idx!==undefined) date_str = date_str.split(' ~ ')[is_right_idx];
						if (date_td == date_str) {
							css_day_fill += ' day_pre_on';
						}
					}else if (date_num > m_days[month]) {
						date_num -= m_days[month];
						css_day_fill = ' wt_calendar_fill_next';
						var date_td = next_y+'-'+fillString(next_m+1,2)+'-'+fillString(date_num,2);
						if (is_right_idx!==undefined) date_str = date_str.split(' ~ ')[is_right_idx];
						if (date_td == date_str) {
							css_day_fill += ' day_pre_on';
						}
					}else{
						var date_td = year+'-'+fillString(month+1,2)+'-'+fillString(date_num,2);
						var date_str2 = '';
						if (is_right_idx!==undefined){
							var arr = date_str.split(' ~ ');
							date_str = arr[0];
							date_str2 = arr[1];
						}
						if (date_td == date_str || date_str2&&date_str2==date_td) {
							css_day_fill += ' day_on';
						}
					}
					var now_date = date_td.split('-').join('/');
					css_day_disabled = is_disabled(now_date) ? ' day_diabled' : '';

					days_html += '<td class="wt_calendar_day'+css_day_fill+css_day_on+css_day_disabled+'" walnut_date="'+date_td+'">' + date_num + '</td>'
				}
				days_html += '</tr>';
			}
			dateElem.find('tbody').eq(is_right_idx||0).html(days_html);
		}
		function set_value(val){
			dateElem[0].firstChild.value = val;
			toggleDatePicker();
			if (callback) callback(val);
		}
		function toggleDatePicker(is_show){
			var daterBox = dateElem.find('.wt_calendar_content');
			if (is_show) {
				w('.wt_calendar_content').not(daterBox[0]).hide().addClass('hidden');
				calcPosition();
				daterBox.show();
				setTimeout(function(){daterBox.removeClass('hidden');},17)
			}else{
				daterBox.addClass('hidden');
				toggleTimePicker();
				var t = w.device<=9 ? 0 : 300;
				setTimeout(function(){
					if (daterBox.hasClass('hidden')) daterBox.hide();
				},t);
			}
		}
		function toggleTimePicker(is_show){
			var daterBox = dateElem.find('.wt_calendar_content');
			var wt_timer = daterBox.find('.wt_calendar_timer');
			if (is_show) {
				wt_timer.show();
				daterBox.find('.btn_timer').addClass('alink');
				setTimeout(function(){wt_timer.removeClass('hidden');},17)
			}else{
				wt_timer.addClass('hidden');
				daterBox.find('.btn_timer').removeClass('alink');
				var t = w.device<=9 ? 0 : 300;
				setTimeout(function(){
					if (wt_timer.hasClass('hidden')) wt_timer.hide();
				},t);
			}
		}
		function checkRangeTime(){
			var arr1 = time_start.split(':');
			var arr2 = time_end.split(':');
			for(var i=0; i<arr1.length; i++){
				if (arr1[i] > arr2[i]) {
					var timer_len = format.split(' ')[3].length;
					time_start = '00:00:00'.substring(0,timer_len);
					break;
				}else if (arr1[i] < arr2[i]) {
					break;
				}
			}
		}
		function initTimer(){
			if (dateElem.find('.btn_timer').length){
				if (timer) {
					dateElem.find('.btn_timer').show();
				}else{
					dateElem.find('.btn_timer').hide();
				}
				return;
			}
			var timer_html = '<p><span>时</span><span>分</span><span>秒</span></p>';
			var timer_ul = '';
			for(var i=0; i<60; i++){
				timer_ul += '<li>'+fillString(i, 2)+'</li>';
				if (i==23) {
					timer_html += '<ul>'+timer_ul+'</ul>';
				}
				if (i==59) {
					timer_html += '<ul>'+timer_ul+'</ul><ul>'+timer_ul+'</ul>';
				}
			}
			dateElem.find('.wt_calendar_timer').each(function(idx){
				var top_h4 = is_double ? idx ? '<h4>结束时间</h4>' : '<h4>开始时间</h4>' : '<h4>选择时间</h4>';
				this.innerHTML = top_h4+timer_html;
			});
			dateElem.find('.wt_calendar_bottom').prepend('<em class="fl btn_timer">时间选择</em>');
			dateElem.find('.btn_timer').on('click',function(){
				if (w(this).hasClass('alink')) {
					toggleTimePicker();
				}else{
					var uls = dateElem.find('.wt_calendar_timer').find('ul');
					var start = time_start.split(':'), len = start.length;
					toggleTimePicker(1);
					dateElem.find('h4')[0].innerHTML = date_select[0]+'年 '+(date_select[1]+1)+'月 '+date_select[2]+'日';
  					uls.removeClass('wt_diabled').eq(len-1).next(true).addClass('wt_diabled');
					if (is_double) {
						dateElem.find('h4')[1].innerHTML = date_select[3]+'年 '+(date_select[4]+1)+'月 '+date_select[5]+'日';
						uls.eq(len+2).next(true).addClass('wt_diabled');
						var end = time_end.split(':');
					}
					for(var i=0; i<len; i++){
						var li = uls.eq(i).find('li').eq(+start[i]);
						li.addClass('active').siblings('.active').removeClass('active');
						li[0].parentNode.scrollTop = li[0].offsetTop-2*li[0].clientHeight;
						if (is_double) {
							var li2 = uls.eq(i+3).find('li').eq(+end[i]);
							li2.addClass('active').siblings('.active').removeClass('active');
							li2[0].parentNode.scrollTop = li2[0].offsetTop-2*li2[0].clientHeight;
						}
					}
				}
			})
			dateElem.find('.wt_calendar_timer').on('click','li',function(){
				var li = w(this),ul = li.parent();
				if (ul.hasClass('wt_diabled')) return;
				li.addClass('active').siblings('.active').removeClass('active');
				var height = this.clientHeight;
				var scroll = (Number(this.innerHTML)-2)*height;
				ul.scrollTop(scroll,200);
				var uls = dateElem.find('.wt_calendar_timer').find('.active');
				var arr1 = time_start.split(':'), len = arr1.length, arr2 = [];
				var is_one_day = date_select[2]==date_select[5]&&date_select[1]==date_select[4]&&date_select[0]==date_select[3];
				for(var i=0; i<len; i++){
					arr1[i] = uls[i].innerHTML;
					if(is_double){
						arr2[i] = uls[i+len].innerHTML;
						if (is_one_day) {
							var is_right = ul.parent().hasClass('timer_start') ? len : 0;
							if (arr1[i] > arr2[i]) {
								if (is_right) {
									arr2[i] = arr1[i];
								}else{
									arr1[i] = arr2[i];
								}
								var ul2 = uls.eq(i+is_right).parent(),num = Number(arr1[i]);
								ul2.find('li').eq(num).addClass('active').siblings('.active').removeClass('active');
								ul2.scrollTop((num-2)*height,200);
							}else if (arr1[i] < arr2[i]) {
								is_one_day = false;
							}
						}
					}
				}
				time_start = arr1.join(':');
				time_end = arr2.join(':');
			})
		}
		// 事件绑定
		dateElem.find('.wt_calendar_input').on('focus',function(){
			var daterBox = dateElem.find('.wt_calendar_content');
			if (daterBox.hasClass('hidden')) {
				setDateValue(this.value);
				set_y_m_d('first',0,0);
				toggleDatePicker(1);
			}
		}).on('keyup',function(event){
			var event = event || window.event;
			if (event.keyCode == 10 || event.keyCode == 13) {
				setDateValue(this.value);
				toggleDatePicker();
				this.value = getDateString(date_select);
				if (callback) callback(this.value);
				this.blur();
			}
		}).next().on('click',function(){
			var daterBox = dateElem.find('.wt_calendar_content');
			if (daterBox.hasClass('hidden')) {
				setDateValue(this.previousSibling.value);
				set_y_m_d('first',0,0);
				toggleDatePicker(1);
			}
		})
		dateElem.find('.wt_calendar_content').on('click','.wt_calendar_day',function(){
			var _this = w(this);
			if (_this.hasClass('day_diabled')) return;
			var day_on = dateElem.find('.day_on');
			if (is_double) {
				if (day_on.length==1 && date_range_start) {
					_this.addClass('day_on');
					var date_start = date_range_start.split('-');
					var d1 = date_start.join('/');
					var date_end = this.getAttribute('walnut_date').split('-');
					var d2 = date_end.join('/');
					var start = new Date(d1).getTime() > new Date(d2).getTime();
					if (start) {
						date_select = date_end.concat(date_start).map(Number);
					}else{
						date_select = date_start.concat(date_end).map(Number);
					}
					date_select[1] -= 1;
					date_select[4] -= 1;
					if (timer && date_select[2]==date_select[5]&&date_select[1]==date_select[4]&&date_select[0]==date_select[3]) {
						checkRangeTime();
					}
					if (dateElem.find('.wt_calendar_confirm').length) {
						updateRangeDate();
					}else{
						set_value(getDateString(date_select));
					}
					date_range_start = '';
				}else{
					dateElem.find('.day_on').removeClass('day_on');
					dateElem.find('.day_in_range').removeClass('day_in_range');
					_this.addClass('day_on');
					date_range_start = this.getAttribute('walnut_date');
				}
			}else{
				if(_this.hasClass('wt_calendar_fill_prev')){
					if (date_show[1]==0) {
						date_show[0] -= 1;
						date_show[1] = 11;
					}else{
						date_show[1] -= 1;
					}
				}else if(_this.hasClass('wt_calendar_fill_next')){
					if (date_show[1]==11) {
						date_show[0] += 1;
						date_show[1] = 0;
					}else{
						date_show[1] += 1;
					}
				}
				date_select[0] = date_show[0];
				date_select[1] = date_show[1];
				date_select[2] = this.innerHTML;
				if (dateElem.find('.wt_calendar_confirm').length) {
					dateElem.find('.day_on').removeClass('day_on');
					_this.addClass('day_on');
				}else{
					set_value(getDateString(date_select));
				}
			}
		})
		dateElem.find('.wt_calendar_content .iconfont').on('click',function(){
			var _this = w(this);
			var is_right = _this.parents('.wt_calendar_box').index();
			var idx_y = is_right*lengths/2;
			var step = _this.hasClass('wt_calendar_next') ? 1 : -1;
			var idx = _this.hasClass('wt_calendar_change_y') ? 0 : 1;
			date_show[idx+idx_y] += step;
			if (!is_double&&lengths>1||lengths>2) {
				if (date_show[1+idx_y]<0 || date_show[1+idx_y]>11){
					date_show[idx_y] += step;
					date_show[1+idx_y] = -date_show[1+idx_y]+step + 11;
				}
			}
			if (_this.siblings('.wt_calendar_m').css('display')=='none') {
				if (_this.siblings('.wt_calendar_y')[0].innerHTML.length>8) {
					date_show[idx_y] += step*11;
					show_year_month(is_right,'y');
				}else{
					_this.siblings('.wt_calendar_y')[0].innerHTML = date_show[idx_y]+"年";
					show_year_month(is_right,'m');
				}
			}else{
				set_y_m_d(0,is_right,idx_y);
			}
		})
		dateElem.find('.wt_calendar_top').find('span').on('click',function(){
			var wt_calendar_box = w(this).parents('.wt_calendar_box');
			var is_right = wt_calendar_box.index();
			wt_calendar_box.find('.wt_calendar_change_m').hide().siblings('.wt_calendar_m').hide();
			show_year_month(is_right,this.className.slice(-1));
		})
		dateElem.find('.wt_calendar_ul_y_m').on('click','.wt_calendar_li',function(){
			var is_right = w(this).parents('.wt_calendar_box').index();
			var idx_y = is_right*lengths/2;
			var y_m = this.innerHTML;
			if (y_m.length>3) {
				date_show[idx_y] = parseInt(y_m);
				if ((is_double&&lengths>2) || (!is_double&&lengths>1)) {
					show_year_month(is_right,'m');
					dateElem.find('.wt_calendar_y')[is_right].innerHTML = date_show[idx_y]+'年';
				}else{
					calc_year_month('y',this);
				}
			}else{
				date_show[1+idx_y] = parseInt(y_m)-1;
				if (lengths===3 || lengths===6) {
					w(this.parentNode.parentNode).removeClass('appear');
					dateElem.find('.wt_calendar_m').eq(is_right).show().siblings('.wt_calendar_change_m').show();
					set_y_m_d(0,is_right,idx_y);
				}else{
					calc_year_month('m',this);
				}
			}
		})
		dateElem.find('.wt_calendar_clear').on('click',function(){
			set_value('');
		})
		dateElem.find('.wt_calendar_today').on('click',function(){
			setDateNow();
			set_value(getDateString(date_select));
		})
		dateElem.find('.wt_calendar_confirm').on('click',function(){
			if (date_range_start) {
				if (timer) {
					checkRangeTime();
					set_value(date_range_start+' '+time_start+' ~ '+date_range_start+' '+time_end);
				}else{
					set_value(date_range_start+' ~ '+date_range_start)
				}
			}else{
				set_value(getDateString(date_select));
			}
		})
		dateElem.on('click',function(e){
			w.stopPropagate(e);
		})
		w(document).on('click',function(){
			toggleDatePicker();
		})
		// 提供给外部的方法
		return {
			hide: function(){
				toggleDatePicker();
			},
			getDate: function(){
				return getDateString(date_select);
			},
			reset: function(opts){
				initDate(opts);
			},
			log:function(str){
				if (typeof str == 'string') {
					return eval( str.replace(/[\.()]/g,'') );
				}
			}
		};
	}

	// IE8方法兼容
	if (!String.prototype.trim) {
		String.prototype.trim = function(){
			return this.replace(/(^\s*)|(\s*$)/g, "");
		}
	}
	if (!Array.prototype.map) {
		Array.prototype.map = function(callback, thisArg) {
			var T, A, k;
			if (this == null) {
				throw new TypeError(" this is null or not defined");
			}
			var O = Object(this);
			var len = O.length >>> 0;
			if (typeof callback !== "function") {
				throw new TypeError(callback + " is not a function");
			}
			if (thisArg) {
				T = thisArg;
			}
			A = new Array(len);
			k = 0;
			while(k < len) {
				var kValue, mappedValue;
				if (k in O) {
					kValue = O[ k ];
					mappedValue = callback.call(T, kValue, k, O);
					A[ k ] = mappedValue;
				}
				k++;
			}
			return A;
		};
	}
	// 判断浏览器是否支持某一个CSS3属性
	Walnut.supportCss3 = function(style) {
		var prefix = ['webkit', 'Moz', 'ms', 'o'],
		i,
		htmlStyle = document.documentElement.style,
		_toHumb = function (string) {
			return string.replace(/-(\w)/g, function ($0, $1) {
				return $1.toUpperCase();
			});
		},
		humpString = [_toHumb(style)];
		for (i in prefix){
			humpString.push(_toHumb(prefix[i] + '-' + style));
		}
		for (i in humpString){
			if (humpString[i] in htmlStyle) return true;
		}
		return false;
	}
	!function() {
		var lastTime = 0;
		var vendors = ['webkit', 'moz'];
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
		}
		if (!window.requestAnimationFrame){
			window.requestAnimationFrame = function(callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function() { callback(currTime + timeToCall); },
				  timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		}
		if (!window.cancelAnimationFrame){
			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
		}
	}();

})(window);
