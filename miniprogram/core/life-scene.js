(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./baby'));else root.LifeScene=factory(root.BabyKit);})(typeof globalThis!=='undefined'?globalThis:this,function(Baby){
  class Scene extends Baby.Renderer {
    draw(now,month){
      if(month>=0&&month<36){super.draw(now,{mode:'idle'});return;}
      const c=this.ctx;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.w,this.h);
      const scale=Math.min(this.w/520,this.h/320);c.translate(this.w/2,this.h/2);c.scale(scale,scale);c.translate(-260,-160);
      this.ellipse(260,160,213,139,'#e8eddf');this.ellipse(260,272,168,17,'#d5dec8');
      c.fillStyle='#fbfaf0';c.fillRect(320,57,71,104);this.line([355,57,355,161],'#dce3d1',3);this.line([320,109,391,109],'#dce3d1',3);
      this.line([99,260,99,182],'#8a9a76',4);this.ellipse(86,208,18,8,'#9dad87');this.ellipse(113,190,18,9,'#abb997');c.fillStyle='#c9ad92';c.fillRect(83,239,32,29);
      const person=(x,y,size,shirt,old=false,pregnant=false)=>{
        c.save();c.translate(x,y);c.scale(size,size);
        this.line([-15,15,-17,69],'#778172',17);this.line([15,15,19,69],'#778172',17);this.ellipse(-23,75,16,7,'#686d61');this.ellipse(24,75,16,7,'#686d61');
        this.ellipse(0,-16,pregnant?43:31,49,shirt);if(pregnant)this.ellipse(22,-4,32,29,shirt);
        this.line([-26,-36,-42,13],'#edc4a8',12);this.line([26,-36,40,13],'#edc4a8',12);
        this.ellipse(0,-82,30,35,'#f3d2b6');this.ellipse(0,-108,27,12,old?'#d7d6c9':'#78614c');
        this.ellipse(-10,-82,2.5,3,'#655341');this.ellipse(10,-82,2.5,3,'#655341');this.line([-7,-67,0,-62,7,-67],'#ba8270',2);
        if(old){this.line([-21,-84,21,-84],'#8f9385',1);this.line([40,11,44,72],'#9b7b58',4);}c.restore();
      };
      if(month<0){person(225,184,.95,'#bb8770',false,true);person(295,174,1.05,'#8ba083');this.heart(255,59,.8,.8);}
      else if(month<144){person(210,206,.67,'#b59470');person(287,180,1,'#8ea58b');this.ellipse(360,256,15,15,'#d8b16c');}
      else if(month<216){person(260,178,1.02,'#9aaa89');c.fillStyle='#bb8d71';c.fillRect(278,176,25,33);}
      else if(month<720){person(260,169,1.13,'#8b9c84');c.fillStyle='#ba977b';c.fillRect(302,202,30,29);this.line([308,201,308,193,326,201],'#927960',2);}
      else{person(258,181,1,'#a6aa94',true);this.heart(314,101,.65,.7);}
    }
  }
  return Scene;
});
