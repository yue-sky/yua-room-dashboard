'use strict';
const fieldLabels={likes:'♡ いいね',comments:'💬 コメント',sales_count:'売上件数',sales_amount:'売上金額（円）',reward_amount:'報酬（円）',clicks:'クリック'};
const metricValue=v=>v==null?'未確認':Number(v).toLocaleString();
function performanceCard(r){
 const article=node('article','card');article.append(node('h3','name',r.itemName));
 article.append(node('p','',`♡ ${metricValue(r.likes)}　💬 ${metricValue(r.comments)}　売上 ${metricValue(r.sales_count)}件`),node('p','hint','最終更新：'+time(r.last_updated_at)));
 const details=node('details',''),title=node('summary','','反応を記録');details.append(title);
 const form=node('form',''),inputs={};
 form.append(node('p','hint','確認できた累計だけ入力。空欄は未確認です。前回から変わった項目だけ保存します。'));
 const sale=node('details','');sale.append(node('summary','','公式レポートの売上・クリック'));
 sale.append(node('p','hint','この商品に対応する公式レポートの累計を入力してください。期間を足し合わせたり、ROOM以外の売上を推測して割り当てないでください。'));
 for(const [key,label] of Object.entries(fieldLabels)){
  const l=node('label','',label),input=node('input','');input.type='number';input.inputMode=key.endsWith('_amount')?'decimal':'numeric';input.min='0';input.max='1000000000';input.step=key.endsWith('_amount')?'0.01':'1';input.value=r[key]??'';input.placeholder='未確認';inputs[key]=input;l.append(input);(['likes','comments'].includes(key)?form:sale).append(l);
 }
 const confirmed=node('input','');confirmed.type='checkbox';const confirmLabel=node('label','confirm','公式レポートの商品別累計を確認しました');confirmLabel.prepend(confirmed);sale.append(confirmLabel);form.append(sale);
 const save=node('button','','保存'),status=node('p','hint');status.setAttribute('role','status');form.append(save,status);
 form.onsubmit=e=>{e.preventDefault();const changes={};for(const [k,input]of Object.entries(inputs)){const v=input.value===''?null:Number(input.value);if(v!==(r[k]??null))changes[k]=v}if(!Object.keys(changes).length){status.textContent='変更はありません。';return}
 const started=popup('record-performance',{itemCode:r.itemCode,changes,expected_updated_at:r.last_updated_at,report_confirmed:confirmed.checked},result=>{article.replaceWith(performanceCard(result.item));message('反応を記録しました。分析は20時に更新します。')},error=>{status.textContent=error;save.disabled=false});if(started){save.disabled=true;status.textContent='記録中…'};
 };details.append(form);article.append(details);return article;
}
const feedback=node('section','feedback'),heading=node('h2','','投稿済み商品の反応'),login=node('button','quiet','反応を表示・記録（GitHubログイン）'),list=node('div','performance-list');feedback.append(heading,node('p','hint','未確認の数値は「未確認」のまま。反応・売上は本人だけが確認できます。'),login,list);document.querySelector('footer').before(feedback);
login.onclick=()=>popup('performance-read',{},result=>{list.replaceChildren(...result.items.map(performanceCard));login.textContent='反応データを更新'},message);
