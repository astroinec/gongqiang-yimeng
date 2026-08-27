const STORAGE_KEY = "gongqiang-save-v2";
const GALLERY_KEY = "gongqiang-endings-v2";
const ACHIEVEMENT_KEY = "gongqiang-achievements-v2";

const initialState = () => ({
  current: "intro_1",
  stats: {
    favor: 0,
    strategy: 0,
    heart: 0,
    reputation: 0,
    suspicion: 0,
    ruthlessness: 0,
    health: 5
  },
  relations: {
    meizhuang: 0,
    lingrong: 0,
    emperor: 0,
    huafei: 0,
    empress: 0,
    cao: 0,
    chun: 0,
    qigui: 0
  },
  flags: {},
  counters: { favor: 0, bold: 0, retreat: 0, help: 0, avoidAlliance: 0 },
  history: [],
  startedAt: Date.now()
});

const endings = {
  freedom: {
    title: "愿得一心人",
    seal: "归",
    hint: "看清真相，也为自己留下归路",
    desc: "宫门在身后缓缓合上。你没有等谁来成全，也没有把余生押在一句旧誓上。天地辽阔，终于可以只做自己。"
  },
  ruler: {
    title: "六宫之主",
    seal: "权",
    hint: "证据、城府与仍愿相助的人缺一不可",
    desc: "你终于坐上了许多人梦寐以求的位置。满殿低首，无人再敢替你安排命运。只是胜者的宫殿，也可能是另一座更大的牢笼。"
  },
  substitute: {
    title: "菀菀类卿",
    seal: "替",
    hint: "盛宠仍在，偏爱却另有来处",
    desc: "你曾以为那份偏爱只属于你。旧衣落地，故人眉眼从尘封往事里浮现——原来盛宠之下，藏着另一个名字。"
  },
  exile: {
    title: "冷宫长夜",
    seal: "蛰",
    hint: "没有赢，也还没有真正输",
    desc: "门锁落下，宫灯远去。所有人都以为你的故事已经结束，只有你知道：冷宫最不缺的，就是重新把旧账想明白的时间。"
  },
  ruin: {
    title: "玉石俱焚",
    seal: "焚",
    hint: "你没有赢，但也不肯让棋局继续",
    desc: "账册、密信和旧案在殿前铺开。你亲手掀翻了这张棋盘，也把自己留在了废墟中央。宫墙还在，旧规则却裂开了一道缝。"
  },
  early_fail: {
    title: "宫斗零分",
    seal: "寄",
    hint: "锋芒、天真或恋爱脑都可能提前结算",
    desc: "宫里从不缺聪明人，缺的是知道何时开口、何时闭嘴的人。你的故事，在所有人反应过来之前就先停在了这一页。"
  }
};

const achievements = {
  zero: { title: "宫斗零分选手", desc: "在故事过半前提前出局", check: (s, c) => c.ending === "early_fail" && s.history.length <= 6 },
  spotlight: { title: "显眼包的一生", desc: "所有能出头的地方都要出头", check: s => s.flags.showed_edge && s.flags.challenged_huafei && s.flags.danced },
  meizhuang: { title: "眉姐姐保卫战", desc: "与眉庄情分深厚并为她翻案", check: s => s.relations.meizhuang >= 5 && (s.flags.saved_ally_secret || s.flags.saved_ally_public) },
  lingrong: { title: "一念之善", desc: "始终没有把陵容当作棋子", check: s => s.relations.lingrong >= 4 && !s.flags.used_lingrong },
  balance: { title: "端水大师", desc: "眉庄、陵容与淳儿都愿意相信你", check: s => s.relations.meizhuang >= 3 && s.relations.lingrong >= 2 && s.relations.chun >= 2 },
  lonely: { title: "谁都不信", desc: "一路避开所有结盟机会", check: s => s.counters.avoidAlliance >= 3 },
  lover: { title: "恋爱脑初级证书", desc: "连续把感情放在局势之前", check: s => s.counters.favor >= 4 },
  knife: { title: "藏锋于袖", desc: "布局很深，却没有留下恶名", check: s => s.stats.strategy >= 8 && s.stats.reputation <= 1 },
  evidence: { title: "证据收藏家", desc: "集齐三条能够翻盘的证据", check: s => s.flags.powder_evidence && s.flags.found_evidence && s.flags.qigui_counter },
  heart: { title: "故心未改", desc: "保住本心并走出宫墙", check: (s, c) => c.ending === "freedom" && s.stats.heart >= 8 },
  destroy: { title: "本宫不玩了", desc: "亲手掀翻整张棋盘", check: (s, c) => c.ending === "ruin" },
  collector: { title: "全图鉴受害者", desc: "见过所有六种命运", check: (s, c) => c.unlockedEndings >= Object.keys(endings).length }
};

const story = {
  intro_1: node("序章 · 宫门", 2, "gate", "旁白", "zhenhuan", "calm", "雍正元年，选秀的名册送入宫中。你本无意争宠，只盼平安度日。可宫门一开，每一次沉默与开口，都将成为他日的因果。", "intro_2"),
  intro_2: {
    chapter: "第一章 · 初入宫门", progress: 6, scene: "gate", speaker: "嬷嬷", portrait: "momo", mood: "calm",
    text: "殿前问话将至。众人都在打量你的衣饰与神情。嬷嬷低声提醒：宫里最忌锋芒毕露，也最怕无人记得。",
    choices: [
      choice("素衣淡妆，只求落选", "你避开了多数人的目光，却仍有人记住了你。", { favor: -1, strategy: 1, heart: 1 }, { emperor: 1 }, ["kept_low"], ["retreat"], "selection_low"),
      choice("从容应答，不卑不亢", "殿内短暂安静，几道目光都重新落在你身上。", { favor: 1, strategy: 1 }, { emperor: 1, empress: 1 }, [], [], "selection_calm"),
      choice("引经据典，叫人过目难忘", "你出了风头，也让一些人提前记住了你的名字。", { favor: 2, reputation: 2, suspicion: 1 }, { emperor: 2, huafei: -1 }, ["showed_edge"], ["bold", "favor"], "selection_bold")
    ]
  },
  selection_low: node("第一章 · 初入宫门", 10, "gate", "皇帝", "emperor", "calm", "你刻意低眉，答得平淡。可一阵风吹落鬓边海棠，御座上的人忽然停了目光：抬起头来。", "first_choice"),
  selection_calm: node("第一章 · 初入宫门", 10, "gate", "皇帝", "emperor", "calm", "不张扬，也不怯懦。你答完最后一句，殿内短暂安静。皇帝只道：留牌子，赐香囊。", "first_choice"),
  selection_bold: node("第一章 · 初入宫门", 10, "gate", "华妃", "huafei", "angry", "你的名字很快传遍候选秀女之间。有人赞你聪慧，也有人冷笑：尚未入宫，便急着叫人记住了。", "first_choice"),
  first_choice: {
    chapter: "第一章 · 初入宫门", progress: 14, scene: "gate", speaker: "旁白", portrait: "zhenhuan", mood: "calm",
    text: "圣旨已下，你终究留在了宫中。入夜后，眉庄托人送来暖手炉，陵容则在门外迟疑许久。你先见谁？",
    choices: [
      choice("先迎眉庄，旧友情分更重", "眉庄没有多说，只把暖手炉往你手里推了推。", { heart: 1 }, { meizhuang: 3, lingrong: -1 }, ["meizhuang_close"], ["help"], "xia_conflict"),
      choice("亲自去接陵容，不叫她难堪", "陵容记住的不是礼物，而是你亲自走到门外的那几步。", { heart: 2 }, { lingrong: 3, meizhuang: 1 }, ["lingrong_kind"], ["help"], "xia_conflict"),
      choice("谁都不见，先摸清宫中局势", "今夜无人打扰，只是两盏送来的灯都渐渐冷了。", { strategy: 2 }, { meizhuang: -1, lingrong: -1 }, [], ["avoidAlliance"], "xia_conflict")
    ]
  },
  xia_conflict: {
    chapter: "第二章 · 宫门第一课", progress: 19, scene: "gate", speaker: "夏冬春", portrait: "xiadongchun", mood: "angry",
    text: "御花园里，夏冬春拦住陵容，讥她出身寒微。华妃的仪仗正从长街尽头逼近，所有人都在等着看谁先犯错。",
    choices: [
      choice("拉住陵容，低声劝她先退", "陵容退到你身后。她没有道谢，却把这份情记得很深。", { strategy: 1, heart: 1 }, { lingrong: 2, huafei: 1 }, ["protected_lingrong"], ["help", "retreat"], "xia_after"),
      choice("当众回敬夏冬春，不许她欺人", "长街忽然安静。有人佩服你的胆量，也有人等着看你如何收场。", { reputation: 2, suspicion: 2, heart: 1 }, { lingrong: 2, huafei: -3 }, ["challenged_huafei"], ["bold", "help"], "xia_after"),
      choice("移开目光，装作没有看见", "你安全离开了长街，陵容也学会了不再向你求助。", { strategy: 1, heart: -1 }, { lingrong: -3, huafei: 1 }, ["ignored_lingrong"], ["avoidAlliance"], "xia_after")
    ]
  },
  xia_after: node("第二章 · 宫门第一课", 22, "gate", "华妃", "huafei", "angry", "仪仗停下。华妃只看了一眼，便让人赏下宫规。宫门第一课不是谁有理，而是谁能承担开口后的代价。", "snow_1"),
  snow_1: {
    chapter: "第三章 · 雪夜初遇", progress: 27, scene: "snow", speaker: "旁白", portrait: "zhenhuan", mood: "calm",
    text: "冬夜雪深，你独自在园中祈愿。远处脚步声近，一个自称果郡王的人停在梅枝下，问你为何深夜在此。",
    choices: [
      choice("如实说出身份与心愿", "他听完没有笑，只说这样的愿望在宫里太奢侈。", { favor: 2, heart: 1, strategy: -1 }, { emperor: 3 }, ["trusted_emperor"], ["favor"], "snow_truth"),
      choice("隐去身份，只说是倚梅园宫女", "逆风如解意，容易莫摧残。他记住了诗，也记住了梅影里的人。", { strategy: 2 }, { emperor: 1 }, ["identity_hidden"], [], "snow_hidden"),
      choice("反问他夜入禁苑所为何事", "他没有恼，只笑你胆子不小。你也没有先把信任交出去。", { strategy: 1, heart: 1, suspicion: 1 }, { emperor: 1 }, ["tested_emperor"], [], "snow_test")
    ]
  },
  snow_truth: node("第三章 · 雪夜初遇", 31, "snow", "神秘男子", "emperor", "calm", "愿得一心人，白首不相离。他折下一枝梅花，像在听你的愿望，也像在听一个不合时宜的笑话。", "yuying_1"),
  snow_hidden: node("第三章 · 雪夜初遇", 31, "snow", "神秘男子", "emperor", "calm", "你借诗掩去身份。他没有追问，只说来日若再听见这句诗，必会认得旧人。", "yuying_1"),
  snow_test: node("第三章 · 雪夜初遇", 31, "snow", "神秘男子", "emperor", "calm", "你们都没有交代真正的身份。雪落在梅枝上，这场相遇从一开始便藏着试探。", "yuying_1"),
  yuying_1: {
    chapter: "第四章 · 借来的荣宠", progress: 36, scene: "snow", speaker: "余莺儿", portrait: "yuyinger", mood: "calm",
    text: "数日后，一个宫女凭借倚梅园的诗句骤然得宠。她在廊下唱着你说过的话，甚至连雪夜里的细节都分毫不差。",
    choices: [
      choice("立刻揭穿她冒名邀宠", "真相传得很快。你夺回了名字，也让更多人看见了你的锋芒。", { favor: 2, reputation: 2, suspicion: 2 }, { emperor: 2, empress: -1 }, ["exposed_yuying"], ["bold", "favor"], "yuying_after"),
      choice("暂不揭穿，暗中留下她说谎的证据", "你把那句诗重新写了一遍，压在匣底。假的终究经不起第二次对问。", { strategy: 3 }, { cao: 1 }, ["yuying_evidence"], [], "yuying_after"),
      choice("把消息告诉陵容，让她替你试探", "陵容替你开了口，也第一次知道自己可以成为你手里的刀。", { strategy: 2, ruthlessness: 1 }, { lingrong: -2 }, ["used_lingrong", "yuying_evidence"], [], "yuying_after")
    ]
  },
  yuying_after: node("第四章 · 借来的荣宠", 39, "snow", "旁白", "zhenhuan", "calm", "冒名者的荣宠像雪地里借来的火，亮得突然，也灭得很快。你第一次发现：真相何时说出口，比真相本身更有分量。", "banquet_1"),
  banquet_1: {
    chapter: "第五章 · 宫宴惊鸿", progress: 44, scene: "banquet", speaker: "皇后", portrait: "empress", mood: "calm",
    text: "宫宴上乐师忽然称病，满殿目光落在你身上。皇后温声道：听闻莞常在通晓音律，不如替大家解个闷。",
    choices: [
      choice("起身应下，独舞惊鸿", "一舞终了，满殿称赞。华妃手中的酒盏却再没有放下。", { favor: 3, reputation: 3, suspicion: 2, strategy: -1 }, { emperor: 3, huafei: -3, empress: -1 }, ["danced"], ["bold", "favor"], "banquet_dance"),
      choice("请眉庄抚琴，你只清唱相和", "琴声与歌声彼此成全。你没有独占风头，却让旧日情分更稳。", { favor: 1, strategy: 1 }, { meizhuang: 2, emperor: 1 }, ["shared_stage"], ["help"], "banquet_together"),
      choice("称病退让，不做众矢之的", "皇后笑意不减，眼底却多了一层审视：太懂得藏的人，也未必无害。", { favor: -1, strategy: 2, heart: 1, reputation: -1 }, { empress: -1 }, ["avoided_spotlight"], ["retreat"], "banquet_retreat")
    ]
  },
  banquet_dance: node("第五章 · 宫宴惊鸿", 47, "banquet", "华妃", "huafei", "angry", "贱人就是矫情。她说得很轻，整座宫宴却都听见了。你知道，从此再无真正的退路。", "cassava_1"),
  banquet_together: node("第五章 · 宫宴惊鸿", 47, "banquet", "眉庄", "meizhuang", "calm", "眉庄看你一眼，已懂你的用意。风头会散，能在风头里拉住你的人却不多。", "cassava_1"),
  banquet_retreat: node("第五章 · 宫宴惊鸿", 47, "banquet", "皇后", "empress", "calm", "你避过了一次出头，也让皇后重新估量你的分量。有时候不争，才最让人难以安心。", "cassava_1"),
  cassava_1: {
    chapter: "第六章 · 木薯粉宴", progress: 52, scene: "banquet", speaker: "淳儿", portrait: "chun", mood: "calm",
    text: "午后小宴，淳儿伸手去取一碟新做的点心。你闻到甜香里混着一丝生涩，曹琴默则不动声色地看向华妃。",
    choices: [
      choice("打翻点心，先把淳儿拉开", "点心碎了一地。淳儿吓得脸白，却从此把你的话当真。", { heart: 2, suspicion: 1, reputation: 1 }, { chun: 4, huafei: -1 }, ["saved_chun"], ["help", "bold"], "cassava_after"),
      choice("悄悄调换碟子，留下一小块作证", "没有人当场失态，但那块点心被你封进了证物袋。", { strategy: 3 }, { chun: 2, cao: 2 }, ["saved_chun", "powder_evidence"], [], "cassava_after"),
      choice("按兵不动，观察谁最先露出破绽", "淳儿病了一场。你看清了几个人的反应，也失去了一份不设防的信任。", { strategy: 2, ruthlessness: 2, heart: -2 }, { chun: -4, cao: 2 }, ["watched_chun_hurt"], ["avoidAlliance"], "cassava_after")
    ]
  },
  cassava_after: node("第六章 · 木薯粉宴", 55, "banquet", "曹琴默", "cao", "calm", "曹琴默低声道：莞嫔果然心细。你听得出这不是夸赞，而是一个善于观局的人在确认你究竟是哪一种对手。", "ally_1"),
  ally_1: {
    chapter: "第七章 · 盟友受难", progress: 60, scene: "chamber", speaker: "流朱", portrait: "liuzhu", mood: "angry",
    text: "眉庄被指假孕争宠，禁足存菊堂。你手中只有一条不完整线索：太医曾在案发前被秘密调换。此时站出来，也许会把自己拖下水。",
    choices: [
      choice("当殿求情，愿以性命担保", "皇帝拂袖而去。情分保住了，翻案的机会却更远了。", { heart: 2, strategy: -2, favor: -1, health: -1, reputation: 1 }, { meizhuang: 4, emperor: -2 }, ["saved_ally_public"], ["help", "bold"], "ally_public"),
      choice("表面疏远，暗中查太医来往", "你没有叫她一声姐姐，却把每一个经手药方的人都记了下来。", { strategy: 3 }, { meizhuang: 3, cao: 1 }, ["saved_ally_secret", "found_evidence"], [], "ally_secret"),
      choice("立刻切割，保住自己再说", "你亲手烧掉往来书信。宫中人人称你聪明，往后却少有人敢把后背交给你。", { strategy: 1, heart: -2, ruthlessness: 2 }, { meizhuang: -5, lingrong: -1 }, ["abandoned_ally"], ["avoidAlliance"], "ally_abandon")
    ]
  },
  ally_public: node("第七章 · 盟友受难", 64, "chamber", "皇帝", "emperor", "angry", "后宫之中最不值钱的，就是誓言。你与眉庄一同被禁足，至少门内还有一个人知道你没有舍弃她。", "qigui_1"),
  ally_secret: node("第七章 · 盟友受难", 64, "chamber", "眉庄", "meizhuang", "calm", "三日后，温实初送来一张药方，墨迹来自已经调任的太医。证据终于有了缺口。", "qigui_1"),
  ally_abandon: node("第七章 · 盟友受难", 64, "chamber", "旁白", "zhenhuan_final", "hidden", "火光很暖，却照不亮心里那块空处。你保住了自己，也学会了胜利有时没有人可以分享。", "qigui_1"),
  qigui_1: {
    chapter: "第八章 · 滴血验亲", progress: 69, scene: "chamber", speaker: "祺贵人", portrait: "qigui", mood: "angry",
    text: "祺贵人捧着密信跪在殿前，指你私通外臣。皇后要滴血验亲，曹琴默悄悄避开你的目光，陵容则站在最远处。",
    choices: [
      choice("调出旧档与药方，逐条反证", "你没有急着喊冤，只把每个时间和证人放到了所有人面前。", { strategy: 3, reputation: 1 }, { qigui: -3, empress: -2 }, ["qigui_counter"], [], "qigui_after"),
      choice("逼陵容当众为你作证", "陵容开了口。她救了你，也终于确认自己在你眼中只是可用之人。", { favor: 1, ruthlessness: 2 }, { lingrong: -4, qigui: -2 }, ["forced_lingrong", "qigui_counter"], ["favor"], "qigui_after"),
      choice("先认管教不严，借机反查皇后宫人", "你退了半步，却让所有人开始怀疑告发背后的手。", { strategy: 2, reputation: -1 }, { empress: -3, cao: 1 }, ["suspected_empress"], ["retreat"], "qigui_after")
    ]
  },
  qigui_after: node("第八章 · 滴血验亲", 72, "chamber", "皇后", "empress", "angry", "皇后拨动佛珠，仍是一副端庄模样。只是从今日起，你们都知道彼此已经没有回头路。", "reveal_1"),
  reveal_1: {
    chapter: "第九章 · 故衣真相", progress: 78, scene: "final", speaker: "皇后", portrait: "empress", mood: "calm",
    text: "册封礼前，一件旧衣被送到你面前。宫人神色古怪，衣上绣样与画像中的纯元皇后别无二致。你忽然想起这些年来所有似曾相识的偏爱。",
    choices: [
      choice("立刻换下旧衣，暗查画像与旧档", "你终于给那些相似的目光找到了另一个名字。", { strategy: 2, heart: 1 }, { emperor: -1, empress: -1 }, ["saw_substitute_truth"], [], "final_1"),
      choice("仍穿旧衣赴宴，赌皇帝对你的真心", "你把答案交给了那个人，也把自己放在最容易受伤的位置。", { favor: 2, heart: -1 }, { emperor: 2 }, ["wore_old_dress"], ["favor"], "final_1"),
      choice("烧掉旧衣，连夜为自己留出宫退路", "火焰吞掉旧衣时，你第一次没有等待任何人的裁决。", { heart: 3, favor: -2, strategy: 1 }, { emperor: -2 }, ["prepared_escape", "saw_substitute_truth"], ["retreat"], "final_1")
    ]
  },
  final_1: {
    chapter: "终章 · 宫墙一梦", progress: 88, scene: "final", speaker: "皇帝", portrait: "emperor", mood: "angry",
    text: "殿门关闭。皇帝问你是否知错，皇后在帘后静候，旧日盟友的命运也悬在今夜。最后一次选择不是如何讨好谁，而是要成为什么样的人。",
    choices: [
      conditionalChoice("交出证据，联合旧盟反击", "你把证据一件件摆上殿前，旧日援手也终于有了回声。", s => s.stats.strategy >= 5 && (s.flags.found_evidence || s.flags.powder_evidence) && (s.relations.meizhuang >= 2 || s.relations.cao >= 2), "你还缺一份能让满宫闭嘴的证据", { strategy: 1 }, { meizhuang: 1 }, ["chose_power"], [], "resolve"),
      conditionalChoice("揭开替身真相，斩断这段旧情", "你没有再争辩自己像不像谁，只问他可曾真正看见过你。", s => s.flags.saw_substitute_truth, "旧衣之下的真相仍隔着一层", { heart: 2, favor: -2 }, { emperor: -3 }, ["chose_truth"], [], "resolve"),
      conditionalChoice("收起所有辩解，按退路离开宫门", "宫门外的路未必平坦，但每一步都终于由你自己决定。", s => s.flags.prepared_escape && s.stats.heart >= 4, "宫墙之外尚无人接应", { heart: 1 }, {}, ["chose_freedom"], [], "resolve"),
      conditionalChoice("公开所有密信，让整座后宫一起翻案", "你不再争谁输谁赢，只把这座宫墙最不愿被人看见的账全部摊开。", s => countEvidence(s) >= 3 && (s.stats.ruthlessness >= 2 || s.stats.reputation >= 4), "你还没有足够的把柄掀翻棋盘", { ruthlessness: 3, reputation: 2 }, { empress: -4, huafei: -2 }, ["chose_destroy"], ["bold"], "resolve"),
      choice("低头认错，只求保住眼前圣眷", "你保住了今夜，也默认把未来交回那个人手中。", { favor: 2, heart: -2 }, { emperor: 2 }, ["chose_favor"], ["favor"], "resolve")
    ]
  },
  resolve: { chapter: "终章 · 尘埃落定", progress: 100, scene: "final", speaker: "旁白", portrait: "zhenhuan_final", mood: "calm", text: "宫灯一盏盏熄灭。此前的每一次退让、试探、援手与背弃，都在此刻汇成了你的命运。", ending: true }
};

const scenePrologues = {
  intro_2: [
    { speaker: "旁白", portrait: "zhenhuan", mood: "calm", text: "你出身官宦，却从未把入宫视作归宿。父亲只盼你平安，母亲则提醒：御前的一句话，足以改变一家人的命运。" },
    { speaker: "甄嬛", portrait: "zhenhuan", mood: "calm", text: "殿门打开前，你最后整理了一次衣袖。落选是原本的打算，可真正站到这里，退与进都不再只关乎你自己。" }
  ],
  first_choice: [
    { speaker: "旁白", portrait: "zhenhuan", mood: "calm", text: "新入宫的秀女被分别安置。沈眉庄与你自幼相识，端庄稳重；安陵容家世寒微，选秀时曾受你相助。" },
    { speaker: "流朱", portrait: "liuzhu", mood: "calm", text: "两边的人几乎同时到了门口。先迎谁，本是一件小事。可在宫里，小事最容易被记成态度。" }
  ],
  xia_conflict: [
    { speaker: "旁白", portrait: "lingrong", mood: "calm", text: "安陵容因衣料朴素，被家世优越的夏冬春当众奚落。她不敢还口，只能死死攥住袖口。" },
    { speaker: "颂芝", portrait: "songzhi", mood: "angry", text: "与此同时，宠冠后宫的华妃仪仗已经转入长街。若冲突惊扰了她，谁先开口，谁就可能先被拿来立威。" }
  ],
  snow_1: [
    { speaker: "旁白", portrait: "zhenhuan", mood: "calm", text: "入宫后你故意称病避宠，只想远离争斗。除夕夜众人赴宴，你独自来到倚梅园，对着梅花许下心愿。" },
    { speaker: "神秘男子", portrait: "emperor", mood: "calm", text: "脚步声从雪地深处传来。来人衣着低调，自称果郡王。你并不知道，他正是微服而来的皇帝。" }
  ],
  yuying_1: [
    { speaker: "旁白", portrait: "lingrong", mood: "calm", text: "皇帝派人寻找雪夜里念诗的女子。宫女余莺儿恰巧听见线索，便冒认身份，一夜之间获封答应。" },
    { speaker: "流朱", portrait: "liuzhu", mood: "angry", text: "她现在唱着你的曲、念着你的诗，也享受着本可能属于你的荣宠。揭穿她能夺回真相，也会把你推到所有人面前。" }
  ],
  banquet_1: [
    { speaker: "旁白", portrait: "zhenhuan_banquet", mood: "calm", text: "你按新晋位份换上盛装。满殿觥筹交错，落在歌舞上的目光是假象，暗中称量你分量的目光才是真的。" },
    { speaker: "旁白", portrait: "empress", mood: "calm", text: "宫宴既是取乐，也是试探。皇后与华妃表面和气，实际都在等新人站错位置。你的才名已经传入御前。" },
    { speaker: "眉庄", portrait: "meizhuang", mood: "calm", text: "眉庄坐在不远处，手边正有一张琴。若你独自出头，可能赢得盛宠；若与她合作，荣耀便不只属于一人。" }
  ],
  cassava_1: [
    { speaker: "旁白", portrait: "chun", mood: "calm", text: "淳儿年纪尚小，性子直率，是宫中少见没有把每句话都藏两层的人。也正因如此，她最容易成为别人试探你的工具。" },
    { speaker: "曹琴默", portrait: "cao", mood: "calm", text: "点心由华妃宫中送来，曹琴默负责安排宴席。你察觉异样，却还不知道这是意外、陷阱，还是有人故意让你看见。" }
  ],
  ally_1: [
    { speaker: "旁白", portrait: "meizhuang", mood: "hidden", text: "沈眉庄曾因稳重得体率先得宠，也因此成为华妃的眼中钉。如今她被指假孕争宠，几乎所有证据都对她不利。" },
    { speaker: "流朱", portrait: "liuzhu", mood: "angry", text: "公开求情能证明情义，却可能让你一起失势；暗中调查需要时间；立刻切割最安全，也最伤人。" }
  ],
  qigui_1: [
    { speaker: "旁白", portrait: "qigui", mood: "angry", text: "祺贵人投靠皇后后，一直寻找能将你彻底扳倒的证据。这一次，她把矛头指向你的孩子与宫外旧识。" },
    { speaker: "皇后", portrait: "empress", mood: "calm", text: "所谓滴血验亲，看似是验证血缘，实则是一场早已布置好的审判。你能依靠的只有此前留下的人证与物证。" }
  ],
  reveal_1: [
    { speaker: "旁白", portrait: "zhenhuan_final", mood: "calm", text: "纯元皇后是皇帝早逝的原配，也是皇后最不愿被提起的人。你曾被称赞的眉眼、嗓音与舞姿，都与她有几分相似。" },
    { speaker: "流朱", portrait: "liuzhu", mood: "angry", text: "这件旧衣若真属于纯元，你得到的偏爱便可能从一开始就不只属于你。穿或不穿，都会成为答案。" }
  ],
  final_1: [
    { speaker: "旁白", portrait: "emperor", mood: "angry", text: "多年争斗终于汇到同一座殿中。皇后仍握着名分，皇帝仍握着生死，而你握着一路留下的证据、情分和秘密。" },
    { speaker: "甄嬛", portrait: "zhenhuan_final", mood: "calm", text: "你已经不能回到初入宫时。现在能决定的，是用这些筹码赢下权力、离开宫墙，还是把整张棋盘一并掀翻。" }
  ]
};

function node(chapter, progress, scene, speaker, portrait, mood, text, next) {
  return { chapter, progress, scene, speaker, portrait, mood, text, next };
}

function choice(text, feedback, effects, relations, flags, tags, next) {
  return { text, feedback, effects, relations, flags, tags, next };
}

function conditionalChoice(text, feedback, require, lockedText, effects, relations, flags, tags, next) {
  return { text, feedback, require, lockedText, effects, relations, flags, tags, next };
}

function countEvidence(s) {
  return ["yuying_evidence", "powder_evidence", "found_evidence", "qigui_counter"].filter(flag => s.flags[flag]).length;
}

let state = initialState();
let typingTimer = null;
let instantText = false;
let activePages = [];
let activePageIndex = 0;
let activeNode = null;

const el = id => document.getElementById(id);
const screens = [...document.querySelectorAll(".screen")];
const assetCache = new Map();
const backgroundAssets = window.GONGQIANG_ASSETS?.backgrounds || {};
const characterAssets = window.GONGQIANG_ASSETS?.characters || {};

function imageAvailable(src) {
  if (assetCache.has(src)) return assetCache.get(src);
  const promise = new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
  assetCache.set(src, promise);
  return promise;
}

function showScreen(id) {
  screens.forEach(screen => screen.classList.toggle("active", screen.id === id));
}

const memoryStore = {};
const storage = {
  get(key) {
    try { return localStorage.getItem(key); }
    catch (_) { return key in memoryStore ? memoryStore[key] : null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); }
    catch (_) { memoryStore[key] = value; }
  },
  remove(key) {
    try { localStorage.removeItem(key); }
    catch (_) { delete memoryStore[key]; }
  }
};

function saveGame() {
  storage.set(STORAGE_KEY, JSON.stringify(state));
  updateContinueButton();
}

function loadGame() {
  try {
    const raw = JSON.parse(storage.get(STORAGE_KEY));
    if (raw && raw.current && story[raw.current]) state = raw;
  } catch (_) {
    state = initialState();
  }
}

function storedList(key) {
  try { return JSON.parse(storage.get(key)) || []; }
  catch (_) { return []; }
}

function unlockStored(key, value) {
  const list = storedList(key);
  if (!list.includes(value)) list.push(value);
  storage.set(key, JSON.stringify(list));
  return list;
}

function updateContinueButton() {
  el("continue-btn").classList.toggle("hidden", !storage.get(STORAGE_KEY));
  el("gallery-count").textContent = `${storedList(GALLERY_KEY).length} / ${Object.keys(endings).length}`;
  el("achievement-count").textContent = `${storedList(ACHIEVEMENT_KEY).length} / ${Object.keys(achievements).length}`;
}

function typeText(text, done) {
  clearInterval(typingTimer);
  const target = el("dialogue");
  target.textContent = "";
  if (instantText) {
    target.textContent = text;
    done();
    return;
  }
  let i = 0;
  typingTimer = setInterval(() => {
    target.textContent += text[i] || "";
    i += 1;
    if (i >= text.length) {
      clearInterval(typingTimer);
      done();
    }
  }, 18);
}

async function setPortrait(type = "zhenhuan", mood = "calm") {
  const portrait = el("portrait");
  portrait.className = `portrait portrait-${type} mood-${mood}`;
  portrait.style.backgroundImage = "";
  const exact = characterAssets[`${type}_${mood}`];
  const fallback = characterAssets[`${type}_calm`];
  let src = null;
  if (exact && await imageAvailable(exact)) src = exact;
  else if (fallback && await imageAvailable(fallback)) src = fallback;
  if (src && portrait.classList.contains(`portrait-${type}`)) {
    portrait.style.backgroundImage = `url("${src}")`;
    portrait.classList.add("has-art");
  }
}

async function setSceneArt(sceneName) {
  const scene = el("scene");
  scene.style.backgroundImage = "";
  scene.classList.remove("has-art");
  const src = backgroundAssets[sceneName];
  if (src && await imageAvailable(src) && scene.classList.contains(`scene-${sceneName}`)) {
    scene.style.backgroundImage = `url("${src}")`;
    scene.classList.add("has-art");
  }
}

// ==================== BGM：三幕切换 ====================
const BGM_TRACKS = {
  early: "./assets/audio/bgm_early.mp3",
  mid: "./assets/audio/bgm_mid.mp3",
  late: "./assets/audio/bgm_late.mp3"
};
let bgm = null;
let bgmTrack = null;
let bgmMuted = false;
let bgmStarted = false;

function bgmForChapter(chapter = "") {
  if (/终章|第九章/.test(chapter)) return "late";
  if (/第五章|第六章|第七章|第八章/.test(chapter)) return "mid";
  return "early";
}

function ensureBgm() {
  if (!bgm) {
    bgm = new Audio();
    bgm.loop = true;
    bgm.volume = 0.3;
    bgm.preload = "auto";
  }
}

function playBgmTrack(track) {
  ensureBgm();
  if (bgmTrack === track) return;
  bgmTrack = track;
  bgm.src = BGM_TRACKS[track];
  if (bgmStarted && !bgmMuted) bgm.play().catch(() => {});
}

function unlockBgm() {
  // 必须在用户手势里调用（入局/继续按钮点击），之后章节切换才能自动播放
  ensureBgm();
  bgmStarted = true;
  if (!bgmMuted && bgmTrack) bgm.play().catch(() => {});
}

function setBgmMuted(muted) {
  bgmMuted = muted;
  el("mute-btn").classList.toggle("muted", muted);
  el("mute-btn").textContent = muted ? "静" : "音";
  if (!bgm) return;
  if (muted) bgm.pause();
  else if (bgmStarted && bgmTrack) bgm.play().catch(() => {});
}

function duckBgmForEnding() {
  if (bgm) bgm.volume = 0.14;
}

function renderNode(id) {
  const currentNode = story[id];
  if (!currentNode) return;
  state.current = id;
  saveGame();
  showScreen("game-screen");
  el("chapter-name").textContent = currentNode.chapter;
  el("progress-bar").style.width = `${currentNode.progress}%`;
  playBgmTrack(bgmForChapter(currentNode.chapter));
  el("scene").className = `scene scene-${currentNode.scene}`;
  setSceneArt(currentNode.scene);
  activeNode = currentNode;
  activePages = [...(scenePrologues[id] || []), {
    speaker: currentNode.speaker,
    portrait: currentNode.portrait,
    mood: currentNode.mood,
    text: currentNode.text
  }];
  activePageIndex = 0;
  renderActivePage();
}

function renderActivePage() {
  const page = activePages[activePageIndex];
  el("speaker").textContent = page.speaker || activeNode.speaker;
  setPortrait(page.portrait || activeNode.portrait, page.mood || activeNode.mood);
  el("choices").innerHTML = "";
  el("next-btn").classList.add("hidden");
  typeText(page.text, () => {
    if (activePageIndex < activePages.length - 1) {
      el("next-btn").textContent = "继续";
      el("next-btn").classList.remove("hidden");
      el("next-btn").onclick = () => {
        activePageIndex += 1;
        renderActivePage();
      };
      return;
    }
    if (activeNode.ending) {
      el("next-btn").textContent = "查看结局";
      el("next-btn").classList.remove("hidden");
      el("next-btn").onclick = finishGame;
    } else if (activeNode.choices) {
      renderChoices(activeNode.choices);
    } else if (activeNode.next) {
      el("next-btn").textContent = "继续";
      el("next-btn").classList.remove("hidden");
      el("next-btn").onclick = () => renderNode(activeNode.next);
    }
  });
}

function renderChoices(choices) {
  const wrap = el("choices");
  choices.forEach(currentChoice => {
    const allowed = !currentChoice.require || currentChoice.require(state);
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.disabled = !allowed;
    button.textContent = allowed ? currentChoice.text : `未解锁：${currentChoice.lockedText}`;
    if (!allowed) {
      button.style.opacity = ".42";
      button.style.cursor = "not-allowed";
    } else {
      button.onclick = () => choose(currentChoice);
    }
    wrap.appendChild(button);
  });
}

function choose(currentChoice) {
  Object.entries(currentChoice.effects || {}).forEach(([key, value]) => {
    state.stats[key] = Math.max(-8, Math.min(12, state.stats[key] + value));
  });
  Object.entries(currentChoice.relations || {}).forEach(([key, value]) => {
    state.relations[key] = Math.max(-8, Math.min(12, state.relations[key] + value));
  });
  (currentChoice.flags || []).forEach(flag => { state.flags[flag] = true; });
  (currentChoice.tags || []).forEach(tag => {
    state.counters[tag] = (state.counters[tag] || 0) + 1;
  });
  state.history.push({ node: state.current, choice: currentChoice.text });
  saveGame();
  showEffect(currentChoice.feedback || "宫中的风向，似乎有了一点变化。");
  evaluateAchievements({});

  const failType = earlyFailure(currentChoice);
  if (failType) {
    state.flags.failType = failType;
    window.setTimeout(() => showEnding("early_fail"), 520);
    return;
  }
  window.setTimeout(() => renderNode(currentChoice.next), 320);
}

function earlyFailure(currentChoice) {
  if (state.current === "xia_conflict" && currentChoice.flags?.includes("challenged_huafei") && state.flags.showed_edge && state.stats.strategy <= 1) return "red";
  if (state.current === "banquet_1" && currentChoice.flags?.includes("danced") && state.relations.huafei <= -5 && state.stats.strategy <= 1) return "spotlight";
  if (state.current === "qigui_1" && currentChoice.flags?.includes("forced_lingrong") && state.relations.lingrong <= -4 && !state.flags.found_evidence) return "betrayal";
  return null;
}

function showEffect(text) {
  const toast = el("effect-toast");
  toast.textContent = text;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1500);
}

function determineEnding() {
  if (state.flags.chose_destroy) return "ruin";
  if (state.flags.chose_freedom) return "freedom";
  if (state.flags.chose_power && state.stats.strategy >= 5 && (state.relations.meizhuang >= 2 || state.relations.cao >= 2)) return "ruler";
  if (state.flags.chose_truth && state.stats.heart >= 4 && state.flags.prepared_escape) return "freedom";
  if (state.flags.chose_favor || (!state.flags.saw_substitute_truth && state.stats.favor >= 4)) return "substitute";
  if (state.stats.health <= 1 || (state.stats.suspicion >= 7 && state.reputation >= 5 && state.stats.strategy <= 2)) return "early_fail";
  return "exile";
}

function finishGame() {
  showEnding(determineEnding());
}

function endingIdentity(key) {
  if (key !== "early_fail") return endings[key];
  const variants = {
    red: { title: "一丈红体验卡", seal: "红", desc: "你替陵容出了头，也替自己提前领完了宫规。长街很长，你的宫斗生涯却短得惊人。" },
    spotlight: { title: "宴会显眼包", seal: "舞", desc: "第一场出了风头，第二场还要独舞。满殿都记住了你，华妃也记住了——而且记得格外牢。" },
    betrayal: { title: "背刺初体验", seal: "刺", desc: "你把陵容推到殿前替你作证，却忘了被当作棋子的人也会选择另一张棋盘。" }
  };
  return { ...endings.early_fail, ...(variants[state.flags.failType] || {}) };
}

function buildEpilogue(key) {
  const parts = [];
  if (state.relations.meizhuang >= 4) parts.push("多年后，一封没有署名的信送到你手里。纸上只有一句：故人安好。你认得眉庄的字。");
  else if (state.relations.meizhuang <= -3) parts.push("存菊堂再没有消息传来。你偶尔想起那个曾与你并肩的人，却已记不清最后一次告别说了什么。");

  if (state.relations.lingrong >= 4) parts.push("陵容最终没有在最要紧的一刻指认你。那不是忠诚，只是她还记得宫门外你曾为她停过脚步。");
  else if (state.relations.lingrong <= -4) parts.push("安陵容的证词被记入最后一册档案。她说得平静，像是在归还一笔积压多年的旧账。");

  if (state.flags.saved_chun) parts.push("淳儿活到了故事最后。她仍不擅长猜人心，却每逢冬日都会送来一盒你再也不敢随便入口的点心。");
  if (state.flags.powder_evidence) parts.push("那块封存的木薯粉点心成了不起眼的铁证。宫里最致命的东西，往往最像一份寻常甜食。");
  if (state.flags.qigui_counter) parts.push("祺贵人的告发被逐条反证。她终于明白，声音最大的人不一定能写下最后的供词。");

  if (key === "ruler" && state.stats.heart >= 6) parts.push("你掌权后没有拆掉碎玉轩。有人说那是念旧，只有你知道，那是提醒自己不要成为第二个皇后。");
  if (key === "ruler" && state.stats.ruthlessness >= 5) parts.push("册封礼后，旧日对手的名字陆续从宫册上消失。你赢得干净，也赢得无人敢靠近。");
  if (key === "freedom" && state.relations.emperor >= 4) parts.push("追寻你的马车曾三次到过城外，最后一次只留下了一枝已经干枯的梅。");
  if (key === "substitute" && state.flags.saw_substitute_truth) parts.push("你其实早已知道答案。留下不是因为相信，而是因为清醒地选择用替身身份换取荣宠。");
  if (key === "exile" && state.stats.strategy >= 6) parts.push("冷宫墙砖后藏着三封密信和一份未完成的名单。所有人都以为你在等死，你只是在等下一次开门。");
  if (key === "ruin") parts.push(`殿前一共摆出了 ${countEvidence(state)} 份证据。没有人能全身而退，包括你自己。`);
  if (state.stats.health <= 2) parts.push("这些年留下的病根最终没有痊愈。每逢冬夜，你仍会梦见那场雪和最初那个过于天真的愿望。");

  return parts.slice(0, 4);
}

function evaluateAchievements(context) {
  const unlockedEndings = storedList(GALLERY_KEY).length;
  const justUnlocked = [];
  Object.entries(achievements).forEach(([key, item]) => {
    if (storedList(ACHIEVEMENT_KEY).includes(key)) return;
    if (item.check(state, { ...context, unlockedEndings })) {
      unlockStored(ACHIEVEMENT_KEY, key);
      justUnlocked.push(key);
    }
  });
  if (justUnlocked.length && !context.atEnding) {
    const first = achievements[justUnlocked[0]];
    window.setTimeout(() => showEffect(`轶闻解锁：${first.title}`), 220);
  }
  return justUnlocked;
}

function showEnding(key) {
  duckBgmForEnding();
  const identity = endingIdentity(key);
  const unlocked = unlockStored(GALLERY_KEY, key);
  const newAchievements = evaluateAchievements({ ending: key, atEnding: true, unlockedEndings: unlocked.length });
  storage.remove(STORAGE_KEY);
  el("ending-seal").textContent = identity.seal;
  el("ending-title").textContent = identity.title;
  el("ending-desc").textContent = identity.desc;
  el("ending-epilogue").innerHTML = buildEpilogue(key).map(text => `<p>${text}</p>`).join("");
  el("ending-achievements").innerHTML = newAchievements.length
    ? `<p>新解锁轶闻</p>${newAchievements.map(item => `<span>${achievements[item].title}</span>`).join("")}`
    : "";
  el("ending-progress").textContent = `命运 ${unlocked.length} / ${Object.keys(endings).length}　·　轶闻 ${storedList(ACHIEVEMENT_KEY).length} / ${Object.keys(achievements).length}`;
  showScreen("ending-screen");
  updateContinueButton();
}

function rumorLines() {
  const lines = [];
  if (state.stats.favor >= 3) lines.push("养心殿近来频频问起你的名字。");
  else if (state.stats.favor <= -1) lines.push("近来的赏赐名单上，很少再见到你的宫名。");
  else lines.push("圣意如风，一时还看不出吹向哪一宫。 ");

  if (state.stats.suspicion >= 4 || state.stats.reputation >= 4) lines.push("你走过长街时，背后的议论总会忽然停下。");
  else if (state.stats.strategy >= 5) lines.push("有人说你沉得住气，也有人开始怕你太沉得住气。");
  else lines.push("宫里暂时只把你当作一个安静的新面孔。");

  if (state.relations.meizhuang >= 3) lines.push("存菊堂送来的暖手炉一直没有凉过。");
  else if (state.relations.meizhuang <= -2) lines.push("眉庄很久没有主动提起你的名字。");

  if (state.relations.lingrong >= 3) lines.push("陵容每次见你，仍会把最靠近的位置留出来。");
  else if (state.relations.lingrong <= -2) lines.push("陵容见到你时愈发恭敬，也愈发疏远。");

  if (state.relations.huafei <= -3) lines.push("翊坤宫最近提到你的次数有些太多了。");
  if (state.flags.powder_evidence || state.flags.found_evidence) lines.push("你的匣子里藏着一件暂时不能见光的东西。");
  if (state.stats.heart < 0) lines.push("镜中的人越来越像一个你从前不认识的人。");
  if (state.stats.health <= 2) lines.push("太医说你该静养，可宫里从不给人真正静下来的时候。");
  return lines.slice(0, 6);
}

function renderRumors() {
  const lines = rumorLines();
  el("stats-list").innerHTML = lines.map(text => `<div class="rumor-row"><i>◇</i><p>${text}</p></div>`).join("");
}

function renderGallery() {
  const unlocked = storedList(GALLERY_KEY);
  const unlockedAchievements = storedList(ACHIEVEMENT_KEY);
  el("gallery-grid").innerHTML = Object.entries(endings).map(([key, ending]) => {
    const open = unlocked.includes(key);
    return `<article class="gallery-item ${open ? "" : "locked"}"><div class="mini-seal"></div><h3>${open ? ending.title : "未解锁"}</h3><p>${open ? ending.hint : "不同的选择会打开这扇门。"}</p></article>`;
  }).join("");
  el("achievement-grid").innerHTML = Object.entries(achievements).map(([key, item]) => {
    const open = unlockedAchievements.includes(key);
    return `<article class="achievement-item ${open ? "" : "locked"}"><b>${open ? item.title : "未记录"}</b><span>${open ? item.desc : "这段轶闻还藏在宫墙之后。"}</span></article>`;
  }).join("");
  el("gallery-header-count").textContent = `${unlocked.length} / ${Object.keys(endings).length}`;
  showScreen("gallery-screen");
}

function startNewGame() {
  state = initialState();
  saveGame();
  renderNode(state.current);
}

el("start-btn").onclick = () => { unlockBgm(); if (bgm) bgm.volume = 0.3; startNewGame(); };
el("continue-btn").onclick = () => { unlockBgm(); loadGame(); renderNode(state.current); };
el("restart-btn").onclick = () => { unlockBgm(); if (bgm) bgm.volume = 0.3; startNewGame(); };
el("mute-btn").onclick = () => setBgmMuted(!bgmMuted);
el("gallery-btn").onclick = renderGallery;
el("ending-gallery-btn").onclick = renderGallery;
el("gallery-home-btn").onclick = () => { updateContinueButton(); showScreen("title-screen"); };
el("home-btn").onclick = () => { saveGame(); updateContinueButton(); showScreen("title-screen"); };
el("home-btn-fallback").onclick = () => { saveGame(); updateContinueButton(); showScreen("title-screen"); };
el("stats-btn").onclick = () => { renderRumors(); el("stats-panel").classList.add("open"); el("stats-panel").setAttribute("aria-hidden", "false"); };
document.querySelectorAll("[data-close='stats']").forEach(element => {
  element.onclick = () => {
    el("stats-panel").classList.remove("open");
    el("stats-panel").setAttribute("aria-hidden", "true");
  };
});
el("speed-btn").onclick = () => {
  instantText = !instantText;
  el("speed-btn").textContent = instantText ? "瞬显" : "逐字";
};

loadGame();
updateContinueButton();
showScreen("title-screen");
