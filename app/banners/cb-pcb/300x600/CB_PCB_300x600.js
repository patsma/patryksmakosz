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
    s01t03 = $('.s01t03'),
    s01t04 = $('.s01t04'),
    s01t05 = $('.s01t05'),
    s01t06 = $('.s01t06'),
    s01i01 = $('.s01i01'),
    s01i02 = $('.s01i02'),
    s01i03 = $('.s01i03'),
    s01i04 = $('.s01i04');
















var tl01 = new TimelineMax({});

tl01
    .add('show-mask01')
    .to("#rectangle01t01",2, {yPercent:150, transformOrigin:"50% 50%"},'show-mask01')
    .to(s01t01,1,{yPercent:-4,autoAlpha:1},'show-mask01+=.2')

    .to(s01t01,.5,{autoAlpha:0})


;



var tl02 = new TimelineMax({});

tl02


    .add('show-mask02')
    .to("#rectangle01t02",2, {yPercent:150, transformOrigin:"50% 50%"},'show-mask02')
    .to(s01t02,1,{yPercent:-4,autoAlpha:1},'show-mask02+=.2')
    .to(s01t02,.5,{autoAlpha:0})

;


var tl03 = new TimelineMax({});

tl03

    .add('show-mask03')
    .to("#rectangle01t03",2, {yPercent:150, transformOrigin:"50% 50%"},'show-mask03')
    .to(s01t03,1,{yPercent:-4,autoAlpha:1},'show-mask03+=.2')
    .to(s01t03,.5,{autoAlpha:0})
;

var tl04 = new TimelineMax({});

tl04


    .add('show-mask04')
    .to("#rectangle01t04",2, {yPercent:150, transformOrigin:"50% 50%"},'show-mask04')
    .to(s01t04,1,{yPercent:-4,autoAlpha:1},'show-mask04+=.2')
    .to(s01t04,.5,{autoAlpha:0})






;


var tl05 = new TimelineMax({});

tl05


    .add('show-mask05')
    .to("#rectangle01t05",2, {yPercent:150, transformOrigin:"50% 50%"},'show-mask05')
    .to(s01t05,1,{yPercent:-4,autoAlpha:1},'show-mask05+=.4')
    .to(s01t05,1,{autoAlpha:1},'show-mask05')
    .to(s01t06,1,{autoAlpha:1},'show-mask05')






;

var master = new TimelineMax({onUpdate:updateSlider});

master
      .add(tl01)
        .add('replace-first-text-=1.2')
        .from([s01i02],1,{x:'300px'},'replace-first-text')
        .to([s01i01],1,{x:'-300px'},'replace-first-text');

master.add(tl02,'replace-second-text-=1.2')

        .add('replace-second-text')
        .from([s01i03],1,{y:'290px'},'replace-second-text')
        .to([s01i02],1,{y:'-290px'},'replace-second-text')
        .to([s01i02],0,{y:'-290px'});

master.add(tl03,'replace-third-text-=1.2')
        .add('replace-third-text')
        .from([s01i04],1,{x:'-300px'},'replace-third-text')
        .to([s01i03],1,{x:'300px'},'replace-third-text')
        .to(s01i01,0,{x:'-300px'},'replace-third-text');

master.add(tl04,'replace-fourth-text-=1.2')
        .add('replace-fourth-text')
        .to([s01t05],0,{autoAlpha:1},'replace-fourth-text')
        .to([s01t04],0,{autoAlpha:0},'replace-fourth-text')
        .add('position-set')
        .to([s01i01],0,{y:'-290px',x:'+=300px'},'position-set')
        .to([s01i02],0,{x:'300px'},'position-set')
        .add('shrink-pictures')
        .to(s01i04,.5,{width:'150px',y:'+=145'},'shrink-pictures') // medicine photo
        .to(s01i01,.5,{width:'150px',y:'+=290'},'shrink-pictures') //farmer
        .to(s01i02,.5,{width:'150px',y:'+=290',x:'-=150'},'shrink-pictures') //dentist photo
        .to(s01i03,.5,{width:'150px',y:'+=145',x:'-=150'},'shrink-pictures'); //clothes
master.add(tl05,'-=.6');



master.staggerTo('#green > path', .5, {opacity:0}, 0.05);
master.staggerTo('#green > path', .5, {opacity:1}, 0.05,'-=1.5');



master.timeScale(1.1);




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
