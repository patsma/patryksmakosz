var s01bg = document.querySelector('.s01bg'),
    s01t01 = document.querySelector('.s01t01'),
    s01t02 = document.querySelector('.s01t02'),
    s02t01 = document.querySelector('.s02t01'),
    s03t01 = document.querySelector('.s03t01'),
    s03t02 = document.querySelector('.s03t02');

var tl = gsap.timeline();

tl
    .to({}, {duration: 1})
    .fromTo(s01t01, {autoAlpha: 0, yPercent: -10}, {autoAlpha: 1, yPercent: 0, duration: 0.8})
    .fromTo(s01t02, {autoAlpha: 0, yPercent: 10}, {autoAlpha: 1, yPercent: 0, duration: 0.8})
    .to({}, {duration: 1})
    .fromTo(s03t01, {autoAlpha: 0, xPercent: -10}, {autoAlpha: 1, xPercent: 0, duration: 0.8})
    .fromTo(s03t02, {autoAlpha: 0, xPercent: 10}, {autoAlpha: 1, xPercent: 0, duration: 0.8})
    .to({}, {duration: 1});

// Expose for gsap-video-export
window.gsap = gsap;
window.tl = tl;
