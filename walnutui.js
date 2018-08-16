(function( window ) {
	var Walnut = function(selector,context){
		return new Walnut.fn.init( selector, context );
	}
	Walnut.fn = Walnut.prototype = {
		each:function(fn){
			for(var i = 0 ,len = this.length; i<len; i++){
				fn.call(this[i],i);
			}
		},
		parent:function(){
			var parent = Walnut(),
				idx = 0;
			this.each(function(){
				if (!w.contains(parent,this.parentNode)) {
					parent[idx] = this.parentNode;
					idx++;
					parent.length = idx;
				}
			})
			return parent;
		},
		parents:function(selector){
			if (!selector) return this.parent();
			var type = selector.charAt(0);
			var p = this.parent()[0];
			if (type === '#') {
				if (p === window.document) {
					return Walnut(document);
				}else if (p.id === selector.substring(1)) {
					return Walnut(p);
				}else{
					return Walnut(p).parents(selector);
				}
			}else if (type === '.') {
				if (p === window.document) {
					return Walnut(document);
				}else if (p.className === selector.substring(1)) {
					return Walnut(p);
				}else{
					return Walnut(p).parents(selector);
				}
			}else{
				if (p === window.document) {
					return Walnut(document);
				}else if (p.tagName.toLowerCase() === selector) {
					return Walnut(p);
				}else{
					return Walnut(p).parents(selector);
				}
			}
		},
		siblings:function(){
			var elem = this[0],
				siblings = Walnut(),
				idx = 0,
				n = elem.parentNode.firstChild;
			for ( ; n; n = n.nextSibling ) {
				if ( n.nodeType === 1 && n !== elem && n.nodeName.toLowerCase() !== 'script') {
					siblings[idx] = n;
					idx++;
					siblings.length = idx;
				}
			}
			return siblings;
		},
		prev:function(obj){
			var prev=this[0].previousSibling;
			while(prev){
				if(prev.nodeType===1){ 
					return Walnut(prev);
				} 
				prev=prev.previousSibling;
			}
			return false;
		},
		next:function(obj){
			var next=this[0].nextSibling;
			while(next){
				if(next.nodeType===1){ 
					return Walnut(next);
				} 
				next=next.nextSibling;
			}
			return false;
		},
		hasClass:function(cName){
			return this[0] ? !!this[0].className.match( new RegExp( "(\\s|^)" + cName + "(\\s|$)") ) : false;
		},
		addClass:function(cName){
			this.each(function(){
				if( !Walnut(this).hasClass(cName) ){
					this.className += (this.className ? ' ' : '') + cName; 
				}
			})
			return this;
		},
		removeClass:function(cName){
			this.each(function(){
				if( Walnut(this).hasClass(cName) ){ 
					this.className = this.className.replace( new RegExp( "(\\s|^)" + cName + "(\\s|$)" ), " " ).replace(/(^\s+)|(\s+$)/g,''); 
				}
				return this;
			})
		},
		css: function (prop, value) {
			this.each(function (){
				this.style[prop] = value;
			});
			return this;
		},
		show: function (){
			this.each(function (){
				this.style.display = 'block';
			});
			return this;
		},
		hide: function (){
			this.each(function (){
				this.style.display = 'none';
			})
			return this;
		},
		on: function (type, fn, useCaptrue){
			this.each(function () {
				window.addEventListener ? this.addEventListener(type, fn, useCaptrue || false) : this.attachEvent('on' + type, fn);
			});
			return this;
		},
		eq:function(num){
			for(var i = 0 ,len = this.length; i<len; i++){
				if (num == i) {
					return Walnut(this[i])
				}
			}
		},
	}
	var init = Walnut.fn.init = function(selector,context) {
		if(!selector) {
			this.length = 0;
			return this;
		}
		if(typeof selector === "string") {
			var _this = this;
			switch(selector.charAt(0)){
				case '#':
					this[0] = document.getElementById(selector.substring(1));
					this.length = 1;
					break;
				case '.':
					var elements = document.querySelectorAll(selector);
					if (elements.forEach) {
						elements.forEach(function(item,i){
							_this[i] = item;
							_this.length = i+1;
						})
					}else if (elements.length){
						_this[0] = elements[0];
						_this.length = 1;
					}
					break;
				default:
					var elements = document.getElementsByTagName(selector);
					if (elements.forEach) {
						elements.forEach(function(item,i){
							_this[i] = item;
							_this.length = i+1;
						})
					}else if (elements.length){
						_this[0] = elements[0];
						_this.length = 1;
					}
			}
			return this;
		}else if (typeof selector === "function") {
			this.addEvent(window,'load',selector)
			return this;
		} else if (selector.nodeType) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		} 
	};

	
	Walnut.addEvent = function(obj,etype,fn){
		if(obj.addEventListener){
			obj.addEventListener(etype,fn,false);
		}else{
			obj.attachEvent('on'+etype,fn);
		}
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
	};
	//横竖屏判断
	Walnut.screenRotate = function(){
		if(screen.width>screen.height){
			return "Landscape";
		}else{
			return "Portrait";
		}
	};
	Walnut.contains = function(arr,ele){
		var had = false;
		for(var i = 0 ,len = arr.length; i<len; i++){
			if (arr[i] === ele) {
				had = true;
				break;
			}
		}
		return had;
	};
	//开关
	Walnut.switchBtn = function(obj,act){
		act = act || "active"; 
		if(w(obj).hasClass(act)){
			w(obj).removeClass(act)
		}else{
			w(obj).addClass(act)
		}
	},
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
	},
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
	},
	//单选
	Walnut.singleSelect = function(obj,act){
		act = act || "active"
		var c = w(obj).parent()[0].children;
		for(var i = 0; i < c.length; i++){
			w(c[i]).removeClass(act)
		}
		w(obj).addClass(act)
	},
	//多选 && 多级列表
	Walnut.oldMultiSelect = function(obj,act){
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
	},
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
	},
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
	},
	//页面消蓝块（和contentEditable冲突,开启后同样禁止光标复制操作）
	Walnut.removeBlue = function(){
		document.onselectstart = new Function("return false");
	},
	//下拉菜单
	Walnut.dropDown = function(obj){
		var _this = this;
		var list = obj.querySelector(".select_list");
		var oStyle = list.currentStyle ? list.currentStyle : window.getComputedStyle(list, null);
		var oLi = obj.getElementsByTagName("li");
		if(oStyle.display == "none"){
			list.style.display = "block";
		}else{
			list.style.display = "none";
		}
	},
	//下拉监听
	Walnut.linsenLi = function(obj){
		var _this = this;
		_this.singleSelect(obj);
		var top = obj.parentNode.parentNode;
		var sele = top.querySelector(".list_selected");
		var list = top.querySelector(".select_list");
		sele.innerHTML = obj.innerHTML;
	},
	//弹层
	Walnut.popups = function(str){
		str = str || "您有未保存的更改，您确定要离开此页面吗？";
		w(".masking").show();
		w(".popup_box").show();
		w(".popup_body_content")[0].innerHTML = str;
		var heigh = w(".popup_box")[0].offsetHeight/-2  + "px";
		w(".popup_box").css("marginTop",heigh)

		w(".popup_close").on("click",function(){
			shut();
		})
		w(".popup_save").on("click",function(){
			shut();
		})
		w(".popup_reset").on("click",function(){
			shut();
		})
		var shut = function(){
			w(".masking").hide();
			w(".popup_box").hide();
		}
	}
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
					next = w(next).next() ? w(next).next()[0] : null;
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
					dd.querySelectorAll('.check_btn').forEach(function(item){
						if (is_check) {
							w(item).addClass('icon-CheckboxSeleted');
						}else{
							w(item).removeClass('icon-CheckboxSeleted');
						}
					})
				}else{
					if (is_check) {
						w(dd).addClass('icon-CheckboxSeleted');
					}else{
						w(dd).removeClass('icon-CheckboxSeleted');
					}
				}
				dd = w(dd).next() ? w(dd).next()[0] : null;
			}
		}
		if (obj.tagName.toLowerCase()==='dt') {
			if (w(obj).hasClass('icon-CheckboxSeleted')) {
				//向下全部选中
				innerChange(w(obj).next() ? w(obj).next()[0] : null,true);
				//向上判断
				outerAdd(obj.parentNode.parentNode);
			}else{
				//向下全部取消
				innerChange(w(obj).next() ? w(obj).next()[0] : null,false);
				//向上分组取消全选
				outerRemove(obj.parentNode.parentNode)
			}
		}else{
			var first_dt = obj.parentNode.children[0];
			if (w(obj).hasClass('icon-CheckboxSeleted')) {
				var is_check = true;
				var next = w(first_dt).next() ? w(first_dt).next()[0] : null;
				while(next){
					if (!w(next).hasClass('icon-CheckboxSeleted')) {
						is_check = false;
						break;
					}
					next = w(next).next() ? w(next).next()[0] : null;
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

	}


	Walnut.v = "1.0.0";
	Walnut.alert_flag = true;
	Walnut.device = Walnut.device();
	Walnut.screendeg = Walnut.screenRotate();



	init.prototype = Walnut.fn;
	window.w = window.walnut = Walnut;
})(window);