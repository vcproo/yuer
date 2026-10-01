const { Care, Renderer } = require('../../core/baby');
const KEY = 'little-sprout-v1';
Page({
  data: { food: 72, mood: 86, energy: 68, day: 1, message: '正在好奇地看着你', sleeping: false, busy: false, error: '', saveError: false },
  onLoad() { let saved; try { saved = wx.getStorageSync(KEY); } catch (_) {} this.care = new Care(saved); this.setData(this.care.view()); },
  onReady() {
    wx.createSelectorQuery().in(this).select('#baby').fields({ node: true, size: true }).exec(res => {
      if (this.closed) return;
      if (!res[0] || !res[0].node) { this.setData({error: '画布未能加载，请更新微信后重新打开。'}); return; }
      this.canvas = res[0].node;
      this.renderer = new Renderer(this.canvas, this.canvas.getContext('2d'), res[0].width, res[0].height, wx.getWindowInfo().pixelRatio);
      if (!this.hidden) this.start();
    });
  },
  onShow() { this.hidden = false; if (this.care) { this.care.tick(Date.now()); this.setData(this.care.view()); } if (this.renderer) this.start(); },
  start() {
    this.stop(); this.renderer.resetClock(); this.lastUI = 0; this.lastSave = Date.now();
    const frame = () => {
      const now = Date.now(); this.care.tick(now); this.renderer.draw(now, this.care.view());
      if (now - this.lastUI > 250) { this.setData(this.care.view()); this.lastUI = now; }
      if (now - this.lastSave > 5000) { this.save(); this.lastSave = now; }
      this.frame = this.canvas.requestAnimationFrame(frame);
    };
    this.frame = this.canvas.requestAnimationFrame(frame);
  },
  stop() { if (this.canvas && this.frame != null) this.canvas.cancelAnimationFrame(this.frame); this.frame = null; },
  save() { if (!this.care) return; try { wx.setStorageSync(KEY, this.care.save()); } catch (_) { if (!this.closed) this.setData({ saveError: true }); } },
  onHide() { this.hidden = true; this.stop(); if(this.care)this.care.tick(Date.now()); this.save(); },
  onUnload() { this.closed = true; this.stop(); this.save(); this.renderer = null; this.canvas = null; },
  onResize() {
    if (!this.renderer) return;
    wx.createSelectorQuery().in(this).select('#baby').fields({size:true}).exec(res=>{if(this.renderer&&res[0])this.renderer.resize(res[0].width,res[0].height,wx.getWindowInfo().pixelRatio);});
  },
  action(e) { if (this.care.act(e.currentTarget.dataset.act)) { this.setData(this.care.view()); this.save(); } },
  touch(e) {
    const touch = e.touches[0]; if (!touch || !this.renderer) return;
    this.renderer.point(touch.x);
  },
  pet(e) {
    if (!this.renderer) return;
    const touch=e.changedTouches[0]; if(!touch)return;
    const r=this.renderer,scale=Math.min(r.w/420,r.h/440),x=(touch.x-r.w/2)/scale,y=(touch.y-r.h/2)/scale;
    if(Math.abs(x)<95&&y>-120&&y<125&&this.care.act('pet')){this.setData(this.care.view());this.save();}
    r.point(r.w/2);
  }
});
