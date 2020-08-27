$(function()
{
    // 筛选操作
    $(document).on('click', '.select-list dl dd', function()
    {
        $(this).addClass("selected").siblings().removeClass("selected");
        var selected_tag_name = $(this).parent('.dd-conent').attr('data-selected-tag');
        if ($(this).hasClass("select-all")) {
            $('#'+selected_tag_name).remove();
        } else {
            if ($('#'+selected_tag_name).length > 0) {
                $('#'+selected_tag_name).find('a').html($(this).find('a').text());
                $('#'+selected_tag_name).find('a').attr('data-value', $(this).find('a').attr('data-value'));
            } else {
                var copy_html = $(this).clone();
                $(".select-result dl").append(copy_html.attr("id", selected_tag_name));
            }
        }
        GetGoodsList(1);
    });

    $(document).on('click', '.select-result dl dd', function() {
        $(this).remove();
        $('#'+$(this).attr('id')+'-dl').find('.select-all').addClass('selected').siblings().removeClass('selected');
        GetGoodsList(1);
    });

    $(document).on('click', 'ul.select dd', function() {
        if ($('.select-result dd').length > 1) {
            $('.select-no').hide();
            $('.screening-remove-submit').show();
            $('.select-result').show();
        } else {
            $('.select-no').show();
            $('.select-result').hide();
        }
    });

    $(".screening-remove-submit").on("click", function() {
        $('.select-result dd.selected').remove();
        $('.select-list .select-all').addClass('selected').siblings().removeClass('selected');
        $(this).hide();
        $('.select-result .select-no').show();
        $('.select-result').hide();
        GetGoodsList(1);
    });

    // 排序导航
    $('.sort-nav li').on('click', function()
    {
        var type = $(this).attr('data-type');
        $('.sort-nav li').attr('data-type', 'desc');
        $('.sort-nav li a i').removeClass('am-icon-long-arrow-up').addClass('am-icon-long-arrow-down');

        if($(this).hasClass('active'))
        {
            if(type == 'asc')
            {
                $(this).attr('data-type', 'desc');
                $(this).find('a i').removeClass('am-icon-long-arrow-down').addClass('am-icon-long-arrow-up');
            } else {
                $(this).attr('data-type', 'asc');
                $(this).find('a i').removeClass('am-icon-long-arrow-up').addClass('am-icon-long-arrow-down');
            }
        } else {
            $('.sort-nav li').removeClass('active');
            $(this).addClass('active');
            $(this).attr('data-type', 'asc');
        }
        GetGoodsList(1);
    });

    // 条件分类组筛选
    $(".select dt").on('click', function()
    {
        if($(window).width() < 640)
        {
            $('body,html').scrollTop(0);
            $(this).next('div.dd-conent').css('top', ($('.theme-popover').height())+'px');
            if ($(this).next('div.dd-conent').css("display") == 'none') {
                $(".theme-popover-mask").show();
                $(".theme-popover").css({"position":"fixed", "top":0});
                $(this).next('div.dd-conent').slideToggle(300);
                $('.select div.dd-conent').not($(this).next()).hide();
            } else {
                $(this).next('div.dd-conent').slideUp(300);
                $(".theme-popover-mask").hide();
                $(".theme-popover").css({"position":"static", "top":0});
           }
        }
    });

    // 取消条件/移除条件
    $(document).on("click", ".select dd, .screening-remove-submit", function()
    {
        if($(document).width() < 640)
        {
            $(".dd-conent").slideUp(300);
            $(".theme-popover-mask").hide();
            $(".theme-popover").css({"position":"static", "top":0});
        }
    });

    // 关闭弹层
    $('.theme-popover-mask').on('click', function()
    {
        $(".dd-conent").slideUp(300);
        $(".theme-popover-mask").hide();
        $(".theme-popover").css({"position":"static", "top":0});
    });
    

    // 导航显示/隐藏处理
    function SearchNav()
    {
        // 滚动处理导航
        $(window).scroll(function()
        {
            if($(window).width() <= 625)
            {
                var scroll = $(document).scrollTop();

                if($('.nav-search').length > 0)
                {
                    if(scroll > 30)
                    {
                        $('.nav-search').css('display','none');
                    } else {
                        $('.nav-search').css('display','block');
                    }
                }
                
            }
        });
    }

    // 浏览器窗口实时事件
    $(window).resize(function()
    {
        // 导航
        SearchNav();

        // 条件筛选
        if($(document).width() >= 640)
        {
            $('.dd-conent').show();
        }
    });
    SearchNav();

    // 获取商品列表
    function GetGoodsList(page)
    {
        // 请求参数处理
        var data = {
            category_id: $('.search-container').data('category-id') || 0,
            wd: $('#search-input').val() || '',
            page: page || parseInt($('.search-pages-submit').attr('data-page')) || 1,
            order_by_field: $('.sort-nav li.active').attr('data-field') || 'default',
            order_by_type: $('.sort-nav li.active').attr('data-type') == 'asc' ? 'desc' : 'asc',
        }
        $('.select-result .selected a').each(function(k, v)
        {
            data[$(this).attr('data-field')] = $(this).attr('data-value');
        });

        // 清空数据
        if(data.page == 1)
        {
            $('.search-list').html('');
        }

        // 页面提示处理
        $('.loding-view').show();
        $('.search-pages-submit').hide();
        $('.table-no').hide();

        // 请求数据
        $.ajax({
            url:$('.search-pages-submit').data('url'),
            type:'POST',
            dataType:"json",
            timeout:10000,
            data:data,
            success:function(result)
            {
                $('.loding-view').hide();
                if(result.code == 0)
                {
                    $('.search-list').append(result.data.data);
                    $('.search-pages-submit').attr('data-page', data.page+1);
                    $('.search-pages-submit').attr('disabled', (result.data.page_total <= 1));
                    $('.search-pages-submit').show();
                    $('.table-no').hide();
                    quickBuy();  //快捷购买
                } else if(result.code == -100) {
                    if($('.search-list li').length == 0)
                    {
                        $('.table-no').show();
                        $('.search-pages-submit').hide();
                    } else {
                        $('.table-no').hide();
                        $('.search-pages-submit').show();
                        $('.search-pages-submit').attr('disabled', true);
                    }
                    Prompt(result.msg);
                } else {
                    Prompt(result.msg);
                }
                $('.select .title-tips strong').text(result.data.total);
            },
            error:function(xhr, type)
            {
                $('.loding-view').hide();
                $('.search-pages-submit').hide();
                $('.table-no').show();
                Prompt('网络异常出错');
            }
        });
    }
    GetGoodsList(1);

    // 加载更多数据
    $('.search-pages-submit').on('click', function()
    {
        GetGoodsList();
    });

    //快捷购物
    function quickBuy(){
        $('.theme-options').each(function()
        {
            $(this).find('ul>li').on('click', function() {
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
                var $sotck = $('#inputbox-'+goodid);
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
                var $sotck = $('#inputbox-'+goodid);
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
                var $sotck = $('#inputbox-'+goodid);
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
        $('.price-'+good_id).text(__price_symbol__+$('.price-'+good_id).data('original-price'));
        $('.number-tag input[type="number"]').attr('max', $('.number-tag input[type="number"]').data('original-max'));
        $('.stock-tips .stock-' + good_id).text($('.stock-tips .stock-' + good_id).data('original-stock'));
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
                    $('.price-'+good_id).text(__price_symbol__+result.data.spec_base.price);
                    $('#inputbox-'+good_id).attr('max', result.data.spec_base.inventory);
                    $('.stock-tips .stock-'+ good_id).text(result.data.spec_base.inventory);
                    $('#inputbox-'+good_id).val(1);

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
});
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