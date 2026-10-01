(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.LifeKit=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const stages=[[-8,'孕期','为见面做准备'],[0,'0—5个月','喂养与日常照护'],[6,'6—11个月','辅食与探索'],[12,'1岁','会走路的小朋友'],[24,'2岁','生活用品慢慢换新'],[36,'幼儿园小班','第一次入园'],[48,'幼儿园中班','熟悉园内生活'],[60,'幼儿园大班','准备走向小学'],[72,'小学入学','背起第一只书包']];
  const kinds={required:'必需安排',conditional:'按情况必需',optional:'可选消费'};
  const categories=['孕产医疗','喂养饮食','尿裤清洁','衣物用品','出行安全','照护托育','医疗保健','玩具图书','教育入学','活动纪念'];
  const age=m=>m<0?'孕期 · 约'+(40+m*4)+'周':m===0?'出生 · 第1个月':m<12?m+' 个月':Math.floor(m/12)+' 岁'+(m%12?' '+m%12+' 个月':'');
  const nextMonth=m=>Math.min(72,m+(m<12?1:m<36?3:6));
  const stage=m=>stages.filter(x=>m>=x[0]).slice(-1)[0];
  const O=(id,label,price=0,qty=1,unit='项',extra={})=>({id,label,price,qty,unit,...extra});
  const skip=()=>O('skip','这次不买',0,1,'项',{skip:true});
  const owned=()=>O('owned','已有合用物品，继续使用',0);
  const T=(id,title,kind,category,description,options,extra={})=>({id,title,kind,category,description,options,...extra});
  function build(s){
    const m=s.month,d=m===72?0:nextMonth(m)-m,p=s.profile,tasks=[];
    const add=(...args)=>tasks.push(T(...args));
    const asset=(key)=>s.owned[key]===undefined||s.owned[key]===m;
    const decision=(id,title,description,values,field)=>add(id,title,'required','生活安排',description,values.map(([id,label])=>O(id,label,0,1,'项',{set:{[field]:id}})),{decision:true});
    const purchase=(id,title,kind,category,description,price,qty=1,unit='件',extra={})=>add(id,title,kind,category,description,[O('basic','实用款',price,qty,unit),O('comfort','升级款',Math.round(price*1.65),qty,unit),...(extra.allowOwned?[owned()]:[]),...(kind==='optional'?[skip()]:[])],extra);
    if(m<0){
      add('prenatal','本月产检自付费用','required','孕产医疗','按本次实际自付部分记账；示例金额不对应具体检查项目。',[O('standard','记录本次自付',300),O('higher','本次自付较多',800),O('covered','本次已由保障覆盖 / 无自付',0)]);
      if(m===-8)add('record','给第一张照片留个位置','optional','活动纪念','电子相册也能留下纪念。',[O('album','买一本纪念册',60,1,'本'),O('photo','拍一组纪念照',600,1,'次'),skip()]);
      if(m===-6)purchase('maternity','孕期换洗衣物','conditional','衣物用品','原有衣物仍合身时可继续使用，不要求整套换新。',120,2,'件',{allowOwned:true});
      if(m===-4)add('sleep-space','准备安全的婴儿睡眠空间','required','衣物用品','需要平整、坚实且合用的婴儿睡眠表面；不把床围、枕头或毛绒玩具列为必需品。',[O('basic','婴儿床与合适床垫',800,1,'套'),O('comfort','较高预算床具组合',1800,1,'套'),O('owned','已有符合要求的床具',0)],{asset:'bed'});
      if(m===-3){purchase('newborn-clothes','第一批新生儿衣物','required','衣物用品','准备少量换洗即可，尺码增长后再添置。',35,5,'件',{allowOwned:true});purchase('bath','清洁与洗浴基础用品','required','尿裤清洁','毛巾、清洁用品等按需准备；不强制买专用高价设备。',180,1,'套',{allowOwned:true,asset:'bath'});}
      if(m===-2){purchase('hospital-bag','待产基础用品','required','孕产医疗','本项仅计母婴住院用的消耗品，不包含分娩账单或之前购买的衣物。',260,1,'套',{allowOwned:true});purchase('room-decoration','布置一间漂亮的婴儿房','optional','衣物用品','装饰、主题灯和墙贴都可以不买。',900,1,'套');}
      if(m===-1){decision('transport','计划怎样带宝宝出门？','仅自驾情境会生成儿童安全座椅任务；方案只改变需要处理的费用清单。',[['car','家里会自驾接送'],['public','步行或公共交通为主']],'transport');if(s.done.transport&&p.transport==='car')purchase('car-seat','配置儿童安全座椅','conditional','出行安全','自驾接送时需要安排合适的安全座椅。已有合规且完好的适龄座椅可继续使用。',1000,1,'台',{allowOwned:true,asset:'seat'});purchase('stroller','要不要添置推车？','optional','出行安全','根据出行方式选择；不购买不会阻止下一阶段。',650,1,'台',{asset:'stroller'});}
      return tasks;
    }
    if(m===72){
      add('public-school','办理公办小学入学','required','教育入学','本轮以约6岁进入公办小学为终点，实际入学时间按当地规定。公办义务教育学杂费记为零。',[O('public','完成入学安排 · 学杂费 ¥0',0)]);
      purchase('schoolbag','准备书包','required','教育入学','能正常使用、尺寸合适的旧书包也可以。',150,1,'个',{allowOwned:true});
      purchase('stationery','准备基础文具','required','教育入学','铅笔、橡皮、尺子和笔袋；不把电子产品列入必需清单。',60,1,'套',{allowOwned:true});
      add('textbooks','领取学校统一提供的教科书','required','教育入学','公办义务教育统一免费教科书按零支出记录，不包含自行选购的教辅。',[O('free','领取免费教科书',0)]);
      add('uniform','核对学校服装要求','conditional','教育入学','只在学校有相应要求且需要添置时购买。',[O('basic','按学校要求添置服装',120,2,'套'),O('owned','无统一要求 / 已有合用服装',0)]);
      purchase('desk','添置专用书桌','optional','教育入学','已有合适的学习位置即可，专用书桌不是入学前必须新买的物品。',800,1,'套');
      purchase('tablet','买一台学习平板？','optional','教育入学','电子学习设备属于可选消费，可以跳过。',2200,1,'台');
      purchase('school-photo','拍一张入学纪念照','optional','活动纪念','留下这一刻，也可以用家里的手机记录。',280,1,'次');
      return tasks;
    }
    if(m===0)add('birth','分娩与住院自付账单','required','孕产医疗','填写保障结算后的家庭自付费用，不再次计入待产物品。不同地区与情况差异很大。',[O('basic','记录家庭自付部分',3500),O('higher','记录较高自付部分',8000),O('covered','本次无家庭自付',0)]);
    if(m<12){
      decision('feeding','安排本期喂养方式','选择用于本期费用模拟的安排，不评价喂养方式。母乳方案不自动收奶粉费；其他方案会展开奶粉采购。',[['breast','母乳喂养'],['mixed','混合喂养'],['formula','配方奶喂养']],'feeding');
      if(s.done.feeding&&['mixed','formula'].includes(p.feeding)){
        add('formula','购买本期配方奶粉','conditional','喂养饮食','已选择需要奶粉的喂养方式。罐数只是采购预算初值，可修改；不表示推荐喂养量。',[O('basic','常规预算奶粉',220,(p.feeding==='mixed'?2:4)*d,'罐'),O('comfort','较高预算奶粉',350,(p.feeding==='mixed'?2:4)*d,'罐')],{condition:'混合 / 配方奶喂养时需要',periodic:true});
        if(asset('bottles'))purchase('bottles','准备奶瓶与清洁工具','conditional','喂养饮食','奶瓶、奶嘴与清洁工具按实际需要准备；本轮准备后不会每月重复购买。',150,1,'套',{allowOwned:true,asset:'bottles'});
      }
      if(s.done.feeding&&(p.feeding==='breast'||p.feeding==='mixed'))purchase('pump','要不要购买吸奶器？','optional','喂养饮食','有储奶、返岗等需求时再考虑；母乳喂养不等于必须购买吸奶器。',400,1,'台',asset('pump')?{asset:'pump'}:{});
      if(s.owned.pump!==undefined&&s.owned.pump!==m){const i=tasks.findIndex(x=>x.id==='pump');if(i>=0)tasks.splice(i,1);}
    }
    if(m<24)add('diapers','安排本期尿裤与尿布','required','尿裤清洁','排泄清洁需要安排，但不限定必须购买一次性纸尿裤。包数按采购需要修改，洗涤费包含在清洁任务中。',[O('basic','采购纸尿裤 · 实用款',65,(m<6?4:m<12?3:2)*d,'包'),O('comfort','采购纸尿裤 · 升级款',105,(m<6?4:m<12?3:2)*d,'包'),O('reusable','已有合用的可重复尿布',0)],{periodic:true});
    if(m>=24&&m<36){decision('toileting','安排本期尿裤使用','如厕进度因人而异，不按生日强行停用尿裤。',[['full','白天和夜间仍需使用'],['night','主要夜间使用'],['none','已不需要尿裤']],'toileting');if(s.done.toileting&&p.toileting!=='none')purchase('diapers','本期仍需要的尿裤','conditional','尿裤清洁','根据刚才的使用安排准备；包数仅是可调整的采购预算。',65,(p.toileting==='night'?1:2)*d,'包',{periodic:true});}
    purchase('cleaning','日常清洁消耗品','required','尿裤清洁','包含清洁、洗护与使用可重复尿布时的新增洗涤预算，不重复购买浴盆等耐用品。',45,d,'月',{periodic:true});
    if(m>=6&&m<12){add('food','安排本期辅食食材','required','喂养饮食','约6月龄起加入辅食费用，与奶类费用分别记录。这里是食材预算，不是食谱或喂养量建议。',[O('home','家常食材为主',220,d,'月'),O('mixed','食材与部分便捷食品',380,d,'月')],{periodic:true});if(asset('tableware'))purchase('tableware','准备基础进食用具','required','喂养饮食','合适的碗、勺等基础用品；可以使用家中已有合用物品。',80,1,'套',{allowOwned:true,asset:'tableware'});purchase('food-machine','购买专用辅食机？','optional','喂养饮食','普通家用工具也能处理食材，专用机器可跳过。',350,1,'台',asset('food-machine')?{asset:'food-machine'}:{});if(s.owned['food-machine']!==undefined&&s.owned['food-machine']!==m)tasks.splice(tasks.findIndex(x=>x.id==='food-machine'),1);}
    if(m>=12&&(m<36||s.done.school)){add('food','安排本期家庭餐食','required','喂养饮食',m>=36?'只计孩子在家吃的餐食，不含园内伙食或另列奶类。':'只计孩子的日常食材，不含家庭其他成员及另列的奶类。',[O('basic','按需采购家常食材',m>=36&&p.school!=='home'?320:380,d,'月'),O('variety','增加食材预算',560,d,'月')],{periodic:true});
      add('milk','安排本期奶类开销','required','喂养饮食','1岁后不把幼儿配方奶设为人人必买。按实际奶类安排记账；每项为采购预算，非推荐摄入量。',[O('breast','继续母乳，本项不新增采购',0),O('dairy','购买适龄奶类食品',150,d,'月'),O('toddler','家庭选择继续购买配方奶',550,d,'月')],{periodic:true});}
    if(m%3===0||m>=36)purchase('clothing','检查尺码与换季衣物','required','衣物用品','先检查是否合身、是否有足够换洗衣物；不需要添置时可以使用现有衣物。',m<12?45:90,m>=36?4:3,'件',{allowOwned:true});
    if(m>=12)purchase('shoes','检查鞋子是否合脚','required','衣物用品','鞋子仍合脚可继续穿，本项不要求按固定周期买新鞋。',100,m>=36?2:1,'双',{allowOwned:true});
    if(m===0||m%6===0){add('health','核对本期儿保与接种安排','required','医疗保健','免疫规划疫苗按免费安排记录；实际项目和时间以当地接种门诊、儿保安排为准，本任务不是接种时间表。',[O('public','免费项目 / 本期无新增自付',0),O('copay','记录其他儿保项目自付',100,1,'次')]);add('nonprogram','其他自费健康服务','optional','医疗保健','仅按家庭已了解并选择的非免费服务记账，不代替医疗判断。',[O('chosen','记录本期自费项目',300,1,'项'),O('covered','当地已免费 / 无自付',0),skip()]);}
    if(m>=6&&m<36){decision('care','安排本期照看方式','有人照看是需要安排的事，但不等于一定要雇人。选择付费服务后才生成相应账单。',[['family','家人照看'],['nursery','使用日间托育'],['helper','聘请照护帮助']],'care');if(s.done.care&&p.care==='nursery')purchase('nursery','本期托育服务费','conditional','照护托育','示例按服务月份计算，不包含已经单列的食材和消耗品。',2200,d,'月',{periodic:true});if(s.done.care&&p.care==='helper')purchase('helper','本期照护服务费','conditional','照护托育','只记录照护服务费；并非所有家庭必须雇用。',4500,d,'月',{periodic:true});}
    if(m===0)purchase('postpartum-help','需要短期产后照护帮助吗？','optional','照护托育','可以由家人分工照护；本项是额外付费服务。',7000,1,'月');
    if(m===6)purchase('home-safety','整理活动空间与安全防护','required','出行安全','检查家具固定、危险物收纳等。有些可通过整理完成，不一定需要购买防护套装。',150,1,'套',{allowOwned:true});
    if(m>=36){
      // Insert arrangement before costs so the visible checklist follows its dependencies.
      const before=tasks.length;decision('school','安排这一学期','每个游戏学期覆盖6个月，默认按5个在园月计费，可改数量；幼儿园不作为小学义务教育学费处理。',[['public','公办幼儿园'],['private','民办幼儿园'],['home','暂未入园，家庭照看']],'school');const [arrangement]=tasks.splice(before,1);tasks.unshift(arrangement);
      if(s.done.school&&p.school&&p.school!=='home'){
        if(p.school==='public'&&m>=60)add('tuition','学前一年公办保教费','conditional','教育入学','按当前公办幼儿园学前一年免保教费政策，保教费为零；伙食、住宿等不在本项免除范围。',[O('free','记录保教费减免 · ¥0',0)],{periodic:true});
        else add('tuition','本学期保教费','conditional','教育入学',m>=60?'民办园此处填写按当地标准减免后的家庭自付额。':'只计保教费，伙食和用品另列。示例价格可以按所在地修改。',[O('standard','记录每月家庭自付额',p.school==='public'?500:m>=60?1500:2000,5,'在园月')],{periodic:true});
        add('school-meals','本学期园内伙食费','conditional','喂养饮食','与在家餐食分开。是否收费、收费标准和计费月份按园所实际安排填写。',[O('standard','园内用餐',400,5,'在园月'),O('nocharge','本期无需单独缴费',0)],{periodic:true});
        if(asset('school-kit')){purchase('school-kit','准备园所要求的入园用品','conditional','教育入学','被褥、换洗袋等仅按园所要求准备，已有合用品可零支出完成。',300,1,'套',{allowOwned:true,asset:'school-kit'});add('entry-check','入园健康检查自付','conditional','医疗保健','只记录入园要求对应的检查自付部分。',[O('check','检查自付费用',120),O('covered','已完成 / 无自付',0)]);}
      }
    }
    if(m<12)purchase('toys','添一件适龄玩具？','optional','玩具图书','可继续使用安全、适龄的已有玩具。不购买不会有惩罚。',60,1,'件');
    else {purchase('toys','玩具或户外小器材','optional','玩具图书','积木、球类等按兴趣和现有物品决定，本期可以不买。',120,1,'件');add('books','这期要不要添绘本？','optional','玩具图书','可以借阅、交换或继续读已有的书。',[O('borrow','图书馆借阅 / 使用已有图书',0),O('buy','购买绘本',35,3,'本'),skip()]);}
    if(m>=12)purchase('classes',m<36?'参加早教体验？':'参加兴趣活动？','optional','活动纪念','商业课程不作为必需费用。可以不报名，也可以选择免费的家庭活动。',m<36?180:600,m<36?2:1,m<36?'次':'期');
    if(m===0||m===12||m===24||m===36||m===48||m===60)add('memory','这次纪念日怎样过？','optional','活动纪念','可以在家简单记录，也可以购买拍摄服务。',[O('home','在家庆祝，使用现有物品',0),O('cake','买个小蛋糕与装饰',180,1,'次'),O('photo','拍一组纪念照',900,1,'次'),skip()]);
    return tasks;
  }
  class Life {
    constructor(saved,config={}){
      if(saved&&saved.version===4&&Number.isInteger(saved.month)&&saved.month>=-8&&saved.month<=72&&Array.isArray(saved.periods)&&Array.isArray(saved.ledger)&&saved.ledger.every(x=>Number.isSafeInteger(x.cents)&&x.cents>=0)&&saved.done&&saved.owned&&saved.profile&&Number.isFinite(saved.budget)&&saved.budget>=0)this.s=JSON.parse(JSON.stringify(saved));
      else this.s={version:4,month:-8,budget:200000,profile:{},owned:{},done:{},ledger:[],periods:[],ended:false,...config};
    }
    tasks(){return build(this.s).map(t=>({...t,kindLabel:kinds[t.kind],record:this.s.done[t.id]||null}));}
    choose(id,optionId,custom={}){
      if(this.s.ended||this.s.done[id])return false;
      const t=this.tasks().find(x=>x.id===id),o=t&&t.options.find(x=>x.id===optionId);if(!o)return false;
      let price=o.price,qty=o.qty;
      if(o.price>0){if(custom.price!==undefined)price=Number(custom.price);if(custom.qty!==undefined)qty=Number(custom.qty);if(!Number.isFinite(price)||price<=0||price>1000000||Math.abs(price*100-Math.round(price*100))>1e-6||!Number.isInteger(qty)||qty<1||qty>1000)return false;}
      const cents=Math.round(price*100)*qty;
      const entry={id:this.s.ledger.length+1,month:this.s.month,to:this.s.month===72?72:nextMonth(this.s.month),task:id,title:t.title,category:t.category,kind:t.kind,kindLabel:kinds[t.kind],label:o.label,price,qty,unit:o.unit,cents,status:o.skip?'skipped':'done',periodic:!!t.periodic,decision:!!t.decision};
      this.s.ledger.push(entry);this.s.done[id]=entry;if(o.set)Object.assign(this.s.profile,o.set);if(t.asset&&!o.skip)this.s.owned[t.asset]=this.s.month;
      return true;
    }
    skipOptional(){let count=0;for(const t of this.tasks())if(!t.record&&t.kind==='optional'&&t.options.some(o=>o.id==='skip'))if(this.choose(t.id,'skip'))count++;return count;}
    advance(){if(this.s.ended||this.tasks().some(t=>!t.record))return false;this.s.periods.push({month:this.s.month,count:this.tasks().length});if(this.s.month===72){this.s.ended=true;return true;}this.s.month=nextMonth(this.s.month);this.s.done={};return true;}
    view(){const s=this.s,tasks=this.tasks(),entries=s.ledger,centTotal=entries.reduce((a,e)=>a+e.cents,0),period=entries.filter(e=>e.month===s.month),sum=es=>es.reduce((a,e)=>a+e.cents,0)/100;return {age:age(s.month),stage:stage(s.month)[1],tagline:stage(s.month)[2],duration:s.month===72?0:nextMonth(s.month)-s.month,nextAge:age(nextMonth(s.month)),tasks,total:centTotal/100,periodTotal:sum(period),requiredTotal:sum(entries.filter(e=>e.kind!=='optional')),optionalTotal:sum(entries.filter(e=>e.kind==='optional')),remaining:s.budget-centTotal/100,done:tasks.filter(t=>t.record).length,pending:tasks.filter(t=>!t.record).length,requiredPending:tasks.filter(t=>!t.record&&t.kind!=='optional').length,optionalPending:tasks.filter(t=>!t.record&&t.kind==='optional').length,skipped:entries.filter(e=>e.status==='skipped').length,stageTotals:stages.map((st,i)=>({name:st[1],total:sum(entries.filter(e=>e.month>=st[0]&&(!stages[i+1]||e.month<stages[i+1][0])))})),categoryTotals:categories.map(name=>({name,total:sum(entries.filter(e=>e.category===name))})),last:s.month===72};}
    csv(){const cell=x=>'"'+String(x).replace(/"/g,'""')+'"';return '\ufeff'+[['年龄','覆盖至','项目','类别','性质','方案','单价','数量','单位','支出（元）','处理'],...this.s.ledger.map(e=>[age(e.month),e.periodic?age(e.to):age(e.month),e.title,e.category,e.kindLabel,e.label,e.price,e.qty,e.unit,(e.cents/100).toFixed(2),e.status==='skipped'?'跳过':'完成'])].map(row=>row.map(cell).join(',')).join('\r\n');}
    save(){return JSON.parse(JSON.stringify(this.s));}
  }
  return {Life,stages,age,nextMonth,kinds,categories};
});
