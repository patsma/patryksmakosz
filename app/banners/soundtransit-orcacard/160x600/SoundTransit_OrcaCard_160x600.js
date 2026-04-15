//
//
$("#slider").slider({
  range: false,
  min: 0,
  max: 100,
  step:.1,
  slide: function ( event, ui ) {
    tl.pause();

    tl.progress( ui.value/100 );
    }
});

// updateSlider function
function updateSlider() {
  $("#slider").slider("value", tl.progress() *100);
}


var s01bg = $('.s01bg'),

    s01t01 = $('.s01t01'),
    s01t02 = $('.s01t02'),
    s02t00 = $('.s02t00'),
    s02t01 = $('.s02t01'),
    s02t02 = $('.s02t02'),
    s02t03 = $('.s02t03')
    ;

var vid = document.getElementsByClassName("s02t03");









var tl = new TimelineMax({onUpdate:updateSlider});

tl
// .to('',2.5,{})
    .set(s02t03,{autoAlpha:1})
    .fromTo(s01t01,0.5,{autoAlpha:1,xPercent:-100},{xPercent:0,autoAlpha:1})
    .to('',2,{})

    .add('hideFirstTextShowSecond')
    .to(s01t01,0.5,{xPercent:100},'hideFirstTextShowSecond')
    .fromTo(s01t02,0.5,{autoAlpha:1,xPercent:-100},{xPercent:0,autoAlpha:1},'hideFirstTextShowSecond')
    .fromTo(s02t03,0.5,{transformOrigin:"center center",scale:0},{transformOrigin:"center center",scale:1},'hideFirstTextShowSecond')
    .to('',1,{})





    .add('hideSecondTextShowThird')

    .fromTo(s02t00,0.5,{autoAlpha:0},{autoAlpha:1},'hideSecondTextShowThird')
    .fromTo(s02t01 ,0.5,{autoAlpha:0},{autoAlpha:1},'hideSecondTextShowThird')


    //LOGO SWAP


    // .add('2')
    // .to(s02t00,0.5,{xPercent:100},'2')
    // .fromTo(s01t01,0.5,{autoAlpha:1,xPercent:-100},{xPercent:0,autoAlpha:1},'2')
    // .to('',1.5,{})
    //
    // .add('3')
    // .to(s01t01,0.5,{xPercent:100},'3')
    // .fromTo(s01t02,0.5,{autoAlpha:1,xPercent:-100},{xPercent:0,autoAlpha:1},'3')
    //
    // .to('',1.5,{})
    // .add('4')
    // .to(s01t02,0.5,{xPercent:100},'4')
    // .fromTo(s02t00,0.5,{autoAlpha:1,xPercent:-100},{xPercent:0,autoAlpha:1},'4')
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




