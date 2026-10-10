'use strict';

function renderLogBattle(body){
 const index=Math.min(state.flags.savePresses||0,VN.saveInterference.length-1),row=VN.saveInterference[index];
 body.append(el('div','Stata · full_sample.log','stata-title'),el('p','完整结果：N=8240 · p=0.507 · 全样本','stata-caption'));
 const stage=el('section','','log-battle');stage.setAttribute('aria-live','polite');
 stage.append(el('div','文件保存　／　full_sample.log','log-window-bar'));
 stage.append(el('small','保存确认 '+index+' / '+VN.saveInterference.length),el('h2',row[0]),el('p',row[1]));
 const phantom=el('div','明天的我会处理。明天的我会处理。','log-phantom');phantom.setAttribute('aria-hidden','true');stage.append(phantom);
 const save=button('保存原始日志',()=>{dispatch('saveResultLog');document.getElementById('save-result-log')?.focus();},'primary');save.id='save-result-log';stage.append(save);
 stage.append(el('p',index<3?'软桃：“别管它说什么，存你刚才那份。我在这里。”':'你看着那行 0.507，没有把手从保存按钮上移开。','save-support'));
 stage.append(el('p','窗口还在拦截。继续按保存，每次确认推进 1 分钟；阅读不计时。','muted'));
 stage.append(button('放弃保存，把结果交给她',()=>dispatch('abandonResult'),'secondary'));body.append(stage);
}
function renderBigJob(body){
 const started=state.flags.bigStarted!==undefined;
 if(!started && !state.flags.auditSaved && !state.known.runTooLate) return;
 if(started){body.append(el('p',(state.flags.bigReplayed?'旧操作自动启动：':'本轮运行：')+VN.fmt(state.flags.bigStarted)+' → '+VN.fmt(state.flags.bigFinishAt)+(state.flags.bigReady?' · 结果已算完，日志尚未保存':' · 正在计算'),'stata-caption'));}
 else if(state.known.runTooLate)body.append(el('p','上次等到回宿舍才运行，已经来不及。出门前留下的运行操作，也会像消息和门锁一样重演。','stata-caption'));
 body.append(button(started?(state.flags.bigReady?'完整重跑已完成':'留在电脑前，等完整重跑结束'):'启动全样本完整重跑 · 留在电脑前 20 分钟',()=>dispatch('runFullModel'),'secondary'));
}

function renderSampleAudit(body){
 if(state.flags.saveFight){renderLogBattle(body);return;}
 body.append(el('div','Stata/MP · 离线样本核查','stata-title'),el('div','游戏内命令模拟 · 不访问真实数据或执行系统命令','stata-menu'));
 const intro=el('div','','stata-caption');intro.append(el('p','先把日志翻出来。那两颗星不是凭空多出来的，总有一步留下了记录。阅读和输入不计时，执行核查会推进时间。'));
 if(state.flags.lockStarted){const elapsed=state.time-state.flags.lockStarted;intro.append(el('p',state.flags.pressureTwo?'敲门声又来了。你把手放回键盘上，尽量不去看那个正在往下压的把手。':state.flags.pressureOne?'手机里又多了一条不是你发的话。你把它划掉，先保存眼前的核查。':'已经过了记住的锁门时刻。原始备份就在眼前，先查这一份，别再点开那个共享版本。'));if(state.flags.ruanSafe&&elapsed>=53)intro.append(el('p','软桃抵着门，声音比刚才高了些：“我在这儿，你接着弄。先保存！”'));}body.append(intro);
 renderBigJob(body);
 const output=el('pre',state.flags.auditOutput||'离线核查环境已就绪。\n原始文件只读；命令提示可点击填入，按 Enter 执行。\n\n. type sample_audit.log','stata-output');body.append(output);
 const form=el('form','','audit-command'),label=el('label','Command');label.htmlFor='audit-input';const input=el('input');input.id='audit-input';input.type='text';input.autocomplete='off';input.spellcheck=false;input.maxLength=160;input.placeholder='输入命令，按 Enter 执行';input.value=state.flags.auditDraft||'';input.oninput=()=>{state.flags.auditDraft=input.value;};const run=el('button','执行');run.type='submit';form.append(label,input,run);form.onsubmit=e=>{e.preventDefault();const command=input.value;state.flags.auditDraft='';VN.stataCommand(state,command);render();document.getElementById('audit-input')?.focus();};body.append(form);
 const help=el('details','','audit-help');help.open=true;help.append(el('summary','核查用命令：点击填入，不会自动执行'));
 const labels=['读取操作日志（不计时）','载入核查副本 · 2 分钟','核对被删观测数 · 1 分钟','比较两份已存结果 · 2 分钟','另存证据 · 1 分钟','核验完整重跑并保存日志'];VN.research.commands.forEach((cmd,i)=>{const b=button(labels[i]+'\n'+cmd,()=>{input.value=cmd;state.flags.auditDraft=cmd;input.focus();},'audit-hint');b.dataset.command=String(i);help.append(b);});body.append(help);
 const footer=el('div','','stata-caption');footer.append(button('查看原始备份说明',()=>{state.panel='backup';render()},'secondary'),button('联系千，核对删除清单',()=>{state.thread='qian';state.panel='phone';render()},'secondary'));body.append(footer);requestAnimationFrame(()=>output.scrollTop=output.scrollHeight);
}
let memoTimer=null,encounterTimer=null;
function renderStata(body){
 if(state.flags.saveFight){renderLogBattle(body);return;}
 if(state.flags.returnedHome&&state.flags.backup){renderSampleAudit(body);return;}
 body.append(el('div','Stata/MP 18.0 — evening_check.do','stata-title'),el('div','File　Edit　Data　Graphics　Statistics　User　Window　Help','stata-menu'));
 const layout=el('div','','stata-layout'),history=el('aside','','stata-history');history.append(el('strong','History'),el('p','use panel_working, clear'),el('p','do evening_check.do'),el('p','estimates store baseline'));const results=el('section','','stata-results');results.append(el('div','Results','stata-pane-label'));
 const text='. do "evening_check.do"\n\n. reghdfe outcome treatment x1 x2, absorb(id year) vce(cluster id)\n(MWFE estimator converged in 4 iterations)\n\nHDFE Linear regression                 Number of obs =     8,240\nAbsorbing 2 HDFE groups                F(  3,  411)  =      1.29\nStatistics robust to heteroskedasticity Prob > F      =    0.2779\n                                      R-squared     =    0.8127\n                                      Within R-sq.  =    0.0012\nNumber of clusters (id) = 412          Root MSE      =    0.1835\n\n------------------------------------------------------------------------------\n             |               Robust\n     outcome | Coefficient  std. err.      t    P>|t|     [95% conf. interval]\n-------------+----------------------------------------------------------------\n   treatment |      .018      .0271      0.66   0.507      -.0351      .0711\n          x1 |      .041       .033      1.24   0.215      -.0239      .1059\n          x2 |     -.009       .016     -0.56   0.574      -.0405      .0225\n------------------------------------------------------------------------------\n\n. estimates store baseline\n\n. capture log close\n\nend of do-file\n\n.';
 results.append(el('pre',text,'stata-output'));const vars=el('aside','','stata-vars');vars.append(el('strong','Variables'),...['outcome','treatment','x1','x2','id','year'].map(v=>el('p',v)));layout.append(history,results,vars);body.append(layout,el('div','Command　│','stata-command'));
 const caption=el('div','','stata-caption');caption.append(el('p',state.round>1?"还是 0.507。连那声运行结束的提示都没变。你扶着桌沿，忽然觉得脚底发空。":"0.507。你把结果窗口拖大，又往屏幕前凑了点。小数点后那几位当然不会因为你看得认真就变。"));if(state.flags.reruns)caption.append(el('p',"还是那个结果。好消息是没报错，坏消息是我也不知道自己究竟在期待它变什么。"));
 renderBigJob(caption);
 caption.append(button('再运行一次 · 2 分钟',()=>dispatch('runStata'),'secondary'),button('保存日志，回到桌面',()=>dispatch('desktop'),'primary'));caption.append(el('small','游戏内虚构结果，不对应真实研究；不显著不等于证明没有效应。'));body.append(caption);requestAnimationFrame(()=>{const out=body.querySelector('.stata-output');if(out)out.scrollTop=out.scrollHeight});
}
function renderDesktop(body){body.append(heading('桌面','21:00 保存的 evening_check.log'));const files=el('div','','desktop-files');files.append(button('▣　Stata / 结果窗口',()=>dispatch('stata'),'desktop-file'),button('▤　明天要做的事.txt',()=>dispatch('memo'),'desktop-file'));if(state.flags.returnedHome)files.append(button('▧　原始备份 / README',()=>dispatch('backup'),'desktop-file'),button('◩　Overleaf / 云端版本',()=>{state.panel='overleaf';state.tab='draft';render()},'desktop-file'));body.append(files);if(!state.flags.leftHome)body.append(button('合上电脑，考虑出门',()=>dispatch('prepareLeave'),'primary'));}
function renderMemo(body){body.append(el('div','明天要做的事.txt — 记事本','memo-title'),el('div','文件　编辑　查看','memo-menu'));const page=el('div','','memo-page');page.setAttribute('aria-label','备忘正文');const abnormal=!!state.flags.returnedHome;const rows=abnormal?['明天的我会处理。','先核对删除清单。','','明天的我会处理。','明天的我会处理。','明天的我会处理。','明天的我会处理。']:['明天的我会处理。','先核对删除清单。'];for(const t of rows)page.append(el('p',t||' '));const last=el('p','','memo-last');last.setAttribute('aria-live','polite');page.append(last);body.append(page,el('div','UTF-8　　Ln '+rows.length+', Col 1','memo-status'));
 if(abnormal){const reveal=()=>{if(state.panel!=='note'||!last.isConnected)return;last.textContent='今天的你可以离开了。';last.classList.add('typed');VN.action(state,'memoReveal');state.toast='';persist();cue('typing')};if(state.flags.memoRevealed||!state.settings.motion)reveal();else memoTimer=setTimeout(reveal,1800)}
}
function renderEncounter(body){const img=el('img','','encounter-cg');img.src='assets/cg-eye-v4.png';img.alt="显示器后方缓缓露出一顶卡其色八角帽。你先看见帽檐，再看见和自己一模一样的夹克。椅子上的人抬起了头。";body.append(img);const retreat=button('退后，不确认她的脸',()=>{state.panel=null;state.cg='';render()},'encounter-retreat');body.append(retreat);const next=button('继续靠近，看清她的脸',()=>dispatch('eye'),'encounter-next');next.hidden=true;body.append(next);const reveal=()=>{if(state.panel==='encounter'&&next.isConnected)next.hidden=false};if(!state.settings.motion)reveal();else encounterTimer=setTimeout(reveal,1600);}

let scareTimer;function playScare(){clearTimeout(scareTimer);document.getElementById('scare-layer')?.remove();const layer=el('div','','scare-layer');layer.id='scare-layer';layer.setAttribute('aria-hidden','true');const im=el('img');im.src='assets/cg-eye-v4.png';layer.append(im,el('p','你为什么还在这里？'));document.body.append(layer);scareTimer=setTimeout(()=>layer.remove(),state.settings.motion?950:350);}

function renderDrawerPaper(body){
 body.append(heading('抽屉里的纸条','一张折了两次的便签，夹在备用充电线下面。'));
 const paper=el('article','','drawer-paper');paper.setAttribute('aria-label','手写纸条');
 const crossed=el('p','我真的适合读博吗？','paper-doubt');crossed.setAttribute('aria-label','被划掉的字：我真的适合读博吗？');paper.append(crossed);
 const abnormal=state.flags.returnedHome&&(state.flags.knock||state.flags.pressureOne||state.flags.ruanTrusted||state.flags.memoRevealed);
 if(abnormal){const answer=el('p','不','paper-denial');answer.setAttribute('aria-label','纸条上多出的字：不');paper.append(answer);}
 body.append(paper,el('p',abnormal?'划掉的问题下面，多了一笔压得很重的墨迹。你没有写过这个字。':'那句话被来回划了几道，纸面都蹭起了毛，字却还是看得清。','paper-caption'));
}
