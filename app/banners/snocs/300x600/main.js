//
//

var s01bg = $('.s01bg'),
    s01bg02 = $('.s01bg02'),
    s02bgBlueBackground = $('.s02bgBlueBackground'),
    s01t01StaticText = $('.s01t01StaticText'),
    s01t02ToyotaRunner = $('.s01t02ToyotaRunner'),
    s01t03Car = $('.s01t03Car'),
    s01t04Caption = $('.s01t04Caption'),
    s02t01Gear = $('.s02t01Gear'),
    s02t02SweatGear = $('.s02t02SweatGear'),
    s03t01Cash = $('.s03t01Cash'),
    s03t02ColdCash = $('.s03t02ColdCash')
;










var tl = new TimelineMax({repeat:-1,repeatDelay:1});

tl
    .to('',1,{})
    .set([s02t01Gear,s02t02SweatGear,s03t01Cash,s03t02ColdCash],{autoAlpha:1,xPercent:100,zIndex:11})
    .set(s01t03Car,{autoAlpha:1,xPercent:-100})

    .to([s01bg02],1,{xPercent:-100})
    //CAR IN
    .to(s01t03Car,1,{xPercent:-10})
    .to('',2,{})
    .add('car-out-copy-out')
    //CAR OUT

    // COPY OUT
    .to(s01t02ToyotaRunner,0,{autoAlpha:0},'car-out-copy-out')
    //COPY IN
    .add('copy-in-gear-in')
    .to(s02t02SweatGear,0,{xPercent:0},'copy-in-gear-in')
    //GEAR IN

    .to('',2.5,{})
    //GEAR OUT
    .add('gear-out-copy-out')

    // COPY OUT
    .to(s02t02SweatGear,0,{autoAlpha:0},'gear-out-copy-out')
    .add('gear-out-copy-out')
    //CASH IN
    .to('',2,{})
    //COPY IN
    .to(s03t02ColdCash,0,{xPercent:0},'gear-out-copy-out')
    //BACKGROUND BACK
    .to('',1,{})
    .add('back-to-start')
    .to([s03t01Cash,s03t02ColdCash],1,{xPercent:100},'back-to-start')
    .to([s01bg02],1,{xPercent:0},'back-to-start')






;








