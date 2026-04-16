//
//
$("#slider").slider({
    range: false,
    min: 0,
    max: 100,
    step:.1,
    slide: function ( event, ui ) {
        master.pause();

        master.progress( ui.value/100 );
    }
});

// updateSlider function
function updateSlider() {
    $("#slider").slider("value", master.progress() *100);
}
var s01bg = $('.s01bg'),
    s01t01 = $('.s01t01'),
    s01t02 = $('.s01t02'),
    s01t03 = $('.s01t03');
    s01t04 = $('.s01t04');
    s01t05 = $('.s01t05');










var tl01 = new TimelineMax({});

tl01
    .add('show-mask01')
    .to("#rectangle01t01",2, {yPercent:150, transformOrigin:"50% 50%"},'show-mask01')
    .to(s01t01,1,{yPercent:-10,autoAlpha:1},'show-mask01')
    .to(s01t01,.5,{autoAlpha:0})
;



var tl02 = new TimelineMax({});

tl02


    .add('show-mask02')
    .to("#rectangle01t02",2, {yPercent:150, transformOrigin:"50% 50%"},'show-mask02')
    .to(s01t02,1,{yPercent:-10,autoAlpha:1},'show-mask02')
    .to(s01t02,.5,{autoAlpha:0})
;


var tl03 = new TimelineMax({});

tl03

    .add('show-mask03')
    .to("#rectangle01t03",2, {yPercent:150, transformOrigin:"50% 50%"},'show-mask03')
    .to(s01t03,1,{yPercent:-10,autoAlpha:1},'show-mask03')
    .to(s01t03,.5,{autoAlpha:0})
;

var tl04 = new TimelineMax({});

tl04


    .add('show-mask04')
    .to("#rectangle01t04",2, {yPercent:150, transformOrigin:"50% 50%"},'show-mask04')
    .to(s01t04,1,{yPercent:-10,autoAlpha:1},'show-mask04')
    .to(s01t05,1,{autoAlpha:1},'show-mask04')



    //


;
var master = new TimelineMax({onUpdate:updateSlider});

master.add(tl01);
master.add(tl02,'-=.5');
master.add(tl03,'-=.5');
master.add(tl04,'-=.5');
master.staggerTo('#green > path', .5, {opacity:0}, 0.05);
master.staggerTo('#green > path', .5, {opacity:1}, 0.05,'-=1.5');









 playBtn = $("#playBtn"),
        pauseBtn = $("#pauseBtn"),
        resumeBtn = $("#resumeBtn"),
        reverseBtn = $("#reverseBtn");


 playBtn.click(function(){
     master.play();
    });
    pauseBtn.click(function(){
        master.pause();
    });
    resumeBtn.click(function(){

        master.resume();
    });
    reverseBtn.click(function(){
        master.reverse();
    });
