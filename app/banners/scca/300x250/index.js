






var s01bg = $('.s01bg'),   //Background
    s01t01 = $('.s01t01'), // "Three time the hope"
    s02t01 = $('.s02t01'), // "Fred Hutch"
    s02t02 = $('.s02t02'), // "Seattle Children's"
    s02t03 = $('.s02t03'), // "UW Medicine"
    s03t01 = $('.s03t01'), // "Three world-class organizations"
    s04t01 = $('.s04t01'), // "for better,longer,richer lives"
    s05t01 = $('.s05t01'), // "Seattle Cancer Care alliance logo+logotype"
    s05t02 = $('.s05t02'), // "learn more"
    logo = $('.logo'); // "svg logo"






//noinspection JSUnresolvedFunction
var tl = new TimelineMax();

tl
    .set(logo,{autoAlpha:0.8})
    .to('',1.2,{})
    .add('first-scene')
    .to(s01t01,0.8,{autoAlpha:0},'first-scene')
    .fromTo(s02t01,0.8,{autoAlpha:0,xPercent:10},{autoAlpha:1,xPercent:0})
    .fromTo(s02t02,0.8,{autoAlpha:0,xPercent:10},{autoAlpha:1,xPercent:0})
    .fromTo(s02t03,0.8,{autoAlpha:0,xPercent:10},{autoAlpha:1,xPercent:0})
    .to('',1.55,{})
    .to([s02t01,s02t02,s02t03],0.8,{autoAlpha:0})
    .fromTo(s03t01,0.8,{autoAlpha:0},{autoAlpha:1,xPercent:0})
    .to('',1.2,{})
    .to(s03t01,0.8,{autoAlpha:0})
    .fromTo(s04t01,0.8,{autoAlpha:0},{autoAlpha:1,xPercent:0})
    .to('',1.2,{})
    .to(s04t01,0.8,{autoAlpha:0})
    .to(logo,0.8,{css:{width:'68px',left:'143px',top:'13px'},ease: Power4.easeOut})
    .add('show-hide-logo')
    .to(logo,1,{autoAlpha:0},'show-hide-logo-=0.2')
    .fromTo(s05t01,0.8,{autoAlpha:0},{autoAlpha:1,xPercent:0},'show-hide-logo')
    .fromTo(s05t02,0.8,{autoAlpha:0,yPercent:10},{autoAlpha:1,yPercent:0},'show-hide-logo+=1')
;




