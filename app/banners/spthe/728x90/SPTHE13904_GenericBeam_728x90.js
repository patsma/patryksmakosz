var s01bg = $('.s01bg'),
    s01t01 = $('.s01t01'),
    s01t02 = $('.s01t02'),
    s01t03 = $('.s01t03');










var tl = new TimelineMax({repeat:-1,repeatDelay:1});

tl
    .set([s01t01,'#laser-beam','#tumor-1','#tumor-2','#tumor-3','#tumor-4','#laser-and-tumor'],{stroke:'lime',drawSVG:0,autoAlpha:1})
    .to('',1,{})
    .to('#laser-beam',0.5,{xPercent:0,drawSVG:"0% 100%"},'-=0.5')
    .to('',0.5,{})
    .add('laser-movement')
    .to('#laser-beam',0.2,{y:1,ease: Power0.easeNone})
    .to('#laser-beam',0.2,{xPercent:-1,ease: Power0.easeNone})
    .to('#laser-beam',0.2,{y:-1,ease: Power0.easeNone})
    .to('#laser-beam',0.2,{xPercent:-1.5,ease: Power0.easeNone})
    .to('#laser-beam',0.2,{y:2,ease: Power0.easeNone})
    .to('#laser-beam',0.2,{xPercent:-2,ease: Power0.easeNone})
    .to('#laser-beam',0.2,{y:-2,ease: Power0.easeNone})
    .to('#laser-beam',0.2,{xPercent:-2.5,ease: Power0.easeNone})
    .to('#laser-beam',0.2,{y:1,ease: Power0.easeNone})
    .to('#laser-beam',0.2,{xPercent:-3,ease: Power0.easeNone})
    .to('#laser-beam',0.2,{y:-1,ease: Power0.easeNone})
    .to('#laser-beam',0.2,{xPercent:-3.2,ease: Power0.easeNone})
    .to('#laser-beam',0.2,{y:0,ease: Power0.easeNone})
    .from(s01t02,1,{yPercent:3,autoAlpha:0})
    .to("rect", 4.2, {attr:{x:298.42}},'laser-movement-=0.2')
    .to('#laser-beam',0.5,{drawSVG:"0% 100%"})
    .to('#laser-beam',0.5,{drawSVG:"100% 0%"})
    .to('#laser-beam',0.5,{drawSVG:false})
    .to([s01t01,s01t02],1,{yPercent:-3,autoAlpha:0})
;







 playBtn = $("#playBtn"),
        pauseBtn = $("#pauseBtn"),
        resumeBtn = $("#resumeBtn"),
        reverseBtn = $("#reverseBtn");


 playBtn.click(function(){
        tl.play();
    });
    pauseBtn.click(function(){
        tl.pause();
    });
    resumeBtn.click(function(){

        tl.resume();
    });
    reverseBtn.click(function(){
        tl.reverse();
    });
