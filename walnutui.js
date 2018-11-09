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
			var parent = Walnut(),
				elements = [];
			this.each(function(){
				elements.push(this.parentNode);
			})
			return w.makeWalnut.call(parent, elements ,'filter');
		},
		parents: function(selector){
			if (!selector) return this.parent();
			var p = this[0] ? this[0].parentNode : null;
			if (!p || p.nodeType===9) {
				return Walnut();
			}
			return w.isEqual(p,selector) ? Walnut(p) : Walnut(p).parents(selector);
		},
		find: function(selector){
			var finds = Walnut();
			if (!selector) return finds;
			var elements = [];
			this.each(function(){
				elements = Array.prototype.concat.apply(elements,this.querySelectorAll(selector));
			})
			return w.makeWalnut.call(finds, elements ,'filter');
		},
		siblings: function(selector){
			var elem = this[0];
			if (!elem) return Walnut();
			var siblings = Walnut(),
				idx = 0,
				n = elem.parentNode.firstChild;
			for ( ; n; n = n.nextSibling ) {
				if ( n.nodeType === 1 && n !== elem && n.nodeName.toLowerCase() !== 'script') {
					if (!selector || w.isEqual(n,selector)) {
						siblings[idx] = n;
						siblings.length = ++idx;
					}
				}
			}
			return siblings;
		},
		prev: function(until){
			// until为复数选择，可设置为num个数
			var prevs = Walnut();
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
			return w.makeWalnut.call(prevs, elements ,'filter');
		},
		next: function(until){
			var nexts = Walnut();
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
			return w.makeWalnut.call(nexts, elements ,'filter');
		},
		eq: function(n){
			return this[n] ? Walnut(this[n]) : Walnut();
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
					return w.getStyle(this[0],prop);
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
					return this[0].getAttribute(prop);
				}
			}else{
				this.each(function (){
					this.setAttribute(prop,value);
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
		html: function(str){
			if (!str){
				return this[0] ? this[0].innerHTML : undefined;
			}
			this.each(function(i){
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
		append:function(html){
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
		prepend:function(html){
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
				this.parentNode.removeChild(this);
			})
		},
		empty: function(){
			this.each(function(){
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
					Walnut.addEvent(this,type,fn,selector);
				}else{
					Walnut.addEvent(this,type,selector);
				}
			});
			return this;
		},
		off: function(type, fn){
			this.each(function(){
				if (!fn && fn_gather[type]) {
					for(var i in fn_gather[type]){
						Walnut.removeEvent(this, i, fn_gather[type][i]);
						delete fn_gather[type][i];
					}
				}else{
					Walnut.removeEvent(this, type, fn);
				}
			})
			return this;
		},
		animate: function(css, time ,callback){
			this.each(function(idx){
				var elem = this, css_begin = {};
				for(var i in css){
					var style = w.getStyle(this,i), num = parseFloat(style);
					if(!num&&num!==0) continue;
					css_begin[i] = {
						num: num,
						unit: style ? style.replace(/[-\d\.]*/g,'') : '',
						range: parseFloat(css[i]) - num
					};
				}
				console.log(css_begin,css)
				w.animateGo(elem,css,css_begin,time,callback);
			})
			return this;
		},
		scrollTop: function(to,speed){
			to = Number(to)>0 ? Number(to) : 0;
			this.each(function(){
				var _this = this;
				var temp = this.scrollTop;
				var diff = to - temp;
				if (diff){
					var num = diff*16/(speed||16);
					var timer = setInterval(function(){
						temp += num;
						if (temp>=to&&diff>0 || temp<=to&&diff<0) {
							_this.scrollTop = to;
							clearInterval(timer);
						}else{
							_this.scrollTop = temp;
						}
					},16)
				}
			})
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
			var _this = this;
			switch(selector.charAt(0)){
				case '#':
					this[0] = document.getElementById(selector.substring(1));
					this.length = 1;
					break;
				case '.':
					var elements = document.querySelectorAll(selector);
					return w.makeWalnut.call(_this, elements);
				default:
					var elements = document.getElementsByTagName(selector);
					return w.makeWalnut.call(_this, elements);
			}
			return this;
		}else if (typeof selector === "function") {
			Walnut.addEvent(window,'load',selector);
		}else if (selector.nodeType) {
			// if (!selector.walnut_mark) selector.walnut_mark = expando++;
			this[0] = selector;
			this.length = 1;
			return this;
		}
	};
	init.prototype = Walnut.fn;
	window.w = window.walnut = Walnut;

	// 生成Walnut实例
	Walnut.makeWalnut = function(arr,needfilter){
		var idx = 0;
		for(var i = 0 ,len = arr.length; i<len; i++){
			if (!needfilter || arr[i] && !w.contains(this, arr[i])) {
				this[idx] = arr[i];
				// if (!(arr[i].walnut_mark)) {
				// 	arr[i].walnut_mark = ++expando+'';
				// 	Walnut.cache[expando] = {};
				// }
				this.length = ++idx;
			}
		}
		return this;
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
	Walnut.each = function(obj,callback){
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
	// 存放私有方法
	var fn_gather = {};
	var expando = 0;
	Walnut.cache = {};
	var w_typeof = {};
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
				var type = name.slice(0,4);
				if (type=='fade') {
					ms = ms || 333;
					var cssData = {'opacity':this.style['opacity']};
					var cssGoto = {'opacity': do_show ? 1 : 0};
					if (do_show){
						this.style['opacity'] = '0';
						this.style.filter = 'alpha(opacity=0)';
					}else{
						this.style['opacity'] = '1';
						this.style.filter = 'alpha(opacity=100)';
					}
				}else{
					ms = ms || 222;
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
					var cssGoto = {
						'height': do_show ? w.getStyle(this,'height') : '0px',
						'margin-top': do_show ? w.getStyle(this,'margin-top') : '0px',
						'margin-bottom': do_show ? w.getStyle(this,'margin-bottom') : '0px',
						'padding-top': do_show ? w.getStyle(this,'padding-top') : '0px',
						'padding-bottom': do_show ? w.getStyle(this,'padding-bottom') : '0px'
					}
				}
				var css_begin = {};
				if (do_show && type=='slid') {
					this.style['height'] = '0px';
					for(var i in cssGoto){
						css_begin[i] = {
							num: 0,
							unit: 'px',
							range: parseFloat(cssGoto[i])
						};
					}
				}else{
					for(var i in cssGoto){
						var style = w.getStyle(this,i), num = parseFloat(style);
						if((!num && num!==0) || (!do_show&&num===0)) continue;
						var range_end = do_show ? 1 : 0;
						css_begin[i] = {
							num: num,
							unit: style ? style.replace(/[-\d\.]*/g,'') : '',
							range: range_end-num
						};
					}
				}
				w.animateGo(this,cssGoto,css_begin,ms,function(){
					for(var i in cssData){
						if (!do_show) this.style.display = "none";
						this.style[i] = cssData[i]||'';
					}
				})
			})
		};
	});
	/*function setCache(key,obj){
		var cacheData = w.cache[key];
		for(var i in obj){
			w.cache[key][i] = obj[i];
		}
	}
	function fetchCache(elem,arr){
		var cacheData = w.cache[elem.walnut_mark];
		for(var i=0; i<arr.length; i++){
			elem.style[arr[i]] = cacheData[arr[i]]||'';
		}
	}*/
	// 给元素添加事件
	Walnut.addEvent = function(obj,etype,fn,selector){
		var type = etype.split('.');
		var func = selector ? function(event){
			var elem = event.srcElement ? event.srcElement : event.target;
			var pElem = w(elem).parents(selector);
			if (Walnut.isEqual(elem,selector)){
				fn.call(elem, event);
			}else if (pElem.length && Walnut.contains(obj.querySelectorAll(selector),pElem[0])) {
				fn.call(pElem[0], event);
			}
		} : function(event){
			fn.call(obj,event);
		};
		if (type[1]) {
			fn_gather[type[1]] = fn_gather[type[1]] || {};
			fn_gather[type[1]][type[0]] = func;
			etype = type[0];
		}
		if (etype==='mousewheel' && Walnut.broswerType==="火狐"){
			etype='DOMMouseScroll';
		}
		if(obj.addEventListener){
			obj.addEventListener(etype,func,false);
		}else{
			obj.attachEvent('on'+etype,func);
		}
	}
	// 移除元素事件
	Walnut.removeEvent = function(obj,etype,fn){
		if (obj.removeEventListener){
			obj.removeEventListener(etype, fn, false);
		}else if (obj.detachEvent){
			obj.detachEvent("on" + etype, fn);
		}
	}
	// 获取元素样式
	Walnut.getStyle = function(obj,attr) {
		if (window.getComputedStyle) {
			if (obj.ownerDocument.defaultView.opener) {
				var style = obj.ownerDocument.defaultView.getComputedStyle(obj,null);
			}else{
				var style = window.getComputedStyle(obj,null);
			}
		}else{
			var style = obj.currentStyle;
		}
		return attr ? style[attr] : style;
	}

	Walnut.animateGo = function(elem,cssGoto,css_begin,time,callback){
		var start=0;
		var act = function(timestamp){
			if (!start) start = timestamp;
			var progress = timestamp - start;
			if (time>0 && progress < time) {
				// console.log(progress,'---progress')
				for(var i in css_begin){
					if (css_begin[i].range) {
						var value = css_begin[i].num + (progress/time)*css_begin[i].range;
						elem.style[i] = value + css_begin[i].unit;
						if (i=='opacity') {
							elem.style.filter = 'alpha(opacity='+value*100+')';
						}
					}
				}
				requestAnimationFrame(act);
			}else {
				for(var i in css_begin){
					elem.style[i] = cssGoto[i];
					if (i=='opacity') {
						elem.style.filter = 'alpha(opacity='+cssGoto[i]*100+')';
					}
				}
				if (callback) callback.call(elem);
			}
		}
		requestAnimationFrame(act);
	}
	// 判断obj元素是否符合selector选择器
	Walnut.isEqual = function(obj,selector) {
		var arr = selector.split(',');
		for (var i = arr.length - 1; i >= 0; i--) {
			var type = arr[i].charAt(0);
			if(type==='#' && "#"+obj.id===selector || type==='.' && w(obj).hasClass(arr[i].substring(1)) || obj.tagName.toLowerCase() === arr[i]){
				return true;
			}
		}
		return false;
	}
	// 判断arr是否存在ele元素
	Walnut.contains = function(arr,ele){
		for(var i = 0 ,len = arr.length; i<len; i++){
			if (arr[i] === ele) {
				return true;
			}
		}
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
	//下拉菜单
	Walnut.dropDown = function(obj){
		var _this = this;
		var list = obj.querySelector(".select_list");
		var oLi = obj.getElementsByTagName("li");
		if(w.getStyle(list,'display') == "none"){
			list.style.display = "block";
		}else{
			list.style.display = "none";
		}
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
		w(ele).find(".popup_body_content")[0].innerHTML = str;
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
				//向下全部选中
				innerChange(_obj.next()[0],true);
				//向上判断
				outerAdd(obj.parentNode.parentNode);
			}else{
				//向下全部取消
				innerChange(_obj.next()[0],false);
				//向上分组取消全选
				outerRemove(obj.parentNode.parentNode)
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
					//向上判断
					outerAdd(obj.parentNode.parentNode);
				}else{
					w(first_dt).removeClass('icon-CheckboxSeleted');
				}
			}else{
				w(first_dt).removeClass('icon-CheckboxSeleted');
				//向上分组取消全选
				outerRemove(obj.parentNode.parentNode);
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
	});
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
					var sub = cursorY - upElem.offsetTop;
					var up_top = upElem.scrollTop;
					if (sub <= height/2) {
						if (sub > 0) {
							upElem.scrollTop = up_top - height/5;
						}else{
							return;
						}
					}
					if (sub >= upElem.offsetHeight - height/2) {
						if (sub < upElem.offsetHeight) {
							upElem.scrollTop = up_top + height/5;
						}else{
							return;
						}
					}
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
						if (options.callback) options.callback(is_change,newIndex,oldIndex);
						me.activate();
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
		var _elem = w('#'+id);
		if (!_elem.length) return;

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
				value = opts_new.value;
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
			minDate = minDate.replace(/today/gi,today_str).substring(0,lengths*3/(is_double+1)+1);
			maxDate = maxDate.replace(/today/gi,today_str).substring(0,lengths*3/(is_double+1)+1);
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
			_elem.find('.wt_calendar_input')[0].value = val;
			if (opts_new&&callback) callback.call(_elem,val);
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
			_elem[0].innerHTML = date_html;
			if (timer) {
				initTimer();
			}else if (!_elem.find('.gray_btn').length) {
				_elem.find('.wt_calendar_bottom').remove();
			}
		}
		function is_leap(year) {  //判断是否为闰年
			return (year%100==0?res=(year%400==0?1:0):res=(year%4==0?1:0));
		}
		function fillString(num, length) {
			return (Array(length).join('0') + num).slice(-length);
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
			if (is_double) {
				time_start = '00:00:00';
				time_end = fillString(now.getHours(),2)+':'+fillString(now.getMinutes(),2)+':'+fillString(now.getSeconds(),2);
			}else{
				time_start = fillString(now.getHours(),2)+':'+fillString(now.getMinutes(),2)+':'+fillString(now.getSeconds(),2);
			}
		}
		function setDateValue(str,reset) {
			str = str.replace(' ~ ',' ');
			if (!/^(\d{4}(-\d{2}(-\d{2}(\s\d{2}(:\d{2}){0,2})?)?)?)(\s\d{4}(-\d{2}(-\d{2}(\s\d{2}(:\d{2}){0,2})?)?)?)?$/i.test(str) || str.length!==format.length) {
				if (!reset || value=='today') {
					return setDateNow();
				}else{
					_elem.find('.wt_calendar_input')[0].value = getDateString(date_select);
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
				_elem.find('.wt_calendar_y')[0].innerHTML = date_show[0]+"年";
				_elem.find('.wt_calendar_m')[0].innerHTML = date_show[1]+1+"月";
				_elem.find('.wt_calendar_y')[1].innerHTML = date_show[lengths/2]+"年";
				_elem.find('.wt_calendar_m')[1].innerHTML = date_show[lengths/2+1]+1+"月";

				if (lengths < 6) {
					if (date_select[lengths/2-1]==date_select[lengths-1]) date_show[lengths-1] = date_show[lengths/2-1];
					_elem.find('.wt_calendar_m').hide();
					_elem.find('.wt_calendar_change_m').hide();
					var type_y_m = lengths==2 ? 'y' : 'm';
					show_year_month(0,type_y_m);
					show_year_month(1,type_y_m);
					return;
				}
				_elem.find('.wt_calendar_ul_y_m').removeClass('appear');
				_elem.find('.wt_calendar_m').show();
				calendar(date_show[idx_y],date_show[1+idx_y] ,is_right);
				// 相邻的面板跟随变动
				if (first || date_show[next_idx]!==next_box[0] || date_show[next_idx+1]!==next_box[1]) {
					calendar(date_show[next_idx],date_show[next_idx+1] ,(is_right+1)%2);
				}
				if(!date_range_start) updateRangeDate();
				_elem.find('.iconfont').show();
			}else{
				_elem.find('.wt_calendar_y')[0].innerHTML = date_show[0]+"年";
				_elem.find('.wt_calendar_m')[0].innerHTML = date_show[1]+1+"月";
				if (lengths===3){
					_elem.find('.wt_calendar_ul_y_m').removeClass('appear');
					_elem.find('.wt_calendar_m').show();
					calendar(date_show[0], date_show[1]);
				}else{
					_elem.find('.wt_calendar_m').hide();
					_elem.find('.wt_calendar_change_m').hide();
					var type_y_m = lengths==1 ? 'y' : 'm';
					show_year_month(0,type_y_m);
				}
			}
		}
		function show_year_month(is_right,type_y_m){
			var ul = _elem.find('.wt_calendar_ul_y_m').eq(is_right);
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
				elem = _elem.find('.wt_calendar_y')[is_right];
				elem.innerHTML = y+'年'+' ~ '+(y+11)+'年';
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
			var li_on = _elem.find('.li_on');
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
					if (_elem.find('.wt_calendar_confirm').length) {
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
				if (_elem.find('.wt_calendar_confirm').length){
					li_on.removeClass('li_on');
					w_obj.addClass('li_on');
				}else{
					set_value(getDateString(date_select));
				}
			}
		}
		function calcPosition(){
			var daterBox = _elem.find('.wt_calendar_content');
			var input_wid = _elem[0].clientWidth;
			var win_wid = Math.min(document.documentElement.clientWidth, document.body.clientWidth);
			var win_hei = Math.min(document.documentElement.clientHeight, document.body.clientHeight);
			var con_wid = parseInt(daterBox.css('width'));
			var con_hei = parseInt(daterBox.find('.wt_calendar_left').css('height'));
			con_hei += _elem.find('.wt_calendar_bottom').length ? 90 : 40;
			var offsetXY = _elem.offset();
			var pageYOffset = window.pageYOffset||document.documentElement.scrollTop;
			// console.log(input_wid,'--input_wid')
			// console.log(win_wid,'--win_wid',win_hei,'--win_hei')
			// console.log(con_wid,'--con_wid',con_hei,'--con_hei')
			// console.log(offsetXY,'--offsetXY')
			// console.log(pageYOffset,'--pageYOffset')

			var cssLeft = offsetXY.left+con_wid+2-win_wid;
			var cssTop = offsetXY.top-pageYOffset+con_hei-win_hei+30;
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
			var month_days = m_days[month];// 每个月的天数
			return month_days-fc_week+1;
		}
		function is_disabled(str){
			var time = new Date(str).getTime();
			return time<minTime || time > maxTime;
		}
		function updateRangeDate(){
			var a = getDateString(date_select).replace(/\s\d{2}(:\d{2}){0,2}}/g,'').split(' ~ ');
			var t1 = new Date(a[0].split('-').join('/')).getTime();
			var t2 = new Date(a[1].split('-').join('/')).getTime();
			_elem.find(".wt_calendar_box").find('.wt_calendar_day').each(function(){
				var str = this.getAttribute('walnut_date').split('-').join('/');
				var time = new Date(str).getTime();
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
				days_html += '<tr class="date">';
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
			_elem.find('tbody').eq(is_right_idx||0).html(days_html);
		}
		function set_value(val){
			_elem.find('.wt_calendar_input')[0].value = val;
			toggleDatePicker();
			if (callback) callback.call(_elem,val);
		}
		function toggleDatePicker(is_show){
			var daterBox = _elem.find('.wt_calendar_content');
			if (is_show) {
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
			var daterBox = _elem.find('.wt_calendar_content');
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
					time_start = '00:00:00';
					break;
				}else if (arr1[i] < arr2[i]) {
					break;
				}
			}
		}
		function initTimer(){
			if (_elem.find('.btn_timer').length){
				if (timer) {
					_elem.find('.btn_timer').show();
				}else{
					_elem.find('.btn_timer').hide();
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
			_elem.find('.wt_calendar_timer').each(function(idx){
				var top_h4 = is_double ? idx ? '<h4>结束时间</h4>' : '<h4>开始时间</h4>' : '<h4>选择时间</h4>';
				this.innerHTML = top_h4+timer_html;
			});
			_elem.find('.wt_calendar_bottom').prepend('<em class="fl btn_timer">时间选择</em>');
			_elem.find('.btn_timer').on('click',function(){
				if (w(this).hasClass('alink')) {
					toggleTimePicker();
				}else{
					var uls = _elem.find('.wt_calendar_timer').find('ul');
					var start = time_start.split(':'), len = start.length;
					toggleTimePicker(1);
					_elem.find('h4')[0].innerHTML = date_select[0]+'年 '+(date_select[1]+1)+'月 '+date_select[2]+'日';
  					uls.removeClass('wt_diabled').eq(len-1).next(true).addClass('wt_diabled');
					if (is_double) {
						_elem.find('h4')[1].innerHTML = date_select[3]+'年 '+(date_select[4]+1)+'月 '+date_select[5]+'日';
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
			_elem.find('.wt_calendar_timer').on('click','li',function(){
				var li = w(this),ul = li.parent();
				if (ul.hasClass('wt_diabled')) return;
				li.addClass('active').siblings('.active').removeClass('active');
				var height = this.clientHeight;
				var scroll = (Number(this.innerHTML)-2)*height;
				ul.scrollTop(scroll,200);
				var uls = _elem.find('.wt_calendar_timer').find('.active');
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
		_elem.find('.wt_calendar_input').on('focus',function(){
			var daterBox = _elem.find('.wt_calendar_content');
			if (daterBox.hasClass('hidden')) {
				setDateValue(this.value);
				set_y_m_d('first',0,0);
				toggleDatePicker(1);
			}
		})
		_elem.find('.icon-Date').on('click',function(){
			var daterBox = _elem.find('.wt_calendar_content');
			if (daterBox.hasClass('hidden')) {
				setDateValue(this.previousSibling.value);
				set_y_m_d('first',0,0);
				toggleDatePicker(1);
			}
		})
		_elem.find('.wt_calendar_input').on('keyup',function(event){
			var event = event || window.event;
			if (event.keyCode == 10 || event.keyCode == 13) {
				setDateValue(this.value);
				toggleDatePicker();
				this.value = getDateString(date_select);
				if (callback) callback(this.value);
				this.blur();
			}
		})
		_elem.find('.wt_calendar_content').on('click','.wt_calendar_day',function(){
			var _this = w(this);
			if (_this.hasClass('day_diabled')) return;
			var day_on = _elem.find('.day_on');
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
					if (_elem.find('.wt_calendar_confirm').length) {
						updateRangeDate();
					}else{
						set_value(getDateString(date_select));
					}
					date_range_start = '';
				}else{
					_elem.find('.day_on').removeClass('day_on');
					_elem.find('.day_in_range').removeClass('day_in_range');
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
				if (_elem.find('.wt_calendar_confirm').length) {
					_elem.find('.day_on').removeClass('day_on');
					_this.addClass('day_on');
				}else{
					set_value(getDateString(date_select));
				}
			}
		})
		_elem.find('.wt_calendar_content .iconfont').on('click',function(){
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
		_elem.find('.wt_calendar_top').find('span').on('click',function(){
			var wt_calendar_box = w(this).parents('.wt_calendar_box');
			var is_right = wt_calendar_box.index();
			wt_calendar_box.find('.wt_calendar_change_m').hide().siblings('.wt_calendar_m').hide();
			show_year_month(is_right,this.className.slice(-1));
		})
		_elem.find('.wt_calendar_ul_y_m').on('click','.wt_calendar_li',function(){
			var is_right = w(this).parents('.wt_calendar_box').index();
			var idx_y = is_right*lengths/2;
			var y_m = this.innerHTML;
			if (y_m.length>3) {
				date_show[idx_y] = parseInt(y_m);
				if ((is_double&&lengths>2) || (!is_double&&lengths>1)) {
					show_year_month(is_right,'m');
					_elem.find('.wt_calendar_y')[is_right].innerHTML = date_show[idx_y]+'年';
				}else{
					calc_year_month('y',this);
				}
			}else{
				date_show[1+idx_y] = parseInt(y_m)-1;
				if (lengths===3 || lengths===6) {
					w(this.parentNode.parentNode).removeClass('appear');
					_elem.find('.wt_calendar_m').eq(is_right).show().siblings('.wt_calendar_change_m').show();
					set_y_m_d(0,is_right,idx_y);
				}else{
					calc_year_month('m',this);
				}
			}
		})
		_elem.find('.wt_calendar_clear').on('click',function(){
			set_value('');
		})
		_elem.find('.wt_calendar_today').on('click',function(){
			setDateNow();
			set_value(getDateString(date_select));
		})
		_elem.find('.wt_calendar_confirm').on('click',function(){
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
		_elem.on('click',function(e){
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
			log:function(){
				console.log(date_select,'---date_select')
				console.log(date_show,'---date_show')
				console.log(date_range_start,'---date_range_start')
				console.log(time_start,'---time_start')
				console.log(time_end,'---time_end')
			}
		};
	}

	// IE8方法兼容
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
