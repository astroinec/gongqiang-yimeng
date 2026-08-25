《宫墙一梦》图片替换目录

背景图放入：assets/backgrounds/
建议尺寸：1920×1080，WebP 优先。
文件名：
- gate.webp       选秀大殿 / 宫门长街
- snow.webp       雪夜倚梅园 / 余莺儿冒名
- banquet.webp    宫宴 / 木薯粉宴
- chamber.webp    存菊堂 / 滴血验亲
- final.webp      故衣真相 / 终局大殿

角色立绘放入：assets/characters/
建议尺寸：1024×1536，透明背景 WebP。
文件名规则：角色_表情.webp
- zhenhuan_calm.webp / zhenhuan_angry.webp / zhenhuan_hidden.webp
- emperor_calm.webp / emperor_angry.webp
- empress_calm.webp / empress_angry.webp
- huafei_calm.webp / huafei_angry.webp
- meizhuang_calm.webp / meizhuang_hidden.webp
- lingrong_calm.webp / lingrong_angry.webp
- cao_calm.webp
- chun_calm.webp
- qigui_calm.webp / qigui_angry.webp

放入图片后，还需要在 assets/manifest.js 登记路径。例如：

window.GONGQIANG_ASSETS = {
  backgrounds: {
    gate: "assets/backgrounds/gate.webp",
    snow: "assets/backgrounds/snow.webp"
  },
  characters: {
    zhenhuan_calm: "assets/characters/zhenhuan_calm.webp",
    zhenhuan_angry: "assets/characters/zhenhuan_angry.webp"
  }
};

游戏会先寻找“角色_表情”配置，找不到时再尝试“角色_calm”配置；仍找不到则自动使用 CSS 剪影占位，不会报错。
