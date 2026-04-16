//
//
// $("#slider").slider({
//   range: false,
//   min: 0,
//   max: 100,
//   step:.1,
//   slide: function ( event, ui ) {
//     tl.pause();
//
//     tl.progress( ui.value/100 );
//     }
// });
//
// // updateSlider function
// function updateSlider() {
//   $("#slider").slider("value", tl.progress() *100);
// }


var s01bg = $('.s01bg'),
    s02bg = $('.s02bg'),
    s04bg = $('.s04bg'),
    s01t01 = $('.s01t01'),
    s02t00 = $('.s02t00'),
    s02t01 = $('.s02t01'),
    s02t02 = $('.s02t02'),
    s02t03 = $('.s02t03'),
    s02t04 = $('.s02t04'),
    s03t01 = $('.s03t01'),
    s03t02 = $('.s03t02'),
    s03t03 = $('.s03t03'),
    s04t01 = $('.s04t01'),
    s04t02 = $('.s04t02'),
    s04t03 = $('.s04t03'),
    s04t04 = $('.s04t04');




var tl = new TimelineMax();

tl
.to('',2.5,{})
.add('first')
.to([s01bg,s01t01],1,{xPercent: '-100'},'first')
.fromTo([s02bg,s02t00,s02t02],1,{xPercent: '100',autoAlpha:1},{autoAlpha:1,xPercent: '0'},'first')
.to('',1,{})
.set(s02t02,{autoAlpha:0})
.set(s02t01,{autoAlpha:1})
.to('',1,{})
.set(s02t01,{autoAlpha:0})
.set(s02t03,{autoAlpha:1})
.to('',1,{})
.add('second')
.to([,s02t00,s02t03],1,{xPercent: '-100'},'second')
.fromTo(s02t04,1,{xPercent: '100',autoAlpha:1},{autoAlpha:1,xPercent: '0'},'second')
.to('',1,{})
.add('third')
.to(s02t04,0.5,{xPercent:'-100'},'third')
.fromTo(s03t02,0.5,{xPercent: '100',autoAlpha:1},{autoAlpha:1,xPercent: '0'},'third')
.to('',0.5,{})
.fromTo(s03t03,0.5,{yPercent: '100',autoAlpha:1},{autoAlpha:1,yPercent: '0'})
.to('',1,{})
.add('fourth')
.to([s02bg,s03t03,s02t04,s03t02],1,{xPercent: '-100'},'fourth')
.fromTo([s04bg,s04t01,s04t02,s04t03],1,{xPercent: '100',autoAlpha:1},{autoAlpha:1,xPercent: '0'},'fourth')
    .fromTo(s04t04,0.5,{yPercent: '50',autoAlpha:0},{autoAlpha:1,yPercent: '0',ease: Back.easeOut})
;

 //
 // playBtn = $("#playBtn"),
 //        pauseBtn = $("#pauseBtn"),
 //        resumeBtn = $("#resumeBtn"),
 //        reverseBtn = $("#reverseBtn");
 //
 //
 // playBtn.click(function(){
 //        tl.play();
 //    });
 //    pauseBtn.click(function(){
 //        tl.pause();
 //    });
 //    resumeBtn.click(function(){
 //
 //        tl.resume();
 //    });
 //    reverseBtn.click(function(){
 //        tl.reverse();
 //    });
