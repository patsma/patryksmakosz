// HEMA Santa Hat Game - Refactored to GSAP 3
gsap.registerPlugin(MotionPathPlugin, MorphSVGPlugin, DrawSVGPlugin, CustomEase, CustomBounce, CustomWiggle);

var background = document.querySelector('#background'),
    hemaLogo = document.querySelector('#hema-logo'),
    hemaLogoBackground = document.querySelector('#hema-logo-background'),
    hemaLogoLetters = document.querySelectorAll('#hema-logo-text > path'),
    santa = document.querySelector('#santa'),
    floatingCircles01 = document.querySelectorAll('#floating-circles01 > path'),
    floatingCircles02 = document.querySelectorAll('#floating-circles02 > path'),
    floatingCircles03 = document.querySelectorAll('#floating-circles03 > path'),
    floatingCircles04 = document.querySelectorAll('#floating-circles04 > path'),
    floatingLetterY = document.querySelector('#floating-letter-y'),
    floatingLetterX = document.querySelector('#floating-letter-x'),
    eyes = document.querySelector('#eyes'),
    centerText01 = document.querySelector('#center-text01'),
    hatWind = document.querySelectorAll('#hat-wind > path'),
    mouseMovementLeft = document.querySelectorAll('#mouse-movement-left > path'),
    arrow = document.querySelector('#arrow'),
    mouseMovementRight = document.querySelectorAll('#mouse-movement-right > path'),
    leftHand = document.querySelector('#left-hand'),
    rightHand = document.querySelector('#right-hand'),
    sintVan = document.querySelectorAll('#shot1 > image'),
    hat = document.querySelector('#hat-floating'),
    cursorGroup = document.querySelector('#cursorGroup'),
    present = document.querySelector('#present'),
    centerText05 = document.querySelector('#centerText05'),
    floatingLetterN = document.querySelector('#floating-letter-n'),
    centerText04 = document.querySelector('#centerText04'),
    replayIcon = document.querySelector('#replay-icon'),
    replayText = document.querySelector('#replay-text'),
    replayButton = document.querySelector('#replay-button'),
    rightHandBig = document.querySelector('#right-hand-big'),
    floatingLetterC = document.querySelector('#floating-letter-c'),
    bigHatMovementTop = document.querySelector('#big-hat-movement-top'),
    bigHatMovementBottom = document.querySelector('#big-hat-movement-bottom > path:nth-child(2)'),
    bigHatBezier = document.querySelector('#big-hat-bezier'),
    bigHandBezier = document.querySelector('#big-hand-bezier'),
    bigHatFloating = document.querySelector('#big-hat-floating'),
    bigRightHand = document.querySelector('#big-right-hand'),
    hatPositionX, hatPositionY;

MorphSVGPlugin.convertToPath("circle, rect, ellipse, line, polygon, polyline");

var setTl = gsap.timeline();
setTl
    .set('#shot1', {autoAlpha: 1})
    .set(sintVan, {y: -5})
    .set(hemaLogo, {y: -20});

// GSAP 3 has no pathDataToBezier. MotionPathPlugin takes the path selector
// directly, and align:"self" reproduces what GSAP 2's align:"relative" did -
// the path is shifted so it starts wherever the element already sits.
var bezier01 = {path: "#bezier01", align: "self", offsetX: 150};
var bezier02 = {path: "#bezier02", align: "self"};
var bezier03 = {path: "#bezier03", align: "self", offsetX: -150, offsetY: 20};
var bezier04 = {path: "#bezier04", align: "self", offsetY: 30};
var bezierHat = {path: "#bezierHat > path", align: "self"};
var bezierBigHat = {path: "#big-hat-bezier", align: "self"};
var bezierBigHand = {path: "#big-hand-bezier", align: "self"};


function moveFloatingCircles() {
    var tl = gsap.timeline({repeat: -1});

    tl
        .add('wind01')
        .from(floatingCircles01, {autoAlpha: 1, yPercent: (i) => [-100, 10, -20, 20, -80][i % 5], yoyo: true, repeat: 1, motionPath: bezier01, duration: 3, stagger: 0.2}, 'wind01')
        .from(floatingCircles02, {autoAlpha: 1, yPercent: (i) => [-100, 10, -20, 20, -80][i % 5], yoyo: true, repeat: 1, motionPath: bezier02, duration: 3, stagger: 0.2}, 'wind01')
        .from(floatingLetterY, {autoAlpha: 0, yoyo: true, repeat: 1, motionPath: bezier03, duration: 3}, 'wind01')
        .add('wind02', '-=0.8')
        .from(floatingCircles03, {autoAlpha: 1, yPercent: (i) => [-100, 10, -20, 20, -80][i % 5], yoyo: true, repeat: 1, motionPath: bezier03, duration: 3, stagger: 0.2}, 'wind02')
        .from(floatingCircles04, {autoAlpha: 1, yPercent: (i) => [-100, 10, -20, 20, -80][i % 5], yoyo: true, repeat: 1, motionPath: bezier04, duration: 3, stagger: 0.2}, 'wind02')
        .from(floatingLetterX, {autoAlpha: 0, yoyo: true, repeat: 1, motionPath: bezier01, duration: 3}, 'wind02');

    return tl;
}

function moveCursor() {
    var tl = gsap.timeline({repeat: -1});

    tl
        .add('arrow-right')
        .to(arrow, {xPercent: 150, duration: 0.2}, 'arrow-right')
        .from(mouseMovementLeft, {xPercent: -100, autoAlpha: 0, duration: 0.2, stagger: 0.05}, 'arrow-right')
        .to(mouseMovementLeft, {autoAlpha: 0, duration: 0.2, stagger: 0.05}, '-=.2')
        .add('arrow-left')
        .to(arrow, {xPercent: -150, scale: 1, duration: 0.2}, 'arrow-left')
        .from(mouseMovementRight, {xPercent: 100, autoAlpha: 0, duration: 0.2, stagger: -0.05}, 'arrow-left')
        .to(mouseMovementRight, {autoAlpha: 0, duration: 0.2, stagger: -0.05}, '-=.2');

    tl.timeScale(0.7);
    return tl;
}

function blewHatOff() {
    var tl = gsap.timeline({id: "blewHatOff"});

    tl
        .add('had-blew-out')
        .to(hat, {
            repeat: -1,
            yoyo: true,
            xPercent: 10,
            motionPath: {path: bezierHat.path, align: bezierHat.align, autoRotate: true},
            ease: 'none',
            onUpdate: updateHatPosition,
            duration: 30
        }, 'had-blew-out')
        .from(hatWind, {autoAlpha: 0, xPercent: -10, drawSVG: 0, duration: 0.5}, 'had-blew-out')
        .to(hatWind, {xPercent: 10, autoAlpha: 0, duration: 0.5}, 'had-blew-out+=.2');

    return tl;
}

function updateHatPosition() {
    if (this.targets && this.targets()) {
        var target = this.targets()[0];
        if (target) {
            hatPositionX = Math.round(gsap.getProperty(target, "x"));
            hatPositionY = Math.round(gsap.getProperty(target, "y"));
        }
    }
}

function moveHandsAndBlink() {
    var tl = gsap.timeline({yoyo: true, repeat: -1, id: "moveHandsAndBlink"});
    tl
        .to(eyes, {autoAlpha: 0, ease: "steps(1)", duration: 0.2})
        .to(eyes, {autoAlpha: 1, ease: "steps(1)", duration: 0.2})
        .to(leftHand, {rotation: 5, transformOrigin: 'right center', duration: 1})
        .to(rightHand, {rotation: 5, transformOrigin: 'left center', duration: 1}, '-=0.5');

    return tl;
}

function showLogos() {
    var tl = gsap.timeline();
    tl
        .add('show-logos')
        .from('#hema-logo-background', {autoAlpha: 0, duration: 1}, 'show-logos')
        .from(hemaLogoLetters, {autoAlpha: 0, duration: 1, stagger: 0.1}, 'show-logos+=.2')
        .from(sintVan, {autoAlpha: 0, duration: 1}, 'show-logos+=.3');
    return tl;
}

function showCenterText01() {
    var tl = gsap.timeline();
    tl.from(centerText01, {autoAlpha: 0, duration: 1});
    return tl;
}

function hideSantaTextAndMouseMovement(opacity, position) {
    var tl = gsap.timeline();
    tl.to(santa, {autoAlpha: opacity, yPercent: position, duration: 0.2});
    return tl;
}

var masterScene01 = gsap.timeline();
masterScene01
    .add(moveFloatingCircles())
    .add(moveHandsAndBlink(), 1)
    .from(cursorGroup, {autoAlpha: 0, duration: 1}, 0);

var cursorMoveScene = gsap.timeline();
cursorMoveScene.add(moveCursor());

var hatMoveScene = gsap.timeline();
hatMoveScene
    .add(blewHatOff(), 0)
    .add('show-logo-text-after-hat-blew-off');

var maxY = -45;
var minY = 150;
var maxX = 690;
var minX = -100;

var running, timeout, isWon, gameTimeOut, endGame;

document.querySelector('.wrapper').addEventListener('mouseenter', function (e) {
    this.style.cursor = 'none';
    e.preventDefault();
    cursorMoveScene.pause();

    if (!endGame) {
        hideSantaTextAndMouseMovement(0, 100);
        gsap.to([mouseMovementLeft, mouseMovementRight], {autoAlpha: 0, duration: 0.2});
        gsap.to(hat, {scale: 1.7, transformOrigin: 'center center', duration: 0.2});
        gsap.to('#center-text01 > path', {autoAlpha: 0, duration: 0.2});
    }
});

document.querySelector('.wrapper').addEventListener('mouseleave', function () {
    gsap.set(arrow, {y: 0, x: 0});
    this.style.cursor = 'default';
});

document.querySelector('.wrapper').addEventListener('mousemove', function (e) {
    gsap.set(arrow, {y: 0, x: 0, clearProps: 'transform'});
    gsap.set(arrow, {
        y: parseInt(e.pageY) - 75,
        x: parseInt(e.pageX) - 442.6,
        onUpdate: function () {
            var target = this.targets()[0];
            var cursorPositionX = (Math.round(gsap.getProperty(target, "x")) + 238);
            var cursorPositionY = (Math.round(gsap.getProperty(target, "y")) + 25);

            if (checkPositionX(cursorPositionX, hatPositionX)
                && checkPositionY(cursorPositionY, hatPositionY)
                && !endGame) {

                if (cursorPositionX < hatPositionX) {
                    if (!running) {
                        gsap.to(hat, {x: cursorPositionX + 150, ease: 'none', duration: 0.15});
                    } else won();
                }

                if (cursorPositionX > hatPositionX) {
                    if (!running) {
                        gsap.to(hat, {x: cursorPositionX - 150, ease: 'none', duration: 0.15});
                    } else won();
                }

                if (cursorPositionY > hatPositionY) {
                    if (!running) {
                        gsap.to(hat, {y: cursorPositionY - 150, ease: 'none', duration: 0.15});
                    } else won();
                }

                if (cursorPositionY < hatPositionY) {
                    if (!running) {
                        gsap.to(hat, {y: cursorPositionY + 150, ease: 'none', duration: 0.15});
                    } else won();
                }

                if (!timeout) {
                    timeout = true;
                    setTimeout(function () {
                        running = true;
                    }, 750);
                }
            }

            if (!gameTimeOut && timeout) {
                gameTimeOut = true;
                setTimeout(function () {
                    endGame = true;
                    if (!isWon) {
                        lost();
                    }
                }, 1000);
            }
        }
    });
});

var hitBoxSize = 60;

var checkPositionX = function (c, h) {
    return c === h || (c > (h - hitBoxSize) && c <= h) || (c < (h + hitBoxSize) && c >= h);
};

var checkPositionY = function (c, h) {
    return c === h || (c > (h - hitBoxSize) && c <= h) || (c < (h + hitBoxSize) && c >= h);
};

var lost = function () {
    hatMoveScene.kill();
    var t2 = gsap.timeline();

    t2
        .set([bigHatFloating, bigRightHand], {autoAlpha: 1})
        .to(hat, {x: '+=970', y: -10, scale: 1.7, rotation: 0, transformOrigin: 'center center', duration: 1})
        .add('show-big-hat-movement', '-=1')
        .from(bigHatFloating, {motionPath: bezierBigHat, duration: 1}, 'show-big-hat-movement')
        .from(bigRightHand, {motionPath: bezierBigHand, duration: 1}, '-=0.9')
        .add('hide-hat-and-hand', '-=0.3')
        .to([bigHatFloating, bigRightHand], {yPercent: 50, motionPath: bezierBigHand, duration: 1}, 'hide-hat-and-hand')
        .set(hat, {x: 70, y: -10, autoAlpha: 0, scale: 0, transformOrigin: 'bottom bottom'})
        .add('show-santa-with-hat-lose')
        .to([centerText04, replayIcon, replayButton, replayText], {autoAlpha: 1, duration: 1, stagger: 0.1}, 'show-santa-with-hat-lose')
        .to(hat, {xPercent: 12, yPercent: -2, autoAlpha: 1, scale: 1.7, duration: 1}, 'show-santa-with-hat-lose+=0.2')
        .to(santa, {autoAlpha: 1, yPercent: -10, scale: 1.7, transformOrigin: 'left top', duration: 1}, 'show-santa-with-hat-lose-=0.5')
        .to(rightHand,{xPercent: -2, rotation: -10, scaleX: 1.4, transformOrigin: 'left top', repeat: -1, yoyo: true, duration: 2})
        .to(replayIcon, {rotation: 360, transformOrigin: 'center center', repeat: -1, yoyo: true, duration: 2});
};

var won = function () {
    isWon = true;
    hatMoveScene.kill();
    gsap.to(hat, {x: 73, y: -10, duration: 1});
    var tl = gsap.timeline();
    tl.add('show-text-santa-hat-on-place')
        .to(hat, {x: 73, y: -10, scale: 1.7, rotation: 0, transformOrigin: 'center center', duration: 1}, 'show-text-santa-hat-on-place')
        .to(centerText05, {autoAlpha: 1, duration: 1}, 'show-text-santa-hat-on-place')
        .to(replayButton, {autoAlpha: 1, yPercent: 65, duration: 1}, 'show-text-santa-hat-on-place')
        .to(santa, {autoAlpha: 1, yPercent: -10, scale: 1.7, transformOrigin: 'left top', duration: 1}, 'show-text-santa-hat-on-place')
        .to(present, {autoAlpha: 1, transformOrigin: 'center center', duration: 1}, 'show-text-santa-hat-on-place');
};

window.gsap = gsap;
