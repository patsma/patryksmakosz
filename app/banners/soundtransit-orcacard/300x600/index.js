var s01bg = document.querySelector('.s01bg'),
    s01t01 = document.querySelector('.s01t01'),
    s01t02 = document.querySelector('.s01t02'),
    s02t00 = document.querySelector('.s02t00'),
    s02t01 = document.querySelector('.s02t01'),
    s02t02 = document.querySelector('.s02t02'),
    s02t03 = document.querySelector('.s02t03');

var tl = gsap.timeline();

tl
    .set(s02t03, {autoAlpha: 1})
    .fromTo(s01t01, {autoAlpha: 1, xPercent: -100}, {xPercent: 0, autoAlpha: 1, duration: 0.5})
    .to({}, {duration: 2})
    .add('hideFirstTextShowSecond')
    .to(s01t01, {xPercent: 100, duration: 0.5}, 'hideFirstTextShowSecond')
    .fromTo(s01t02, {autoAlpha: 1, xPercent: -100}, {xPercent: 0, autoAlpha: 1, duration: 0.5}, 'hideFirstTextShowSecond')
    .fromTo(s02t03, {transformOrigin: "center center", scale: 0}, {transformOrigin: "center center", scale: 1, duration: 0.5}, 'hideFirstTextShowSecond')
    .to({}, {duration: 1})
    .add('hideSecondTextShowThird')
    .fromTo(s02t00, {autoAlpha: 0}, {autoAlpha: 1, duration: 0.5}, 'hideSecondTextShowThird')
    .fromTo(s02t01, {autoAlpha: 0}, {autoAlpha: 1, duration: 0.5}, 'hideSecondTextShowThird');

window.gsap = gsap;
window.tl = tl;
