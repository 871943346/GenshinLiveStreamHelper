// ==UserScript==
// @name         原神直播活动抢码助手(改)
// @namespace    https://github.com/871943346
// @version      3.5.0.1
// @description  一款用于原神直播活动的抢码助手,支持哔哩哔哩、虎牙、斗鱼多个平台的自动抢码,附带一些页面优化功能
// @author       ifeng0188
// @author       871943346
// @match        *://www.bilibili.com/blackboard/activity-award-exchange.html?task_id=*
// @match        *://zt.huya.com/*/pc/index.html
// @match        *://www.douyu.com/topic/ys*
// @icon         https://ys.mihoyo.com/main/favicon.ico
// @grant        unsafeWindow
// @grant        GM_log
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @homepageURL  https://github.com/871943346/GenshinLiveStreamHelper
// @supportURL   https://github.com/871943346/GenshinLiveStreamHelper/issues
// @downloadURL  https://raw.fastgit.org/871943346/GenshinLiveStreamHelper/main/demo.js
// @updateURL    https://raw.fastgit.org/871943346/GenshinLiveStreamHelper/main/demo.js
// @license      GPL-3.0 license
// ==/UserScript==

/*
    3.5.0.1
    斗鱼3.5里程碑和页面净化修复
    仍存在些许问题(待别的大佬修复)
    3.4.0.3
    去除新春限时开播福利(领取难度低)
    斗鱼、虎牙每10s刷新、领经验
    3.4.0.2
    自动打开里程碑-新增跳转到里程碑视图
    新增虎牙、斗鱼0:29:59开始领取新春限时开播福利（已测试成功）
    新增新春限时开播福利已领取后刷新页面
    3.4.0.1
    去掉菜单配置取消的警告框
    斗鱼3.4里程碑和页面净化修复
    直接去除直播会导致控制台出现大量https://shark2.douyucdn.cn/front-publish/下的js报错
    具体等"https://github.com/ifeng0188/GenshinLiveStreamHelper"更新
*/

(function () {
  'use strict';

  // 配置初始化
  if (!GM_getValue('gh_reward_progress')) {
    GM_setValue('gh_reward_progress', 1);
  }
  if (!GM_getValue('gh_start_time')) {
    GM_setValue('gh_start_time', '01:59:59');
  }
  if (!GM_getValue('gh_interval')) {
    GM_setValue('gh_interval', '10,1000,100');
  }
  if (!GM_getValue('gh_autoExpand')) {
    GM_setValue('gh_autoExpand', false);
  }
  if (!GM_getValue('gh_pagePurify')) {
    GM_setValue('gh_pagePurify', false);
  }
  if (!GM_getValue('hyexp')) {
    GM_setValue('gh_hyexp', false);
  }

  // 变量初始化
  let platform = (function () {
    if (location.href.includes('bilibili')) return 'B站';
    if (document.title.includes('原神')) {
      if (location.href.includes('huya') && document.title.includes('直播季'))
        return '虎牙';
      if (location.href.includes('douyu') && document.title.includes('领原石'))
        return '斗鱼';
    }
    return '';
  })();

  let interval = (function () {
    let group = GM_getValue('gh_interval').split(',');
    switch (platform) {
      case 'B站':
        return group[0];
      case '虎牙':
        return group[1];
      case '斗鱼':
        return group[2];
    }
  })();

  // 注册菜单
  GM_registerMenuCommand(
    `设定里程碑进度:${GM_getValue('gh_reward_progress')}（点击修改）`,
    set_reward_progress
  );
  GM_registerMenuCommand(
    `设定抢码时间:${GM_getValue('gh_start_time')}（点击修改）`,
    set_start_time
  );
  GM_registerMenuCommand(
    `设定抢码间隔:${interval} 毫秒（点击修改）`,
    set_interval
  );
  GM_registerMenuCommand(
    `${GM_getValue('gh_autoExpand') ? '✅' : '❌'}自动打开里程碑（点击切换）`,
    switch_autoExpand
  );
  GM_registerMenuCommand(
    `${GM_getValue('gh_pagePurify') ? '✅' : '❌'}页面净化（点击切换）`,
    switch_pagePurify
  );
  GM_registerMenuCommand(
    `${GM_getValue('gh_hyexp') ? '✅' : '❌'}每10s尝试领取经验（点击切换）`,
    switch_hyexp
  );

  function set_reward_progress() {
    let temp = parseInt(
      prompt(
        '请输入里程碑进度,输入范围1~6,天数从小到大对应相关奖励',
        GM_getValue('gh_reward_progress')
      )
    );
    if (temp) {
      if (temp > 6 || temp < 1) {
        alert('格式错误,请重新输入');
        return;
      }
      GM_setValue('gh_reward_progress', temp);
      alert('设置成功,请刷新页面使之生效');
    } else {
      //   alert('格式错误,请重新输入')
    }
  }

  function set_start_time() {
    let temp = prompt(
      '请输入抢码时间,格式示例:01:59:59',
      GM_getValue('gh_start_time')
    );
    if (/^(\d{2}):(\d{2}):(\d{2})$/.test(temp)) {
      GM_setValue('gh_start_time', temp);
      alert('设置成功,请刷新页面使之生效');
    } else {
      //   alert('格式错误,请重新输入')
    }
  }

  function set_interval() {
    let temp = prompt(
      '请输入抢码间隔,格式示例:10,1000,100,即代表B站平台间隔为10毫秒 虎牙平台间隔为1000毫秒 斗鱼平台间隔为100毫秒',
      GM_getValue('gh_interval')
    );
    if (/^(\d+),(\d+),(\d+)$/.test(temp)) {
      GM_setValue('gh_interval', temp);
      alert('设置成功,请刷新页面使之生效');
    } else {
      //   alert('格式错误,请重新输入')
    }
  }

  function switch_autoExpand() {
    GM_setValue('gh_autoExpand', !GM_getValue('gh_autoExpand'));
    alert('切换成功,请刷新页面使之生效');
  }

  function switch_pagePurify() {
    GM_setValue('gh_pagePurify', !GM_getValue('gh_pagePurify'));
    alert('切换成功,请刷新页面使之生效');
  }
  function switch_hyexp() {
    GM_setValue('gh_hyexp', !GM_getValue('gh_hyexp'));
    alert('切换成功,请刷新页面使之生效');
    window.location.reload();
  }

  // Run
  if (platform) {
    log(`当前直播平台为${platform},助手开始运行`);
    run_purify_process(); //里程碑、页面净化
    run_rob_process(); //抢码
    run_huYa_Exp(); //虎牙尝试领取经验
    log('感谢你的使用,如本项目对你有帮助可以帮忙点个Star');
    log('https://github.com/871943346/GenshinLiveStreamHelper/');
    log('From:https://github.com/ifeng0188/GenshinLiveStreamHelper');
  }

  // 运行净化进程
  function run_purify_process() {
    if (GM_getValue('gh_autoExpand')) {
      switch (platform) {
        case '虎牙':
          document.querySelectorAll('.J_item')[1].click();
          jump('matchComponent15');
          break;
        case '斗鱼':
          let timer = setInterval(() => {
            //   if (document.querySelectorAll('#bc68')[0]){}else{window.location.reload();}
            if (document.querySelectorAll('#bc20')[0]) {
              clearInterval(timer);
              document.querySelectorAll('#bc72')[0].click();
              jump('bc72');
            }
          }, 1000);
          break;
      }
    }
    if (GM_getValue('gh_pagePurify')) {
      switch (platform) {
        case '斗鱼':
          let timer = setInterval(() => {
            if (document.querySelectorAll('#bc3')[0]) {
              clearInterval(timer);
              clearElement(document.querySelectorAll('#bc3')[0].parentNode);
            }
          }, 1000);
      }
    }
  }

  // 运行抢码进程
  function run_rob_process() {
    // 显示注意事项
    if (!GM_getValue('gh_autoExpand')) {
      switch (platform) {
        case '虎牙':
          log('★请手动打开里程碑页面★');
          break;
        case '斗鱼':
          log('★请手动打开里程碑页面,并通过领取其他奖励,完成一次验证码★');
          break;
      }
    }

    // 变量初始化
    let level = parseInt(GM_getValue('gh_reward_progress'));
    let start_time = GM_getValue('gh_start_time').split(':');

    log(
      `助手计划于${parseInt(start_time[0])}点${parseInt(
        start_time[1]
      )}分${parseInt(
        start_time[2]
      )}秒开始领取第${level}档的里程碑奖励（如有误请自行通过菜单修改配置）`
    );

    // 等待开抢
    let timer = setInterval(() => {
      let date = new Date();
      if (
        date.getHours() == parseInt(start_time[0]) &&
        date.getMinutes() == parseInt(start_time[1]) &&
        date.getSeconds() >= parseInt(start_time[2])
      ) {
        clearInterval(timer);
        rob();
      }
    }, 100);

    // 抢码实现
    function rob() {
      log('助手开始领取,如若出现数据异常为正常情况');
      if (platform == '虎牙') {
        setInterval(() => {
          huYaExp();
        }, interval);
      }
      setInterval(() => {
        switch (platform) {
          case '哔哩哔哩':
            document.querySelectorAll('.exchange-button')[0].click();
            break;
          case '虎牙':
            document
              .querySelectorAll('.exp-award li button')
              [level - 1].click();
            break;
          case '斗鱼':
            document
              .querySelectorAll('.wmTaskV3GiftBtn-btn')
              [level - 1].click();
            break;
        }
      }, interval);
    }
  }

  // 虎牙领取经验
  function huYaExp() {
    document.querySelectorAll('div[title="10经验值"]+button')[0].click();
    document.querySelectorAll('.exp-award .reload')[0].click();
  }

  //虎牙每10S尝试领取经验
  function run_huYa_Exp() {
    if (GM_getValue('gh_hyexp')) {
      switch (platform) {
        case '虎牙':
          setInterval(() => {
            huYaExp();
          }, 10000);
          setInterval(() => {
            if (document.querySelectorAll('.dcpf-btn-confirm')[0]) {
              document.querySelectorAll('.dcpf-btn-confirm')[0].click();
            }
          }, 10);
          break;
        case '斗鱼':
          setInterval(() => {
            document.querySelectorAll('.wmTaskV3Reload')[0].click();
          }, 10000);
          breakl;
      }
    }
  }

  // 移除元素
  function clearElement(el) {
    el.parentNode.removeChild(el);
  }

  // 跳转
  function jump(id) {
    document.querySelector('#' + id).scrollIntoView();
  }

  // 日志
  function log(msg) {
    console.info(`【原神直播活动抢码助手】${msg}`);
  }
})();
