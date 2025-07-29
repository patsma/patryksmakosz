gsap.registerPlugin(Observer)

window.addEventListener("DOMContentLoaded", () => {

    const container = document.querySelector('.mwg_effect026 .container')
    
    const halfX = container.clientWidth / 2
    const wrapX = gsap.utils.wrap(-halfX, 0)
    const xTo = gsap.quickTo(container, 'x', {
        duration: 1.5, // Will change over 1.5s
        ease: "power4", // Non-linear
        modifiers: {
            x: gsap.utils.unitize(wrapX)
        }
    })
    
    const halfY = container.clientHeight / 2
    const wrapY = gsap.utils.wrap(-halfY, 0)
    const yTo = gsap.quickTo(container, 'y', {
        duration: 1.5, // Will change over 1.5s
        ease: "power4", // Non-linear
        modifiers: {
            y: gsap.utils.unitize(wrapY)
        }
    })

    let incrX = 0, incrY = 0;

    // Observer to handle wheel and drag events
    Observer.create({
        target: window,
        type: "wheel,touch,pointer", // Handles wheel, touch, and drag
        onChangeX: (self) => {
            if(self.event.type === "wheel")
                incrX -= self.deltaX
            else
                incrX += self.deltaX * 2

            xTo(incrX) // smoothly animate to the new x position
        },
        onChangeY: (self) => {
            if(self.event.type === "wheel")
                incrY -= self.deltaY // Update incrY based on the vertical movement
            else 
                incrY += self.deltaY * 2

            yTo(incrY) // Smoothly animate to the new y position
        }
    })

    // RANDOM ITEM POSITIONS
    // const lengthMedia = container.querySelector('.content').querySelectorAll('.media').length
    // const randomValues = []
    // for (let i = 0; i < lengthMedia; i++) {
    //     randomValues.push([
    //         (Math.random() - 0.5) * 30, 
    //         (Math.random() - 0.5) * 30
    //     ])
    // }
    // container.querySelectorAll('.content').forEach(content => {
    //     content.querySelectorAll('.media').forEach((el, index) => {
    //         gsap.set(el, {
    //             xPercent: randomValues[index][0],
    //             yPercent: randomValues[index][1]
    //         })
    //     })
    // })
})