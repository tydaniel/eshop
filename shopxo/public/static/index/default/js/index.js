// 楼层聚合数据高度处理
function FloorResizeHandle()
{
    $('.floor').each(function(k, v)
    {
        var height = $(this).find('.goods-list').height();
        $(this).find('.aggregation').css('height', ((window.innerWidth || $(window).width()) <= 640) ? 'auto' : height+'px');
    });
}

// 购买
// $('.buy-submit, .cart-submit').on('click', function()
// {
//     // 是否登录
//     if(__user_id__ != 0)
//     {
//         if($(window).width() >= 1025)
//         {
//             CartAdd($(this));
//         }
//     }
// });

// 规格弹窗关闭
function PoptitClose()
{
    if($(window).width() < 1025)
    {
        $(document.body).css('position', 'static');
        $('.theme-signin-left').scrollTop(0);
        $('.theme-popover-mask').hide();
        $('.theme-popover').slideUp(100);
    }
}

/**
 * 加入购物车
 *
 * @param   {object}        currentEle [当前标签对象]
 */
function CartAdd(currentEle)
{
    // 参数
    var type = currentEle.attr('data-type');
    // var good_id = currentEle.attr('data-id');
    var good_id = currentEle.data('id');

    var stock = parseInt($("#inputbox-" + good_id).val()) || 1;

    // 库存数量
    // var inventory = parseInt($('.stock-tips .stock').text());
    // 最低起购数量
    // var min = $('.stock-tips .stock').data('min-limit') || 1;
    // 最大限购数量
    // var max = $('.stock-tips .stock').data('max-limit') || 0;
    // 单位
    // var unit = $('.stock-tips .stock').data('unit') || '';

    // if(stock < min)
    // {
    //     PromptCenter('最低起购数量'+min+unit);
    //     return false;
    // }
    // if(max > 0 && stock > max)
    // {
    //     PromptCenter('最大限购数量'+max+unit);
    //     return false;
    // }
    // if(stock > inventory)
    // {
    //     PromptCenter('库存数量'+inventory+unit);
    //     return false;
    // }

    // 规格
    var spec = [];
    var sku_count = $('.sku-items-' + good_id).length;
    if(sku_count > 0)
    {
        var spec_count = $('.sku-line.selected').length;
        if(spec_count < sku_count)
        {
            $('.sku-items').each(function(k, v)
            {
                if($(this).find('.sku-line.selected').length == 0)
                {
                    $(this).addClass('sku-not-active');
                }
            });
            PromptCenter('请选择规格');
            return false;
        } else {
            $('.iteminfo_parameter .sku-items-' + good_id).removeClass('sku-not-active');
            $('.theme-signin-left .sku-items-' + good_id + ' li.selected').each(function(k, v)
            {
                spec.push({"type": $(this).data('type-value'), "value": $(this).data('value')})
            });
        }
    }

    // 操作类型
    switch(type)
    {
        // 立即购买
        // case 'buy' :
        //     var $form_buy = $('form.buy-form');
        //     $form_buy.find('input[name="spec"]').val(JSON.stringify(spec));
        //     $form_buy.find('input[name="stock"]').val(stock);
        //     $form_buy.find('button[type="submit"]').trigger('click');
        //     break;

        // 加入购物车
        case 'cart' :
            // 开启进度条
            $.AMUI.progress.start();

            var $button = currentEle;
            $button.attr('disabled', true);

            // ajax请求
            $.ajax({
                url: currentEle.data('ajax-url'),
                type: 'post',
                dataType: "json",
                timeout: 10000,
                data: {"goods_id": good_id, "stock": stock, "spec": spec},
                success: function(result)
                {
                    PoptitClose();
                    $.AMUI.progress.done();
                    $button.attr('disabled', false);

                    if(result.code == 0)
                    {
                        HomeCartNumberTotalUpdate(parseInt(result.data));
                        PromptCenter(result.msg, 'success');
                    } else {
                        PromptCenter(result.msg);
                    }
                },
                error: function(xhr, type)
                {
                    PoptitClose();
                    $.AMUI.progress.done();
                    $button.attr('disabled', false);
                    PromptCenter('服务器错误');
                }
            });
            break;

        // 默认
        default :
            PromptCenter('操作参数配置有误');
    }
    return true;
}

/**
 * 获取规格详情
 */
function GoodsSpecDetail(good_id)
{
    // 是否全部选中
    var sku_count = $('.theme-signin-left .sku-items').length;
    var active_count = $('.theme-signin-left .sku-items li.selected').length;
    if(active_count < sku_count)
    {
        return false;
    }

    // 获取规格值
    var spec = [];
    $('.theme-signin-left .sku-items-'+good_id+' li.selected').each(function(k, v)
    {
        spec.push({"type": $(this).data('type-value'), "value": $(this).data('value')})
    });

    // 开启进度条
    $.AMUI.progress.start();

    // ajax请求
    $.ajax({
        url: $('.goods-detail').data('spec-detail-ajax-url'),
        type: 'post',
        dataType: "json",
        timeout: 10000,
        data: {"id": good_id, "spec": spec},
        success: function(result)
        {
            $.AMUI.progress.done();
            if(result.code == 0)
            {
                // $('.text-info .price-now').text(__price_symbol__+result.data.spec_base.price);
                $('.price-'+good_id).text(__price_symbol__+result.data.spec_base.price);
                $('#text_box-'+good_id).attr('max', result.data.spec_base.inventory);
                $('.stock-tips .stock-'+ good_id).text(result.data.spec_base.inventory);
                $('#text_box-'+good_id).val(1);
                // if(result.data.spec_base.original_price > 0)
                // {
                //     $('.goods-original-price').text(__price_symbol__+result.data.spec_base.original_price);
                //     $('.goods-original-price').parents('.items').show();
                // } else {
                //     $('.goods-original-price').parents('.items').hide();
                // }

                // 扩展数据处理
                var extends_element = result.data.extends_element || [];
                if(extends_element.length > 0)
                {
                    for(var i in extends_element)
                    {
                        if((extends_element[i]['element'] || null) != null && extends_element[i]['content'] !== null)
                        {
                            $(extends_element[i]['element']).html(extends_element[i]['content']);
                        }
                    }
                }
            } else {
                if($(window).width() < 640)
                {
                    PromptBottom(result.msg, null, null, 50);
                } else {
                    PromptCenter(result.msg);
                }
            }
        },
        error: function(xhr, type)
        {
            $.AMUI.progress.done();
            if($(window).width() < 640)
            {
                PromptBottom('服务器错误', null, null, 50);
            } else {
                PromptCenter('服务器错误');
            }
        }
    });
}

/**
 * 获取规格类型
 */
function GoodsSpecType(good_id)
{
    // 是否全部选中
    var sku_count = $('.theme-signin-left .sku-items-' + good_id).length;
    var active_count = $('.theme-signin-left .sku-items-' + good_id + ' li.selected').length;
    if(active_count <= 0 || active_count >= sku_count)
    {
        return false;
    }

    // 获取规格值
    var spec = [];
    $('.theme-signin-left .sku-items-' + good_id + ' li.selected').each(function(k, v)
    {
        spec.push({"type": $(this).data('type-value'), "value": $(this).data('value')})
    });

    // 开启进度条
    $.AMUI.progress.start();

    // ajax请求
    $.ajax({
        url: $('.goods-detail').data('spec-type-ajax-url'),
        type: 'post',
        dataType: "json",
        timeout: 10000,
        data: {"id": good_id, "spec": spec},
        success: function(result)
        {
            $.AMUI.progress.done();
            if(result.code == 0)
            {
                var spec_count = spec.length;
                var index = (spec_count > 0) ? spec_count : 0;
                if(index < sku_count)
                {
                    $('.theme-signin-left .sku-items').eq(index).find('li').each(function(k, v)
                    {
                        $(this).removeClass('sku-dont-choose');
                        var value = $(this).data('value').toString();
                        if(result.data.spec_type.indexOf(value) == -1)
                        {
                            $(this).addClass('sku-items-disabled');
                        } else {
                            $(this).removeClass('sku-items-disabled');
                        }
                    });
                }

                // 扩展数据处理
                var extends_element = result.data.extends_element || [];
                if(extends_element.length > 0)
                {
                    for(var i in extends_element)
                    {
                        if((extends_element[i]['element'] || null) != null && extends_element[i]['content'] !== null)
                        {
                            $(extends_element[i]['element']).html(extends_element[i]['content']);
                        }
                    }
                }
            } else {
                if($(window).width() < 640)
                {
                    PromptBottom(result.msg, null, null, 50);
                } else {
                    PromptCenter(result.msg);
                }
            }
        },
        error: function(xhr, type)
        {
            $.AMUI.progress.done();
            if($(window).width() < 640)
            {
                PromptBottom('服务器错误', null, null, 50);
            } else {
                PromptCenter('服务器错误');
            }
        }
    });
}

/**
 * 商品基础数据恢复
 * @author   Devil
 * @blog    http://gong.gg/
 * @version 1.0.0
 * @date    2018-12-25
 * @desc    description
 */
function GoodsBaseRestore(good_id)
{
    // $('.text-info .price-now').text(__price_symbol__+$('.text-info .price-now').data('original-price'));
    $('.price-'+good_id).text(__price_symbol__+$('.price-'+good_id).data('original-price'));
    $('.number-tag input[type="number"]').attr('max', $('.number-tag input[type="number"]').data('original-max'));
    $('.stock-tips .stock-' + good_id).text($('.stock-tips .stock-' + good_id).data('original-stock'));

    // 价格处理
    // if($('.tb-detail-price .original-price-value').length > 0)
    // {
    //     $('.tb-detail-price .original-price-value').each(function(k, v)
    //     {
    //         var price = $(this).data('original-price');
    //         if(price !== undefined)
    //         {
    //             $(this).text(__price_symbol__+price);
    //         }
    //     });
    // }
}

$(function()
{
    // 新闻轮播
    if((window.innerWidth || $(window).width()) <= 640)
    {
        function AutoScroll()
        {
            $('.banner-news').find("ul").animate({
                marginTop: "-39px"
            }, 500, function() {
                $(this).css({
                    marginTop: "0px"
                }).find("li:first").appendTo(this);
            });
        }
        setInterval(function()
        {
            AutoScroll();
        }, 3000);
    }

    $('.theme-options').each(function()
    {
        // var good_id2 = $(this).data('id');

        $(this).find('ul>li').on('click', function()
        {

            // 商品ID
            var good_id = $(this).data('id');
            // var stock = parseInt($("#inputbox-" + good_id).val()) || 1;

            // 切换规格购买数量清空
            $('#inputbox-' + good_id).val($('.stock-tips .stock-' + good_id).data('min-limit') || 1);

            // 规格处理
            var length = $('.theme-signin-left .sku-items-' + good_id).length;
            var index = $(this).parents('.sku-items-' + good_id).index();

            if($(this).hasClass('selected'))
            {
                $(this).removeClass('selected');

                // 去掉元素之后的禁止
                $('.theme-signin-left .sku-items-' + good_id).each(function(k, v)
                {
                    if(k > index)
                    {
                        $(this).find('li').removeClass('sku-items-disabled').removeClass('selected').addClass('sku-dont-choose');
                    }
                });

                // 数据还原
                GoodsBaseRestore(good_id);

            } else {
                if($(this).hasClass('sku-items-disabled') || $(this).hasClass('sku-dont-choose'))
                {
                    return false;
                }
                $(this).addClass('selected').siblings('li').removeClass('selected');
                $(this).parents('.sku-items-' + good_id).removeClass('sku-not-active');

                // 去掉元素之后的禁止
                if(index < length)
                {
                    $('.theme-signin-left .sku-items').each(function(k, v)
                    {
                        if(k > index)
                        {
                            $(this).find('li').removeClass('sku-items-disabled').removeClass('selected').addClass('sku-dont-choose');
                        }
                    });
                }

                // 是否存在规格图片
                var spec_images = $(this).data('type-images') || null;
                if(spec_images != null)
                {
                    $('.jqzoom').attr('src', spec_images);
                    $('.jqzoom').attr('rel', spec_images);
                    $('.img-info img').attr('src', spec_images);
                }

                // 后面是否还有未选择的规格
                if(index < length-1)
                {
                    // 数据还原
                    GoodsBaseRestore(good_id);
                }

                // 获取下一个规格类型
                GoodsSpecType(good_id);

                // 获取规格详情
                GoodsSpecDetail(good_id);
            }
        });
        //数量增加操作
        $(this).find($('.add')).on('click', function() {
            // 商品ID
            var goodid = $(this).data('id');
            var $sotck = $('#text_box-'+goodid);
            var inventory = parseInt($('.stock-tips .stock-'+goodid).text());
            var number = parseInt($sotck.val())+1;
            var max = $('.stock-tips .stock-'+goodid).data('max-limit') || 0;
            var unit = $('.stock-tips .stock-'+goodid).data('unit') || '';
            if(max > 0 && number > max)
            {
                Prompt('最大限购数量'+max+unit);
                return false;
            }
            if(number > inventory)
            {
                Prompt('库存数量'+inventory+unit);
                return false;
            }
            $sotck.val(number);
        });
        //数量减少操作
        $(this).find($('.min')).on('click', function() {
            // 商品ID
            var goodid = $(this).data('id');
            var $sotck = $('#text_box-'+goodid);
            var value = parseInt($sotck.val())-1 || 1;
            var min = $('.stock-tips .stock-'+goodid).data('min-limit') || 1;
            var unit = $('.stock-tips .stock-'+goodid).data('unit') || '';
            if(value < min)
            {
                Prompt('最低起购数量'+min+unit);
                return false;
            }
            $sotck.val(value);
        });
        // 手动输入
        $(this).find($('input[type=number]')).on('blur', function() {
            // 商品ID
            var goodid = $(this).data('id');
            var $sotck = $('#text_box-'+goodid);
            var min = $('.stock-tips .stock-'+goodid).data('min-limit') || 1;
            var number = parseInt($(this).val());
            var inventory = parseInt($('.stock-tips .stock-'+goodid).text());
            if(number > inventory)
            {
                number = inventory;
            }
            if(number <= 1 || isNaN(number))
            {
                number = min;
            }
            $sotck.val(number);
        });
    });


    // 浏览器窗口实时事件
    $(window).resize(function()
    {
        FloorResizeHandle();
    });
});

$(window).load(function()
{
    FloorResizeHandle();
});