Page({
  data: {
    statusBarHeight: 20, // 默认值，会在onLoad中获取实际高度
    latestGoods: [
      {
        id: 1,
        name: '这是美食的标题这是美食的标题',
        image: '/images/food1.png',
        priceDesc: '这是美食的价格',
        stock: 20,
        price: '22'
      },
      {
        id: 2,
        name: '双层牛肉汉堡',
        image: '/images/food1.png',
        priceDesc: '超值套餐',
        stock: 18,
        price: '38'
      },
      {
        id: 3,
        name: '招牌炸鸡全家桶',
        image: '/images/food1.png',
        priceDesc: '家庭分享装',
        stock: 5,
        price: '99'
      },
      {
        id: 4,
        name: '黄金薯条大份',
        image: '/images/food1.png',
        priceDesc: '配番茄酱',
        stock: 50,
        price: '18'
      },
      {
        id: 5,
        name: '冰淇淋圣代',
        image: '/images/food1.png',
        priceDesc: '草莓口味',
        stock: 15,
        price: '12'
      },
      {
        id: 6,
        name: '鲜榨橙汁中杯',
        image: '/images/food1.png',
        priceDesc: '无糖版',
        stock: 28,
        price: '15'
      },
      {
        id: 7,
        name: '意式浓缩咖啡',
        image: '/images/food1.png',
        priceDesc: '双倍浓缩',
        stock: 32,
        price: '22'
      },
      {
        id: 8,
        name: '巧克力慕斯蛋糕',
        image: '/images/food1.png',
        priceDesc: '精品甜点',
        stock: 8,
        price: '28'
      },
      {
        id: 9,
        name: '水果沙拉大份',
        image: '/images/food1.png',
        priceDesc: '时令水果',
        stock: 12,
        price: '26'
      },
      {
        id: 10,
        name: '芝士焗饭',
        image: '/images/food1.png',
        priceDesc: '海鲜口味',
        stock: 7,
        price: '36'
      },
      {
        id: 11,
        name: '意大利面',
        image: '/images/food1.png',
        priceDesc: '番茄肉酱',
        stock: 16,
        price: '42'
      },
      {
        id: 12,
        name: '田园蔬菜沙拉',
        image: '/images/food1.png',
        priceDesc: '低卡健康',
        stock: 22,
        price: '18'
      },
      {
        id: 13,
        name: '超级至尊披萨',
        image: '/images/food1.png',
        priceDesc: '9寸家庭装',
        stock: 3,
        price: '68'
      },
      {
        id: 14,
        name: '烤翅拼盘',
        image: '/images/food1.png',
        priceDesc: '混合口味',
        stock: 14,
        price: '45'
      },
      {
        id: 15,
        name: '鲜虾鸡肉卷',
        image: '/images/food1.png',
        priceDesc: '墨西哥风味',
        stock: 19,
        price: '32'
      },
      {
        id: 16,
        name: '豪华海鲜饭',
        image: '/images/food1.png',
        priceDesc: '西班牙风味',
        stock: 6,
        price: '88'
      },
      {
        id: 17,
        name: '香煎三文鱼',
        image: '/images/food1.png',
        priceDesc: '挪威进口',
        stock: 9,
        price: '78'
      },
      {
        id: 18,
        name: '日式拉面',
        image: '/images/food1.png',
        priceDesc: '正宗豚骨汤底',
        stock: 25,
        price: '39'
      },
      {
        id: 19,
        name: '韩式石锅拌饭',
        image: '/images/food1.png',
        priceDesc: '配泡菜',
        stock: 11,
        price: '42'
      },
      {
        id: 20,
        name: '泰式冬阴功汤',
        image: '/images/food1.png',
        priceDesc: '酸辣口味',
        stock: 17,
        price: '35'
      },
      {
        id: 21,
        name: '越南牛肉河粉',
        image: '/images/food1.png',
        priceDesc: '配香草',
        stock: 21,
        price: '38'
      },
      {
        id: 22,
        name: '印度咖喱鸡',
        image: '/images/food1.png',
        priceDesc: '配印度飞饼',
        stock: 13,
        price: '46'
      },
      {
        id: 23,
        name: '法式蜗牛',
        image: '/images/food1.png',
        priceDesc: '配蒜香黄油',
        stock: 4,
        price: '88'
      },
      {
        id: 24,
        name: '英式下午茶套餐',
        image: '/images/food1.png',
        priceDesc: '配司康饼',
        stock: 10,
        price: '58'
      },
      {
        id: 25,
        name: '美式BBQ烤肋排',
        image: '/images/food1.png',
        priceDesc: '配烤玉米',
        stock: 7,
        price: '98'
      },
      {
        id: 26,
        name: '德国猪肘',
        image: '/images/food1.png',
        priceDesc: '配酸菜',
        stock: 5,
        price: '88'
      },
      {
        id: 27,
        name: '俄罗斯红菜汤',
        image: '/images/food1.png',
        priceDesc: '配酸奶油',
        stock: 15,
        price: '32'
      },
      {
        id: 28,
        name: '希腊沙拉',
        image: '/images/food1.png',
        priceDesc: '配橄榄油',
        stock: 20,
        price: '28'
      },
      {
        id: 29,
        name: '墨西哥玉米卷',
        image: '/images/food1.png',
        priceDesc: '配鳄梨酱',
        stock: 18,
        price: '36'
      },
      {
        id: 30,
        name: '新加坡辣椒蟹',
        image: '/images/food1.png',
        priceDesc: '配馒头',
        stock: 2,
        price: '128'
      }
    ]
  },

  onLoad: function(options) {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
  },

  onReady: function() {
    // 在页面渲染完成后计算固定区域的高度
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      query.select('.fixed-content').boundingClientRect();
      query.exec((res) => {
        if (res[0]) {
          // 获取系统信息，计算可用高度
          const systemInfo = wx.getSystemInfoSync();
          const windowHeight = systemInfo.windowHeight;
          const fixedHeight = res[0].height;
          
          this.setData({
            fixedContentHeight: res[0].height,
            scrollHeight: windowHeight - res[0].height - 30 // 减去30px，为底部留出更多空间
          });
        }
      });
    }, 100); // 延迟100ms确保页面已渲染
  },

  // 导航到数字核销页面
  navigateToDigitalVerify: function() {
    wx.navigateTo({
      url: '/pages/productindex/verify/digital'
    });
  },

  // 导航到扫码核销页面
  navigateToScanVerify: function() {
    wx.scanCode({
      success: (res) => {
        // 处理扫码结果
        console.log('扫码结果:', res);
        
        // 将扫码结果传递给数字核销页面
        wx.navigateTo({
          url: `/pages/productindex/verify/digital?code=${res.result}`
        });
      },
      fail: (err) => {
        console.error('扫码失败:', err);
        // 可以在这里添加扫码失败的处理逻辑，例如提示用户
        wx.showToast({
          title: '扫码取消或失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 导航到添加商品页面
  navigateToAddGoods: function() {
    wx.navigateTo({
      url: '/pages/productindex/newproduct/index'
    });
  },

  // 显示更多选项
  showMoreOptions: function() {
    wx.showActionSheet({
      itemList: ['店铺设置', '消息通知', '帮助中心'],
      success: function(res) {
        console.log(res.tapIndex);
        // 根据点击的选项执行相应操作
      }
    });
  },
  
  // 扫码
  scanCode: function() {
    wx.scanCode({
      success: (res) => {
        console.log(res);
        // 处理扫码结果
      }
    });
  },

  // 处理图片加载错误
  handleImageError: function(e) {
    const index = e.currentTarget.dataset.index;
    // 不修改原始数据，只是在UI上显示为灰色背景
  }
}); 