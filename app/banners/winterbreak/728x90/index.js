$('#snow').snowfall({shadow : true, round : true,  minSize: 3, maxSize:6});

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

var bg0102 = $('#scene01-02-bg'),
    bg0304 = $('#scene03-04-bg'),
    s01t01 = $('#scene01-txt01'),
    s01t02 = $('#scene01-txt02'),
    s01t03 = $('#scene01-txt03'),
    s01t04 = $('#scene01-txt04'),
    s01t05 = $('#scene01-txt05'),
    s02t01 = $('#scene02-txt01'),
    s02t02 = $('#scene02-txt02'),
    s03t01 = $('#scene03-txt01'),
    s03t02 = $('#scene03-txt02'),
    s03t03 = $('#scene03-txt03'),
    s04b = $('#scene04-button'),
    s04l = $('#scene04-logo'),
    s04t = $('#scene04-tag');



var tl = new TimelineMax();

tl
.set('#snow',{autoAlpha:1})
.set(bg0304,{autoAlpha:1})
.set({}, {}, "+=1")
.fromTo(s01t01,0.8,{autoAlpha:0,y:-50},{autoAlpha:1,y:0})
.fromTo(s01t02,0.8,{autoAlpha:0,y:50},{autoAlpha:1,y:0})
.set({}, {}, "+=3")


.fromTo(bg0102,1,{x:'0%'},{x:'-100%',autoAlpha:0},'-=0.3')
.fromTo([s01t01,s01t02],1,{x:'0%'},{x:'100%',autoAlpha:0},'-=1')
.to('#snow',0.2,{zIndex:10})
.fromTo([s03t01,s03t02],1.2,{autoAlpha:0,y:100},{autoAlpha:1,y:0})

    .to(s03t01,0.8,{})
    .fromTo([s03t01,s03t02],0.3,{transform:'scale(1)'},{transform:'scale(0.65)'})


    // .fromTo([s03t01,s03t02],0.8,{},{autoAlpha:1,x:-170})
    // .fromTo(s03t01,0.8,{},{autoAlpha:1,x:-250},'lable1')

    .to([s03t01,s03t02],0.8,{x:-170})
    .to(s03t01,0.8,{x:-267},'-=0.8')
    .add('lable1')
    .to([s03t01,s03t02],0.8,{y:5},'lable1')



    .fromTo(s04l,1.2,{autoAlpha:0,y:100},{autoAlpha:1,y:0},'lable1')
    .fromTo(s04b,1.2,{autoAlpha:0,y:35},{autoAlpha:1,y:0})


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
