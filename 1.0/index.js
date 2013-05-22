/**
 * @fileoverview 请修改组件描述
 * @author bachi<bachi@taobao.com>
 * @module galleria
 **/
KISSY.add(function (S, Node,Base) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * 请修改组件描述
     * @class Galleria
     * @constructor
     * @extends Base
     */
    function Galleria(comConfig) {
        var self = this;
        //调用父类构造函数
        Galleria.superclass.constructor.call(self, comConfig);
    }
    S.extend(Galleria, Base, /** @lends Galleria.prototype*/{

    }, {ATTRS : /** @lends Galleria*/{

    }});
    return Galleria;
}, {requires:['node', 'base']});



