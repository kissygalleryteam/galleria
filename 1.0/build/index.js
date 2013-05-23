/*
combined files : 

gallery/galleria/1.0/fsm
gallery/galleria/1.0/index

*/
/**
 * @fileoverview ����״̬������
 * @desc ����״̬������
 * @author �ؼ�<diji@taobao.com>
 */
 
 
KISSY.add('gallery/galleria/1.0/fsm',function(S, undefined) {

    var D = S.DOM, E = S.Event, doc = document;
	
    /**
	 * ����״̬������
	 * @class
	 * @constructor
	 * @name FSM
	 * @param config
	 */
    function FSM(config){
        this.config = config;
        this.currentState = this.config.initState;
        this.nextState = null;
        this.states = this.config.states;
        this.events = this.config.events;
        
        this.defineEvents();
    }


    var proto = {
        //�¼�����״̬ת��(���ֲ�)
        handleEvents:function(event){
            if(!this.currentState)return;
            
            var actionTransitionFunction = this.states[this.currentState][event.type];
            if(!actionTransitionFunction)return;
            var nextState = actionTransitionFunction.call(this,event);
            this.currentState = nextState;
        },
        //ֱ�Ӵ���һ��״̬ת��
        doTransition:function(state,type,event){
            var actionTransitionFunction = this.states[state][type];
            if(!actionTransitionFunction)return;
            var nextState = actionTransitionFunction.call(this,event);
            this.currentState = nextState;
        },
        //�����¼� (��Ϊ��)
        defineEvents:function(){
            var _this = this,
            events = this.events;
            S.each(events,function(fn,k){
                fn.call(_this,function(event){
                    _this.fire(k,event);
                });
                _this.on(k,_this.handleEvents);
            });
        }
    }
    S.augment(FSM, S.EventTarget, proto);

    //���� 1.1.6
    S.FSM = FSM;

    return FSM;
}, {
    requires: ["core"]
});

/**
 * @fileoverview 请修改组件描述
 * @author bachi<bachi@taobao.com>
 * @module galleria
 **/

KISSY.add('gallery/galleria/1.0/index',function (S,Base,Node,Slide) {

	"use strict";

    var D = S.DOM, E = S.Event, doc = document;
	
	
	var CLSQUE = [
		"ss-before-prev",
		"ss-prev",
		"ss-main",
		"ss-next",
		"ss-after-next"
	];
	
	function circle(arr,dir){
		if(dir==1){
			var item = arr.shift();
			arr.push(item);
		}else{
			var item = arr.pop();
			arr.unshift(item);
		}
		return arr;
	}
    /**
	 * 照片浮层轮播
	 * @class
	 * @constructor
	 * @name SlideShow
	 * @param ds {HTML Element} 图片源
	 */
    function SlideShow(ds,cfg) {
        var _this = this;
		_this.data = [];
		_this.activeIndex = 0;
		_this.showing = false;
		_this.cfg=S.mix({
            index:0,    //当前显示图片的下标
            itemCls:"ss-picitem"
        },cfg)
		
		//组件当前状态
		_this.activeIndex = 0;
		
		//列表项
		_this.listItem = D.query("." + _this.cfg.itemCls , ds);
		
		//组件外容器
		_this.container = D.create('<div class="ss-container" style="display:none"></div>');
		
		//关闭按键
		_this.closeBtn = D.create('<a href="#" class="ss-close-btn" title="关闭"></a>')
		_this.showItem = [];
		S.each(CLSQUE,function(cls){
			var item = D.create('<div class="ss-show-item"></div>');
			_this.showItem.push(item);
			D.append(item,_this.container);
			E.on(item,"mouseenter",function(e){
				tar = e.currentTarget;
				if(D.hasClass(tar,"ss-small-pic")){
					D.addClass(tar,"ss-hover");
				}
			});
			E.on(item,"mouseleave",function(e){
				tar = e.currentTarget;
				if(D.hasClass(tar,"ss-small-pic")){
					D.removeClass(tar,"ss-hover");
				}
			});
		});
		
		//遮罩
		_this.mask = D.create('<div class="ss-mask"></div>');
		
		D.append(_this.mask,_this.container);
		D.append(_this.closeBtn,_this.container);
		D.append(_this.container,"body");
		
		//当前组件尺寸
		_this.pos = {
			width:0,
			height:0,
			top:0,
			left:0
		}
		
		//全局timeout
		_this.globalTimeout = null;
		
		//标志位
		_this.flags = {
			isShow:false,			//是否可见
			isAnim:false 			//是否动画中，动画中禁止用户一切操作
		}
		
		_this.pushData();
		

		//FSM配置参数
        var stateConfig = {
            initState:"hidden",		//初始状态为不可见
            states:{
                //不可见状态（初始状态）
                "hidden":{
                    clickpic:function(event){
                        _this.showView(event);
                        return "view";
                    }
                },
                //展示状态
                "view":{
                    close:function(){
                    	_this.closeView();
                    	return "hidden";
                    },
                    next:function(){
                    	_this.showNext();
                    	return "view";
                    },
                    prev:function(){
                    	_this.showPrev();
                    	return "view";
                    },
                    resize:function(){
                    	_this.resizeView();
                    	return "view";
                    }
                }  
            },
            //定义用户行为
            events:{
            	//点击某张图片，显示大图模式
                "clickpic":function(fn){
                    E.on(_this.listItem,"click",function(e){
                    	e.halt();
                    	e.curItem = e.currentTarget;
                    	fn(e);
                    });
                },
                //关闭组件
                "close":function(fn){
                    E.on(_this.closeBtn,"click",function(e){
                    	e.halt();
                    	fn();
                    });
                    E.on(_this.mask,"click",function(e){
                    	if(e.target == this)
                    		fn();
                    });
                    
                    E.on(document, 'keydown', function(e){
                    	
						var keyCode = e.keyCode;
						switch(keyCode){
							case 39 ://right键
								e.halt();
								if(_this.activeIndex==_this.data.length-1)
									fn();
								break;
							case 37 ://left键
								e.halt();
								if(_this.activeIndex==0)
									fn();
								break;
							case 27 ://esc键
								e.halt();
								fn();
								break;
							default:
								break;
						}
					});
                },
                //上一张
                "prev":function(fn){
                    E.on(_this.showItem,"click",function(e){
                    	if(_this.flags.isAnim)return;
                    	if(e.currentTarget!=_this.showItem[1])return;
                    	e.halt();
                    	fn(e);
                    });
                    E.on(document, 'keydown', function(e){
                    	if(_this.flags.isAnim)return;
						var keyCode = e.keyCode;
						switch(keyCode){
							case 37 ://left键
								e.halt();
								fn();
								break;
							default:
								break;
						}
					});
                },
                //下一张
                "next":function(fn){
                   	E.on(_this.showItem,"click",function(e){
                   		if(_this.flags.isAnim)return;
                   		if(e.currentTarget!=_this.showItem[3]&&e.currentTarget!=_this.showItem[2])return;
                    	e.halt();
                    	fn(e);
                    });
                    E.on(document, 'keydown', function(e){
                    	if(_this.flags.isAnim)return;
						var keyCode = e.keyCode;
						switch(keyCode){
							case 39 ://right键
								e.halt();
								fn();
								break;
							default:
								break;
						}
					});
                },
                //resize
                "resize":function(fn){
                	E.on(window,"resize",function(){
                		fn();
                	});
                }
            }
        }
        //启动有限状态机
        _this.FSM = new S.FSM(stateConfig);
		
    }

	//原型扩展
    S.augment(SlideShow, S.EventTarget, {
    	
    	//让组件不能翻页一段时间
    	disable:function(dur){
    		var _this = this;
    		_this.flags.isAnim = true;
			setTimeout(function(){
				_this.flags.isAnim = false;
			},dur*1000);
    	},
    	
    	//展示组件
    	showView:function(e){
    		var _this = this,
    		item = e.curItem,
    		index = D.attr(item,"data-index"),
    		anim = S.UA.ie==6?false:true;
    		
    		D.addClass("html","ss-hideoverflow");
    		
    		_this.activeIndex = parseInt(index);
    		
    		_this.buildShowView();
    		S.one(_this.closeBtn).hide();
			S.each(_this.showItem,function(item){
				S.one(item).hide();
			});
    		//展示组件
    		_this.setpos(_this.getItemPos(item),_this.getWinPos(),anim,true,function(){
    			_this.disable(0.5);
    			S.one(_this.closeBtn).fadeIn(0.04);
    			S.each(_this.showItem,function(item){
    				S.one(item).fadeIn(0.2);
    			});
    		});
    		
    		
    	},
    	
    	//隐藏组件
    	closeView:function(){
    		var _this = this,
    		index = _this.activeIndex,
    		item = _this.listItem[index],
    		top = D.offset(item).top;
    		S.one(_this.closeBtn).hide();
			S.each(_this.showItem,function(item){
				S.one(item).hide();
			});
			S.Anim(window,{
				scrollTop:top-(D.viewportHeight()/2)
			},0.2,"easeOut").run();
    		//隐藏组件
    		_this.setpos(_this.getWinPos(),_this.getItemPos(item),true,false);
    		D.removeClass("html","ss-hideoverflow");
    	},
    	
    	//处理刚显示时展示图片的内容，并缓存上下张的大图
    	buildShowView:function(dir){
    		var _this = this,
    		index = _this.activeIndex-0,
    		datas = _this.data,
    		wraps = _this.showItem,
    		curDatas = [];
    		//获取当前展示区数据
    		for(var i=index-2; i<=index+2; i++){
    			D.attr(wraps[i-index+2],"data-index",i);
    			if(i>=0&&i<datas.length){
    				curDatas.push(datas[i]);
    			}else{
    				//若不存在图片数据则推入默认图
    				curDatas.push({
    					orgin:"",
    					big:"",
    					small:""
    				});
    			}
    		}
    		//把图片放入相应的容器中，需要处理大图
    		S.each(curDatas,function(data,i){
    			var k, 
    			smallimg = new Image(),
    			bigimg = new Image(),
    			img = D.get("img",wraps[i]);
    			smallimg.src = data.small;
    			bigimg.src = data.big;
    			
    			
    			//如果是用户做的切换动作，则只处理
    			if(dir==-1){
    				if(i!=0&&i!=2)
    					return;
    			}
    			if(dir==1){
    				if(i!=4&&i!=2)
    					return;
    			}
    			if(i!=2){
    				wraps[i].innerHTML = "<b></b>";
    				D.append(smallimg,wraps[i]);
    			}else{
    				if(!img){
    					wraps[i].innerHTML = "<b></b>";
    					D.append(bigimg,wraps[i]);
    				}
    				else
    					img.src = data.big;
    			}
    			
    		});
    		
    		var handleIndex;
    		if(dir==-1)handleIndex=0;
    		if(dir==1)handleIndex=4;
			//计算图片位置
    		_this.setPicPos(handleIndex);
    		
    	},
    	
    	//处理组件尺寸
    	resizeView:function(){
    		var _this = this;
    		_this.setpos(_this.pos,_this.getWinPos(),false,true);
    		//计算图片位置
    		_this.setPicPos();
    	},
    	
    	
    	//获取点击的图片的尺寸
    	getItemPos:function(tar){
    		var _this = this,
    		top = D.offset(tar).top,
    		left = D.offset(tar).left,
    		width = D.outerWidth(tar),
    		height = D.outerHeight(tar);
    		return {
    			top:top,
    			left:left,
    			width:width,
    			height:height
    		}
    	},
    	//获取当前页面大小
    	getWinPos:function(){
    		var _this = this,
    		top = D.scrollTop(),
    		left = 0,
    		width = D.viewportWidth(),
    		height = D.viewportHeight();
    		return {
    			top:top,
    			left:left,
    			width:width,
    			height:height
    		}
    	},
    	//把组件变成目标尺寸（主要用于显隐组件时的动画）
    	setpos:function(start,end,anim,show,fn){
    		var _this = this,startop = show?0.6:1,endop = show?1:0.6;
    		startop = D.css(_this.container,"opacity")||startop;
    		
    		D.css(_this.container,{
    			width:start.width+"px",
    			height:start.height+"px",
    			top:start.top+"px",
    			left:start.left+"px",
    			opacity:D.css(_this.container,"opacity")||startop
    		});
    		if(show){
    			D.show(_this.container);
    		}
    		_this.pos = end;
    		//把父容器变成目标尺寸
    		if(!anim){
    			D.css(_this.container,{
    				width:end.width+"px",
	    			height:end.height+"px",
	    			top:end.top+"px",
	    			left:end.left+"px",
	    			opacity:endop
    			});
    			fn&&fn();
    		}else{
    			_this.flags.isAnim = true;
    			var an = new S.Anim(_this.container,{
    				width:end.width+"px",
	    			height:end.height+"px",
	    			top:end.top+"px",
	    			left:end.left+"px",
	    			opacity:endop
    			},0.3,"easeOut",function(){
    				_this.flags.isAnim = false;
    				if(!show){
		    			D.hide(_this.container);
		    		}
		    		fn&&fn();
    			});
    			an.run();
    		}
    	},
    	
    	//推入列表图片数据
    	pushData:function(){
    		var _this = this,
    		listItem = _this.listItem;
    		S.each(listItem,function(item,i){
    			var img = D.get("img",item);
				var oriUrl = img.src.replace(/_[0-9]{1,3}x[0-9]{1,3}\.jpg/,""),
				bigUrl = img.src.replace(/_[0-9]{1,3}x[0-9]{1,3}\.jpg/,""),
				smallUrl = img.src.replace(/_[0-9]{1,3}x[0-9]{1,3}\.jpg/,"_250x250.jpg"),
				data = {
					origin:oriUrl,
					big:bigUrl,
					small:smallUrl
				};
				D.attr(item,"data-index",i);
				_this.data.push(data);
				img = new Image();
				img.src = oriUrl;
				//增加图片比例数据，用于计算大图的尺寸
				if(img.width>0){
					data.scale = img.width/img.height;
				}else{
					E.on(img,"load",function(){
						E.remove(img,"load",arguments.callee);
						data.scale = img.width/img.height;
					});
				}
				
			});
    	},
    	
    	
    	//设置两边小图的尺寸和位置
    	setSmallPic:function(wrap,dataOnly){
    		var _this = this;
    		function centerImg(img){
    			var scale = img.width/img.height,
    			wrap = _this.showItem[0],
    			wrapWidth = D.outerWidth(wrap),
    			wrapHeight = D.outerHeight(wrap),
    			width = Math.max(wrapWidth,wrapHeight*scale),
    			height = Math.max(wrapHeight,wrapWidth/scale),
    			left = (wrapWidth-width)/2,
    			top = (wrapHeight-height)/2;
    			if(!dataOnly){
	    			D.css(img,{
	    				width:width+"px",
	    				height:height+"px",
	    				left:left+"px",
	    				top:top+"px"
	    			});
	    			S.one(img).fadeIn();
    			}
    			return {
    				width:width+"px",
    				height:height+"px",
    				left:left+"px",
    				top:top+"px"
    			}
    		}
    		var img = D.get("img",wrap);
    		
			if(img.width){
				return centerImg(img,wrap);
			}else{
				D.hide(img);
				E.on(img,"load",function(){
					E.remove(img,"load",arguments.callee);
					return centerImg(img,wrap);
				});
			}
    	},
    	
    	//计算大图的尺寸
    	getMainSize:function(index){
    		index = parseInt(typeof index!="undefined"?index:this.activeIndex);
    		var imgData = this.data[index], 
    		winHeight = D.viewportHeight(),
    		winWidth = D.viewportWidth()-200,
    		areaWidth = Math.max(winWidth-90,400),
    		areaHeight = Math.max(winHeight-200,300),
    		width = Math.min(areaWidth,areaHeight*imgData.scale),
    		height = Math.min(areaHeight,areaWidth/imgData.scale);
console.log([width,height,imgData])
    		return {
    			left:(winWidth-width)/2+100+"px",
    			top:(winHeight-height)/2+"px",
    			width:width+"px",
    			height:height+"px"
    		}
    	},
    	
    	//设置所有图片的大小和位置
    	setPicPos:function(index){
    		var _this = this,
    		items = _this.showItem,
    		winHeight = D.viewportHeight(),
    		winWidth = D.viewportWidth(),
    		smallHeight = D.outerHeight(items[0]),
    		smallWidth = D.outerWidth(items[0]),
    		smallTop =(winHeight-smallHeight)/2;
    		
    		D.show(items);
    		
    		S.each(items,function(item,i){
    			if(i==2){
    				D.removeClass(item,"ss-small-pic");
    				D.addClass(item,"ss-main-pic");
    			}
    			if(i!=2){
    				D.addClass(item,"ss-small-pic");
    				D.removeClass(item,"ss-main-pic");
    				D.removeClass(item,"ss-hover");
    			}
    		});
    		function setMainPic(wrap){
    			var img = D.get("img",wrap);
    			D.attr(img,"style","");
    			D.css(img,{
    				width:"100%",
    				height:"100%"
    			});
    		}
    		D.addClass(items,"ss-cursor");
    		
    		D.css(items[0],{
    			top:smallTop+"px",
    			left:-smallWidth+"px"
    		});
    		_this.setSmallPic(items[0]);
    		
    		D.css(items[1],{
    			top:smallTop+"px",
    			left:0
    		});
    		_this.setSmallPic(items[1]);
    		
    		D.css(items[2],_this.getMainSize());
    		setMainPic(items[2]);
    		D.removeClass(items[2],"ss-cursor");
    		
    		D.css(items[3],{
    			top:smallTop+"px",
    			left:winWidth-smallWidth+"px"
    		});
    		_this.setSmallPic(items[3]);
    		
    		D.css(items[4],{
    			top:smallTop+"px",
    			left:winWidth+"px"
    		});
    		_this.setSmallPic(items[4]);
    		
    		if(_this.activeIndex==0){
    			D.hide(items[1]);
    		}
    		if(_this.activeIndex==_this.data.length-1){
    			D.hide(items[3]);
    		}
    	},
    	

    	//切换时的动画,dir:1下一张，-1上一张
    	scrollAnim:function(dir){
    		var _this = this,
    		items = _this.showItem,
    		styles = [],
    		mainPos,
    		dur = 0.2;
    		if(_this.activeIndex+dir<0||_this.activeIndex+dir>=_this.data.length)return;
    		
    		D.show(items);
    		
    		S.each(items,function(item,i){
    			//设置大图的样式
    			if(i==2){
    				mainPos = _this.getMainSize(parseInt(D.attr(item,"data-index"))+dir);
    				styles.push(mainPos);
    				return;
    			}
    			//设置其它图的样式
    			styles.push({
    				left:D.css(item,"left"),
    				top:D.css(item,"top"),
    				width:D.css(item,"width"),
    				height:D.css(item,"height")
    			});
    		});
    		
    		var mainPicStyle = {
    			width:mainPos.width,
    			height:mainPos.height,
    			top:0,
    			left:0
    		};
    		D.removeClass(items[2+dir],"ss-cursor");
    		D.addClass(items[2],"ss-cursor");
    		D.removeClass(items[2],"ss-hover");
    		
			//将下一张或上一张图变到主图大小
    		D.css(
    			D.get("img",items[2+dir]),
    			S.mix(mainPicStyle,{
    				width:"100%",
    				height:"100%"
    			})
    		);
    		S.Anim(
    			D.get("img",items[2]),
    			_this.setSmallPic(items[2],true),
    			dur,
    			"easeOut"
    		).run();
    		
    		items = _this.showItem = circle(items,dir);
    		setTimeout(function(){
    			_this.activeIndex+=dir;
				_this.buildShowView(dir);
				_this.flags.isAnim = false;
    				
    		},dur*1500);
    		
    		S.each(items,function(item,i){
    			var thisDur = dur;
    			if(dir==1&&i==4){
    				return;
    			}
    			if(dir==-1&&i==0){
    				return;
    			}
    			_this.flags.isAnim = true;
    			
    			if(i!=2&&i!=2-dir)thisDur=dur*1.5;
    			
    			S.Anim(item,styles[i],thisDur,"easeOut",function(){

    			}).run();
    		});
    		
    	},


		showNext:function(){
			var _this = this;
			_this.scrollAnim(1);
			
		},
		showPrev:function(){
			var _this = this;
			_this.scrollAnim(-1);
		}
		
    });

    //兼容 1.1.6
    S.Galleria = SlideShow;

    return SlideShow;

}, {
    requires: ["core","sizzle","template","switchable",'./fsm']
});

