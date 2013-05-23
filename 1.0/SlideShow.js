/**
 * @fileoverview ��Ƭ�����ֲ�
 * @desc �μ���Ƭ�����ֲ�
 * @author �ؼ�<diji@taobao.com>
 */
 
 //���뿪���׶κ�u�뱣���ļ��еġ�.dev����׺
 //������ɿ����󣬼���ȥ���ļ��еġ�.dev����׺������kissy-util�ļ����µ�index.html��������������
 //������demo��Ҫ��дDOM������ʹ��kissy-dpl/base/��Ĵ����Խ�Լ����ʱ��
 
KISSY.add('widgets/SlideShow/SlideShow', function(S, undefined) {

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
	 * ��Ƭ�����ֲ�
	 * @class
	 * @constructor
	 * @name SlideShow
	 * @param ds {HTML Element} ͼƬԴ
	 */
    function SlideShow(ds,cfg) {
        var _this = this;
		_this.data = [];
		_this.activeIndex = 0;
		_this.showing = false;
		_this.cfg=S.mix({
            index:0,    //��ǰ��ʾͼƬ���±�
            itemCls:"ss-picitem"
        },cfg)
		
		//�����ǰ״̬
		_this.activeIndex = 0;
		
		//�б���
		_this.listItem = D.query("." + _this.cfg.itemCls , ds);
		
		//���������
		_this.container = D.create('<div class="ss-container" style="display:none"></div>');
		
		//�رհ���
		_this.closeBtn = D.create('<a href="#" class="ss-close-btn" title="�ر�"></a>')
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
		
		//����
		_this.mask = D.create('<div class="ss-mask"></div>');
		
		D.append(_this.mask,_this.container);
		D.append(_this.closeBtn,_this.container);
		D.append(_this.container,"body");
		
		//��ǰ����ߴ�
		_this.pos = {
			width:0,
			height:0,
			top:0,
			left:0
		}
		
		//ȫ��timeout
		_this.globalTimeout = null;
		
		//��־λ
		_this.flags = {
			isShow:false,			//�Ƿ�ɼ�
			isAnim:false 			//�Ƿ񶯻��У������н�ֹ�û�һ�в���
		}
		
		_this.pushData();
		

		//FSM���ò���
        var stateConfig = {
            initState:"hidden",		//��ʼ״̬Ϊ���ɼ�
            states:{
                //���ɼ�״̬����ʼ״̬��
                "hidden":{
                    clickpic:function(event){
                        _this.showView(event);
                        return "view";
                    }
                },
                //չʾ״̬
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
            //�����û���Ϊ
            events:{
            	//���ĳ��ͼƬ����ʾ��ͼģʽ
                "clickpic":function(fn){
                    E.on(_this.listItem,"click",function(e){
                    	e.halt();
                    	e.curItem = e.currentTarget;
                    	fn(e);
                    });
                },
                //�ر����
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
							case 39 ://right��
								e.halt();
								if(_this.activeIndex==_this.data.length-1)
									fn();
								break;
							case 37 ://left��
								e.halt();
								if(_this.activeIndex==0)
									fn();
								break;
							case 27 ://esc��
								e.halt();
								fn();
								break;
							default:
								break;
						}
					});
                },
                //��һ��
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
							case 37 ://left��
								e.halt();
								fn();
								break;
							default:
								break;
						}
					});
                },
                //��һ��
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
							case 39 ://right��
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
        //��������״̬��
        _this.FSM = new S.FSM(stateConfig);
		
		
		
		
    }

	//ԭ����չ
    S.augment(SlideShow, S.EventTarget, {
    	
    	//��������ܷ�ҳһ��ʱ��
    	disable:function(dur){
    		var _this = this;
    		_this.flags.isAnim = true;
			setTimeout(function(){
				_this.flags.isAnim = false;
			},dur*1000);
    	},
    	
    	//չʾ���
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
    		//չʾ���
    		_this.setpos(_this.getItemPos(item),_this.getWinPos(),anim,true,function(){
    			_this.disable(0.5);
    			S.one(_this.closeBtn).fadeIn(0.04);
    			S.each(_this.showItem,function(item){
    				S.one(item).fadeIn(0.2);
    			});
    		});
    		
    		
    	},
    	
    	//�������
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
    		//�������
    		_this.setpos(_this.getWinPos(),_this.getItemPos(item),true,false);
    		D.removeClass("html","ss-hideoverflow");
    	},
    	
    	//�������ʾʱչʾͼƬ�����ݣ������������ŵĴ�ͼ
    	buildShowView:function(dir){
    		var _this = this,
    		index = _this.activeIndex-0,
    		datas = _this.data,
    		wraps = _this.showItem,
    		curDatas = [];
    		//��ȡ��ǰչʾ������
    		for(var i=index-2; i<=index+2; i++){
    			D.attr(wraps[i-index+2],"data-index",i);
    			if(i>=0&&i<datas.length){
    				curDatas.push(datas[i]);
    			}else{
    				//��������ͼƬ����������Ĭ��ͼ
    				curDatas.push({
    					orgin:"",
    					big:"",
    					small:""
    				});
    			}
    		}
    		//��ͼƬ������Ӧ�������У���Ҫ�����ͼ
    		S.each(curDatas,function(data,i){
    			var k, 
    			smallimg = new Image(),
    			bigimg = new Image(),
    			img = D.get("img",wraps[i]);
    			smallimg.src = data.small;
    			bigimg.src = data.big;
    			
    			
    			//������û������л���������ֻ����
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
			//����ͼƬλ��
    		_this.setPicPos(handleIndex);
    		
    	},
    	
    	//��������ߴ�
    	resizeView:function(){
    		var _this = this;
    		_this.setpos(_this.pos,_this.getWinPos(),false,true);
    		//����ͼƬλ��
    		_this.setPicPos();
    	},
    	
    	
    	//��ȡ�����ͼƬ�ĳߴ�
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
    	//��ȡ��ǰҳ���С
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
    	//��������Ŀ��ߴ磨��Ҫ�����������ʱ�Ķ�����
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
    		//�Ѹ��������Ŀ��ߴ�
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
    	
    	//�����б�ͼƬ����
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
				//����ͼƬ�������ݣ����ڼ����ͼ�ĳߴ�
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
    	
    	
    	//��������Сͼ�ĳߴ��λ��
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
    	
    	//�����ͼ�ĳߴ�
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
    	
    	//��������ͼƬ�Ĵ�С��λ��
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
    	

    	//�л�ʱ�Ķ���,dir:1��һ�ţ�-1��һ��
    	scrollAnim:function(dir){
    		var _this = this,
    		items = _this.showItem,
    		styles = [],
    		mainPos,
    		dur = 0.2;
    		if(_this.activeIndex+dir<0||_this.activeIndex+dir>=_this.data.length)return;
    		
    		D.show(items);
    		
    		S.each(items,function(item,i){
    			//���ô�ͼ����ʽ
    			if(i==2){
    				mainPos = _this.getMainSize(parseInt(D.attr(item,"data-index"))+dir);
    				styles.push(mainPos);
    				return;
    			}
    			//��������ͼ����ʽ
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
    		
			//����һ�Ż���һ��ͼ�䵽��ͼ��С
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

    //���� 1.1.6
    S.SlideShow = SlideShow;

    return SlideShow;
},{	
    requires: ["core","sizzle","template","switchable",'../FSM/FSM',"./SlideShow.css"]
});
