var s01bg = document.querySelector('.s01bg'),
    s01t01 = document.querySelector('.s01t01'),
    s01t02 = document.querySelector('.s01t02'),
    s02t00 = document.querySelector('.s02t00'),
    s02t01 = document.querySelector('.s02t01'),
    s02t02 = document.querySelector('.s02t02');

var vid = document.querySelector('.s02t03');

var tl = gsap.timeline();

tl
    .fromTo(s01t01, {autoAlpha: 1, xPercent: -100}, {xPercent: 0, autoAlpha: 1, duration: 0.5})
    .to({}, {duration: 2})
    .add('hideFirstTextShowSecond')
    .to(s01t01, {xPercent: 100, duration: 0.5}, 'hideFirstTextShowSecond')
    .fromTo(s01t02, {autoAlpha: 1, xPercent: -100}, {xPercent: 0, autoAlpha: 1, duration: 0.5}, 'hideFirstTextShowSecond')
    .to({}, {duration: 2})
    .add(function() { if (vid) vid.play(); }, '-=0.3')
    .add('hideSecondTextShowThird')
    .to(s01t02, {autoAlpha: 0, duration: 0.5}, 'hideSecondTextShowThird')
    .fromTo(s02t00, {autoAlpha: 0}, {autoAlpha: 1, duration: 0.5}, 'hideSecondTextShowThird')
    .fromTo(s02t01, {autoAlpha: 0}, {autoAlpha: 1, duration: 0.5}, 'hideSecondTextShowThird')
    .to({}, {duration: 2})
    .fromTo(s02t02, {autoAlpha: 0, yPercent: 5}, {autoAlpha: 1, yPercent: 0, duration: 0.5});

window.gsap = gsap;
window.tl = tl;
