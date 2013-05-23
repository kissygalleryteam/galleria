/**
 * @fileoverview ����״̬�����
 * @desc ����״̬�����
 * @author �ؼ�<diji@taobao.com>
 */
 
 
KISSY.add(function(S, undefined) {

    var D = S.DOM, E = S.Event, doc = document;
	
    /**
	 * ����״̬�����
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
