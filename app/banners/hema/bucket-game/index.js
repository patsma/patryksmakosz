// HEMA Catch The Gift Game - Refactored to GSAP 3
gsap.registerPlugin(MotionPathPlugin, MorphSVGPlugin, DrawSVGPlugin, CustomEase, CustomBounce, CustomWiggle);

var wrapper = document.querySelector('.wrapper'),
    clickReset = document.querySelector('.click-reset'),
    arrow = document.querySelector('#arrow'),
    mouseMovementLeft = document.querySelectorAll('#mouse-movement-left > path'),
    mouseMovementRight = document.querySelectorAll('#mouse-movement-right > path'),
    cursorGroup = document.querySelector('#cursorGroup'),
    centerText01 = document.querySelector('#center-text01'),
    centerTextWin = document.querySelector('#benieuwd_wat_Sint_voor_je_heeft_'),
    centerTextLose = document.querySelector('#lose-text'),
    replayIcon = document.querySelector('#replay-icon'),
    replayText = document.querySelector('#replay-text'),
    replayButton = document.querySelector('#replay-button'),
    replayButtonLost = document.querySelector('#replay-button-2'),
    gift = document.querySelector('#golden');

// Santa and his bag move together as the "bucket" that catches the gift
var santaOnAHorse = ['#santa', '#bag'];

MorphSVGPlugin.convertToPath("circle, rect, ellipse, line, polygon, polyline");

// GSAP 3 has no pathDataToBezier. MotionPathPlugin takes the path selector
// directly. No align here, matching the original call which used the path's
// own absolute coordinates.
var bezierStaticPresents = ".bezier-static-presents";

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

gsap.set(gift, {autoAlpha: 1, x: getRandomInt(-450, 450)});
gsap.set('#falling', {autoAlpha: 1});

// Game state
var endGame = false,
    isCatchedGift = false,
    santaX;

// Hit test bounds - the gift counts as caught inside this box around the bucket
var bucketMargin = 30,
    bucketHeight = 50,
    endGameY = 149;

var catchGift = function () {
    var giftX = Math.round(gsap.getProperty(gift, "x"));
    var giftY = Math.round(gsap.getProperty(gift, "y"));

    if (typeof santaX !== 'undefined' &&
        giftX < santaX + bucketMargin &&
        giftX > santaX - bucketMargin &&
        giftY > bucketHeight &&
        giftY < bucketHeight + 40) {
        won();
    }

    if (giftY > endGameY && !isCatchedGift) {
        lost();
    }
};

var won = function () {
    isCatchedGift = true;
    endGame = true;
    tlFallingPresents.timeScale(1).pause(0);
    tlGift.pause();

    gsap.to(santaOnAHorse, {x: 0, y: 0, duration: 1});
    gsap.to(gift, {x: -233, y: 50, duration: 1});
    gsap.to(centerTextWin, {autoAlpha: 1, duration: 1});
    gsap.to(replayButton, {autoAlpha: 1, duration: 1});
};

var lost = function () {
    endGame = true;
    tlFallingPresents.timeScale(1).pause(0);

    var tlLost = gsap.timeline();

    tlLost
        .set(gift, {y: -300})
        .to(santaOnAHorse, {x: 0, y: 0, duration: 1})
        .to(clickReset, {autoAlpha: 1, duration: 0.2})
        .add('show-retry')
        .to(centerTextLose, {autoAlpha: 1, duration: 1}, 'show-retry')
        .to(replayButtonLost, {autoAlpha: 1, duration: 1}, 'show-retry')
        .to(replayIcon, {autoAlpha: 1, duration: 1}, 'show-retry')
        .to(replayText, {autoAlpha: 1, duration: 1}, 'show-retry');
};

var tlGift = gsap.timeline({paused: true});
tlGift.fromTo(gift, {y: -300}, {y: 150, duration: 2, onUpdate: catchGift});

// Background presents drifting along a fixed path, looped forever
var tlFallingPresentsStatic = gsap.timeline({repeat: -1});
gsap.set(['#presents-looped > g:nth-child(1)', '#presents-looped > g:nth-child(2)'], {yPercent: -250});
tlFallingPresentsStatic
    .add('float-static-presents')
    .to('#presents-looped > g:nth-child(1)', {motionPath: {path: bezierStaticPresents}, duration: 10}, 'float-static-presents')
    .to('#presents-looped > g:nth-child(2)', {motionPath: {path: bezierStaticPresents}, duration: 10}, 'float-static-presents+=0.2');

// "Move your mouse" hint shown before the player takes over
var tlMoveCursor = gsap.timeline({repeat: -1});
tlMoveCursor
    .add('arrow-right')
    .to(arrow, {xPercent: 150, duration: 0.2}, 'arrow-right')
    .from(mouseMovementLeft, {xPercent: -100, autoAlpha: 0, duration: 0.2, stagger: 0.05}, 'arrow-right')
    .to(mouseMovementLeft, {autoAlpha: 0, duration: 0.2, stagger: 0.05}, '+=.1')
    .add('arrow-left')
    .to(arrow, {xPercent: -150, scale: 1, duration: 0.2}, 'arrow-left')
    .from(mouseMovementRight, {xPercent: 100, autoAlpha: 0, duration: 0.2, stagger: -0.05}, 'arrow-left')
    .to(mouseMovementRight, {autoAlpha: 0, duration: 0.2, stagger: -0.05}, '+=.1');

tlMoveCursor.timeScale(2);

var tlFallingPresents = gsap.timeline({repeat: -1});
tlFallingPresents.fromTo('#falling > *', {yPercent: -350}, {yPercent: 180, duration: 1, stagger: 0.01});
tlFallingPresents.timeScale(0.05);

wrapper.addEventListener('mouseenter', function (e) {
    e.preventDefault();

    if (!endGame) {
        tlGift.play();
        tlFallingPresents.timeScale(1).play(0);
        this.style.cursor = 'none';
    } else {
        this.style.cursor = 'default';
    }

    gsap.set([cursorGroup, centerText01], {autoAlpha: 0});
    tlMoveCursor.pause();
});

wrapper.addEventListener('mouseleave', function () {
    gsap.set(santaOnAHorse, {y: 0, x: 0});
    this.style.cursor = 'default';
});

wrapper.addEventListener('mousemove', function (e) {
    if (!endGame) {
        gsap.set(santaOnAHorse, {y: 0, x: 0, clearProps: 'transform'});
        gsap.set(santaOnAHorse, {x: parseInt(e.pageX) - 242.2});

        santaX = parseInt(e.pageX) - 484.4;
    } else {
        this.style.cursor = 'default';
    }
});

clickReset.addEventListener('click', function () {
    isCatchedGift = false;
    endGame = false;

    gsap.set(gift, {x: getRandomInt(-450, 450)});
    tlFallingPresents.timeScale(1).play(0);

    var tlReset = gsap.timeline();
    tlReset
        .add('hide-retry')
        .to(centerTextLose, {autoAlpha: 0, duration: 1}, 'hide-retry')
        .to(replayButtonLost, {autoAlpha: 0, duration: 1}, 'hide-retry')
        .to(replayIcon, {autoAlpha: 0, duration: 1}, 'hide-retry')
        .to(replayText, {autoAlpha: 0, duration: 1}, 'hide-retry')
        .set(gift, {y: -300})
        .to({}, {duration: 1})
        .to(gift, {y: 150, duration: 2, onUpdate: catchGift});
});

window.gsap = gsap;

// Read-only hook so the video recorder can drive and observe the game
window.__banner = {
    get endGame() { return endGame; },
    get isCatchedGift() { return isCatchedGift; },
    giftX: function () { return Math.round(gsap.getProperty(gift, "x")); },
    giftY: function () { return Math.round(gsap.getProperty(gift, "y")); }
};
