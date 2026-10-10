/* 未保存的明天 — 0.4, standalone fictional simulation. */
(function(root){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x)),fmt=n=>`${String(Math.floor(n/60)%24).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
const line=(who,text,portrait='',mood='',expression='')=>({who,text,portrait,mood,expression}),narr=t=>line('',t),hero=(t,expression='')=>line('我',t,'heroine','',expression),wang=(t,expression='')=>line('王光耀',t,'wang','',expression);
const locations={office:'经济学院 · 共享工位',corridor:'经济学院 · 走廊',mentor:'导师办公室门口',tea:'接水区',parking:'院楼正门外 · 停车处',road:'回程 · 红绿灯前',gate:'楼栋后侧 · 小门',dorm:'宿舍 · 上床下桌'};
const contacts={group:{name:'课题组',avatar:'研',pin:true},ruan:{name:'软',realName:'软桃',relation:'最好的闺蜜',avatar:'☁',pin:true},advisor:{name:'导师',avatar:'山'},wang:{name:'王光耀',avatar:'王'},qian:{name:'千',relation:'本科同学 · 在另一所学校读博',avatar:'千'},shidi:{name:'师弟',avatar:'叶'},yan:{name:'燕日央',relation:'发小 · 历史系研究生',avatar:'燕'}};
const editors=['我','导师','千'];
const WANG_LEAVES=1318,CLOSE_AT=1337;
const deadline=s=>Math.min(CLOSE_AT,...s.previous.filter(e=>e.kind==='resolve'&&e.at>s.time).map(e=>e.at));
const endings={
he:{tag:'HE',title:'下一次尝试',lines:[narr('你把当前结论标成“待复核”，给导师和千发出了原始记录。没有把措辞修饰得更好，也没有删去那个让人难堪的问题。'),line('千 · 微信','收到。明天先核对删除清单，我陪你一起找。'),narr('早上醒来，课题没有突然变好。你甚至仍然不想打开电脑。可窗外经过了一班不同的列车，桌上的水也已经凉了。'),hero('今天不必把这一切说完美。先做下一步，看看会发生什么。')]},
te:{tag:'TE',title:'未保存的明天',lines:[narr('你留下的检验句按时出现，原段落随后变成灰色。旁边的新批注没有消失：它绑定着另一个段落，和独立保存的证据一起留在了界面上。'),hero('她重复的是我做过的操作，不是我的下一次决定。只要不把选择也交给她，这一轮就可以不同。'),narr('你重新打开那份备忘。“今天的你可以离开了”仍然停在最后一行。你终于读懂了它替你作出的安排。'),narr('你无法证明一句话为什么能长出另一个自己。但你认得她试图替你消除的东西：不确定、难堪，以及再次失败的可能。'),hero('不用替我保证成功。我会带着这些问题，自己去见明天。'),narr('磨砂玻璃后的影子收回了手。时钟越过深夜，窗外终于亮起来。你没有重写过去，却第一次留下了一个没有被预先写好的明天。')]},
stay:{tag:'逃避结局',title:'明天再说',lines:[narr('你把闹钟关掉，又把电脑包放回原处。这一次，你不打算给下一轮留下任务。'),narr('灯光一直停在最舒服的亮度。列车按同一节奏经过，软的那条消息始终没有变成“昨天”。'),hero('我知道还有别的办法。可是现在，我只想让这里一直这样。'),narr('门外没有再催你。明天被留在了门的另一边。')]},
replace:{tag:'BE',title:'明天照常',lines:[narr('那个没有问号的版本顺利通过了组会。你听见自己的声音流畅地解释每个疑点，连停顿都恰到好处。'),line('导师 · 微信','材料收到，后续请保留完整记录。'),narr('你还没碰到键盘，“好的老师”已经发了出去。镜面里的手先你一步收起电脑，随后等着你跟上。'),hero('我以为交出去的只是一份汇报。')]},
gate:{tag:'BE',title:'已经到家的人',lines:[narr('刷卡器显示通过。你走进熟悉的楼栋，却发现每一层的灯都比脚步早亮一秒。'),narr('宿舍门没有锁。电脑包已经在椅子上，另一个戴着同样帽子的人正从包里取出电脑。'),line('我？','你不是已经回来了吗？','echo','dark'),narr('身后的锁舌合上了。你们同时抬眼，时间退回 21:00；可这一回，入口也变成了这扇宿舍门。每一次重新开始，都有人已经在里面等你。')]},
road:{tag:'BE',title:'没有终点的绿灯',lines:[narr('你跟上了前方那辆车。绿灯一次也没有变过，地铁却接连从头顶经过。'),narr('第三次经过同一间值班室时，你终于停下来。前方那辆车也停了，保持着与你完全相同的距离。'),hero('我一直在前进，却没有更接近宿舍。'),narr('手机上的导航只剩一条直线。终点跟着你一起移动，永远在下一个路口。')]},
ne:{tag:'NE',title:'天亮之后',lines:[narr('你保存了全部版本，给导师发出延期核查的消息。这个夜晚还有许多事解释不清，但你决定先让自己离开。'),narr('天亮时，门外的脚步声终于消失。你下楼买了一份早餐，手机里多了一条新的日期。'),narr('问题被带到了白天。你还没有解决它们，也没有再假装它们已经解决。')]}
};endings.home={tag:'短篇 · NE',title:'今晚先吃饭',cg:'assets/cg-he-v4.png',lines:[narr('你保存运行日志，把笔记本合上。消息里，软正在认真比较两家外卖谁的起送价更离谱。'),line('软 · 微信','决定好了，吃面。再选下去早餐店都开门了。'),hero('那我也吃面。明天先核对删除清单，不和这台电脑耗到天亮了。'),narr('第二天，问题没有替你消失。你吃过早饭，重新打开那份文件。')]};for(const [id,e]of Object.entries(endings))e.cg ||= `assets/cg-${id}-v4.png`;
function initialChat(){const rows=[['yan','燕日央',"你那本书还在我包里，压得我肩膀疼。你今天来学校了吗？我也在院楼。",1255],['group','导师',"明天上午九点组会。大家把数据版本、识别思路和还没核实的地方整理一下，会上我们一起看。",1256],['group','师弟',"收到老师，会议室和投屏我来弄。我也整理了几篇跟上次讨论的方法有关的论文，稍后发群文件。",1257],['advisor','导师',"没确认的部分先留着批注，不要为了赶明天的汇报硬把结果定下来。有问题就来办公室找我。",1258],['qian','千',"刚听完我们院的报告，脑子已经快转不动了。对了，你前几天说的那份样本清单，后来核对了吗？",1250],['ruan','软',"不是吧，你今晚又打算拿饼干糊弄晚饭？我在看外卖，要不要给你捎一份？这次请点个有菜的。",1260],['qian','千',"给你丢个应用微观工作坊，刚看到的。你先收藏吧，忙完再说。",1245],['wang','王光耀',"我还在工位。靠窗这边能腾出点地方，你要来就来，反正我也没做出什么进度。",1257],['shidi','师弟',"师姐，明天要是转接头不够，用我的就行。上次那个我已经放包里了。",1230]];return rows.sort((a,b)=>a[3]-b[3]).map(([thread,who,text,at],i)=>({id:i+1,thread,who,text,at}))}
function fresh(){return {version:7,loc:'dorm',time:1260,round:1,flags:{leftHome:false,visitedOffice:false,returnedHome:false},known:{},notes:[],events:[],previous:[],path:[{at:1260,loc:'dorm'}],previousPath:[],fired:[],chat:initialChat(),read:{},replyFlags:{},dialog:[narr("晚上九点。窗外的列车刚开过去，桌边的水不知道什么时候凉透了。你本来想站起来倒点热的，手却又不自觉伸向鼠标。"),narr("Stata 终于停了。你先看有没有报错，再去找处理变量那一行。小数点后那几个数字，已经看得有些发虚。")],pending:'stata',menu:null,panel:null,tab:'draft',thread:'',phoneTab:'chats',revision:'latest',cg:'',cgSeen:[],ending:null,unlocked:[],checkpoint:null,toast:'',cue:'',log:[],settings:{audio:true,motion:true,textSpeed:22}}}
function evidence(s,id,title,text){if(!s.known[id]){s.known[id]=true;s.notes.push({id,title,text});s.toast=`已记下：${title}`}}
function say(s,lines,pending='',cg=''){s.panel=null;s.menu=null;s.dialog=clone(lines);s.pending=pending;s.cg=cg;if(cg&&!s.cgSeen.includes(cg))s.cgSeen.push(cg)}
function choose(s,title,items){s.panel=null;s.dialog=[];s.cg='';s.menu={title,items}}
function msg(s,thread,who,text,at=s.time,ghost=false){s.chat.push({id:(s.chat.at(-1)?.id||0)+1,thread,who,text,at,ghost});s.toast=`${who==='我'?'你的账号':who}发来一条消息`;s.cue='message'}
function tick(s,n){const before=s.time;s.time=Math.min(s.flags.visitedOffice&&!s.flags.callDone?CLOSE_AT:1559,s.time+n);
if(s.flags.visitedOffice&&!s.flags.wangPacking&&s.time>=1315){s.flags.wangPacking=true;msg(s,'wang','王光耀',"我这边差不多了，准备收东西下楼。对了，你水杯别又落桌上。",1315)}
if(s.flags.visitedOffice&&!s.flags.wangGone&&s.time>=WANG_LEAVES){s.flags.wangGone=true;msg(s,'wang','王光耀',s.flags.wangSafe?"我在正门这儿等你，别绕回去了。":s.flags.doorRequested?"等等，你刚才不是跟我一起出来的吗？我明明听见你在后面喊我。":"我到楼下了。你也早点回吧，别又搞到半夜。",WANG_LEAVES);s.cue='door'}
if(before<1320&&s.time>=1320)msg(s,'advisor','导师',"我先回去了。你把没核实的地方列个单子发我就行，明天我们再一起看。",1320);
if(s.flags.visitedOffice&&s.time>=1322&&!s.flags.bottleEcho){s.flags.bottleEcho=true;s.cue='bottle';s.toast=['office','tea'].includes(s.loc)?"显示器后面传来一声轻响，像有人正慢慢拧紧杯盖。声音刚停，椅轮又在地上碾了一下。":''}
if(false){s.flags.forged=true;msg(s,'wang','我','明天你陪你核对。',1324,true);msg(s,'wang','王光耀',"你最后那句是不是打错字了？我有点没看懂。",1324)}
for(const e of [...s.previous,{id:'entry-'+s.round,kind:'entry',at:WANG_LEAVES}].sort((a,b)=>a.at-b.at)){if(e.at>=before&&e.at<=s.time&&!s.fired.includes(e.id)){s.fired.push(e.id);if(e.kind==='run'){startBigJob(s,e.at,true);}else if(e.kind==='entry'){if(s.flags.doorRequested&&!s.flags.gateClosed)s.flags.echoEntered=true;}else if(e.kind==='lock'||e.kind==='unlock'){applyGate(s,e.kind,e.at,true);}else if(e.kind==='dismiss'){msg(s,'qian','我',e.text,e.at,true);s.flags.oldDismissSeen=true;if(!s.flags.forecastSent){s.flags.reviewPaused=true;s.flags.receipt=false;s.flags.challenge=null;msg(s,'qian','千',"好，收到。我先不碰那部分了，你确认要核对的时候再叫我。",e.at);}else msg(s,'qian','千',"你提前说过的那条消息真的来了。我按咱们刚说好的查，旧消息就先不作数。",e.at);}else if(e.kind==='door'){s.flags.doorRequested=true;msg(s,'wang','我',e.text,e.at,true);evidence(s,'doorReplay','没有撤回的请求',fmt(e.at)+'，上一轮的开门请求再次送达。');}else if(e.kind==='message'){msg(s,e.thread,'我',e.text,e.at,true);}else if(e.kind==='resolve'){s.flags.resolved=true;if(!s.flags.reanchored)s.flags.windowMissed=true;evidence(s,'deadline','批注被按时归档',fmt(e.at)+'，旧操作再次关闭原段落的批注。')}else{s.flags.echoComment=true;evidence(s,'replay',"再次出现的回复",`${fmt(e.at)}，明明没碰手机，千却收到了跟上一次一模一样的话。`);msg(s,'qian','千',`这条我收到了，内容是：${e.text}`,e.at)}}}
if(s.flags.visitedOffice&&before<CLOSE_AT&&s.time>=CLOSE_AT){s.flags.resolved=true;if(!s.flags.reanchored)s.flags.windowMissed=true;recordAt(s,'resolve','解决来源批注',CLOSE_AT);if(s.known.loop)evidence(s,'deadline','22:17 的归档','旧段落的批注在 22:17 归档。操作绑定的是原段落，不是屏幕上看起来相同的文字。');s.toast='Review · 原段落的批注已归档';s.cue='typing'}
witnessReplay(s);castTick(s);completeBigJob(s);
if(s.loc==='dorm'&&s.flags.returnedHome&&s.time>=(s.flags.arrived||9999)+5&&!s.flags.knock){s.flags.knock=true;s.cue='knock';s.toast="门外传来两下敲门声。间隔得很均匀，像有人知道你正在听。"}
}
function travel(s,loc,minutes){if(s.loc==='dorm'&&loc!=='dorm'){if(s.flags.ruanArrival){s.flags.ruanVisitDeparted=true;s.flags.ruanArrival=null;s.flags.ruanMet=false;msg(s,'ruan','软',"你真去院楼啊？那我先回去了。饭记得带上，别到那儿又饿着。");}}const from=s.time;s.path.push({at:s.time,loc:'road'});s.loc='road';tick(s,minutes);if(s.time-from<minutes){s.flags.pendingTravel={loc,remaining:minutes-(s.time-from)};s.menu=null;s.panel=null;s.cg='';return;}s.loc=loc;s.path.push({at:s.time,loc});s.menu=null;s.panel=null;s.cg=''}
function echoLocation(s){let loc='office';for(const p of s.previousPath)if(p.at<=s.time)loc=p.loc;return loc}
function recordAt(s,kind,text,at){const id=kind+'-'+at;if(!s.events.some(e=>e.id===id))s.events.push({id,kind,at,text,anchor:'original'})}
function record(s,kind,text){recordAt(s,kind,text,s.time)}
function rewind(s){const previous=[...s.previous];for(const e of s.events)if(!previous.some(p=>p.id===e.id))previous.push(clone(e));previous.sort((a,b)=>a.at-b.at);const keep={known:s.known,notes:s.notes,unlocked:s.unlocked,cgSeen:s.cgSeen,settings:s.settings,previous,previousPath:clone(s.path),round:s.round+1,log:s.log};Object.assign(s,fresh(),keep);s.known.loop=true;s.cue='rewind';s.toast='';replayOpeningJob(s);}
function showEnd(s,id){if(id==='opened'&&['office','corridor','tea','mentor'].includes(s.loc))id='openedOffice';s.checkpoint=clone({...s,checkpoint:null,dialog:[],pending:'',menu:null,panel:null,cg:''});say(s,id==='opened'&&s.flags.bigTooLate?[narr('进度条还没走完，门把手已经压了下去。你盯着预计结束时间，第一次看清自己差的不是一个按钮，是整整二十分钟。'),hero('刚才要是已经在跑了……不，得更早。得在出门以前。'),narr('屏幕上还有没写完的输出。身后那声椅轮响起时，你没能按到保存。')]:id==='opened'&&s.flags.breached?[narr("你根本没伸手。门把手却在你眼前转了半圈，锁舌一点点退了回去。"),line('门外','你关上的那扇门，现在轮到我了。'),narr("核查窗口还开着，最后一步没来得及执行。门外不敲了。你听见身后的椅子轻轻响了一下。")]:endings[id].lines,'end:'+id,id)}
function next(s){if(!s.dialog.length)return;s.log.push(s.dialog.shift());if(s.log.length>200)s.log.shift();if(s.dialog.length)return;const p=s.pending;s.pending='';s.cg='';if(p==='rewind')horrorAction(s,'waitCall');else if(p==='wangOffer'){choose(s,"王光耀把杯子拧紧，停了一下：“我等会儿去接点水就走。后门那边刚才好像有人敲，你听到了吗？”",[['requestDoor','请他接水时顺便看看后门'],['declineDoor','不用过去了，一会儿直接从正门走']]);}else if(p==='desktop'){s.panel='desktop'}else if(p==='stata'){s.panel='stata';s.cue='result'}else if(p.startsWith('end:')){s.ending=p.slice(4);if(!s.unlocked.includes(s.ending))s.unlocked.push(s.ending);s.panel='ending'}else if(p==='eyeChoice')choose(s,"她还坐在显示器后面。只要往前再走两步，就能看见那张脸。可你现在最不想做的，就是走过去。",[['eye',"走过去，看清那个人究竟是谁"],['leaveEye',"先退开，假装没看见，检查电脑上的记录"]]);}
function arrive(s){if(!s.flags.visitedOffice||s.loc!=='dorm')return;s.flags.returnedHome=true;s.flags.arrived=s.time;s.flags.laptopClosed=true;say(s,[narr("钥匙转了半圈，你推门进去。电脑包顺手往椅子上一放，肩膀才终于松下来一点。"),narr("旧电脑还是合着的。灯、书、桌角那叠纸，乍一看都跟出门前没什么两样。")]);}
function enterOffice(s){if(s.loc!=='office')return;const first=!s.flags.visitedOffice;s.flags.visitedOffice=true;if(first){say(s,s.time<WANG_LEAVES?[narr("院楼还亮得跟白天差不多。四排共享工位上堆着书、水杯和充电线，有一把椅子拉出来就会碰到别人书包。靠窗那点空地方，勉强够摊开电脑。"),wang("来了啊？我把旁边那堆东西挪了挪，你看看够不够坐。插座是好的，就是这把椅子有点响。"),hero("谢了。我就是在宿舍坐得有点崩溃，过来换换脑子。"),...(s.round===1?[wang('怎么，你也没进度？'),hero('什么叫“也”？'),wang('我今天写了删、删了写，最后发现还不如昨天那版。现在属于是打开电脑就想关。'),hero('刚才又跑了一遍，还是不显著。我记得有一版不一样，想过来理理文件。'),wang('我不信。你前几天不是还说找到问题了吗？'),hero('找到一个，顺手发现后面可能还有三个。要不我来这儿干什么。'),wang('……行吧，那咱俩今天谁也别问谁了。'),narr('他说自己没进度，屏幕上却还开着几篇你没看过的论文。你差点想问他最近是不是又有发现。算了，别相互折磨了。')]:[]),narr("王光耀低头笑了一下，拧上水杯，把缠在桌腿上的充电线捋开。椅子被他往后一拉，滚轮咯噔响了两下。")]:[narr("工位区的灯还亮着，靠窗那一角却空了。王光耀的电脑、水杯都不在桌上，只有椅子歪向走道。")]);s.cue='bottle';if(s.time<WANG_LEAVES&&!s.flags.doorRequested&&!s.previous.some(x=>x.kind==='door'))s.pending='wangOffer';}else say(s,[narr("你再次走进工位区。椅背上还挂着一截别人的袖子，晃得你心口猛地一紧。凑近才看清，只是外套。")]);}
function openPhone(s,thread){s.thread=thread;s.phoneTab='chats';s.panel='phone'}
function hotspot(s,id){if(s.dialog.length||s.menu||s.panel||s.ending)return;
switch(id){
case 'computer':tick(s,1);s.panel=s.loc==='dorm'?'desktop':'overleaf';s.tab='draft';break;
case 'bag':action(s,'prepareLeave');break;
case 'cup':tick(s,1);if(s.flags.returnedHome){say(s,[hero("我记得很清楚，出门前杯子是在右边。……总不能是我自己记反了吧。"),narr("杯子好端端放在左手边，杯把朝着你。你伸手碰了一下，指尖被烫得缩回来——里面的水竟然还是热的。")]);evidence(s,'cup','被移动的水杯','出门前在右侧的冷水杯，回来后到了左侧，水却是热的。')}else{s.flags.cupSeen=true;say(s,[narr("杯子在桌子右手边。你握着杯壁等了两秒，连一点余温都没摸到。")])}break;
case 'chair':tick(s,1);if(s.time<WANG_LEAVES){say(s,[narr("对面椅背上搭了件外套，座位底下塞着纸袋。你把包缩到脚边——可别一坐下来就碰倒别人东西。")]);break}if(!s.flags.chair){s.flags.chair=true;s.cue='bottle';say(s,[narr("显示器背后“咔”地响了一声，像是有人贴着桌沿把水杯盖拧紧。"),hero("……王光耀？你没走啊？"),narr("没人应声。你低头看手机，王光耀刚刚才发来“我到楼下了”。你又抬头看了一眼显示器后面。")]);}else choose(s,"那把椅子轻轻滚动了两下。声音近得像有人就在隔板另一面。",[['turnChair',"绕过显示器，看看究竟是谁"],['leaveEye',"先别过去，退回桌边看手机"]]);break;

case 'person':case 'water':if(s.time>=WANG_LEAVES){tick(s,1);s.flags.wangGone=true;say(s,[narr(s.loc==='tea'?"饮水机上的灯亮着，接水台却空荡荡的。":"那根充电线已经拔了，王光耀的电脑和杯子都不见了。")]);break}tick(s,1);s.flags.metWang=true;say(s,[wang(s.time>=1315?"我差不多要收东西了。你还打算继续啊？":"别提了，我今天写了删、删了写，最后又撤销回昨天那版。你呢，有进度没？"),hero("刚在宿舍跑完，还是不显著。之前好像有过另一版，坐那儿越想越乱，出来换个地方。"),wang("这边好歹还有空调。你先坐吧，我去接点水，一会儿就撤。")]);s.cue='bottle';break;

case 'door':if(s.loc==='office')travel(s,'corridor',1);else if(s.loc==='dorm'&&!s.flags.leftHome)action(s,'prepareLeave');else if(s.loc==='dorm')choose(s,s.flags.knock?'门外有人轻轻敲了两下。':'钥匙还插在门内侧。',[['peephole','查看猫眼'],['listen','听听门外'],['returnOffice','回院楼核查'],['leaveEye','离开门边']]);else travel(s,'corridor',1);break;
case 'office':travel(s,'office',['road','gate'].includes(s.loc)?30:1);break;case 'tea':travel(s,'tea',1);break;case 'mentor':travel(s,'mentor',1);break;case 'parking':travel(s,'parking',3);break;case 'corridor':travel(s,'corridor',3);break;
case 'knock':action(s,'mentorTalk');break;
case 'notice':tick(s,1);say(s,[narr("预约表上写着明早九点组会。你盯了一眼房间号，又忍不住看了看手机——时间倒还来得及。")]);break;
case 'reflection':tick(s,1);if(!s.known.loop){say(s,[narr("金属挡板映出饮水机的白光。水烧开了，咔哒一声跳停。你这才发现，自己刚才一直屏着气。")]);break}evidence(s,'reflection','隔着倒影观察','倒影中的动作不同步，但手机时间仍向前。');say(s,[narr("你没有回头，只盯着金属挡板里那块模糊的反光。杯沿旁多出一只手，停着不动。手机上的分钟数却又跳了一格。")]);break;

case 'scooter':case 'bicycle':action(s,id);break;
case 'clock':choose(s,'阅读线索不耗时；等待和行动会推动这一晚。',[['wait5','等待五分钟'],['wait20','整理文件二十分钟'],...(s.previous.some(e=>e.kind==='comment')?[['experiment','验证上一轮留下的回复']]:[]),['leaveEye','继续调查']]);break;
case 'drawer':tick(s,1);s.flags.drawerRead=true;s.panel='paper';break;
case 'window':tick(s,1);if(!s.flags.returnedHome){say(s,[narr("一列地铁从高架上开过去。亮着的车窗一格格掠过你面前的玻璃，最后全被旁边那堵楼挡住了。")]);s.cue='train';break}say(s,[narr("玻璃里，桌子左边闪着一点光。你回头看实物——杯子明明在另一侧。\n……等等，刚才到底是哪边？")]);break;

case 'bed':choose(s,"床就在头顶，爬上去只要几步。可你看着桌上还没关的文件，怎么也迈不开腿。",[['rest','先休息十分钟'],['sleep','保存文件，准备结束这一晚'],...(s.known.loop&&s.flags.visitedOffice?[['quiet','把消息静音']]:[]),['leaveEye','回到桌前']]);break;
case 'front':action(s,'goFront');break;
case 'gate':travel(s,'gate',6);say(s,s.time<1440?[line('保安',"回宿舍啊？我等会儿也换班了。过了十二点记得刷卡啊，这破读卡器偶尔还会把上一条念一遍。要是不想折腾，直接走前门呗。")]:[narr("值班室的外套搭在椅背上，电视里还播着没声音的节目。刷卡器忽然亮了一下绿灯，过了半拍，屏幕才慢吞吞跳出“请刷卡”。")]);break;
case 'signal':choose(s,"行人灯还红着，水洼里却是一片绿。前面那辆没牌照的车缓缓起步，骑车人的帽子，和你头上这顶一模一样。",[['followLight','跟着那辆车走进高架下的小路'],['leaveEye','等真实的信号灯，自己选择路线']]);break;
case 'reader':choose(s,"刷卡器的最近一条记录写着你的名字。你站在门外，卡却一直攥在自己手里。",[['enterGate','刷卡进入'],['goFront','退回路口，走正门']]);break;
}}
function caseSteps(s){return [
{done:!!s.known.future,title:'核对异常记录',hint:'在电脑的 History 中打开 21:47 版本。'},
{done:!!s.known.permissions&&!!s.known.author,title:'核实作者身份',hint:'查看 Share 的三位编辑者，再私聊千核对记录。'},
{done:!!s.known.loop,title:'确认回退触发点',hint:'活到 22:17，接听来自自己号码的电话。'},
{done:!!s.known.experiment,title:'验证固定重演',hint:'回退后在笔记中预测结果，等到上一轮回复的时刻。'},
{done:!!s.known.verified,title:'找出被覆盖的内容',hint:'回宿舍打开本地备份，对照样本删除记录。'},
{done:!!s.known.mechanism,title:'完成因果判断',hint:'把“作者”和“固定时间重演”两条证据组合起来。'}]}
function readyTE(s){return caseSteps(s).every(x=>x.done)}
function action(s,id){s.toast='';s.cue='';switch(id){
case 'leaveEye':s.menu=null;break;
case 'prepareLeave':if(s.flags.leftHome){action(s,'returnOffice');break}choose(s,"你看了看椅子边的电脑包。在宿舍越坐越乱，不如去工位把几个版本理一理。换个地方，就能看出漏掉了什么。要不要过去？",[['departHome','合上电脑，带包出门'],['leaveEye','先不出门，坐回去'],['homeEnd','今晚先吃饭，明天继续']]);break;
case 'departHome':if(s.flags.leftHome)break;s.flags.leftHome=true;s.flags.laptopClosed=true;s.flags.cupSeen=true;travel(s,'office',20);enterOffice(s);break;
case 'homeEnd':if(!s.flags.leftHome)showEnd(s,'home');break;
case 'stata':s.panel='stata';break;
case 'runStata':tick(s,2);s.flags.reruns=(s.flags.reruns||0)+1;s.panel='stata';s.cue='result';break;
case 'desktop':if(s.round===1&&!s.flags.leftHome&&!s.flags.openingThought){s.flags.openingThought=true;say(s,[narr('运行结束的提示音响过，你的手还搭在鼠标上。楼下有人骑过减速带，外卖箱哐当响了一声。'),hero('怎么还是这样……前几天不是有一版有星号吗？'),hero('到底是哪份来着。文件名一个比一个像，我都快分不清了。'),narr('你点开文件夹，几个相似的文件名挤在一起。手指停了一会儿，又把窗口缩回去。手机刚好亮起，是软桃在问晚饭。'),hero('先回个消息吧。电脑不会跑，跑的只有我的晚饭。')],'desktop');}else s.panel='desktop';break;
case 'memo':s.panel='note';break;
case 'memoReveal':if(s.flags.returnedHome){s.flags.memoRevealed=true;evidence(s,'origin','备忘里多出的一行','今天的你可以离开了。')}break;
case 'ackLoop':if(s.known.loop){s.flags.acknowledged=true;evidence(s,'recognition',"相同的开头","又是九点。屏幕上还是那个结果，软桃的消息停在同一句话。你明明记得自己已经离开过这里。")}break;

case 'mentorTalk':tick(s,2);say(s,s.time<1320?[line('导师',"明天不用把所有东西一次讲完。你先告诉我，哪个版本开始有问题，哪一步你现在不确定。"),hero("可要真是那一步错了，前面好多东西可能都得重来。我有点不敢往下查。"),line('导师',"那就先查它究竟影响了多少。改起来可能麻烦，但总不能因为已经做了很久，就当没看见。"),hero(s.known.future?'云端换了样本，结果就有星号了。我还没核清楚少掉的那批。':'我就是一直盯着那个不显著的结果，越看越觉得前面都白做了。'),line('导师','先把原始记录留好。你现在确定哪一步，就写哪一步，没核清的明天接着查。'),narr('老师说完，转回去收电脑，像这不过是一件需要慢慢查清的研究问题。你站在门边，居然有点羡慕这种镇定。')]:[narr("办公室门锁着。你看了眼微信，老师十点左右发的消息还在。看来今晚只能先把问题写清楚。"),hero("老师已经回去了。先把具体问题发过去吧，光在门口站着也没用。")]);break;
case 'depart':travel(s,'parking',3);break;
case 'scooter':case 'bicycle':travel(s,'road',id==='scooter'?18:30);say(s,[narr("出校门时红灯刚亮。车一辆辆停在高架前，过灯直行是地铁下的小路和楼栋后门；不过灯、提前右转，则能从正门回去。你握着车把，想起白天从没留意过这段路这么长。")]);break;
case 'goFront':if(s.time>=1500){say(s,[narr("正门口保洁用的灯已经关了，门禁正在夜间核验。玻璃映出一个举着手机的人——你停下了，她却没停。"),hero("不对。先回院楼，至少那边还有灯。不能在这里瞎试。")]);s.flags.frontClosed=true;}else{travel(s,'dorm',s.loc==='gate'?12:10);arrive(s)}break;
case 'followLight':choose(s,"你又向前蹭了一点，忽然发现水洼里只映着那辆车。你自己的车灯、影子，全都没有。",[['roadEnd','继续跟上前车'],['leaveEye','停下来，回到路口']]);break;
case 'roadEnd':showEnd(s,'road');break;
case 'enterGate':if(s.time>=1440)showEnd(s,'gate');else{travel(s,'dorm',2);arrive(s)}break;
case 'returnOffice':if(!s.flags.leftHome){action(s,'prepareLeave');break}travel(s,'office',15);enterOffice(s);break;
case 'wait5':case 'wait20':s.menu=null;tick(s,id==='wait5'?5:20);break;
case 'turnChair':if(s.loc!=='office'||s.time<WANG_LEAVES)break;s.menu=null;s.dialog=[];s.panel='encounter';s.cg='eye';s.cue='silence';if(!s.cgSeen.includes('eye'))s.cgSeen.push('eye');break;
case 'eye':if(s.loc!=='office'||s.time<WANG_LEAVES)break;horrorEnd(s,'face');break;

case 'revision':s.revision='future';if(!s.flags.visitedOffice)break;evidence(s,'future',"21:47 的修改",'Overleaf 出现两星结果，样本量是 7920，连清洗说明都写完了。修改时间标着 21:47，作者是我；我没有上传这张表，也没有提交这段说明。需要向千核实。');break;
case 'oldRevision':s.revision='old';evidence(s,'old',"千留着的旧说明",'昨天 20:54，千保留了“保留原始全样本”的说明。');break;
case 'permissions':s.tab='share';evidence(s,'permissions',"只有三位编辑者","Share 上只有我、老师和千。王光耀、师弟都不在名单里。……所以那次修改到底是谁做的？");break;
case 'replyComment':if(!s.flags.replied){tick(s,2);s.flags.replied=true;record(s,'comment','保留全样本，先核对删除清单。');evidence(s,'comment',"我留下的那句话",`${fmt(s.time)}：保留全样本，先核对删除清单。`);s.toast='回复已保存。笔记记下了准确时间。'}break;
case 'resolve':tick(s,1);s.flags.resolved=true;record(s,'resolve','解决来源批注');evidence(s,'risk',"一次过早的解决","批注仍绑在 original 上。它只是进了 History，并没有真的把这个问题核对清楚。");s.toast="解决记录已经提交，不能当作没按过。下次如果还回到九点，我得看着它会不会在同一时间再发生。";break;
case 'reopen':s.toast="已经提交的那次“解决”不能抹掉。想让新问题留在当前界面，只能另外建一条批注；旧动作到时仍会发生。";break;
case 'experiment':if(!s.known.loop){s.toast='还没有经历回退，无法检验重演。';break}if(!s.previous.some(e=>e.kind==='comment')){say(s,[hero("上次连一句能认出来的回复都没留下。这一轮得先写点什么，免得下次还是两眼一抹黑。")]);break}choose(s,"上一轮那句话明明已经发过。这次什么都不按，到时候它会自己出现吗？",[['predictReplay','它仍会在同一时刻出现'],['predictWrong','它只会在我再次按发送后出现'],['leaveEye','先检查上一轮的时间记录']]);break;
case 'predictWrong':say(s,[hero("如果非得我再点一次，之前那些莫名其妙的操作又是谁做的？不行，这次我要把手从键盘上拿开。")]);break;
case 'predictReplay':if(!s.known.loop||!s.previous.some(e=>e.kind==='comment'))break;{const e=s.previous.find(e=>e.kind==='comment');tick(s,Math.max(0,e.at-s.time));evidence(s,'experiment',"预测真的对了",`${fmt(e.at)}，手都没碰键盘，旧回复却准时出现。即便没在现场，也能和千的收件时间对上。`);evidence(s,'replay',"固定时间的重演","过去提交过的操作，会在原本的时间再来一遍。光看消息不会推动时间。");say(s,[narr(s.time>e.at?`你把 ${fmt(e.at)} 的收件时间和上次记下的那行笔记对在一起。分毫不差。这一轮，你根本没按过发送。`:`你把双手放在桌沿，死死盯着时间。到了 ${fmt(e.at)}，历史记录里忽然多出那句熟悉的话，作者还是你。`),hero("……真的来了。不是她现在替我回了什么，是我以前发出去的东西，自己又走了一遍。"),narr("你提前知道了它会出现，等它真的出现时，后背还是凉了一下。可至少这一次，你知道自己该害怕什么。")],'','proof');}break;
case 'backup':if(s.loc!=='dorm'||!s.flags.returnedHome)break;tick(s,3);s.flags.backup=true;s.panel='backup';evidence(s,'backup',"没被同步掉的旧文件",'宿舍旧电脑中保留着原始全样本、样本删除清单和两份运行日志。');break;
case 'compare':if(s.flags.backup&&s.known.future)choose(s,'原始样本 8240 条，p=0.507；新版 7920 条，p=0.019。删除清单没有预先约定的依据。这两颗星说明了什么？',[['wrongSample','两星证明删掉的样本都是噪声'],['classification','看过结果后选择性剔除样本，换来了显著性'],['wrongName','只是换了文件名，研究没有改变']]);break;
case 'wrongSample':case 'wrongName':say(s,[hero('不能因为有了星号，就说那批样本该删。先把清单找出来，看看当时到底留了什么理由。')]);break;
case 'classification':if(!s.flags.backup||!s.known.future)break;s.flags.verified=true;evidence(s,'verified','用一批样本换来的两颗星','原始全样本 8240 条，p=0.507；手动删除 320 条后为 7920 条，p=0.019。排除依据尚未核实，试跑发生在查看原始结果之后；本地标注“仅排查用”，云端却把它写成已完成的清洗。');say(s,[narr("你把两份日志并排拖开，一项项往下看。模型没换，变量也没换。到了样本数那一行，你停住了：少了 320 条，旁边的排除理由却空着。"),hero("……想起来了。当时为了排查，我临时把这批样本拿掉试了一次。两颗星就是那时候出来的。",'tense'),narr('试跑文件旁边还有你留下的备注：“排除依据未核实，仅排查用，不放正文。”云端版本里，这句话不见了。'),hero("我没有查完，所以把它搁下了。可刚才看到两颗星，我第一反应居然是：太好了，终于能讲了。"),narr("你把试跑备注和云端说明并排放着。同一份结果，从“仅排查用”变成了“按预定规则清洗”。它替你省掉的，恰好是你还没做完的核验。你没有关掉窗口，把两边的记录一起存了下来。")]);break;
case 'deduce':if(s.known.permissions&&s.known.author&&s.known.experiment)choose(s,'三位编辑者的记录已经核对，检验句也按预期重演。最能解释异常的是哪一种机制？',[['wrongServer','王光耀用另一个账号修改了项目'],['repeat','另一个我重演旧操作，直接认出她会回退'],['leaveEye','继续查看证据']]);else s.toast='还需要核实编辑者、千的记录，并完成重演实验。';break;
case 'wrongServer':say(s,[hero("Share 上根本没有王光耀。再说，如果是他偷偷改的，怎么解释那些每次准时出现的旧回复？我总得信已经看到的东西。")]);break;
case 'repeat':if(!s.known.experiment||!s.known.author||!s.known.permissions)break;evidence(s,'mechanism','可以利用的重复','她重演过去，我仍能另存一份新记录。避开直接对视，就能在旧操作之外完成新决定。');say(s,[hero("不用跟她抢着把这一晚重做一遍了。旧记录照旧来，我只要让它找不到新东西，再把真正核对过的那份留下。"),narr("你把笔记往前翻了一页，把散着的时间戳挨个划到一起。纸上还是一堆没解决的事，但现在至少知道先做哪一步。")]);break;
case 'breakLoop':if(!readyTE(s)){s.panel='notes';break}if(s.loc!=='office'){s.toast='需要回到工位电脑。';s.panel='notes';break}if(s.time>=deadline(s)){say(s,[hero("来晚了。原来的批注已经灰了……行，先把时间记下来。下次至少不用从头查起。")]);s.flags.windowMissed=true;break}choose(s,'旧批注将在 '+fmt(deadline(s))+' 归档。先把核查结果放在哪里？',[['protect','另存本地证据副本 · 2 分钟'],['wrongBreak','只把原段落的文字改回来 · 1 分钟']]);break;
case 'wrongBreak':tick(s,1);say(s,[hero("只改了表面的字，底下还是同一个 original。到了时间，那次旧操作还是会点中它。")]);break;
case 'protect':if(!readyTE(s)||s.loc!=='office')break;tick(s,2);s.flags.protected=true;choose(s,'副本已保留。把待核实批注绑定到哪里？',[['anchorOld','原段落 original：改动文字 · 2 分钟'],['anchorNew','复制为新段落 source_check，再绑定批注 · 2 分钟']]);break;
case 'anchorOld':tick(s,2);s.flags.reanchored=false;s.panel='overleaf';s.tab='comments';s.toast='批注仍绑定 original。可以在归档前改绑。';break;
case 'anchorNew':if(!s.flags.protected)break;if(s.time+2>=deadline(s)){tick(s,2);s.flags.windowMissed=true;say(s,[narr("新的段落还差最后一下没保存，屏幕另一侧的旧批注已经灰了。你把手停在鼠标上，好几秒没动。"),hero("……就差一点。好在文件没丢。下次我得先做这个，不能又拖到最后。")]);break}tick(s,2);s.flags.reanchored=true;s.panel='overleaf';s.tab='comments';s.toast="新的核查批注已经挂在 source_check 上。旧操作能找到 original，却碰不到这条新记录。";break;
case 'watchArchive':if(!s.flags.reanchored||!s.flags.protected)break;tick(s,Math.max(0,deadline(s)-s.time));s.flags.countered=true;s.panel='overleaf';s.tab='comments';s.cue='proof';s.toast="original 按时灰了下去。你屏住呼吸点开 source_check——它还亮着，状态仍是 Open。";break;
case 'screenOnly':if(s.flags.countered)choose(s,"那一下真的发生了。旧批注关了，新核查还在。把它和原始备份一起发出去，不能再只留在自己电脑里。",[['te','发送具体问题与明天的核查计划'],['leaveEye','再核对一次']]);break;
case 'te':if(s.flags.countered&&readyTE(s))showEnd(s,'te');break;

case 'rest':s.menu=null;tick(s,10);say(s,[narr("你趴在桌上闭了会儿眼。醒来第一反应还是去摸鼠标，手伸到一半才想起，刚才那些问题并没有自己消失。"),hero("……先喝水。至少先让我喝口水。")]);break;
case 'quiet':choose(s,"提示音停了。你才注意到房间里只剩窗外远远的车声，安静得让人有点不自在。",[['quietMore','连明早的闹钟也关掉'],['leaveEye','只静音，休息后继续']]);break;
case 'quietMore':choose(s,"你看着手机上关掉的闹钟，又看看还没合上的电脑。你明明知道事情没有结束，却忽然想留在这个没变化的晚上。",[['stay','我太累了，宁愿暂时没有明天'],['leaveEye','保留闹钟，明天再尝试']]);break;
case 'stay':showEnd(s,'stay');break;
case 'sleep':if(!s.flags.leftHome){choose(s,"结果和日志都存好了。电脑一合上，今晚就真能不再看它了吗？",[['homeEnd','不去工位了，先吃饭休息'],['prepareLeave','还是换个地方试试'],['leaveEye','再坐一会儿']]);break}choose(s,"东西都已经存过一遍了。接下来是继续核查，还是先想办法熬过今晚？",[[s.flags.verified&&s.flags.support?'he':'ne',s.flags.verified&&s.flags.support?'把核查计划发出去，明天继续':'先离开这一晚，留待白天核查'],...(s.flags.verified?[['delegate','查看那个已经完成的版本']]:[]),...(readyTE(s)?[['returnOffice','带证据回工位，执行破局']]:[]),['leaveEye','继续调查']]);break;
case 'he':if(s.flags.verified&&s.flags.support)showEnd(s,'he');break;case 'ne':showEnd(s,'ne');break;
case 'delegate':choose(s,"那份文稿里没有一处“待核实”。图表排得整整齐齐，连明天汇报时该停顿的地方都写好了。你看着它，几乎能想象自己照着念的样子。",[['replace','让她替我完成明天的汇报'],['leaveEye','保留我自己的问题']]);break;
case 'replace':showEnd(s,'replace');break;
case 'peephole':tick(s,1);say(s,[narr("猫眼里空荡荡的。你刚松开门把手，门外几乎同时传来另一声轻响——有人在另一边，也松开了手。"),line('门外','换个地方，就能看出漏掉了什么。'),hero("……这不是我出门前说的那句吗？当时房间里明明只有我一个人。")]);evidence(s,'door','门外重复的独白','门外的人重复了出门前只对自己说的话。');break;
case 'listen':tick(s,1);say(s,[narr("门外传来细碎的键盘声。你下意识屏住气，声音也跟着停了。等你忍不住喘出一口气，那边又敲起来，像有谁一直等着你接上下一句。")]);break;
case 'checkpoint':retryNight(s);break;
case 'askSenior':openPhone(s,'qian');break;case 'openEditor':if(['office','dorm'].includes(s.loc)){s.panel='overleaf';s.tab='history'}else s.toast='电脑在工位和宿舍。';break;
}}
function replies(s){const all={group:[['groupAck',"收到老师。我明天先把数据版本和还没核对完的地方汇报一下。"]],advisor:[['advisorQuestion','老师，我对了两份结果，样本量不一样。我想先查清少了哪些记录，暂时不往汇报里放。'],...(s.flags.verified?[['advisorPlan','老师，找到那批被手动删掉的样本了，当时没有留下排除依据。两星那版我先撤下，明天把原始结果和修改记录一起带来。']]:[])],qian:[...(s.known.future?[['seniorAuthor',"千，文稿里突然有两颗星了。我记得见过这个结果，但今晚没上传过。21:47那次更新是你做的吗？"]]:[]),...(s.flags.verified?[['seniorSupport','我把手动删掉的那批找到了。明天有空吗？咱俩一起把清单再过一遍。']]:[])],wang:[['wangWhere',"你还在楼里吗？我刚在这层听见一点动静。"],...(s.flags.chair?[['wangChair',"我确认一下，对面那把椅子今晚一直空着，是吧？"]]:[]),...(s.flags.forged?[['wangDeny','刚才那句“明天你陪你核对”不是我发的。']]:[])],ruan:[['ruanTalk',"……吃了。几块饼干，四舍五入算晚饭。"],['ruanThanks',"先不说我了，你最后吃的什么？我感觉我已经快忘了正常晚饭长什么样。"],['ruanVideo',"最近有没有什么好笑的视频？给我发一个吧，我想换换脑子。"]],qianSocial:[['qianInfo',"你转我的那个我看看吧。最近看自己的东西看得有点烦，想换换口味。"],['qianPressure',"你怎么又有新消息了……我还在改同一张表，感觉大家都在往前跑。"]],shidi:[['shidiThanks',"谢谢师弟！明天接头真不够我再来借。"]]};return[...(all[s.thread]||[]),...(s.thread==='qian'?all.qianSocial:[])].filter(([id])=>!s.replyFlags[id])}
function reply(s,id){const r=replies(s).find(x=>x[0]===id);if(!r)return;s.replyFlags[id]=true;msg(s,s.thread,'我',r[1]);tick(s,1);const a={groupAck:['师弟',"收到师姐，会议室我刚确认过了。投影线也带着，明天应该不会再跟设备斗智斗勇。"],advisorQuestion:['导师',"先把两个版本差在哪一步查清楚，暂时不要下结论。我今晚没改正文，待核实的批注也先别关。"],advisorPlan:['导师',"行。明天先告诉我哪几行出了问题、你打算怎么核，不用今晚赶着给出全部答案。"],seniorAuthor:['千',"不是我改的。我最后一次动它是昨天 20:54。你说的那条我打开历史看了，作者挂着你的名字。我先把记录留着。"],seniorSupport:['千',"没问题，明天一起对。你先把原文件留好，咱们从被删的那批开始，别急着连夜把所有东西翻一遍。"],wangWhere:['王光耀',s.flags.wangHome?"我已经到宿舍了，电脑刚放下。你那边怎么了？":s.flags.wangHeadingHome?"我正在回宿舍的路上，停好车才看到消息。你听见什么了？":s.flags.wangSafe?"我还在正门外，没回楼里。你听见的是哪边？":s.time<WANG_LEAVES?"还在这层，正收东西。你听见什么了？":"我已经离开工位了，没回去拿东西。你那边怎么了？"],wangChair:['王光耀',"没人坐过，一直空着。外套在那儿挂好几天了，我也没动。怎么突然问这个？"],wangDeny:['王光耀',"我只看见你账号发来这句话，不知道是谁发的。先别删，时间还在上面。"],ruanTalk:['软',"饼干博士，我建议你下一篇就研究“饼干作为正餐的可行性”。对照组记得安排一碗热面。"],ruanThanks:['软',"我在两家面馆之间反复横跳。一家起送价像融资门槛，一家配送费像要横跨半个中国。你快替我拍板。"],ruanVideo:['软',"一只猫把爪子洗得可认真了，洗完转头一脚踩进水碗。配字还写“测试全部通过，准备上线”。你看看像不像你。"],qianInfo:['千',"有个研究助理的实习，做文献和数据清理，时间听说挺灵活。还有那个应用微观工作坊，我都扔给你了，你哪天闲了再翻。"],qianPressure:['千',"你看到的都是我好意思往外发的东西。我卡住的时候也不发朋友圈啊。上次还是你帮我查出了那个问题呢。"],shidiThanks:['师弟',"没问题师姐，我会早点来试一遍投屏。对了，今天又刷到一篇新论文，越看越烧心……明天发群里一起烧。"]};if(s.flags[s.thread+'Lost']||(s.thread==='wang'&&s.flags.wangMissing)){s.toast='消息发出后，没有等到新的回复。';return;}msg(s,s.thread,...a[id]);if(id==='seniorAuthor')evidence(s,'author',"千确认的作者记录","千确认自己最后改动是昨天；她查看了那条历史记录，作者显示为我。她没有确认导师的操作。");if(['seniorSupport','advisorPlan'].includes(id)){s.flags.support=true;evidence(s,'support',"已经把核查计划发出去了","至少这回，我没把没弄清的问题装成已经处理完。")}if(id==='wangDeny')evidence(s,'forged',"一句不对劲的人称","“明天你陪你核对”从我的账号发出，却不是我发的。它连“我”和“你”都没分清。")}
function spots(s){const p=(id,label,x,y,w=10,h=14)=>({id,label,x,y,w,h}),clock=p('clock','看时间',95,6,7,9);const map={office:[p('computer','电脑 / Overleaf',24,55,20,22),p('chair','对面的空椅',34,45,12,15),p('person',s.time<WANG_LEAVES?'王光耀':'已经收空的位置',63,40),p('door','去走廊',88,25,12,34)],corridor:[p('office','共享工位',17,45,20,38),p('tea','接水区',34,48),p('notice','组会安排',41,35),p('mentor','导师办公室',88,42,13,30),p('parking','电梯 / 下楼',57,41,10,20)],mentor:[p('knock','敲门',89,49,12,30),p('door','返回走廊',49,73,25,20)],tea:[p('water',s.time<WANG_LEAVES?'接水 / 王光耀':'饮水机',18,47,22,45),p('reflection','金属挡板',49,31,30,26),p('door','返回走廊',87,41,18,45)],parking:[p('scooter','骑电动车 · 18 分钟',26,64,30,40),p('bicycle','骑共享单车 · 30 分钟',70,65,27,40),p('corridor','回到楼上',43,40,20,30)],road:[p('signal','红绿灯与水洼',12,27,17,29),p('front','过灯前右拐 · 正门',82,58,26,30),p('gate','直行穿过高架 · 小门',44,47,28,27),p('office','回院楼',7,78,10,16)],gate:[p('reader','小门刷卡器',49,46,18,22),p('front','退回路口走正门',82,57,24,28),p('office','回院楼',9,80,12,16)],dorm:[p('bag','电脑包',14,81,11,16),p('cup',s.flags.returnedHome?'桌左侧的水杯':'桌右侧的水杯',s.flags.returnedHome?18:39,s.flags.returnedHome?63:59,7,10),p('computer',s.flags.returnedHome?'打开合着的旧电脑':'电脑 / Stata',22,57,15,17),p('drawer','书桌抽屉',37,73,13,20),p('window','窗玻璃',60,34,25,35),p('bed','上铺 / 休息',25,15,37,24),p('door','宿舍门',87,44,15,45)]};return [...map[s.loc],clock]}
function valid(s,depth=0){if(!s||depth>1||s.version!==7||!Object.hasOwn(locations,s.loc)||!Number.isInteger(s.time)||s.time<1260||s.time>=1560||!Number.isInteger(s.round)||s.round<1)return false;
if(!['notes','events','previous','path','previousPath','fired','chat','dialog','unlocked','log','cgSeen'].every(k=>Array.isArray(s[k])&&s[k].length<5000))return false;
if(!['flags','known','settings','read','replyFlags'].every(k=>s[k]&&typeof s[k]==='object'&&!Array.isArray(s[k])))return false;
if(!['pending','tab','thread','phoneTab','revision','toast','cue','cg'].every(k=>typeof s[k]==='string')||typeof s.settings.audio!=='boolean'||typeof s.settings.motion!=='boolean'||![0,22].includes(s.settings.textSpeed))return false;
if(![...s.dialog,...s.log].every(l=>l&&['who','text','portrait'].every(k=>typeof l[k]==='string'))||!s.notes.every(n=>n&&['id','title','text'].every(k=>typeof n[k]==='string'))||!s.chat.every(m=>m&&typeof m.text==='string'&&typeof m.who==='string'&&Object.hasOwn(contacts,m.thread)&&Number.isInteger(m.id)&&Number.isInteger(m.at)))return false;
if(![...s.events,...s.previous].every(e=>e&&Number.isInteger(e.at)&&typeof e.text==='string'&&typeof e.id==='string'&&['comment','resolve','door','message','lock','unlock','dismiss','run'].includes(e.kind)))return false;
if(![...s.path,...s.previousPath].every(p=>p&&Number.isInteger(p.at)&&Object.hasOwn(locations,p.loc)))return false;
if(!s.unlocked.every(e=>Object.hasOwn(endings,e))||s.menu&&!(typeof s.menu.title==='string'&&Array.isArray(s.menu.items)&&s.menu.items.every(x=>Array.isArray(x)&&x.length===2&&x.every(v=>typeof v==='string'))))return false;
if(![null,'phone','overleaf','notes','note','paper','backup','settings','ending','gallery','stata','desktop','encounter'].includes(s.panel))return false;
return s.ending?Object.hasOwn(endings,s.ending)&&s.checkpoint&&!s.checkpoint.ending&&valid(s.checkpoint,depth+1):true}
// Horror rules: committed actions survive both calls and death retries.
Object.assign(endings,{
face:{tag:'即死 BE',title:'她终于看见你',cg:'assets/cg-eye-v4.png',lines:[narr("你绕过显示器。椅子上的人一动不动，你刚想退开，她的脸却猛地从屏幕后方贴了过来——近得连眨眼都来不及。"),narr("手机仍在一秒一秒往前走。你没有回到九点。喉咙里那口气，也没能再吸进来。")]},
vanish:{tag:'消失 BE',title:'查无此人',cg:'assets/cg-road-v4.png',lines:[narr("你顺着王光耀的声音拐过去。身后的感应灯啪地暗了，等你回头，来的路不见了。"),narr("微信里，王光耀的名字先变成了一块空白。紧接着，你自己的头像也不见了。输入框里无声地浮出一行字：这里从来没有这个人。")]},
opened:{tag:'即死 BE',title:'谢谢你开门',cg:'assets/cg-gate-v4.png',lines:[narr("你的手指刚把门把压下去，玻璃外那张脸就猛地撞近。明明隔着一扇门，声音却像贴在耳边说的。"),line('门外','不是你叫我来的吗？'),narr("手机没再响。你终于明白，这一次连等到回退的机会都没有了。")]},
missed:{tag:'BE',title:'未接来电',cg:'assets/cg-replace-v4.png',lines:[narr("铃声停了。走廊里的脚步还在往前，一下也没慢。"),narr("直到手机屏幕暗下去，你才发觉那脚步声一直踩着自己的呼吸。你刚吸进一口气，它就停在你身后。")]}
});
endings.te.lines=[narr('核查结束。全样本仍然是 8240 条，p=0.507，没有星号。你把它和删除清单一同保存；门外敲到一半的声音停了。'),narr('21:58，旧消息再次送达。你没有删除它，王光耀也确实听见了敲门声。但他已经站在正门外。'),narr('22:10，门把手按时转动。门禁仍然处于锁定状态。有人用你的声音，一遍遍请求开门。'),narr('22:17，你让来电响到结束。玻璃后的脸猛地贴近，随后沿着反光退了回去。时钟跳到了 22:18。'),hero('过去的事情还在。我只是没有再把接下来会发生什么交给它。'),narr('王光耀发来消息，问你明天要不要一起吃早饭。你把没有解决的课题保存好，回复他：好啊，明天见。')];
endings.he.lines=[narr('你把原始记录和待核实的问题发给导师，也把王光耀带到了正门。'),narr('你没有弄清门外的东西为什么能使用你的声音。你们离开时，院楼里的手机还在响。'),hero('明天先核对删除清单。今晚，我们先一起回去。'),narr('第二天早上，新的日期终于出现。群里照常提醒组会；相册里，却还留着一张你不记得拍过的空椅子。')];
endings.gate.lines=[narr('刷卡记录显示，你十分钟前已经进入楼栋。你仍然把卡贴了上去。'),narr('宿舍里的人抬起头，先你一步说出：我回来了。门在你身后关上。'),narr('手机停在当前时间。死亡没有让这一晚重新开始。')];
function committed(s){const map=new Map();for(const x of [...s.previous,...s.events])map.set(x.id,clone(x));return [...map.values()].sort((a,b)=>a.at-b.at)}
function retryNight(s){const keep={previous:committed(s),known:clone(s.known),notes:clone(s.notes),unlocked:s.unlocked,cgSeen:s.cgSeen,settings:s.settings,round:s.round,log:s.log};Object.assign(s,fresh(),keep);s.toast='重试这一轮：已发出的行为仍会按时发生。';replayOpeningJob(s);}
function horrorEnd(s,id){showEnd(s,id);s.cue='scare';s.flags.scareSerial=(s.flags.scareSerial||0)+1;}
function wangFarewell(s,onsite=false,at=s.time){if(!s.flags.wangSafe||s.flags.wangHeadingHome)return;s.flags.wangHeadingHome=true;s.flags.wangOutside=false;s.flags.wangHomeAt=at+18;evidence(s,'lockControl',"离开前拍下的门禁说明","王光耀拍的照片上写着：22:10 后不再受理夜间锁定。得等异常进入后再关门，人从正门撤离。");evidence(s,'wangRoute',"王光耀确认的回宿舍路线","到红绿灯前就右转，从正门进；别跟着高架下那辆车，更别绕去小门刷第二次卡。");msg(s,'wang','王光耀',"[门禁照片] 我刚在门厅拍的。十点十分之后就不能再锁了，你看清楚啊。还有，别把人关里面。",at);msg(s,'wang','王光耀',"我先回宿舍，到了给你发消息。你回去就在红绿灯前右转，走正门，别嫌绕路去小门。",at);if(onsite)say(s,[wang("那条真不是我发的。刚才你要没拦住我，我可能真就过去了……我都不知道自己在想什么。"),hero("我现在也解释不了。你先别回去了，回宿舍，到了就给我发个消息。"),wang("好。门禁照片我发你了。你也别硬撑，有事打电话啊——不对，先发消息也行。"),narr("他把杯子塞进包里，头盔扣了两次才扣紧。车灯从院门拐出去，汇进路上稀稀拉拉的车流。你站着看了好一会儿，直到再也分不清哪一辆是他。")],'','wangFarewell');}
function finishHorror(s){castTick(s);auditPressure(s);if(s.flags.breached&&!s.flags.auditDone&&!s.ending&&!s.pending.startsWith('end:')){showEnd(s,'opened');return;}
 if(s.ending||s.pending.startsWith('end:'))return;if(s.flags.wangHeadingHome&&s.time>=s.flags.wangHomeAt&&!s.flags.wangHome){s.flags.wangHome=true;msg(s,'wang','王光耀',"到宿舍了，刚把电脑放下，水也烧上了。这回杯子带回来了哈哈。你到了也说声，别再吓我。",s.flags.wangHomeAt);evidence(s,'wangHome','他已经回到宿舍','王光耀回到自己的宿舍并报平安，仍可以通过微信联系。');}if(s.flags.lockCaught){horrorEnd(s,'locked');return;}
 if(s.flags.visitedOffice&&s.time>=WANG_LEAVES&&!s.flags.disappearance){s.flags.disappearance=true;
 if(s.flags.doorRequested){msg(s,'wang','王光耀',"我过去看看，你先别动，在那儿等我一下。",WANG_LEAVES);
 if(!s.flags.wangSafe){s.flags.wangMissing=true;msg(s,'wang','王光耀',"别过来！这里根本没有楼梯。",WANG_LEAVES);s.cue='knock';if(['office','corridor','tea'].includes(s.loc)&&s.time<CLOSE_AT&&!s.dialog.length)say(s,[narr("王光耀端着杯子往后门走。手机亮了一下，是他刚发的：“我过去看看，你先别动，在那儿等我一下。”"),narr("门后传来三下敲击，像有人拿指节很耐心地试门。王光耀的脚步声忽然断了。只剩饮水机还在咕噜咕噜响。"),hero("王光耀？你别吓我啊，你还在接水吗？"),narr("没人回应。你盯着那条没再跳动的聊天记录，还是往接水区走了一步。")]);}
 else{s.flags.replayWitnessPending=true;}
 }else {s.flags.wangOrdinaryLeft=true;}
 }
 if(s.flags.replayWitnessPending&&!s.dialog.length&&s.time<CLOSE_AT){s.flags.replayWitnessPending=false;evidence(s,'rescued','他在楼外，回复仍然出现','21:58，王光耀已经离开后门路线。他没有发送，上一轮同一句回复却仍然到达。');s.cue='proof';say(s,s.loc==='parking'?[narr("21:58。你和王光耀都在正门外。他一只手抱着电脑包，另一只手正往里塞水杯，根本没空看手机。"),narr("手机一震。王光耀：我过去看看，你先别动，在那儿等我一下。"),hero("你刚刚……给我发消息了？"),wang("啊？没有啊。你看，我手机都没拿出来。"),narr("你把手机举到他面前，手指在那行时间上停住。跟上一轮一模一样。他人明明就在你身边，那条消息却又自己来了。")]:[narr("21:58。那句“我过去看看，你先别动，在那儿等我一下”又出现了。"),narr("紧跟着，他从正门外拍了张照片发你：“我没动手机，刚才那条不是我。”"),hero("他都已经出来了……那刚才往后门走的，究竟是谁？不，是那句话为什么还会来？")]);}
 if(s.time>=1330&&s.flags.visitedOffice&&!s.flags.doorAttack){s.flags.doorAttack=true;s.flags.knock=true;if(s.flags.wangSafe){wangFarewell(s,false,1330);msg(s,'wang','王光耀',"我走了啊。你别回头来找我，我真的不会再进楼了。");}else msg(s,'wang','我',"后门那边有人学你的声音。千万别开。",1330,true);}
 if(s.flags.visitedOffice&&s.time>=CLOSE_AT&&!s.flags.callDone){s.flags.callPending=true;choose(s,"22:17。屏幕亮起，来电人那一栏，赫然是你自己的手机号码。",[['answerCall','接通电话'],['refuseCall','让铃声响到结束']]);s.cue='ring';}
 if(s.flags.lockInsightPending&&!s.dialog.length&&!s.menu&&!s.flags.callPending&&!s.ending&&!s.pending.startsWith('end:')){s.flags.lockInsightPending=false;s.flags.lockInsightShown=true;say(s,[narr(s.loc==='corridor'?'门禁面板跳成“已锁定”。你的手还放在身侧，根本没碰过它。':'手机上的时间到了。你记得，上一轮就是这一分钟按下了锁门键。这里看不见那扇门，也听不见锁舌的声音。'),hero(s.loc==='corridor'?'门真的关了。我这次明明没碰过面板。':'消息会重演，锁门也应该一样。希望那一下没有白按。'),narr('上一轮按下按钮时的触感，你还记得。那一下没有被抹掉，和那些发出去的消息一样。'),hero('原来不只是它能借用过去的我。至少那次关门，是我自己留下的。')]);}
}
function horrorAction(s,id){
 if(s.ending&&id!=='checkpoint')return;
 if(s.flags.callPending&&!['answerCall','refuseCall','checkpoint'].includes(id))return;
 switch(id){
 case 'yanMeet':if(!['office','corridor'].includes(s.loc)||s.time>=1305)return;if(!s.flags.yanMet){tick(s,2);s.flags.yanMet=true;say(s,[narr("有人在门框上轻轻敲了两下。燕日央推推眼镜，从鼓鼓囊囊的帆布包里抽出一本书。"),line('燕日央',"喏，书。还有你夹里面这个，还是我送你的书签呢。",'yan'),hero("你云南买回来送我的，不用白不用。"),line('燕日央',"你真留到现在啊？我妈当初还说我买得花里胡哨、你肯定不会用。回头我得拿这个堵她嘴。",'yan'),narr("他把书放在桌角，你忽然想起小时候他就爱看这种大部头的书，还推荐给你妈妈，导致你被迫也读了几页。")]);}else choose(s,'燕日央把书放在桌边，给你留出摆电脑的地方。',[['yanChildhood','聊聊那张云南带来的书签'],['yanResearch','问问他今天查到了什么'],['leaveEye','让他先忙，继续工作']]);break;
 case 'yanChildhood':if(!s.flags.yanMet||!['office','corridor'].includes(s.loc)||s.time>=1310)return;tick(s,1);say(s,[line('燕日央',"我妈前几天又问你来着。你猜她和你妈聊了多久？都快忘了我在旁边吃饭。",'yan'),hero("上回她们还翻我们小时候的照片呢。"),line('燕日央',"别是小学时候的照片吧。",'yan')]);s.flags.yanMemory=true;break;
 case 'yanResearch':if(!s.flags.yanMet||!['office','corridor'].includes(s.loc)||s.time>=1310)return;tick(s,1);say(s,[line('燕日央',"我今天查了两份材料，写得都跟当事人亲眼见过似的。结果追到最后，俩人原来抄的是同一份回忆。",'yan'),hero("所以你也白忙一下午？"),line('燕日央',"也不能算白忙吧。至少知道不能让它俩互相作证了。就是为了得出这句话，我一下午没了。",'yan'),hero("听起来怎么跟我今天干的事一个味儿。"),line('燕日央',"那更得吃点好的了。不然今天唯一可确认的成果，就只剩咱俩饿肚子。",'yan')]);s.flags.yanResearch=true;break;
 case 'waitRuan':if(s.loc!=='dorm'||!s.flags.ruanArrival||s.flags.ruanMet)return;tick(s,Math.max(0,s.flags.ruanArrival-s.time));if(!s.flags.callPending)horrorAction(s,'ruanMeet');break;
 case 'ruanMeet':if(s.loc!=='dorm'||!s.flags.ruanArrival||s.time<s.flags.ruanArrival)return;if(!s.flags.ruanMet){tick(s,1);s.flags.ruanMet=true;s.flags.ruanVisitDeparted=false;say(s,[narr("你在楼下碰见软桃，她一手拎着两袋外卖，一手把滑下肩的包带往上抖。上楼时，她熟练地侧身绕过走道里乱放的椅子。"),line('软桃',"给你带了份正常晚饭。来，饼干博士，给热饭腾个位。我手快被袋子勒断了。",'ruantao'),hero("你微信里可没这么凶。刚才还问我要不要喝汤呢。"),line('软桃',"吃你的吧，都多晚了。",'ruantao'),narr("她把挎包甩到椅背上，拨了拨头发，先低头确认外卖没洒。这屋里突然多了塑料袋窸窣响、拆筷套和她嫌配送费贵的抱怨，你一下觉得像有人把“今晚”又还了回来。")]);}else choose(s,'软桃坐在桌边，手机屏幕停在一段猫的视频上。',[['ruanFood','拆开外卖，一起吃几口'],['ruanHonest','跟她说说今晚为什么想换个地方'],['leaveEye','先忙一会儿，让她等你']]);break;
 case 'ruanFood':if(s.loc!=='dorm'||!s.flags.ruanMet||s.flags.ruanVisitDeparted)return;tick(s,3);say(s,[line('软桃',"这家号称微辣。我的嘴刚替你测过了——老板和咱俩显然不是一套辣度标准。",'ruantao'),hero("你偷偷尝我那份了？"),line('软桃',"什么叫偷偷，我这是先替你排雷。快吃，等会儿凉了可别赖我。",'ruantao'),narr("你把纸巾盒往她那边推，她终于没憋住笑，把还没拆开的那份饭放到你面前。")]);break;
 case 'ruanHonest':if(s.loc!=='dorm'||!s.flags.ruanMet||s.flags.ruanVisitDeparted)return;tick(s,2);say(s,[hero("我去工位不是因为那边效率高。就是今天一看见这张桌子，我脑子里只剩那几个结果，真的烦。"),line('软桃',"我知道啊。你这几天给我发消息，三句里总有一句“我再跑一遍”。",'ruantao'),hero("我有时候真不知道自己到底在干吗。"),line('软桃',"所以先吃饭。你慢慢骂，我帮你骂两句也行。只是你这个面再放一会儿真要坨了。",'ruantao'),narr("她暂停了手机里的猫视频，却没按退出。你知道她不是在催你讲完——你们说够了，还可以接着一起看那个傻视频。")]);s.flags.ruanConfided=true;break;

 case 'answerCall':if(!s.flags.callPending)return;s.flags.callPending=false;rewind(s);if(s.round===2)say(s,[narr('电流似的嗡鸣突然断了。你猛地抬头，差点把膝盖撞到书桌底下。'),hero('……什么？'),narr('宿舍的灯亮着。Stata 窗口停在原来的位置，水杯放在桌子右边。'),hero('不对。我刚刚明明不在这里。'),...(s.known.wangEvidence?[hero('王光耀呢？我不是还在看他的消息吗？')]:[]),narr('你摸出手机。21:00。软桃问晚饭的那条消息，又亮在屏幕上。'),hero('手机坏了？电脑也坏了？这两个东西总不至于商量好一起坏吧。'),narr('你把手机锁屏、解锁，又去摸水杯。指尖碰到冰凉的杯壁，心里反而更慌。'),hero('冷的。它怎么又变冷了？'),narr('你盯着对话列表，手指悬在王光耀的头像上方。既想立刻问他，又怕他回你一句“你刚才不是来过了吗”。'),hero('先别慌。至少我还记得刚才发生过什么。先找一件能对得上的事。')],'stata');s.toast='';return;
 case 'refuseCall':if(!s.flags.callPending)return;s.flags.callPending=false;s.flags.callDone=true;if(s.flags.trapped&&s.flags.wangSafe){s.menu=null;s.dialog=[];s.pending='';const trip=s.flags.pendingTravel;delete s.flags.pendingTravel;if(trip){travel(s,trip.loc,trip.remaining);if(trip.loc==='dorm')arrive(s);else if(trip.loc==='office')enterOffice(s);}if(!s.dialog.length)say(s,[narr("铃声停了。22:18。走廊灯还亮着，手机却像忽然轻了很多。你站在原地，确认时间真的往前跳了一分钟。"),hero("……没回去？真的没回九点。可门只是关上了，其他事还没完。我得把宿舍那份原始文件交给能确认它的人。")]);s.time=Math.max(s.time,1338);evidence(s,'pastCall','第一次越过来电','没有接通，时间仍然继续。安全离开只完成了第一步。');}else horrorEnd(s,'missed');return;
 case 'requestDoor':if(!s.flags.visitedOffice||s.time>=WANG_LEAVES||s.flags.doorRequested)return;s.menu=null;tick(s,1);record(s,'door','能帮我开一下走廊的门吗？');s.flags.doorRequested=true;msg(s,'wang','我','能帮我开一下走廊的门吗？');msg(s,'wang','王光耀',"行，我接完水就过去。你先忙你的。");s.panel=null;s.thread='wang';say(s,[wang("行，我接完水就过去。你先忙你的。"),narr("你怕他一会儿忘记，索性又在微信里发了一遍：“能帮我开一下走廊的门吗？”发出去时你还觉得，这不过是顺手帮个忙。")]);break;
 case 'declineDoor':s.flags.doorDeclined=true;say(s,[hero("算了，先别去，可能是风。我一会儿也走正门，咱们别绕那边了。"),wang("行，那就不看了。你也别弄太晚。")]);break;
 case 'inspectWangCup':if(s.loc!=='tea'||!s.flags.wangMissing)return;const firstCup=!s.known.wangEvidence;tick(s,1);evidence(s,'wangEvidence','杯子、路线和 21:58 的消息','王光耀的杯子留在饮水机下，手机回复停在 21:58。后门路线没有通向楼下的出口。');evidence(s,'vanishing','后门路线中断','他答应替我查看后门，之后没有从正常出口离开。');say(s,[narr("水已经漫过杯沿，顺着接水台往下淌。你一眼认出杯盖上那道磨白的划痕，赶紧伸手把开关按回去。"),narr("杯子在，人却不在。旁边也没有电脑包。通向后门的短廊里，感应灯一盏一盏暗了下去。"),hero("是我让他去的……那句消息是我发的。他原本根本不用往后门走。",'tense'),narr("你把时间记下来，脚却像被钉在亮着的地砖上。后面那截走廊太黑了，你始终没再迈过去。")]);if(firstCup)s.dialog.push(hero('他只是帮我看个门。'),hero('我当时为什么非要多发那条微信？不发，他是不是就直接回去了？'),narr('对话框里仍留着他答应过去的那句话。你点开键盘，输入“别去了”，又一个字一个字删掉。'),hero('现在说有什么用。他都没回我。'),hero(s.known.loop?'下一次，我得在他过去之前拦住他。':'要是能再来一次……我一定不让他过去。'));break;
 case 'rescueWang':if(!s.known.wangEvidence){s.toast='还没有证据说明他会在这条路线遇险。';return;}if(s.flags.wangSafe||s.time>=WANG_LEAVES||!['office','corridor','tea'].includes(s.loc)){s.toast='他已经不在这里了。';return;}if(s.time+3>=WANG_LEAVES){tick(s,3);s.toast='你走到门边时，接水区的脚步声已经停了。';break;}
 s.path.push({at:s.time,loc:'corridor'});travel(s,'parking',3);s.flags.wangSafe=true;s.flags.wangOutside=true;say(s,[hero("你先别去后面了，陪我从正门下去一趟吧。我……有点事想跟你说。"),wang("你怎么了，脸色这么白？……行，等一下，我电脑装好就跟你走。"),narr("你站在旁边等他拉好电脑包拉链，连催了两次。你们穿过走廊、下楼，直到正门在背后合上，才听见他长长出了一口气。"),narr("门外冷风迎面一吹，你才发现手心里全是汗。你看了眼手机，离 21:58 还有一点时间。"),wang("现在能告诉我怎么回事了吗？你刚才那个样子，我还以为楼里着火了。"),hero('……我在等一条消息。'),wang('你怎么一直看我？我手机还在兜里呢。'),hero('我知道。就是因为你没拿出来。'),narr('你把自己的手机攥紧了些。最好别来。可它要是不来，你又怎么证明刚才那些事不是做梦？')]);break;
 case 'letWangGo':if(s.loc!=='parking'||!s.flags.wangOutside||!s.known.rescued||s.time<WANG_LEAVES)return;wangFarewell(s,true);break;
 case 'wangRoute':if(s.loc!=='road'||!s.known.wangRoute)return;action(s,'goFront');break;
 case 'wangOutsideTalk':if(s.loc!=='parking'||!s.flags.wangOutside)return;if(s.time>=WANG_LEAVES&&s.known.rescued){choose(s,'王光耀看了一眼时间，把水杯收进包里。',[['letWangGo','让他先回宿舍，到家报平安'],['leaveEye','请他再等一会儿，最迟 22:10 离开']]);return;}say(s,[hero("我知道你觉得奇怪，可我真的很怕你去后门会出事。咱俩先在这儿待一小会儿，行吗？"),wang("你都把我一路拽下来了，总得说说到底出了什么事吧。我有点慌了。"),hero("等一会儿我就告诉你。求你了，就在这儿，别回去。"),wang("……行。我不走。但你也别扔下我一个人跑回去啊。",'relieved')]);break;
 case 'returnForEvidence':if(s.loc!=='parking')return;choose(s,'王光耀留在正门外。返回楼内需要三分钟。',[['confirmReturn','告诉他留在外面，自己回去核查'],['leaveEye','继续留在楼外']]);return;
 case 'confirmReturn':if(s.loc!=='parking')return;travel(s,'corridor',3);say(s,[narr(s.flags.wangHeadingHome?"王光耀已经离开，你给他发了句“别回来了”，才重新推开院楼的门。":"你反复跟王光耀确认别跟进来，看着他点头，才把手搭上院楼正门。"),narr("楼里的风声和刚才没什么两样。只是这一次，走廊里少了王光耀熟悉的脚步。你知道他没有跟回来。")]);break;
 case 'followVoice':if(s.time<WANG_LEAVES||s.flags.wangSafe||!s.flags.wangMissing){s.toast='拐角里没有声音。';return;}choose(s,"拐角那边传来王光耀的声音，像隔着一道门。他刚刚却明明发消息叫你别过去。",[['vanishNow','走过拐角，寻找他'],['leaveEye','停在灯光下面']]);return;
 case 'vanishNow':if(!s.flags.wangMissing)return;evidence(s,'wangEvidence','消失之前的时间与路线','王光耀在 21:58 走向后门；跟随声音也会失去出口。');horrorEnd(s,'vanish');return;
 case 'unsafeDoor':choose(s,"门把手一点点往下沉，好像有人在外面试着压。声音确实熟悉，可隔着玻璃你根本看不清脸。",[['openFatal','压下把手，打开门'],['leaveEye','退开，不回答']]);return;
 case 'openFatal':horrorEnd(s,'opened');return;
 case 'sealDoor':if(!s.known.lockControl||!['corridor','office'].includes(s.loc)||s.time>=1330){s.toast='需要在 22:10 前到门禁面板操作。';return;}tick(s,2);if(s.time>=1330){s.toast='错过锁定窗口。先记下时刻，下次可以提前安排。';break;}record(s,'lock','锁定工位后门');applyGate(s,'lock',s.time,false);say(s,[narr(`门禁“滴”地响了一声，锁舌咔哒扣上。你盯着面板，记住这次锁门的时间：${fmt(s.time)}。`),hero("关上了。它会记住这一下……下一次，就算我不在这里，这扇门应该还是会在这个时候锁上。"),narr("门锁住了，之前发出去的开门请求却还在。必须等那东西进去、王光耀出来，再让旧锁定发生——否则就只是锁了一扇空门。")]);break;
 case 'unsealDoor':if(!s.known.lockControl||!['corridor','office'].includes(s.loc))return;tick(s,1);record(s,'unlock','解除工位后门锁定');applyGate(s,'unlock',s.time,false);say(s,[narr("门锁又开了。你没有抹掉早先的锁定操作，只是在它后面又补了一次更晚的解锁。")]);break;
 case 'waitGate':{const locks=s.previous.filter(x=>x.kind==='lock'&&x.at>s.time);if(!locks.length){s.toast='没有尚未发生的旧锁门操作。';return;}s.menu=null;tick(s,Math.min(...locks.map(x=>x.at))-s.time);break;}
 case 'sendPacket':case 'forecastOld':case 'askFresh':case 'answerFreshA':case 'answerFreshB':case 'answerFreshC':case 'finishTE':case 'dismissSenior':case 'ruanTest':case 'moveMeal':if(phaseTwo(s,id))return;break;
 case 'horrorPlan':s.panel=null;choose(s,s.known.loop?'阅读不推进时间。已经发生的操作仍会重演。':'阅读不计时；整理文件或等待会让这一晚继续。',[[s.time<WANG_LEAVES?'waitDeparture':'followVoice',s.time<WANG_LEAVES?(s.known.wangEvidence?'等待到 21:58，观察原来的时刻':'整理文件，等王光耀收拾好'):'看看接水区附近'],...(s.known.wangEvidence&&!s.flags.wangSafe&&['office','corridor','tea'].includes(s.loc)&&s.time<WANG_LEAVES?[['rescueWang',"提前陪王光耀从正门下楼 · 3 分钟"]]:[]),...(s.known.lockControl?[['sealDoor','操作门禁，留下锁定记录 · 2 分钟'],['unsealDoor','解除锁定 · 留下新记录'],...(s.previous.some(x=>x.kind==='lock'&&x.at>s.time)?[['waitGate','等待旧锁门操作发生']]:[])]:[]),['waitCall',s.known.loop?'等待到 22:17':'继续整理一会儿'],['leaveEye','继续调查']]);return;
 case 'waitDeparture':s.menu=null;{const stop=!s.known.yanArrival&&s.time<1295?1295:!s.known.qianWindow&&s.time<1300?1300:WANG_LEAVES;tick(s,Math.max(0,stop-s.time));}break;
 case 'waitCall':s.menu=null;tick(s,Math.max(0,CLOSE_AT-s.time));break;
 case 'breakLoop':case 'experiment':case 'deduce':case 'protect':case 'anchorOld':case 'anchorNew':case 'watchArchive':case 'screenOnly':case 'te':case 'predictReplay':case 'repeat':horrorAction(s,'horrorPlan');return;
 case 'sleep':if(s.loc==='dorm'&&s.flags.returnedHome&&s.flags.doorDeclined&&!s.flags.doorRequested&&!s.previous.some(x=>x.kind==='door')){showEnd(s,'ne');return;}if(s.flags.leftHome){choose(s,'你保存了当前的文件。今晚还有哪些事情需要得到确认？',[...(canFinish(s)?[['finishTE','保留完整记录，带着尚未解决的问题迎接明天']]:[]),...(allSafe(s)&&s.flags.receipt&&s.flags.verified?[['he','已经安全交出证据，今晚先到这里']]:[]),['askSenior','查看与千的核查对话'],...(!s.flags.callDone?[['waitCall',"保持清醒，等那通电话打来"]]:[]),['quiet','把消息静音'],['leaveEye','继续调查']]);return;}action(s,id);break;
 case 'he':if(allSafe(s)&&s.flags.receipt&&s.flags.verified)showEnd(s,'he');return;
 case 'ne':horrorAction(s,'waitCall');return;
 default:action(s,id);
 }
 finishHorror(s);
}
function horrorHotspot(s,id){
 if(s.dialog.length||s.panel||s.menu||s.ending)return;
 if(id==='yan'){horrorAction(s,'yanMeet');return;}if(id==='ruan'){horrorAction(s,s.flags.ruanArrival>s.time?'waitRuan':'ruanMeet');return;}
 if(id==='person'&&s.flags.wangSafe){say(s,[narr(s.flags.wangHeadingHome?"王光耀那边已经收得干干净净。你记得他推车离开院楼，正往自己的宿舍走。":"他的电脑已经收走。现在人留在正门外，没跟你进来。")]);return;}if(id==='water'&&s.flags.wangMissing){horrorAction(s,'inspectWangCup');return;}if(id==='outsideWang'){horrorAction(s,'wangOutsideTalk');return;}if(id==='corridor'&&s.loc==='parking'&&s.flags.wangOutside){horrorAction(s,'returnForEvidence');return;}
 if(id==='clock'){horrorAction(s,'horrorPlan');return;}
 if(id==='rescue'){horrorAction(s,'rescueWang');return;}
 if(id==='wangRoute'){horrorAction(s,'wangRoute');return;}if(id==='proofGate'){horrorAction(s,'waitGate');return;}if(id==='meal'){horrorAction(s,'ruanTest');return;}if(id==='seal'){horrorAction(s,'sealDoor');return;}
 if(id==='voice'){horrorAction(s,'followVoice');return;}
 if(id==='dangerDoor'){horrorAction(s,'unsafeDoor');return;}
 if(s.round===1&&!s.flags.doorDeclined&&!s.flags.wangOutside&&['mentor','parking'].includes(id)){say(s,[narr('王光耀正准备收拾东西。你打算等他一起下楼，先在附近看看。')]);return;}
 hotspot(s,id);finishHorror(s);
}
function horrorNext(s){next(s);if(!s.dialog.length)finishHorror(s);}
function horrorReplies(s){return [...replies(s),...phaseReplies(s),...(s.thread==='ruan'&&s.loc==='dorm'&&!s.flags.ruanArrival?[['inviteRuan','我在宿舍，带上你的晚饭来一起吃吧。']]:[]),...(s.thread==='yan'&&!s.replyFlags.yanReply?[['yanReply','我可能会去工位，见面再把书给我吧。']]:[]),...(s.thread==='wang'&&s.flags.visitedOffice&&s.time<WANG_LEAVES&&!s.flags.doorRequested?[['requestDoor','能帮我开一下走廊的门吗？']]:[])];}
function horrorReply(s,id){if(['sendPacket','forecastOld','askFresh','answerFreshA','answerFreshB','answerFreshC','dismissSenior','finishTE'].includes(id)){if(!phaseReplies(s).some(x=>x[0]===id))return;phaseTwo(s,id);finishHorror(s);return;}if(['inviteRuan','yanReply'].includes(id)){const option=horrorReplies(s).find(x=>x[0]===id);if(!option)return;const thread=s.thread;msg(s,thread,'我',option[1]);s.events.push({id:'message-'+thread+'-'+s.time+'-'+id,kind:'message',at:s.time,text:option[1],thread});tick(s,1);s.replyFlags[id]=true;if(id==='inviteRuan'){s.flags.ruanArrival=s.time+8;msg(s,'ruan','软',"我买两份，快到了给你消息。记得下来接我，别又让我提着饭在楼下猜哪栋是你的。");}else msg(s,'yan','燕日央',"好，查完我过去。你要不在，我就先把书背回去，下次你自己来拿。");finishHorror(s);return;}if(id==='requestDoor'){horrorAction(s,id);return;}const old=s.chat.length;reply(s,id);for(const m of s.chat.slice(old).filter(m=>m.who==='我'&&!m.ghost)){const key='message-'+m.thread+'-'+m.at+'-'+id;if(!s.events.some(x=>x.id===key))s.events.push({id:key,kind:'message',text:m.text,at:m.at,thread:m.thread});}finishHorror(s);}
function horrorSpots(s){let p=spots(s);if(s.loc==='road'&&s.known.wangRoute)p.push({id:'wangRoute',label:'按王光耀确认的路线走正门',x:74,y:38,w:22,h:12});if(s.loc==='dorm'&&s.flags.ruanMet&&!s.flags.ruanVisitDeparted)p.push({id:'meal',label:'桌上的外卖与资料',x:44,y:64,w:13,h:16});if(s.loc==='parking'&&s.previous.some(x=>x.kind==='lock'&&x.at>s.time))p.push({id:'proofGate',label:'观察旧门禁记录',x:45,y:25,w:12,h:14});if(s.loc==='parking'&&s.flags.wangOutside)p.push({id:'outsideWang',label:'正门外的王光耀',x:80,y:28,w:13,h:30});if(s.flags.wangSafe)p=p.filter(x=>x.id!=='person');if(['office','corridor'].includes(s.loc)&&s.time>=1295&&s.time<1305)p.push({id:'yan',label:s.flags.yanMet?'和燕日央聊聊':'门边的燕日央',x:3,y:38,w:11,h:28});if(s.loc==='dorm'&&s.flags.ruanArrival&&!s.flags.ruanVisitDeparted)p.push({id:'ruan',label:s.time<s.flags.ruanArrival?'等软桃到楼下':'软桃 · 一起吃晚饭',x:66,y:58,w:13,h:25});if(s.round===1&&!s.flags.doorDeclined&&!s.flags.wangOutside)p=p.filter(x=>!['mentor','parking'].includes(x.id));if(['office','corridor','tea'].includes(s.loc)){if(s.known.wangEvidence&&!s.flags.wangSafe&&s.time<WANG_LEAVES)p.push({id:'rescue',label:'陪王光耀去正门',x:76,y:45,w:10,h:20});if(s.known.lockControl)p.push({id:'seal',label:'门禁夜间锁定',x:90,y:30,w:8,h:15});if(s.time>=WANG_LEAVES&&!s.flags.wangSafe&&s.flags.wangMissing)p.push({id:'voice',label:'拐角传来的声音',x:3,y:25,w:10,h:30});}if(s.flags.knock)p.push({id:'dangerDoor',label:'回应门外的人',x:86,y:52,w:10,h:20});return p;}
// Phase two: replayed physical operations and evidence with a live receipt.
endings.locked={tag:'BE',title:'门里面的人',cg:'assets/cg-gate-v4.png',lines:[narr('门禁按记录锁定。你计划得没有错，只漏掉了一件事：你自己仍在工位里面。'),narr('显示器后的椅子慢慢转过来。门外的脚步声，再也听不见了。')]};
endings.te.lines=[narr('核查结束。全样本仍然是 8240 条，p=0.507，没有星号。你把它和删除清单一同保存；门外敲到一半的声音停了。'),narr('旧锁门操作按时发生。你已经在楼外，王光耀也在安全的位置，里面的声音没有再追出来。'),narr('原始备份抵达千的电脑。他没有只回一句“收到”，而是问起另一条记录。你们对照同一份文件，确认了具体的问题。'),line('千 · 微信','这两行对上了。今晚先保留原始版本，明天从这里继续。我把要查的内容也写进记录了。'),narr('旧消息仍然留在屏幕上。你没有删掉它们，也不再需要它们替你把事情说得完美。'),hero('明天的结果可能还是不显著。那就从已经确认的这一行，接着做。'),narr('新的消息出现在旧记录下面。窗外驶过一班列车，时钟继续往前。')];
function applyGate(s,kind,at,replayed){s.flags.lastGateAt=at;s.flags.lastGateReplay=replayed;
 if(kind==='unlock'){s.flags.gateClosed=false;s.flags.sealed=false;s.flags.trapped=false;if(s.flags.doorRequested&&at>=WANG_LEAVES&&at<1330)s.flags.echoEntered=true;if(replayed)evidence(s,'unlockReplay','更晚的解锁也会重演',fmt(at)+(s.loc==='corridor'?'，面板恢复通行。':'，到了旧解锁记录的时刻；离开后无法查看门禁现状。')+'旧锁定记录没有消失，后面还有这次解锁。');return;}
 s.flags.gateClosed=true;s.flags.sealed=true;
 if(at>WANG_LEAVES&&at<1330&&s.flags.echoEntered&&s.flags.wangSafe){s.flags.trapped=true;if(!s.flags.lockStarted)s.flags.lockStarted=at;if(s.loc==='office'){s.flags.lockCaught=true;return;}if(replayed){s.flags.lockReplay=true;if(!s.flags.lockInsightShown)s.flags.lockInsightPending=true;evidence(s,'remoteLock',s.loc==='corridor'?'没有碰过的锁门键':'记住的锁门时刻',s.loc==='corridor'?fmt(at)+'，我站在面板前，看见旧锁门操作自行发生。':fmt(at)+'，到了上一轮锁门的时刻。我已经离开，无法查看现在的门禁；只能根据旧操作的重演规律推断。');s.cue='proof';}else evidence(s,'gatePrepared',"终于留下的关门记录",`${fmt(at)}，等那东西进去后，门被锁住了。下一轮这条操作还会照做，那时我就能提前离开。`);}
 else evidence(s,'gateTiming',"锁对了时间，却没锁对人",`${fmt(at)}，关门时位置还不对。旧操作删不掉，只能再安排一次解锁和更晚的锁定。`);
}
function phaseReplies(s){if(s.thread!=='qian')return [];return [
 ...(!s.flags.verified&&!s.replyFlags.dismissSenior?[['dismissSenior',"我先自己查一遍，你那边先别跟着动，免得两个版本又对不上。"]]:[]),
 ...(s.flags.verified&&s.flags.backup&&!s.flags.packetSent?[['sendPacket',"把全样本和删除清单发给千，说明两星是怎么来的"]]:[]),
 ...(s.known.loop&&s.previous.length&&!s.flags.forecastSent?[['forecastOld',"提前告诉千：哪条旧消息会在什么时候再出现"]]:[]),
 ...(s.flags.packetSent&&!s.flags.challenge&&!s.flags.receipt?[['askFresh',"请千从删除清单里挑一项，现在对一遍"]]:[]),
 ...(s.flags.challenge?[['answerFreshA','删除清单共有 320 条观测。'],['answerFreshB','这些记录来自 16 个地区。'],['answerFreshC','两星说明清洗是有效的，不必再核对。']]:[]),
 ...(canFinish(s)?[['finishTE','保留完整记录，约好明天从这一行继续']]:[])
 ];}
function canFinish(s){return allSafe(s)&&!!(s.flags.auditDone&&s.flags.receipt&&s.flags.verified&&s.flags.forecastSent&&s.flags.trapped&&s.flags.lockReplay&&s.flags.callDone&&s.loc==='dorm');}
function phaseSend(s,id,text,kind='message'){msg(s,'qian','我',text);const key=kind+'-'+s.time+'-'+id;if(!s.events.some(e=>e.id===key))s.events.push({id:key,kind,at:s.time,text,thread:'qian'});}
function phaseTwo(s,id){
 if(s.flags.callPending||s.ending)return true;
 switch(id){
 case 'dismissSenior':if(s.replyFlags.dismissSenior||s.flags.verified)return true;tick(s,1);s.replyFlags.dismissSenior=true;phaseSend(s,id,"我先自己查一遍，你那边先别跟着动，免得两个版本又对不上。",'dismiss');s.flags.reviewPaused=true;msg(s,'qian','千',"好，我先停在这儿。你确定要一起查了再叫我，别俩人同时改同一份。");break;
 case 'sendPacket':if(!s.flags.qianOffline||s.flags.qianLost){s.toast='千还没有同意改用离线核查，先联系并验证异常。';return true;}if(s.loc!=='dorm'||!s.flags.backup||!s.flags.verified||s.flags.packetSent)return true;tick(s,2);s.flags.packetSent=true;s.flags.reviewPaused=false;phaseSend(s,id,"[原始备份] 我对上了。全样本 8240 条，p=0.507；后来手动删了 320 条，才变成 p=0.019、两颗星。这只是我搁下的排查试跑，备注写着不能放正文，云端却把它当成了定论。你帮我把完整文件留一份，这版结论先别用了。");msg(s,'qian','千',"收到。我现在打开。你先别关电脑，我看有一行得跟你当场核一下。");s.panel='phone';s.thread='qian';break;
 case 'forecastOld':if(!s.flags.qianTrusted){msg(s,'qian','千',"你先别让我光凭一句“循环”就信。告诉我一条消息和时间，我把编辑窗口关掉，亲眼等它来。");return true;}if(!s.known.loop||!s.previous.length||s.flags.forecastSent)return true;tick(s,1);s.flags.forecastSent=true;const relevant=s.previous.filter(e=>e.kind==='dismiss'||e.thread==='qian'||e.kind==='comment');const record=relevant.length?relevant:s.previous.filter(e=>e.kind==='door'||e.kind==='lock');phaseSend(s,id,`我已经记下来了：${record.map(e=>fmt(e.at)+' '+e.text).join('；')}。这些旧消息会照原时间再发一次。要是等会儿真来了，咱们仍按刚说好的查，别把旧话算作我这次的新决定。`);msg(s,'qian','千',"好，我把时间记下来，不急着猜为什么。先拿原始文件再对一条新的，看看你这次真正看到的是什么。");break;
 case 'askFresh':if(s.flags.qianLost)return true;if(!s.flags.packetSent||s.flags.challenge||s.flags.receipt)return true;tick(s,1);s.flags.reviewPaused=false;s.flags.challenge=s.round%2?{row:'地区数',answer:'B'}:{row:'观测数',answer:'A'};phaseSend(s,id,"你从删除清单里另外挑一项问我吧。我直接查本地文件，咱俩现在对。");msg(s,'qian','千',"我这边打开的是你刚发的清单。你看一下，被删记录的"+s.flags.challenge.row+"是多少？直接查清单回我，先别看那张带星号的表。");break;
 case 'answerFreshA':case 'answerFreshB':case 'answerFreshC':if(!s.flags.challenge||s.loc!=='dorm')return true;{const question=s.flags.challenge;tick(s,1);const answer=id==='answerFreshA'?'A':id==='answerFreshB'?'B':'cloud';phaseSend(s,id,answer==='cloud'?'两星说明清洗是有效的，不必再核对。':answer==='A'?'清单里有 320 条观测。':'来自 16 个地区。');if(answer!==question.answer){msg(s,'qian','千',"等等，这跟我手里的原始文件对不上。你再翻一下本地备份，我们先停在这里，别急着往后做。");}else {s.flags.receipt=true;s.flags.qianSafe=!!s.flags.qianOffline;s.flags.challenge=null;s.flags.support=true;evidence(s,'liveReceipt','对方确实在读原始记录','千对的是另一份离线文件，清单里的数和我这边一致。那次删除留下了记录，现在不只我一个人看见了。');msg(s,'qian','千',"对，我这边也是这个数。两份记录我都留好了。你把本地核查另外存一份，原来的全样本别再动了。");s.cue='proof';}}break;
 case 'finishTE':if(canFinish(s))showEnd(s,'te');return true;
 case 'ruanTest':if(s.loc!=='dorm'||!s.flags.ruanMet||s.flags.ruanVisitDeparted)return true;choose(s,"软桃正要把饭放到桌子右侧。你看着那边摊开的材料，忽然想试试：如果现在把位置换掉，她会怎么做？",[['moveMeal','把资料移到右边，让左侧空出来'],['leaveEye','先不挪动']]);return true;
 case 'moveMeal':if(s.loc!=='dorm'||!s.flags.ruanMet||s.flags.ruanVisitDeparted)return true;tick(s,1);say(s,[narr("你把摊开的资料往右挪。软桃的手在半空停了停，把饭盒换到左手，顺势放在你刚腾出的空位上。"),line('软桃',"你这是给晚饭临时调座位啊？行，我放左边。汤离纸远点，你那一堆东西泡了可别哭。",'ruantao'),hero("你看见我刚才把东西挪了，对吧？"),line('软桃',"……我又不是机器人。你今天到底怎么回事，怎么老确认这种事？",'ruantao')]);evidence(s,'newResponse',"她回应了刚刚发生的事","软桃看到我这一轮挪动资料，才临时改变了放饭的动作。这不是重复一条旧消息能做到的。");break;
 default:return false;
 }
 finishHorror(s);return true;
}
// Four-person appointment and trust arc, 0.7. Knowledge persists; people do not remember loops.
const art={yanProof:{title:'过场 · 他替你拿着手机',cg:'assets/cg-yan-proof-v7.png'},ruanWitness:{title:'过场 · 门外是她的声音',cg:'assets/cg-ruan-door-v7.png'},qianProof:{title:'过场 · 另一所学校的屏幕',cg:'assets/cg-qian-link-v7.png'},wangFarewell:{title:'过场 · 回到自己的宿舍',cg:'assets/cg-wang-farewell-v7.png'}};
endings.vanish.cg='assets/cg-vanish-v8.png';endings.opened.cg='assets/cg-opened-v8.png';endings.missed.cg='assets/cg-missed-v8.png';endings.te.cg='assets/cg-te-v7.png';endings.locked.cg='assets/cg-locked-v7.png';
endings.missedFriends={tag:'BE',title:'错过的约定',cg:'assets/cg-friends-v8.png',lines:[narr('你把没有得到回答的对话一个个打开。名字还在，新的消息却没有再出现。'),narr('你记下最后联系的时间。下一次，要在那之前赴约。')]};
endings.te.lines=[narr('核查结束。全样本仍然是 8240 条，p=0.507，没有星号。你把它和删除清单一同保存；门外敲到一半的声音停了。'),narr('燕日央发来离开侧门的照片。王光耀已经在宿舍烧上水。软桃坐在你的桌边，把两份晚饭重新热了一遍。'),line('千 · 微信','全样本和删除清单都保存在我这边了。0.507 也留着，明天就从这里讲。'),narr('工位的门禁按旧记录锁住，四个人都给出了危险时刻之后的新回应。这一次，你不再只凭自己的记忆判断。'),narr('你们轮流打了个盹。窗外第一班列车经过时，天已经亮了。软桃下楼买来早餐，手机上多了三条新的报平安消息。'),line('软桃','早餐还吃不吃？再看下去又凉了。','ruantao'),hero('吃。今天先从确认过的那一行继续。'),narr('你把手机放回桌面。课题还没有完成，但明天终于不再只有你一个人面对。')];
// Polished endings; preserve ending IDs, art and eligibility.
endings.he.lines=[narr("你把原始文件和没查清的地方发给导师，又确认了一遍那三条报平安的消息。软桃还在桌边，伸手把你的水杯往远离电脑的地方挪了挪。"),narr("千那边已经留好了证据，本地最后的核查却还没做完。你关上结果窗口，手仍压在鼠标上，过了一会儿才松开。"),hero("先到这里吧。删掉的那批记录还得查，明天我把事情说清楚。"),narr("第二天早上，日期终于变了。群里照样提醒组会；相册里却多出一张空椅子的照片。你盯着看了很久，怎么也想不起自己什么时候拍过。")];
endings.te.lines=[narr("full_sample.log 终于出现在目录里。你重新打开它，8240 条，p=0.507，没有一行被换掉。那些挡着保存按钮的窗口一齐消失了。门外敲到一半的声音，也断了。"),narr("燕日央发来从正门离开的照片，玻璃上还映着门厅的灯。王光耀报平安，说刚到宿舍，水已经烧上。软桃坐在你桌边，把那两份凉了又热的晚饭往中间推了推。"),line("千 · 微信","全样本和删除清单我都留好了，两边对得上。0.507 也留着，明天就从这个结果往下查。"),narr("你翻过今晚的记录：那次提前留下的锁门操作给你争取了时间，朋友们也都在各自的危险时刻之后给了新的回应。软桃就在桌边，正低头拆筷子。你看着她，终于不再一遍遍翻那条锁门时间记录。"),narr("你们轮流眯了一会儿。第一班列车从窗外驶过时，你才意识到天已经亮了。软桃下楼买早餐，回来时还在抱怨豆浆排队太长；手机上，三条新的报平安消息好端端地留着。"),narr("你醒来时第一反应还是摸手机。不是九点，也不是那串等得心口发紧的数字。楼下有人收早餐摊，塑料凳拖过地面，吵得很实在。"),line("软桃","早餐吃不吃？我排半天队买的，你再看电脑它可真要凉了。",'ruantao'),hero("吃啊。等吃完了，再从确认过的那行往下查。"),narr("你把手机扣在桌上，第一次没急着确认时间。论文还没写完，错误也还得核。但桌对面有人在拆早餐袋，窗外是一个从未重复过的清晨。")];
endings.stay.lines=[narr("你按掉闹钟，把电脑包从椅背上取下来，放回老地方。这一次，不给下一个夜晚留下任何新的任务。"),narr("灯始终亮在你喜欢的那个档位。列车照着同一种节奏从窗外经过；软桃那句问晚饭的话，怎么也等不到一个“昨天”。"),hero("我知道还有别的办法。可是……再让我在这儿待一会儿吧。哪怕这一会儿永远过不去。"),narr("门外终于不再催促。你把头埋进被子，听见下一班列车，和上一班没有任何区别。")];
endings.replace.lines=[narr("那份没有一个问号的版本顺顺利利通过了组会。你听见“自己”把每个问题解释得干干净净，连停顿都恰到好处。台下没有人追问那份删除清单。"),line("导师 · 微信","材料收到了，后续注意把完整修改记录留好。"),narr("你还没伸手，“好的老师”已经替你发出去了。玻璃里那只手先一步合上电脑，慢慢拔下桌边的充电线，像是习惯性地等你跟上。"),hero("……我以为交出去的，只是一份汇报。")];
endings.gate.lines=[narr("刷卡记录里写着，你十分钟前已经进去过。你攥着卡站了半晌，最后还是贴到读卡器上。"),narr("宿舍门开着一条缝。里面的人抬头，声音和你一模一样：“我回来了。”你来不及往后退，门就在身后关上。"),narr("手机上的时间没有倒退，甚至还在往前走。你盯着那一秒一秒变化的数字，终于明白这一次不会再回到九点。")];
endings.road.lines=[narr("你跟在那辆车后面，绿灯一直不肯变红。地铁从头顶轰隆隆开过去，声音远了，过不了多久却又从同一个方向传来。"),narr("第三次看见那间值班室，你猛地刹住车。前面那辆车也停了，与你之间仍隔着不多不少的那段距离。"),hero("我不是一直在往前骑吗……为什么宿舍还是那么远？"),narr("导航上的路线拉成了一条笔直的线。你往前走一步，终点就往前退一步，永远停在下一个路口。")];
endings.ne.lines=[narr("你把各个版本存好，给导师发了消息，说样本删除记录还需要复核，不能把当前结论当成已经完成。发送完，你很久都没把手机放下。"),narr("门外的脚步声不知什么时候停了。天亮以后，你下楼买早餐，付款时看见手机日期终于跳到了新的一天。"),narr("还有很多事讲不清，你也没打算装作讲清了。早餐有点烫，你捧着袋子往回走，开始想今天先查哪一行。")];
endings.home.lines=[narr("你把运行日志保存好，合上电脑。软桃正在微信里认真比较两家店的起送价，一边截图一边骂配送费。"),line("软 · 微信","决定了，吃面。再纠结下去早餐店都开门了。"),hero("行，那我也吃面。样本清单明天再核，今晚不跟这台电脑耗了。"),narr("第二天早上，数据里的问题当然没凭空消失。你吃完饭，擦干净手，重新打开了文件。")];
endings.face.lines=[narr("你绕过显示器，刚要看清那个人的侧脸，她却像一直在等这一刻似的，猛地朝你转过头来。距离太近了，你甚至来不及看清她的表情。"),narr("手机上的秒数还在跳。没有回到九点。你张嘴想喊出声，却再也吸不进第二口气。")];
endings.vanish.lines=[narr("你跟着王光耀的声音拐过那个角。背后灯啪地熄了，再回头时，连通向大厅的那段走廊都不见了。"),narr("微信里王光耀的名字变成空白。你还没来得及退出，对话框上方自己的头像也消失了。输入栏里慢慢浮出一句话：这里从来没有这个人。")];
endings.opened.lines=[narr("你的手指压下门把。玻璃外的脸忽然撞到眼前——那一声闷响很轻，近得像贴着耳膜。"),line("门外","不是你叫我来的吗？"),narr("手机始终没有响。这一次，你连等到那通电话的机会都没有。")];
endings.missed.lines=[narr("铃声终于停了。你刚松一口气，才发现走廊里的脚步还在继续，甚至比刚才更近。"),narr("你试着屏住呼吸，脚步也停了。你再吸气，它就跟着迈出最后一步。手机暗下去时，身后有什么东西碰到了你的肩膀。")];
endings.locked.lines=[narr("门禁照着记录锁上了。你每一步都算对了，只漏掉一件事——你自己还没走出工位。"),narr("门外的脚步声渐渐听不见。你回头时，显示器后面那把椅子正慢慢转过来。")];
endings.missedFriends.lines=[narr("你把对话框一个个点开。头像和名字都还在，最后一条消息却像被谁按住，再也没往下跳过。"),narr("你打开备忘录，记下最后联系的时间。手抖得厉害，第三个数字输了两次。要是还能再回去，必须赶在这些时间之前找到他们。")];
endings.openedOffice={tag:'即死 BE',title:'谢谢你开门 · 工位',cg:'assets/cg-opened-office-v10.png',lines:[narr('你压下玻璃门的把手。门禁灯亮着，玻璃另一侧的脸却突然贴了上来。那顶帽子和你的一模一样。'),line('门外','不是你叫我来的吗？'),narr('身后的显示器一排排暗下去。你还攥着门把，已经听不见走廊里的声音。')]};
endings.opened.title='谢谢你开门 · 宿舍';
endings.opened.lines=[narr('你压下宿舍门的把手，门缝里先伸进来几根手指。紧接着，一张和你一模一样的脸挤到了眼前。'),line('门外','不是你叫我来的吗？'),narr('床下的台灯还亮着，电脑停在刚才的页面。门却越开越大，挡住了你退回桌边的路。')];
function allSafe(s){return !!(s.flags.wangHome&&s.flags.yanSafe&&s.flags.ruanSafe&&s.flags.qianSafe&&!s.flags.yanLost&&!s.flags.ruanLost&&!s.flags.qianLost);}
function castStatus(s){return [
 ['燕日央',[s.known.yanArrival?'21:35 收到他到门口的消息':'只知道他也在院楼',s.known.yanDeparture?'21:45 去了资料室':'',s.known.yanDeadline?'22:05 侧门最后一次联系':''].filter(Boolean).join('；'),s.flags.yanLost?'失联':s.flags.yanSafe?'已确认离开院楼':s.flags.yanWarned?'已提醒改走正门':s.flags.yanTrusted?'亲眼见过消息重演':s.flags.yanMet?'已经见过面':'尚未见面'],
 ['王光耀',s.known.wangEvidence?'21:58 的回复之后，只找到了接水区的杯子':'他在工位，还没有确认离开的时间',s.flags.wangMissing?'失联':s.flags.wangHome?'已到宿舍':s.flags.wangHeadingHome?'回宿舍途中':s.flags.wangSafe?'已陪他离开院楼':'在楼内'],
 ['软桃',[s.known.ruanArrivalSeen?'22:20 收到楼下的消息':'她在买晚饭',s.known.ruanDeadline?'上次最后联系：22:30':''].filter(Boolean).join('；'),s.flags.ruanLost?'失联':s.flags.ruanSafe?'陪在宿舍里':s.flags.ruanTrusted?'两个人都听见了门外的声音':s.flags.ruanMet?'已当面接到':s.flags.ruanExtended?'已请她在正门多等一会儿':'还没见到她'],
 ['千',[s.known.qianWindow?'21:40 回复，说回到电脑前了':'刚听完报告，还没开始核查',s.known.qianWindowEnd?'22:00 暂时离开电脑':'',s.known.qianDeadline?'22:35 打开旧链接后，回复开始重复':''].filter(Boolean).join('；'),s.flags.qianLost?'只剩重复回复':s.flags.qianSafe?'原始记录已核对':s.flags.qianOffline?'已约好改查离线文件':s.flags.qianTrusted?'共同见过旧消息出现':'正常私聊']
 ].map(([name,schedule,status])=>({name,schedule,status}));}
function castTick(s){
 if(!s.flags.visitedOffice||s.ending||s.pending.startsWith('end:'))return;
 if(s.time>=1295&&!s.flags.yanArrived){s.flags.yanArrived=true;msg(s,'yan','燕日央',"我到院楼门口了，你在哪一排？我这包快把我肩压歪了。",1295);evidence(s,'yanArrival','还书的人到了','21:35，燕日央发来门口的消息。');}
 if(s.time>=1300&&!s.flags.qianAvailable){s.flags.qianAvailable=true;msg(s,'qian','千',"我回电脑前了。你说的那两份样本，文件叫什么来着？发我名字，我搜一下。",1300);evidence(s,'qianWindow','千回到电脑前','21:40，千开始回复核查问题。');}

 if(s.time>=1305&&!s.flags.yanLeft){s.flags.yanLeft=true;evidence(s,'yanDeparture','他去资料室了','21:45，燕日央发来离开的消息。');msg(s,'yan','燕日央',"我去资料室看一眼。书给你放桌边了，千万别又拿来垫电脑，我回头还要检查书角。",1305);}
 if(s.time>=1320&&!s.flags.qianAway){s.flags.qianAway=true;msg(s,'qian','千',"楼下洗衣机好了，一直催命似的响。我去把衣服拿上来，你先把文件发着，我回来就看。",1320);evidence(s,'qianWindowEnd','核查中断了一会儿','22:00，千暂时离开电脑去收衣服。');}
 if(s.flags.doorRequested&&s.time>=1325&&!s.flags.yanWarned&&!s.flags.yanLost){s.flags.yanLost=true;evidence(s,'yanDeadline','侧门之后没有新回复','燕日央最后一次联系在 22:05。他原本要回来拿伞。');msg(s,'yan','燕日央',"我到侧门了。里面好像有人在叫我，声音跟你一模一样。伞是不是被拿到那边去了？",1325);}
 if(s.flags.yanWarned&&s.time>=1328&&!s.flags.yanSafe){s.flags.yanSafe=true;msg(s,'yan','燕日央',"我从正门出来了，伞不要了！刚拍的照片你看一下，门厅时钟也在里面。你也别往那儿去。",1328);evidence(s,'yanWitness','来自另一侧的时间记录','燕日央确认正常出口，并留下独立时间记录。');}
 if(s.time>=1340&&!s.flags.ruanAtGate){s.flags.ruanAtGate=true;s.flags.ruanArrival=1340;evidence(s,'ruanArrivalSeen','晚饭到了','22:20，软桃发来楼下的消息。');msg(s,'ruan','软',"我到楼下啦。你下不下来接我？这两袋饭真的有点重，不然我找个台阶先放一下。",1340);}
 const cutoff=s.flags.ruanExtended?1370:1350;
 if(s.flags.doorRequested&&s.time>=cutoff&&!s.flags.ruanMet&&!s.flags.ruanLost){s.flags.ruanLost=true;evidence(s,'ruanDeadline','晚饭到了，人没有上来',fmt(cutoff)+'，软桃按原约定结束等待，走向另一处入口。之后没有新的回复。');msg(s,'ruan','软',"你刚刚是不是在小门那边叫我？我过去看一眼啊，别又从正门绕回来让我扑空。",cutoff);}
 if(s.flags.doorRequested&&s.time>=1355&&!s.flags.qianOffline&&!s.flags.qianLost){s.flags.qianLost=true;s.flags.receipt=false;s.flags.challenge=null;evidence(s,'qianDeadline','停在同一句话的千','22:35，千打开共享版本。之后只有同一句回复，没有新的核查。');msg(s,'qian','千',"洗衣服回来了。我点开你刚才发的那个共享链接看看。",1355);msg(s,'qian','千','我看一下。',1355);msg(s,'qian','千','我看一下。',1355);}
}
function castCommit(s,id,thread,text){tick(s,1);msg(s,thread,'我',text);s.events.push({id:'cast-'+id+'-'+s.time,kind:'message',thread,text,at:s.time});}
function prediction(s,thread){return s.previous.find(e=>e.kind==='message'&&e.thread===thread&&e.at>s.time&&e.at<=(thread==='yan'?1305:1320));}
function witnessReplay(s){for(const who of ['yan','qian']){const key=who+'Prediction',p=s.flags[key];if(!p||!s.fired.includes(p.id))continue;delete s.flags[key];if(who==='yan'&&(!s.flags.yanMet||!['office','corridor'].includes(s.loc)||s.time>1305))continue;if(who==='qian'&&s.time>1320)continue;s.flags[who+'Trusted']=true;evidence(s,who+'Proof',who==='yan'?'他拿着手机，消息仍然发出':'千确认了预告的旧消息',fmt(p.at)+'，原文与预告一致，双方都没有进行发送操作。');msg(s,who,who==='yan'?'燕日央':'千',who==='yan'?"我一直拿着手机，消息还是发出去了。你先说，别急，我听着。":"看到了！我把编辑窗口都关了，它还是准点出现。先别删，我把这边的记录截图了。");}}
function castAction(s,id){
 if(s.flags.saveFight&&!s.ending){if(id==='saveResultLog')saveResultLog(s);else if(id==='abandonResult'){s.flags.saveFight=false;showEnd(s,'replace');}else s.panel='stata';return;}
 if(id==='runFullModel'){runFullModel(s);return;}
 castTick(s);auditPressure(s);if(s.flags.breached&&!s.flags.auditDone&&id!=='checkpoint'&&!s.ending&&!s.pending.startsWith('end:')){showEnd(s,'opened');return;}if(s.ending&&id!=='checkpoint')return;if(s.flags.callPending){horrorAction(s,id);return;}
 switch(id){
 case 'waitYan':if(s.time<1295){tick(s,1295-s.time);finishHorror(s);}return;
 case 'waitQian':if(s.time<1300){tick(s,1300-s.time);finishHorror(s);}return;
 case 'yanMeet':if(s.time<1295||s.time>=1305||s.flags.yanLost){s.toast='门边没有人。先看看消息，或者忙一会儿自己的事。';return;}horrorAction(s,id);return;
 case 'yanMark':if(!s.flags.yanMet||s.time>=1304||s.flags.yanLost)return;castCommit(s,id,'yan',"书签还夹在原来那页吧？别当废纸扔了啊，那是你从云南带给我的。");say(s,[line('燕日央',"看见了看见了。咱俩隔着一张桌子还发微信，你怕我私吞一张书签啊？",'yan'),narr(s.known.loop?"你忍不住又看了一眼发送时间：这句话已经留在记录里了。":"燕日央看完手机，笑着把那张书签又往书里塞紧了一点。")]);break;
 case 'yanPredict':case 'qianPredict':{const who=id==='yanPredict'?'yan':'qian';if(who==='yan'&&(!s.flags.yanMet||s.time<1295||s.time>=1305)||who==='qian'&&(s.time<1300||s.time>=1320)||s.flags[who+'Lost'])return;const p=prediction(s,who);if(!p){s.toast='现在没有尚未发生的、能让对方核验的旧消息。先留下明确的消息，再在下一轮预告。';return;}s.flags[who+'Prediction']=clone(p);msg(s,who,'我',`先别碰手机。${fmt(p.at)}，你应该会收到一条和这句话完全一样的消息：${p.text}`);tick(s,p.at-s.time);witnessReplay(s);if(s.flags[who+'Trusted'])say(s,who==='yan'?[narr("燕日央照你说的，把手机平放在手心。你们两个人盯着屏幕，谁也没说话。"),line('燕日央',"……等会儿！手机一直在我手里啊，刚才那是谁发的？",'yan'),hero("所以我才叫你别走侧门。我知道这话听着太离谱了，但今晚求你信我这一次。")]:[narr('你拨通了视频。千把手机靠在书架上，旁边晃着一个赛马娘挂件。她还穿着那件熟悉的开衫，身后是另一所学校的宿舍。'),line('千 · 视频','刚才还在给赛马娘排训练，轮到我自己的论文就不想打开了。你先把双手举起来，我看着你。','qian'),narr('你把手举到镜头前。提示音忽然响了。千的笑容停住，低头看了一眼聊天框，又看向屏幕里的你。'),line('千 · 视频','来了……你没有碰手机，我看见了。连那处打错的字都一样。','qian','','worried'),line('千 · 视频','我现在也说不清原因。但你之前说得对：聊天框里的话，不能直接当成你现在的意思。','qian','','worried'),line('千 · 视频','视频先别挂。我把这边的记录存下来，我们一项一项核对。','qian'),hero('好。这次不用我一个人记住所有事情了。','hope')],'',who==='yan'?'yanProof':'qianProof');break;}
 case 'yanWarn':if(!s.flags.yanTrusted||s.flags.yanLost||s.time>=1325)return;castCommit(s,id,'yan',"别去侧门，也别回头拿伞。你就从正门出去，到了外头拍张照片给我，好不好？");s.flags.yanWarned=true;msg(s,'yan','燕日央',"好，我走正门。门厅旁边那段楼梯直通停车处，比等电梯快。你也别一个人往黑的地方去啊。");s.flags.yanRoute=true;say(s,[line('燕日央',"你手怎么冰成这样？……行，我听你的，从正门出去。你自己也小心点。",'yan','','concerned'),hero("出了门一定回我一条，照片也行。别嫌我啰嗦。",'tense'),line('燕日央',"知道了。你也别什么事都自己扛着，尤其别往没开灯的地方跑。",'yan','','concerned')]);break;
 case 'qianMark':if(s.time<1300||s.time>=1319||s.flags.qianLost)return;castCommit(s,id,'qian',"全样本先别动，等我把删除清单核完，再一起看。");msg(s,'qian','千',"行，底稿先留着。你核完叫我，别查着查着连原文件都改了。");break;
 case 'qianOffline':if(!s.flags.qianTrusted||s.flags.qianLost||s.time>=1355)return;s.flags.qianOffline=true;castCommit(s,id,'qian',"先别打开共享链接。我一会儿发你离线备份，你拿那个核；到时候另外挑一条问我，咱们俩现场对。");msg(s,'qian','千',"好，那我先关链接。你发过来叫我，我在电脑前等着。");break;
 case 'extendRuan':if(s.flags.ruanLost||s.flags.ruanMet||s.time>=1350)return;s.flags.ruanExtended=true;castCommit(s,id,'ruan',"我还没回去。你到了在正门等我好不好？千万别往小门绕，我一定下来接。");msg(s,'ruan','软',"行，我找地方坐会儿。饭要是凉了你负责热啊，别让我提着两袋东西研究你学校的地理。");break;
 case 'inviteRuan':if(s.time<1340){s.flags.ruanArrival=1340;msg(s,'ruan','软',"还在等出餐。拿到了就过去，你记得到楼下接我。");s.panel='phone';return;}castAction(s,'extendRuan');return;
 case 'waitRuan':if(s.loc!=='dorm'||s.flags.ruanLost)return;if(s.time<1340)tick(s,1340-s.time);castAction(s,'ruanMeet');return;
 case 'ruanMeet':if(s.loc!=='dorm'||s.flags.ruanLost||s.time<1340)return;if(s.flags.ruanMet){horrorAction(s,id);return;}tick(s,2);if(s.flags.ruanLost)return;s.flags.ruanMet=true;s.flags.ruanArrival=1340;s.flags.ruanVisitDeparted=false;say(s,[narr("你在正门灯下接到软桃。她两只手各提一袋晚饭，见到你先松了一口气，接着就皱眉看你的脸。"),line('软桃',"先上楼吧，我手都快被袋子勒断了。你脸色怎么这么差？别告诉我今晚又只吃了饼干。",'ruantao'),narr("你接过一只袋子，两个人并肩上楼。她没再自己找别的入口，进门后还顺手把门锁好。")]);break;
 case 'ruanWitness':if(s.loc!=='dorm'||!s.flags.ruanMet||s.flags.ruanLost||!s.flags.visitedOffice||s.flags.ruanVisitDeparted)return;tick(s,2);s.flags.ruanTrusted=true;s.cue='knock';say(s,[hero("我跟你说件事啊……但我一说出来，你可能要以为我科研做疯了。",'tense'),line('软桃',"那就说呀。我连猫视频都按暂停了，这待遇还不够高？",'ruantao'),narr("门外忽然传来软桃的声音，连语气都分毫不差：“先上楼吧，我手都快被袋子勒断了。你脸色怎么这么差？别告诉我今晚又只吃了饼干。”"),narr("软桃就坐在你眼前，筷子才拆开一半。你们同时闭上了嘴。她盯着门，你盯着她，谁也没先动。"),line('软桃',"……你听见了吧？那是我的声音。我刚刚在楼下说的那句，一字不差。",'ruantao'),hero('你刚才真的没出去，对吧？'),line('软桃','你看我像能带着两盒面从窗户飞出去吗？','ruantao','','alert'),narr('她开玩笑时声音都有点发紧，筷子举在半空，半天没落下。'),line('软桃','先别开门。你看着门锁，我把手机拿来录着。','ruantao','','alert'),narr('她也听见了。她的手刚伸出去，就停在了半空。'),narr("手机又亮了：软——我到楼下了。时间显示就是现在。软桃的手机还反扣在桌上，谁也没碰到它。")],'','ruanWitness');evidence(s,'ruanProof','两个人共同听见的重复','软桃在屋里，门外却重复她刚才说过的话。她不再把异常只理解成主角的疲劳。');break;
 case 'guardRuan':if(s.loc!=='dorm'||!s.flags.ruanTrusted||s.flags.ruanLost||s.flags.ruanVisitDeparted)return;tick(s,1);s.flags.ruanSafe=true;say(s,[line('软桃',"别过去，先让它敲。你就在这儿弄你的文件，我陪你。门外再怎么叫，咱俩也别随便开。",'ruantao','','alert'),narr("软桃把原始文件另存进一个不自动同步的文件夹，手指着屏幕上的名字念给你听：“这个？这个也要？”你一一点头。"),hero("好。你先别走，等我把这几个地方核完。")]);evidence(s,'ruanHelp',"不必独自守着","软桃一直在屋里，和我一起确认门外的声音、离线文件与两个人的位置。至少这一次，不用我每隔几分钟就去看一眼门锁。");break;
 case 'castRetry':showEnd(s,'missedFriends');return;
 default:if(s.thread==='qian'&&s.flags.qianLost&&['sendPacket','forecastOld','askFresh','answerFreshA','answerFreshB','answerFreshC'].includes(id)){s.toast='没有新的回应。记下失联时刻，下一轮提前联系。';return;}horrorAction(s,id);return;
 }
 finishHorror(s);
}

function contextualReplies(s,items){
 const inBuilding=s.flags.visitedOffice&&['office','corridor','tea','mentor'].includes(s.loc);
 if(s.thread==='wang'&&s.flags.wangMissing)return [];
 items=items.filter(([id])=>{
  if(id==='wangWhere')return inBuilding&&!!s.flags.chair;
  if(id==='advisorQuestion')return !!s.known.future;
  if(id==='wangDeny')return s.chat.some(m=>m.thread==='wang'&&m.who==='我'&&m.text==='明天你陪你核对。');
  if(id==='yanReply')return !s.flags.visitedOffice&&!s.flags.yanMet&&!s.flags.yanLeft;
  if(id==='requestDoor')return inBuilding;
  if(id==='extendRuan')return s.flags.leftHome&&!s.flags.returnedHome;
  if(id==='sendPacket')return !!s.flags.qianOffline&&s.loc==='dorm';
  if(id==='forecastOld')return !!s.flags.qianTrusted;
  return true;
 });
 // A live verification question takes precedence over unrelated topics.
 if(s.thread==='qian'&&s.flags.challenge)return items.filter(([id])=>id.startsWith('answerFresh'));
 const topics={ruan:['ruanTalk','ruanThanks','ruanVideo'],qian:['qianInfo','qianPressure']};
 const social=topics[s.thread]||[];
 const chosen=social.find(id=>s.replyFlags[id]);
 const urgent=s.thread==='qian'&&(s.flags.packetSent||s.flags.qianTrusted)||s.thread==='ruan'&&(s.flags.ruanAtGate||s.flags.ruanMet);
 if(chosen){
  items=items.filter(([id])=>!social.includes(id));
  if(!s.replyFlags['socialClosed:'+s.thread]&&!urgent){
   const endings={ruanTalk:'行，我找点正经的吃。你也别饿着。',ruanThanks:'就吃面吧，别再替配送费做研究了。',ruanVideo:'哈哈哈，看完了。谢谢你，我继续理文件了。',qianInfo:'收到，我先收藏。等这边忙完再仔细看。',qianPressure:'也是。谢谢你，我先把眼前这一步弄清楚。'};
   return [['closeSocial',endings[chosen]]];
  }
 }
 if(urgent||s.thread==='qian'&&s.known.future)items=items.filter(([id])=>!social.includes(id));
 return items;
}

function castReplies(s){const base=horrorReplies(s).filter(x=>!['inviteRuan'].includes(x[0]));if(s.flags[s.thread+'Lost'])return [];const extra=[];
 if(s.thread==='yan'){if(s.flags.yanTrusted&&!s.flags.yanWarned&&s.time<1325)extra.push(['yanWarn','说明侧门的危险，约定正常出口与报平安']);}
 if(s.thread==='qian'){if(s.time<1300)extra.push(['waitQian',s.known.qianWindow?'等到上次千回复的时刻':'先整理资料，等千回消息']);if(s.time>=1300&&s.time<1320&&!s.flags.qianTrusted){extra.push(['qianMark','告诉千先保留全样本']);if(prediction(s,'qian'))extra.push(['qianPredict','预告旧消息，请千关闭窗口共同验证']);}if(s.flags.qianTrusted&&!s.flags.qianOffline&&s.time<1355)extra.push(['qianOffline','约定不打开共享版本，改用离线核查']);}
 if(s.thread==='ruan'&&!s.flags.ruanMet&&s.time<1350&&!s.flags.ruanExtended)extra.push(['extendRuan','告诉她自己还没回去，请在正门多等一会儿']);return contextualReplies(s,[...base,...extra]);}
function castReply(s,id){const selected=castReplies(s).find(x=>x[0]===id);if(!selected)return;
 if(id==='closeSocial'){castCommit(s,id,s.thread,selected[1]);s.replyFlags['socialClosed:'+s.thread]=true;finishHorror(s);return;}
if(['yanWarn','waitQian','qianMark','qianPredict','qianOffline','extendRuan'].includes(id))castAction(s,id);else horrorReply(s,id);}
function castHotspot(s,id){if(s.dialog.length||s.panel||s.menu||s.ending)return;if(id==='yan'){castAction(s,'yanMeet');return;}if(['yanMark','yanPredict','ruanWitness','guardRuan'].includes(id)){castAction(s,id);return;}if(id==='ruan'){castAction(s,s.time<1340?'waitRuan':'ruanMeet');return;}if(id==='parking'&&s.loc==='corridor'&&s.flags.yanRoute){travel(s,'parking',2);finishHorror(s);return;}horrorHotspot(s,id);}
function castSpots(s){const p=horrorSpots(s).filter(x=>!(x.id==='yan'&&(s.time<1295||s.time>=1305||s.flags.yanLost))&&!(x.id==='ruan'&&s.flags.ruanLost));if(['office','corridor'].includes(s.loc)&&s.flags.yanMet&&s.time<1305&&!s.flags.yanLost){p.push({id:'yanMark',label:'发消息提醒他别弄丢书签',x:16,y:20,w:15,h:12});if(prediction(s,'yan'))p.push({id:'yanPredict',label:'请燕日央拿着手机验证预告',x:33,y:20,w:18,h:12});}
 if(s.loc==='dorm'&&!s.flags.ruanLost){if(s.time>=1340&&!s.flags.ruanMet&&!p.some(x=>x.id==='ruan'))p.push({id:'ruan',label:'到正门接软桃',x:72,y:54,w:15,h:18});if(s.flags.ruanMet&&!s.flags.ruanVisitDeparted){p.push({id:s.flags.ruanTrusted?'guardRuan':'ruanWitness',label:s.flags.ruanTrusted?'和软桃确认门锁与备份':'向软桃解释门外的声音',x:68,y:25,w:19,h:14});}}
 return p;}
function castNext(s){horrorNext(s);}
function refreshStoryText(s){const opening=initialChat();for(const m of s.chat){if(m.ghost||m.who==='我')continue;const current=opening.find(x=>x.thread===m.thread&&x.who===m.who&&x.at===m.at);if(current)m.text=current.text;}for(const m of s.chat){if(m.text.includes("门禁通知又弹了"))m.text="我已经回宿舍了。你到哪儿了？别再回那层楼。";if(m.text.includes("门禁那边刚显示锁定"))m.text="已经过了上一轮锁门的时刻。我离开了院楼，这里看不到那扇门。";if(m.text.includes("面板自己跳成“锁定”了，我手都没伸过去"))m.text="已经到你说的那个时刻了。我在正门外，没回楼里。";}for(const n of s.notes){if(n.id==="remoteLock"&&n.title==="你不在，门还是锁上了"){n.title="记住的锁门时刻";n.text="旧记录里的锁门时刻已经过去。离开院楼后无法查看现在的门禁，只能根据操作重演推断。";}if(n.id==="pressure"&&n.text.includes("锁灯"))n.text="离开院楼后无法查看门禁；是否仍然安全，要留意眼前发生的异常。";}return s;}

// Fictional, bounded command puzzle: never evaluates JS or invokes real Stata.
const research={
 backup:'README_original.txt\n\n原始全样本：8240 条，412 个地区。\n排查试跑临时剔除：320 条，来自 16 个地区（每个地区 20 条）；尚未核实排除依据，仅排查用，不放正文。\n剔除后：7920 条，396 个地区。\nmissing_required=0；duplicate=0；exclusion_reason 为空。\n\n原始结果：b=0.018，SE=0.0271，p=0.507，无星号。\n删样本后：b=0.061，SE=0.0260，p=0.019，**。\n星号约定：* p<0.10，** p<0.05，*** p<0.01。\n\n离线核查副本 audit_sample 合并了原始记录和删除标记。\n日志 sample_audit.log 保留操作顺序和草稿。\n完整模型 full_sample.do 只读全样本，运行需要二十分钟。verify_source.do 检查当前轮计算结果，并进入日志保存。\n\n先读日志，再载入副本、核对数量、比较结果、另存，请千独立复核。最后确认完整重跑的结果，保存 full_sample.log。',
 table:'已载入的历史估计（游戏内虚构）\n                 baseline       revised\ntreatment          0.018          0.061**\nN                   8240            7920\np                  0.507           0.019\n* p<.10; ** p<.05; *** p<.01\n模型与变量相同，手动剔除了 320 条样本。',
 commands:['type sample_audit.log','use audit_sample, clear','count if manual_exclude == 1','estimates table baseline revised, star(.10 .05 .01) stats(N)','save audit_copy, replace','do verify_source.do']
};
function auditPressure(s){
 if(!s.flags.lockStarted||!s.flags.trapped||s.flags.auditDone||s.ending||s.pending.startsWith('end:'))return;
 const elapsed=s.time-s.flags.lockStarted;
 if(elapsed>=25&&!s.flags.pressureOne){s.flags.pressureOne=true;msg(s,'wang','我','明天的我会处理。',s.time,true);evidence(s,'pressure','它没有留在那扇门后','距离记住的锁门时刻约二十五分钟，我的账号又发出一句没有输入过的话。离开院楼没有让异常停下。');}
 if(elapsed>=43&&!s.flags.pressureTwo){s.flags.pressureTwo=true;msg(s,'ruan','我','你以为你回去，就没有门了吗？',s.time,true);s.cue='knock';s.toast="那条消息不一样了。你还没读完，门外就响起一下敲击，隔了好一会儿，才是第二下。";}
 if(elapsed>=53&&!s.flags.pressureThree){s.flags.pressureThree=true;s.cue='door';s.toast=s.flags.ruanSafe?"软桃用肩膀抵住门，回头喊你：“先保存，别在这时候关掉！”":"门把手慢慢压下去，又弹回来。你盯着它，手指僵在键盘上。";}
 if(elapsed>=60+(s.flags.ruanSafe?5:0))s.flags.breached=true;
}
function stataCommand(s,input){
 if(s.flags.saveFight||s.loc!=='dorm'||!s.flags.returnedHome||!s.flags.backup||s.ending||s.pending.startsWith('end:')||s.flags.callPending)return;
 const cmd=String(input).trim().replace(/^\.\s*/, '').replace(/\s+/g,' ').replace(/\s*,\s*/g,', ').toLowerCase();
 const put=t=>{s.flags.auditOutput=(s.flags.auditOutput||'')+'\n. '+cmd+'\n'+t+'\n';s.flags.auditOutput=s.flags.auditOutput.slice(-12000);s.panel='stata';};
 if(cmd==='do full_sample.do'){runFullModel(s);return;}
 const id=research.commands.findIndex(c=>c.toLowerCase()===cmd);
 if(id<0){put('command not recognized\nr(199);\n这里只接受离线核查命令。拼写错误不消耗时间。');return;}
 if(id===0){s.flags.auditRead=true;put('昨天 20:54  baseline: N=8240, p=0.507\n前天 20:46  排查试跑：临时排除 16 个地区，320 条记录；排除依据未核实。\n前天 21:00  revised: N=7920, p=0.019 **；仅排查用，未放正文。\n今天 21:00  baseline: N=8240, p=0.507；全样本复跑。\n21:47  main.tex: “按预定规则清洗样本”；账号：我，无对应的本地提交记录。\n试跑备注：排除依据未核实，仅排查用，不放正文。\n\n下一步载入 audit_sample；manual_exclude 是删除标记。');return;}
 if(id===1&&!s.flags.auditRead){put('先读取 sample_audit.log，确认核查副本的来源。');return;}
 if(id>=2&&!s.flags.auditLoaded){put('no dataset in memory\nr(3);\n请先载入 audit_sample。');return;}
 if(id===3&&!s.flags.auditCounted){put('先核对 manual_exclude 标记的观测数。');return;}
 if(id===4&&!s.flags.auditCompared){put('还未比对两份历史估计，暂不保存完成标记。');return;}
 if(id===5&&!(s.flags.auditSaved&&allSafe(s)&&s.flags.receipt&&s.flags.verified&&s.flags.forecastSent&&s.flags.lockReplay&&s.flags.callDone)){put('verification incomplete\n需要：另存核查副本、千的独立复核、四人安全回应，以及本轮已验证的封锁。');return;}
 if(id===5){if(!s.flags.bigReady){runFullModel(s);if(s.ending||s.pending.startsWith('end:')||!s.flags.bigReady)return;}beginLogSave(s);return;}
 tick(s,id===1||id===3?2:1);auditPressure(s);
 if(s.flags.breached){showEnd(s,'opened');return;}
 if(id===1){s.flags.auditLoaded=true;put('audit_sample loaded\n8240 observations; original data + deletion flags\n历史估计 baseline / revised 已从日志快照载入。');}
 if(id===2){s.flags.auditCounted=true;put('  320\n来自 16 个地区。缺失和重复检查均未给出删除依据。');}
 if(id===3){s.flags.auditCompared=true;put(research.table);evidence(s,'auditContrast','同一模型，两份样本','Stata 核查：原始 p=0.507；选择性剔除 320 条后 p=0.019。两星来自改变样本，而非修复模型。');}
 if(id===4){s.flags.auditSaved=true;put('file audit_copy.dta saved\n原始文件未覆盖；删除清单、两份历史结果一并保留。\n请千核对清单，再执行 verify_source.do。');}
 
 if(id!==5)finishHorror(s);
}


// Full-model jobs repeat their original start time. Data are fixed, results never cross loops.
const saveInterference=[
 ['无法保存','这个结果没有必要保存。明天的我会处理。'],
 ['文件名已更正','保存为：tomorrow.log。full_sample.log 不存在。'],
 ['发现更好的结果','建议替换：N=7920，p=0.019 **。你想要的不是这个吗？'],
 ['保存失败','明天的我会处理。明天的我会处理。明天的我会处理。'],
 ['你已经保存过了','你已经保存过了。你已经保存过了。不要再确认。'],
 ['最后一次警告','停止保存。门外的人已经到了。']
];
function startBigJob(s,at,replayed){
 // Repeated later runs still occur, but an earlier completed read-only result remains usable.
 if(s.flags.bigStarted!==undefined)return;
 s.flags.bigStarted=at;s.flags.bigFinishAt=at+20;s.flags.bigReplayed=replayed;
 if(replayed)evidence(s,'runReplay','没有按下的运行键',fmt(at)+'，旧运行操作自己启动了。结果不会从上一轮带回来，计算仍要走完二十分钟；这次我可以先去做别的事。');
}
function completeBigJob(s){if(s.flags.bigStarted===undefined||s.flags.bigReady||s.time<s.flags.bigFinishAt)return;s.flags.bigReady=true;s.flags.bigResult='N=8240; p=0.507';s.cue='result';evidence(s,'fullResult','完整重跑结束',fmt(s.flags.bigFinishAt)+'，全样本完整重跑结束：8240 条，p=0.507。结果还在内存里，必须回宿舍核验并保存日志。');}
function replayOpeningJob(s){for(const e of s.previous.filter(e=>e.kind==='run'&&e.at<=s.time).sort((a,b)=>a.at-b.at)){if(!s.fired.includes(e.id)){s.fired.push(e.id);startBigJob(s,e.at,true);}}completeBigJob(s);}
function runFullModel(s){
 if(s.loc!=='dorm'||s.ending||s.pending.startsWith('end:')||s.flags.callPending||s.flags.saveFight)return;
 if(s.flags.returnedHome&&!s.flags.auditSaved){s.toast='先核对删除清单并另存副本，再做完整重跑。';return;}
 if(s.flags.bigReady){s.panel='stata';s.toast='完整重跑已经结束，不必覆盖刚算出的结果。';return;}
 if(s.flags.bigStarted===undefined){record(s,'run','运行全样本完整模型 · 二十分钟');startBigJob(s,s.time,false);}
 evidence(s,'longRun','一次完整重跑要二十分钟',s.known.loop?'亲自启动完整模型时，要留在电脑前检查整个运行过程。旧操作重演时，计算会按原时刻自行开始。我可以提前出门，结果仍要等二十分钟才算出来。':'完整模型需要二十分钟。得留在电脑前检查中间步骤，这段时间不能出门。开始和结束的时刻都记在运行记录里。');
 const wait=Math.max(0,s.flags.bigFinishAt-s.time);
 const limit=s.flags.trapped?s.flags.lockStarted+60+(s.flags.ruanSafe?5:0):Infinity;
 if(s.flags.bigFinishAt>=limit){s.flags.bigTooLate=true;evidence(s,'runTooLate','来不及的二十分钟','回宿舍完成核查后才运行，门锁撑不到计算结束。不能把这次操作改到过去；得在另一轮出门前先留下运行记录，再利用它的重演。');tick(s,Math.max(0,limit-s.time));auditPressure(s);showEnd(s,'opened');return;}
 tick(s,wait);completeBigJob(s);s.panel='stata';s.flags.auditOutput=(s.flags.auditOutput||'')+'\n. do full_sample.do\n运行开始 '+fmt(s.flags.bigStarted)+' / 结束 '+fmt(s.flags.bigFinishAt)+'\nN=8240; p=0.507\n结果尚未保存到 full_sample.log。\n';finishHorror(s);
}
function beginLogSave(s){
 if(!s.flags.bigReady||!s.flags.auditSaved||!allSafe(s)||!s.flags.receipt||!s.flags.verified||!s.flags.forecastSent||!s.flags.lockReplay||!s.flags.callDone||s.loc!=='dorm'||s.ending||s.pending.startsWith('end:'))return;
 auditPressure(s);if(s.flags.breached){showEnd(s,'opened');return;}
 s.flags.saveFight=true;s.flags.savePresses=0;s.panel='stata';s.cue='knock';
}
function saveResultLog(s){
 if(!s.flags.saveFight||!s.flags.bigReady||s.loc!=='dorm'||s.ending||s.pending.startsWith('end:'))return;
 tick(s,1);auditPressure(s);if(s.flags.breached){s.flags.saveFight=false;showEnd(s,'opened');return;}
 if(!allSafe(s)||!s.flags.receipt||!s.flags.trapped||!s.flags.lockReplay){s.flags.saveFight=false;s.panel='stata';s.toast='旧消息又改变了核查约定。先联系千，确认朋友们与封锁的情况，再回来保存。';return;}
 s.flags.savePresses=Math.min(saveInterference.length,(s.flags.savePresses||0)+1);s.cue=s.flags.savePresses%2?'typing':'knock';
 if(s.flags.savePresses<saveInterference.length){s.panel='stata';return;}
 s.flags.saveFight=false;s.flags.resultLogSaved=true;s.flags.auditDone=true;
 s.flags.auditOutput=(s.flags.auditOutput||'')+'\nfile full_sample.log saved and verified\nN=8240; p=0.507\n全样本日志与千的独立副本一致。';showEnd(s,'te');
}

const api={saveInterference,fresh,fmt,refreshStoryText,research,stataCommand,hotspot:castHotspot,action:castAction,next:castNext,replies:castReplies,reply:castReply,spots:castSpots,castStatus,art,echoLocation,endings,valid,clone,locations,contacts,editors,caseSteps,readyTE,deadline,WANG_LEAVES};root.VN=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
