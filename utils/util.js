/**
 * 格式化时间
 * @param {Date} date 日期对象
 * @param {String} format 格式字符串
 * @return {String} 格式化后的日期字符串
 */
const formatTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  format = format.replace(/YYYY/g, year);
  format = format.replace(/MM/g, padZero(month));
  format = format.replace(/DD/g, padZero(day));
  format = format.replace(/HH/g, padZero(hour));
  format = format.replace(/mm/g, padZero(minute));
  format = format.replace(/ss/g, padZero(second));

  return format;
};

/**
 * 数字补零
 * @param {Number} n 数字
 * @return {String} 补零后的字符串
 */
const padZero = n => {
  return n < 10 ? '0' + n : '' + n;
};

/**
 * 验证手机号
 * @param {String} phone 手机号
 * @return {Boolean} 是否有效
 */
const isValidPhone = phone => {
  return /^1[3-9]\d{9}$/.test(phone);
};

/**
 * 验证身份证号
 * @param {String} idCard 身份证号
 * @return {Boolean} 是否有效
 */
const isValidIdCard = idCard => {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard);
};

/**
 * 生成随机验证码
 * @param {Number} length 验证码长度
 * @return {String} 验证码
 */
const generateVerifyCode = (length = 4) => {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
};

/**
 * 显示加载提示
 * @param {String} title 提示文字
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  });
};

/**
 * 隐藏加载提示
 */
const hideLoading = () => {
  wx.hideLoading();
};

/**
 * 显示成功提示
 * @param {String} title 提示文字
 * @param {Number} duration 显示时长
 */
const showSuccess = (title, duration = 1500) => {
  wx.showToast({
    title,
    icon: 'success',
    duration
  });
};

/**
 * 显示错误提示
 * @param {String} title 提示文字
 * @param {Number} duration 显示时长
 */
const showError = (title, duration = 1500) => {
  wx.showToast({
    title,
    icon: 'none',
    duration
  });
};

/**
 * 显示确认对话框
 * @param {String} title 标题
 * @param {String} content 内容
 * @param {Function} confirmCallback 确认回调
 * @param {Function} cancelCallback 取消回调
 */
const showConfirm = (title, content, confirmCallback, cancelCallback) => {
  wx.showModal({
    title,
    content,
    success: res => {
      if (res.confirm) {
        confirmCallback && confirmCallback();
      } else if (res.cancel) {
        cancelCallback && cancelCallback();
      }
    }
  });
};

/**
 * 防抖函数
 * @param {Function} fn 要执行的函数
 * @param {Number} delay 延迟时间
 * @return {Function} 防抖后的函数
 */
const debounce = (fn, delay = 500) => {
  let timer = null;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
};

/**
 * 节流函数
 * @param {Function} fn 要执行的函数
 * @param {Number} interval 间隔时间
 * @return {Function} 节流后的函数
 */
const throttle = (fn, interval = 500) => {
  let last = 0;
  return function() {
    const context = this;
    const args = arguments;
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(context, args);
    }
  };
};

module.exports = {
  formatTime,
  isValidPhone,
  isValidIdCard,
  generateVerifyCode,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showConfirm,
  debounce,
  throttle
};
