$('#snow').snowfall({shadow: true, round: true, minSize: 3, maxSize: 6});

var bg0102 = document.querySelector('#scene01-02-bg'),
    bg0304 = document.querySelector('#scene03-04-bg'),
    s01t01 = document.querySelector('#scene01-txt01'),
    s02t01 = document.querySelector('#scene02-txt01'),
    s03t01 = document.querySelector('#scene03-txt01'),
    s03t02 = document.querySelector('#scene03-txt02'),
    s04b = document.querySelector('#scene04-button'),
    s04l = document.querySelector('#scene04-logo'),
    s04t = document.querySelector('#scene04-tag');

var tl = gsap.timeline();

tl
    .set('#snow', {autoAlpha: 1})
    .set(bg0304, {autoAlpha: 1})
    .fromTo(s01t01, {autoAlpha: 0, y: -50}, {autoAlpha: 1, y: 0, duration: 0.8})
    .fromTo(s02t01, {autoAlpha: 0, y: 50}, {autoAlpha: 1, y: 0, duration: 0.8})
    .to(s01t01, {autoAlpha: 1, duration: 1.4})
    .fromTo([bg0102, s02t01, s01t01], {y: '0%'}, {y: '-100%', autoAlpha: 0, duration: 1}, '-=0.3')
    .to('#snow', {zIndex: 10, duration: 0.2})
    .fromTo([s03t01, s03t02], {autoAlpha: 0, y: 100}, {autoAlpha: 1, y: 0, duration: 1.2})
    .to(s03t02, {autoAlpha: 1, duration: 1.5})
    .to([s03t01, s03t02], {autoAlpha: 0, y: -100, duration: 0.6})
    .fromTo(s04l, {autoAlpha: 0, y: 100}, {autoAlpha: 1, y: 0, duration: 1.2})
    .fromTo(s04t, {autoAlpha: 0, y: 100}, {autoAlpha: 1, y: 0, duration: 1.2})
    .fromTo(s04b, {autoAlpha: 0, y: 35}, {autoAlpha: 1, y: 0, duration: 1.2});

window.gsap = gsap;
window.tl = tl;
