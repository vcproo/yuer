const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Care}=require('../miniprogram/core/baby');
test('feeding cannot be spammed and returns to idle',()=>{const c=new Care(null,1000);assert.ok(c.act('feed',1000));const food=c.food;assert.equal(c.act('feed',1100),false);assert.ok(c.food<=food);c.tick(5300);assert.equal(c.mode,'idle');assert.ok(c.act('feed',5300));});
test('sleep blocks feeding and restores energy offline',()=>{const c=new Care(null,1000);c.act('sleep',1000);assert.equal(c.act('feed',1100),false);const e=c.energy;const restored=new Care(c.save(),3601000);assert.equal(restored.mode,'sleep');assert.ok(restored.energy>e);assert.ok(restored.act('sleep',3601000));assert.equal(restored.mode,'idle');});
test('invalid storage, future clock and long absence keep values bounded',()=>{for(const data of [null,{}, {version:1,food:-100,mood:Infinity,energy:200,last:1e15}]){const c=new Care(data,1000);c.tick(1e12);for(const k of ['food','mood','energy'])assert.ok(Number.isFinite(c[k])&&c[k]>=0&&c[k]<=100);assert.equal(c.act('unknown',1e12),false);}});
test('transient actions are not replayed from saved storage',()=>{const c=new Care(null,1000);c.act('pet',1000);const restored=new Care(c.save(),2000);assert.equal(restored.mode,'idle');assert.equal(restored.born,1000);});
