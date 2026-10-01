/* Shared, dependency-free 2D character rig and deterministic care model. */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BabyKit = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const labels = { idle: '正在好奇地看着你', pet: '嘿嘿，最喜欢你啦', feed: '咕嘟咕嘟，好满足', sleep: '嘘，小芽正在做梦' };
  class Care {
    constructor(saved, now = Date.now()) {
      saved = saved && saved.version === 1 ? saved : {};
      this.food = Number.isFinite(saved.food) ? clamp(saved.food, 0, 100) : 72;
      this.mood = Number.isFinite(saved.mood) ? clamp(saved.mood, 0, 100) : 86;
      this.energy = Number.isFinite(saved.energy) ? clamp(saved.energy, 0, 100) : 68;
      this.born = Number.isFinite(saved.born) ? Math.min(saved.born, now) : now;
      this.sleeping = saved.sleeping === true;
      this.mode = this.sleeping ? 'sleep' : 'idle';
      this.last = Number.isFinite(saved.last) ? saved.last : now;
      this.until = 0;
      this.tick(now);
    }
    tick(now) {
      const seconds = clamp((now - this.last) / 1000, 0, 86400);
      this.food = clamp(this.food - seconds / 180, 0, 100);
      this.mood = clamp(this.mood - seconds / 360, 0, 100);
      this.energy = clamp(this.energy + seconds * (this.sleeping ? 1 / 45 : -1 / 240), 0, 100);
      this.last = now;
      if (this.mode !== 'sleep' && now >= this.until) this.mode = 'idle';
    }
    act(action, now = Date.now()) {
      this.tick(now);
      if (!['pet', 'feed', 'sleep'].includes(action)) return false;
      if (action === 'sleep') {
        this.sleeping = !this.sleeping;
        this.mode = this.sleeping ? 'sleep' : 'idle';
        this.until = 0;
        return true;
      }
      if (this.sleeping || this.mode !== 'idle') return false;
      this.mode = action;
      this.until = now + (action === 'feed' ? 4200 : 2300);
      if (action === 'feed') this.food = clamp(this.food + 15, 0, 100);
      this.mood = clamp(this.mood + (action === 'pet' ? 8 : 3), 0, 100);
      return true;
    }
    view() {
      return { food: Math.round(this.food), mood: Math.round(this.mood), energy: Math.round(this.energy),
        mode: this.mode, sleeping: this.sleeping, busy: this.mode === 'feed' || this.mode === 'pet',
        day: Math.max(1, Math.floor((this.last - this.born) / 86400000) + 1),
        message: this.mode === 'idle' && this.food < 25 ? '小肚子有点饿啦' : this.mode === 'idle' && this.energy < 25 ? '揉揉眼睛，有点困了' : labels[this.mode] };
    }
    save() { return { version: 1, food: this.food, mood: this.mood, energy: this.energy, born: this.born, sleeping: this.sleeping, last: this.last }; }
  }
  class Renderer {
    constructor(canvas, ctx, width, height, dpr, reduced) {
      this.canvas = canvas; this.ctx = ctx; this.reduced = reduced;
      this.t = 0; this.last = null; this.gaze = 0; this.target = 0;
      this.weights = { pet: 0, feed: 0, sleep: 0 };
      this.resize(width, height, dpr);
    }
    resize(width, height, dpr) {
      this.w = width; this.h = height; this.dpr = Math.min(dpr || 1, 2);
      this.canvas.width = Math.round(width * this.dpr); this.canvas.height = Math.round(height * this.dpr);
    }
    point(x) { this.target = clamp((x / this.w - .5) * 2, -1, 1); }
    resetClock() { this.last = null; }
    ellipse(x, y, rx, ry, color) {
      const c = this.ctx; c.beginPath(); c.ellipse(x,y,rx,ry,0,0,Math.PI*2); c.fillStyle=color; c.fill();
    }
    line(points, color, width) {
      const c=this.ctx; c.beginPath(); c.moveTo(points[0],points[1]);
      if(points.length===6)c.quadraticCurveTo(...points.slice(2)); else c.lineTo(...points.slice(2));
      c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();
    }
    heart(x,y,s,alpha) {
      const c=this.ctx;c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha=alpha;
      c.beginPath();c.moveTo(0,4);c.bezierCurveTo(-20,-8,-10,-22,0,-11);c.bezierCurveTo(10,-22,20,-8,0,4);c.fillStyle='#dd907e';c.fill();c.restore();
    }
    draw(now, state) {
      const dt = this.last === null ? 0 : clamp((now-this.last)/1000,0,.08); this.last=now;this.t+=dt;
      const t=this.t, c=this.ctx, blend=1-Math.exp(-dt*7);
      for(const key of Object.keys(this.weights))this.weights[key]+=((state.mode===key?1:0)-this.weights[key])*blend;
      this.gaze+=(this.target-this.gaze)*(1-Math.exp(-dt*4));
      const p=this.weights.pet,f=this.weights.feed,s=this.weights.sleep;
      const motion=this.reduced ? .2 : 1;
      c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.w,this.h);
      const scale=Math.min(this.w/420,this.h/440);c.translate(this.w/2,this.h/2);c.scale(scale,scale);c.translate(-210,-215);
      // Quiet nursery: window, mobile, rug, and soft cushion.
      this.ellipse(210,240,180,179,s>.5?'#dce5db':'#e9ede1');
      c.save();c.globalAlpha=.65;c.fillStyle='#fcfbf4';c.fillRect(278,59,60,92);
      this.line([308,59,308,151],'#e0e6d9',3);this.line([278,105,338,105],'#e0e6d9',3);c.restore();
      this.line([81,0,81,59],'#c4cbbb',1);this.line([47,60,114,60],'#b8c3ae',2);
      [52,81,109].forEach((x,i)=>{this.line([x,60,x,90+i%2*16],'#c4cbbb',1);this.ellipse(x,98+i%2*16,8,11,['#e1be83','#9dad95','#dab09a'][i]);});
      this.ellipse(210,376,164,32,'#d8ddce');this.ellipse(210,361,145,29,'#fdf8ef');
      this.ellipse(210,367,105,13,'#eee5d6');
      const breath=Math.sin(t*2.1)*1.8*motion;
      c.save();c.translate(210,291+breath);c.rotate(Math.sin(t*1.3)*.012*motion+s*Math.sin(t)*.018);
      // Legs and feet, independently layered behind the romper.
      [-1,1].forEach(side=>{
        c.save();c.translate(side*42,40);c.rotate(side*(.28+Math.sin(t*2+side)*.025*motion));
        this.ellipse(0,0,27,39,'#e9bda4');this.ellipse(side*5,27,30,18,'#f4d0b9');
        [0,1,2].forEach(i=>this.line([side*10+i*4-4,30,side*10+i*4-4,34],'#d8ab94',1));c.restore();
      });
      this.ellipse(0,0,67,73,'#8ea98e');this.ellipse(0,7,52,56,'#a9bea0');
      this.line([-29,-44,-23,35],'#ced9bb',3);this.line([29,-44,23,35],'#ced9bb',3);
      [-25,25].forEach(x=>this.ellipse(x,-28,4,4,'#f5e9c8'));
      this.ellipse(0,15,19,23,'#dce3c6');this.line([0,27,0,5],'#829879',2);
      this.ellipse(-5,10,5,3,'#91a985');this.ellipse(5,17,5,3,'#91a985');
      [-1,1].forEach(side=>{
        c.save();c.translate(side*55,-29);
        c.rotate(side*(-.19 - p*.85-f*.95 + Math.sin(t*2.4+side)*.035*motion));
        this.ellipse(side*7,21,19,34,'#a3b79a');this.ellipse(side*10,47,18,19,'#f3cbb1');c.restore();
      });
      // Head pivot: cheeks, ears, hair, eyes, and mouth share one transform.
      c.save();c.translate(this.gaze*3,-108);c.rotate(this.gaze*.045*(1-s)+p*.065+s*.07);
      this.ellipse(-80,2,15,22,'#efc0a6');this.ellipse(80,2,15,22,'#efc0a6');
      const skin=c.createRadialGradient(-23,-38,12,0,0,100);skin.addColorStop(0,'#ffe7cd');skin.addColorStop(1,'#edbfa3');
      this.ellipse(0,-2,84,82,skin);this.ellipse(0,20,83,57,skin);
      c.save();c.rotate(-.15);this.ellipse(-7,-70,36,11,'#816148');c.restore();
      this.line([-14,-77,-9,-105,8,-90],'#816148',7);this.line([5,-78,24,-92,27,-80],'#816148',5);
      this.ellipse(-48,27,18,10,'#eeac99');this.ellipse(48,27,18,10,'#eeac99');
      const blinkPhase=t%4.7;const blink=blinkPhase>4.48?Math.sin((blinkPhase-4.48)/.22*Math.PI):0;
      const eyeOpen=clamp(1-Math.max(blink,s,p*.85),.04,1);
      [-1,1].forEach(side=>{
        const x=side*31;
        this.line([x-9,-25,x,-29,x+8,-24],'#99765a',2.6);
        if(eyeOpen<.22)this.line([x-10,2,x,10,x+10,2],'#614c3e',3);
        else {this.ellipse(x,3,8.4,11.5*eyeOpen,'#59493c');this.ellipse(x+this.gaze*2-2,0,2.6,3*eyeOpen,'#fff9ed');}
      });
      this.ellipse(0,19,8,5,'#e9b195');
      if(f>.4)this.ellipse(0,40,8,10+Math.sin(t*8)*1.5,'#a96858');
      else if(s>.5)this.ellipse(0,40,4,5,'#ae7562');
      else {this.line([-12-p*4,37,0,48+p*12,12+p*4,37],'#ac6e5c',3);}
      c.restore();c.restore();
      if(f>.01){
        c.save();c.globalAlpha=f;c.translate(232+20*(1-f),246+65*(1-f));c.rotate(-.42);
        c.fillStyle='#fbf9ed';c.strokeStyle='#bbcdc2';c.lineWidth=2;c.beginPath();c.roundRect ? c.roundRect(-16,0,32,63,8) : c.rect(-16,0,32,63);c.fill();c.stroke();
        c.fillStyle='#e9d7ac';c.fillRect(-13,24,26,32);c.fillStyle='#9ebdad';c.fillRect(-18,-5,36,12);
        this.ellipse(0,-10,8,9,'#ebba99');[22,33,44].forEach(y=>this.line([5,y,12,y],'#b5bdaa',2));c.restore();
      }
      if(p>.01){for(let i=0;i<3;i++){const phase=(t*.65+i*.31)%1;this.heart(105+i*103,181-phase*90,.6+phase*.25,p*(1-phase));}}
      if(s>.01){c.save();c.globalAlpha=s;c.fillStyle='#718a79';c.font='600 21px Georgia';c.fillText('z',292,156-Math.sin(t)*4);c.font='600 29px Georgia';c.fillText('z',315,123-Math.sin(t+1)*5);c.restore();}
    }
  }
  return { Care, Renderer };
});
