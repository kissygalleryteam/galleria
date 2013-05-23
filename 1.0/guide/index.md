## Galleria 组件

v 1.0

辅助预览页面大图的组件

使用：

	new Galleria(".J_slideWrap",{
		itemCls:"ss-picitem"  //item容器的class
	});

图文列表的格式为：

	<wrap class="itemCls">
		..
		<img />
		..
	</wrap>

图片外围必须包裹一层，并指定这一层为item的容器
