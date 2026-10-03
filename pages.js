'use strict';
// Hash routes work on static hosting and preserve browser back/forward history.
const roomPages={today:'今日の商品',candidates:'候補・保留',history:'投稿履歴',reactions:'反応の記録',analysis:'成果分析',operations:'運用状況'};
const candidateViews={stale:'最新確認待ち',review:'原稿QA保留',missing:'生成不足',failed:'処理失敗',other:'対象外'};
const nav=document.querySelector('#room-nav');
for(const [id,label] of Object.entries(roomPages)){const a=node('a','',label);a.href='#'+id;nav.append(a)}
function roomRoute(){const [page,filter,raw]=location.hash.slice(1).split('/');return {page:Object.hasOwn(roomPages,page)?page:'today',filter:Object.hasOwn(candidateViews,filter)?filter:'stale',number:/^[1-9]\d*$/.test(raw||'')?Number(raw):1}}
function pageLink(label,route){const a=node('a','page-link',label);a.href='#'+route;return a}
window.renderRoomPage=function(focus=false){
 const r=roomRoute(),list=$('#cards'),overview=$('#summary');
 for(const a of nav.children){if(a.hash==='#'+r.page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')}
 document.title=roomPages[r.page]+'｜楽天ROOM・ゆあ';
 const heading=document.querySelector('h1');heading.textContent=(testMode?'動作確認専用・実際のROOM投稿はしません：':'')+roomPages[r.page];
 list.setAttribute('aria-label',roomPages[r.page]);overview.hidden=r.page!=='operations';list.hidden=!['today','candidates','history'].includes(r.page);
 feedback.hidden=r.page!=='reactions';affiliatePanel.hidden=r.page!=='analysis';if(r.page==='analysis')affiliatePanel.open=true;
 $('#refresh').hidden=!['today','candidates','operations'].includes(r.page)||testMode;
 $('#refresh').disabled=refreshing||data?.control?.stopped===true;
 const brief=$('#daily-brief');brief.replaceChildren();if(data?.candidate_plan){const p=data.candidate_plan;$('#refresh').textContent='候補を補充・最新情報を確認';brief.append(node('p','hint','保存済み・QA承認済みの未投稿候補から最大5件を補充します。新商品の検索や原稿の有料生成は行いません。'));if(p.shortage)brief.append(node('p','',p.reason),node('p','hint',`補充対象 ${p.selected_count}件 / QA・対象承認待ち ${p.qa_or_approval_hold}件 / 選定条件で見送り ${p.diversity_deferred}件`),pageLink('保留理由を見る','candidates/review/1'));}
 if(data?.operations){const o=data.operations;if(data.control?.manual_only){brief.append(node('p','',`準備・手動操作可 ${o.counts.READY}件（自動投稿なし）`),node('p','hint','期限切れなら「最新情報を確認」。有効中は再照会しません。1回最大5商品・1日4回まで。'));if(data.manual_refresh?.state==='RUNNING')brief.append(node('p','','最新確認の処理中です。画面を閉じても継続します。'));if(data.manual_refresh?.state==='FAILED')brief.append(node('p','',data.manual_refresh.reason));}if(o.preparation?.prepared_count)brief.append(node('p','',`準備完了 ${o.preparation.prepared_count}件（投稿停止中・有効期限 ${time(o.preparation.expires_at)}）`));brief.append(node('strong','',`投稿可能 ${o.counts.READY}件 / 本日投稿済み ${o.posted_today}件 / あと ${o.shortage}件`));if(o.shortage&&!o.preparation?.prepared_count){brief.append(node('p','hint',`最新確認待ち ${o.counts.READY_STALE}件、原稿QA保留 ${o.counts.NEEDS_REVIEW}件。期限切れやQA未完了は投稿可能件数に含みません。`),pageLink('不足の理由と次の処理を見る','candidates/stale/1'))}}
 if(!list.hidden){list.replaceChildren();if(!data){list.append(node('p','','商品情報を読み込んでいます。'));return}
  const g=groups();let rows=r.page==='today'?[...g.ready,...data.cards.filter(c=>c.preparation_ready&&!g.ready.includes(c))]:r.page==='history'?g.posted:g[r.filter];
  if(r.page==='candidates'){const filters=node('nav','candidate-filters');filters.setAttribute('aria-label','候補の状態');for(const [key,label] of Object.entries(candidateViews)){const a=pageLink(label+' '+g[key].length+'件','candidates/'+key+'/1');if(key===r.filter)a.setAttribute('aria-current','page');filters.append(a)}list.append(filters)}
  const size=r.page==='today'?5:4,pages=Math.max(1,Math.ceil(rows.length/size)),current=Math.min(r.number,pages);
  list.append(node('h2','',`${r.page==='candidates'?candidateViews[r.filter]:roomPages[r.page]}：${rows.length}件`));
  if(!rows.length){const empty=node('div','empty-state');empty.append(node('p','',r.page==='today'?'いま投稿できる商品はありません。':'この状態の商品はありません。'));if(r.page==='today')empty.append(node('p','','最新確認待ちの商品と、原稿の確認が必要な商品を分けて表示しています。'),pageLink('候補を確認する','candidates/stale/1'));list.append(empty)}
  list.append(...rows.slice((current-1)*size,current*size).map(card));
  if(pages>1){const pager=node('nav','pager');pager.setAttribute('aria-label','商品一覧のページ');const route=r.page+'/'+r.filter+'/';if(current>1)pager.append(pageLink('前へ',route+(current-1)));pager.append(node('span','',`${current} / ${pages}ページ`));if(current<pages)pager.append(pageLink('次へ',route+(current+1)));list.append(pager)}
 }
 if(focus){heading.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'})}
};
window.addEventListener('hashchange',()=>window.renderRoomPage(true));
window.renderRoomPage();
