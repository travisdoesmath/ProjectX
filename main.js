let svgns = "http://www.w3.org/2000/svg"
let minX, minY, maxX, maxY



sqWidth = 20;

let svg = document.getElementById('pattern')
let svgHeight = svg.clientHeight
let svgWidth = svg.clientWidth

let patternLayer = document.createElementNS(svgns,'g')
patternLayer.setAttribute('id', 'patternLayer')
patternLayer.setAttribute('transform', 'matrix(1 0 0 1 0 0)')
let mousedown = false
let mousemoved = false
let mousedownPosition = []
svg.addEventListener("mousedown", event => {
    mousedown = true; 
    mousemoved = false;
    mousedownPosition = [event.pageX, event.pageY]
})
svg.addEventListener("mouseup", () => {mousedown = false;})
svg.addEventListener("mouseleave", () => {mousedown = false})
let previousTouch;
let previousTwoTouch;
let scaling = false;
let selected;
svg.addEventListener('touchstart', function(event) {
    if (event.touches.length == 2) {
        scaling = true;
        event.preventDefault();
        console.log(event.touches);
    }
})
svg.addEventListener('touchmove', function(event) {
    event.preventDefault;
    if (event.touches.length == 1) {
        const touch = event.touches[0];

        if (previousTouch) {
            event.movementX = touch.pageX - previousTouch.pageX;
            event.movementY = touch.pageY - previousTouch.pageY
            let transform = patternLayer.transform.baseVal.getItem(0).matrix
            let currentScale = transform.a
            let currentTranslateX = transform.e
            let currentTranslateY = transform.f
            updateLabels(currentScale, currentTranslateX + event.movementX, currentTranslateY + event.movementY);
            patternLayer.setAttribute('transform', `matrix(${currentScale} 0 0 ${currentScale} ${currentTranslateX + event.movementX} ${currentTranslateY + event.movementY})`)
        }

        previousTouch = touch;
    } else if (event.touches.length == 2 && scaling) {
        if (previousTwoTouch) {
            let transform = patternLayer.transform.baseVal.getItem(0).matrix
            let a = transform.a
            let e = transform.e
            let f = transform.f
            let newScale = Math.hypot(event.touches[0].pageX - event.touches[1].pageX, event.touches[0].pageY - event.touches[1].pageY) / 
                        Math.hypot(previousTwoTouch[0].pageX - previousTwoTouch[1].pageX, previousTwoTouch[0].pageY - previousTwoTouch[1].pageY)
            let centerX = 0.5*(event.touches[0].pageX + event.touches[1].pageX)
            let centerY = 0.5*(event.touches[0].pageY + event.touches[1].pageY)
            let e_new = centerX - newScale * (centerX - e)
            let f_new = centerY - newScale * (centerY - f)
            updateLabels(newScale * a, e_new, f_new);
            patternLayer.setAttribute('transform', `matrix(${newScale * a} 0 0 ${newScale * a} ${e_new} ${f_new})`)
        }

        previousTwoTouch = event.touches;

    }
})
svg.addEventListener('touchend', () => {previousTouch = null; previousTwoTouch = null})
svg.addEventListener("mousemove", function(event) {
    mousemoved = true
    if (mousedown) {
        let transform = patternLayer.transform.baseVal.getItem(0).matrix
        let currentScale = transform.a
        let currentTranslateX = transform.e
        let currentTranslateY = transform.f
        updateLabels(currentScale, currentTranslateX + event.movementX, currentTranslateY + event.movementY)
        patternLayer.setAttribute('transform', `matrix(${currentScale} 0 0 ${currentScale} ${currentTranslateX + event.movementX} ${currentTranslateY + event.movementY})`)
    }
})

function updateLabels(scale, x, y) {
    document.querySelectorAll('.xlabel').forEach(label => {
        label.style.transform = `translate(${0}px, ${Math.max(0, -y/scale)}px)`
    })
    document.querySelectorAll('.ylabel').forEach(label => {
        label.style.transform = `translate(${Math.min(9/8*svgWidth - 20, (svgWidth-x)/scale - 20)}px, 0px)`
    })
}

let scale = 1
svg.addEventListener("wheel", function(event) {
    console.log(event);
    event.preventDefault();

    scale *= 2**(-event.deltaY/500);

    scale = Math.min(Math.max(0.125, scale), 4);

    let transform = patternLayer.transform.baseVal.getItem(0).matrix
    let a = transform.a
    let e = transform.e
    let f = transform.f
    let e_new = event.pageX - (scale/a) * (event.pageX - e)
    let f_new = event.pageY - (scale/a) * (event.pageY - f)
    patternLayer.setAttribute('transform', `matrix(${scale} 0 0 ${scale} ${e_new} ${f_new})`)
    updateLabels(scale, e_new, f_new)

})
svg.appendChild(patternLayer)
let overlay = document.getElementById('overlay')
let legend = document.getElementById('legend');
let legendElements = document.getElementById('legend-elements');


let flossCodes = {
    703: {color: '#66A647', symbol: '\u2229' },
    702: {color: '#138D46', symbol: '/' },
    700: {color: '#007443', symbol: '+' },
    973: {color: '#FFC617', symbol: '>' },
    743: {color: '#FBAD31', symbol: '\u2a2f' },
    445: {color: '#EDE66A', symbol: 'S' },
    562: {color: '#1E8061', symbol: 'H' },
    561: {color: '#386654', symbol: 'Z' },
    15: {color: '#C0DC94', symbol: '-' },
    352: {color: '#F26E66', symbol: '\u2192' },
    606: {color: '#EE282B', symbol: '\u222a' },
    608: {color: '#EF472A', symbol: '|' },
    351: {color: '#EC404E', symbol: '<' },
    761: {color: '#F69FA5', symbol: '\ua7ae' },
    Blanc: {color: '#FDFDFD', symbol: '\u25cb' },
    321: {color: '#BF2148', symbol: '\u2191' },
    563: {color: '#67B68E', symbol: '\\' }
}

let flossCounts = {}

function updateLegend(flossCounts, pattern) {
    legendElements.innerHTML = ""
    flossLegendOrder = Object.keys(flossCounts).sort((a, b) => flossCounts[b] - flossCounts[a])

    flossLegendOrder.forEach((l, i) => {
        let element = document.createElement('li')
        element.innerHTML = `<a class="dropdown-item" href="#" style="color: ${hexDarker(flossCodes[l].color)}">${l} ${flossCodes[l].symbol}</a>`
        element.style.backgroundColor = flossCodes[l].color
        if (selected && l != selected) {
                element.style.opacity = 0.25
        }
        // element.style.color = hexDarker(flossCodes[l].color)

        element.addEventListener('click', function() {
            console.log(this)
            if (!selected) {
                selected = l
                let minX = pattern.filter(x => x.color.code == l).map(x => x.x).reduce((a, b) => a < b ? a : b)
                let maxX = pattern.filter(x => x.color.code == l).map(x => x.x).reduce((a, b) => a > b ? a : b)
                let minY = pattern.filter(x => x.color.code == l).map(x => x.y).reduce((a, b) => a < b ? a : b)
                let maxY = pattern.filter(x => x.color.code == l).map(x => x.y).reduce((a, b) => a > b ? a : b)
                zoom(minX, maxX, minY, maxY)
                els = document.getElementsByClassName('cell')
                for (let j = 0; j < els.length; j++) {
                    el = els[j]
                    if (![...el.classList].includes(`floss${l}`)) {
                        el.style.opacity = 0.25
                    }
                }

                els = document.getElementsByClassName('legendItem')
                for (let j = 0; j < els.length; j++) {
                    el = els[j]
                    if (![...el.classList].includes(`floss${l}`)) {
                        el.style.opacity = 0.25
                    }
                }

            } else {
                selected = null
                els = document.getElementsByClassName('cell')
                for (let j = 0; j < els.length; j++) {
                    els[j].style.opacity = 1
                }
                els = document.getElementsByClassName('legendItem')
                for (let j = 0; j < els.length; j++) {
                    els[j].style.opacity = 1
                }
            }
            updateLegend(flossCounts, pattern);
        })
        legendElements.append(element);
    })

    

    console.log(legend)

//                  <li><a class="dropdown-item" href="#">Action</a></li>


    


    //legend.
}

function createLegend_OLD(flossCounts) {
    

    


    console.log(flossCounts)
    flossLegendOrder = Object.keys(flossCounts).sort((a, b) => flossCounts[b] - flossCounts[a])

    let nLegendItems = Object.keys(flossCounts).length
    let legendItemHeight = window.innerHeight / nLegendItems - 10
    legend.style.width = `${2*legendItemHeight + 20}px`;

    flossLegendOrder.forEach((l, i) => {
        let element = document.createElement('div');
        element.className = `legendItem floss${l}`;
        element.style.backgroundColor = flossCodes[l].color
        element.style.color = hexDarker(flossCodes[l].color)
        element.style.left = `10px`;
        // element.style.top = `${5 + i*(legendItemHeight+10)}px`;
        element.style.height = `${legendItemHeight}px`;
        element.style.width = `${2*legendItemHeight}px`;
        element.style.fontSize = `${0.4*legendItemHeight}px`;
        element.innerText = `${l} ${flossCodes[l].symbol}`
        element.addEventListener('click', function(event) {
            event.stopPropagation()
            console.log(this)
            if (!selected) {
                selected = l
                let minX = pattern.filter(x => x.color.code == l).map(x => x.x).reduce((a, b) => a < b ? a : b)
                let maxX = pattern.filter(x => x.color.code == l).map(x => x.x).reduce((a, b) => a > b ? a : b)
                let minY = pattern.filter(x => x.color.code == l).map(x => x.y).reduce((a, b) => a < b ? a : b)
                let maxY = pattern.filter(x => x.color.code == l).map(x => x.y).reduce((a, b) => a > b ? a : b)
                zoom(minX, maxX, minY, maxY)
                els = document.getElementsByClassName('cell')
                for (let j = 0; j < els.length; j++) {
                    el = els[j]
                    if (![...el.classList].includes(`floss${l}`)) {
                        el.style.opacity = 0.25
                    }
                }

                els = document.getElementsByClassName('legendItem')
                for (let j = 0; j < els.length; j++) {
                    el = els[j]
                    if (![...el.classList].includes(`floss${l}`)) {
                        el.style.opacity = 0.25
                    }
                }

            } else {
                selected = null
                els = document.getElementsByClassName('cell')
                for (let j = 0; j < els.length; j++) {
                    els[j].style.opacity = 1
                }
                els = document.getElementsByClassName('legendItem')
                for (let j = 0; j < els.length; j++) {
                    els[j].style.opacity = 1
                }
            }
        })
        legend.append(element);
    })
    
}

// function updateLegend() {

// }

function updateLegend_OLD() {
    let legend = document.getElementById('legend')
    let legendItems = document.getElementsByClassName('legendItem');
    let nLegendItems = legendItems.length
    if (window.innerHeight > window.innerWidth) {
        legend.style.bottom = '0'
        legend.style.width = '100%'
    } else {
        let legendItemHeight = window.innerHeight / nLegendItems - 10;
        legend.style.width = `${2*legendItemHeight + 20}px`;
        for (let i = 0; i < legendItems.length; i++) {
            legendItems[i].style.height = `${legendItemHeight}px`;
            legendItems[i].style.width = `${2*legendItemHeight}px`;
            legendItems[i].style.fontSize = `${0.4*legendItemHeight}px`;

        }

    }
}

function zoom(minX, maxX, minY, maxY) {
    let duration = 500
    let transform = patternLayer.transform.baseVal.getItem(0).matrix
    console.log(transform)
    let start = {
        a: transform.a,
        e: transform.e,
        f: transform.f
    }
    let scale = Math.min(svgWidth/(sqWidth * (maxX - minX + 4)), svgHeight/(sqWidth * (maxY - minY + 4)))
    let end = {
        a: scale,
        e: -scale*sqWidth*(0.5*(minX + maxX + 1))+0.5*svgWidth,
        f: -scale*sqWidth*(0.5*(minY + maxY + 1))+0.5*svgHeight
    }

    let startTime, previousTimeStamp
    let interp = x => {
        t = x/duration;
        return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2
    }
    function animate(timestamp) {
        if (startTime === undefined) {
            startTime = timestamp;
        }
        const elapsed = timestamp - startTime;

        if (previousTimeStamp !== timestamp) {
            let t = Math.min(1, interp(elapsed))

            a_t = t * end.a + (1-t) * start.a
            e_t = t * end.e + (1-t) * start.e
            f_t = t * end.f + (1-t) * start.f

            patternLayer.setAttribute('transform', `matrix(${a_t} 0 0 ${a_t} ${e_t} ${f_t})`)
            updateLabels(a_t, e_t, f_t)
        }
        if (elapsed < duration) {
            window.requestAnimationFrame(animate)
        }
    }
    window.requestAnimationFrame(animate)
}

fetch('pattern.json').then(response => response.json())
.then(pattern => {
    console.log(pattern);
    minX = pattern.map(x => x.x).reduce((a, b) => a < b ? a : b)
    maxX = pattern.map(x => x.x).reduce((a, b) => a > b ? a : b)
    minY = pattern.map(x => x.y).reduce((a, b) => a < b ? a : b)
    maxY = pattern.map(x => x.y).reduce((a, b) => a > b ? a : b)
    pattern.forEach(p => {
        if (p.color.code in flossCounts) {
            flossCounts[p.color.code] += 1
        } else {
            flossCounts[p.color.code] = 1
        }
        let g = document.createElementNS(svgns,'g')
        g.setAttribute('transform', `translate(${p.x * sqWidth}, ${p.y * sqWidth})`)
        g.setAttribute('class', `cell floss${p.color.code} noselect`)
        g.addEventListener('mouseup', function(event) {
            let startX = mousedownPosition[0]
            let startY = mousedownPosition[1]
            let dist = Math.hypot(event.pageX - startX, event.pageY - startY)
            if (dist < 5) {
                for (let i = 0; i<this.children.length; i++) {
                    var child = this.children[i];
                    child.classList.toggle('completed');
                }
            }
        })

        let rect = document.createElementNS(svgns,'rect')
        rect.setAttribute('fill', flossCodes[p.color.code].color)
        rect.setAttribute('width', `${sqWidth}`);
        rect.setAttribute('height', `${sqWidth}`);

        let text = document.createElementNS(svgns,'text')
        text.setAttribute('x', 0.5*sqWidth)
        text.setAttribute('y', 0.5*sqWidth)
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('dominant-baseline', 'middle')
        text.setAttribute('fill', hexDarker(flossCodes[p.color.code].color))
        text.appendChild(document.createTextNode(p.color.symbol))
        
        g.appendChild(rect)
        g.appendChild(text)
        patternLayer.appendChild(g)

    })

    updateLegend(flossCounts, pattern);
    
}).then(() => {
    for (let i = 0; i <= 90; i++) {
        let line = document.createElementNS(svgns,'line')
        line.setAttribute('x1', 0.5*Math.round(2*i*sqWidth))
        line.setAttribute('y1', 0)
        line.setAttribute('x2', 0.5*Math.round(2*i*sqWidth))
        line.setAttribute('y1', 90*sqWidth)
        line.setAttribute('stroke', '#666')
        patternLayer.appendChild(line)
    }

    for (let i = 0; i <= 90; i++) {
        let line = document.createElementNS(svgns,'line')
        line.setAttribute('y1', 0.5*Math.round(2*i*sqWidth))
        line.setAttribute('x1', 0)
        line.setAttribute('y2', 0.5*Math.round(2*i*sqWidth))
        line.setAttribute('x1', 90*sqWidth)
        line.setAttribute('stroke', '#666')
        patternLayer.appendChild(line)
    }

    for (let i = 0; i <= 9; i++) {
        let line = document.createElementNS(svgns,'line')
        line.setAttribute('x1', 0.5*Math.round(20*i*sqWidth))
        line.setAttribute('y1', 0)
        line.setAttribute('x2', 0.5*Math.round(20*i*sqWidth))
        line.setAttribute('y1', 90*sqWidth)
        line.setAttribute('stroke', '#666')
        line.setAttribute('stroke-width', '2px')
        patternLayer.appendChild(line)
        if (i !== 0) {
            let gridNumber = document.createElementNS(svgns, 'text')
            gridNumber.setAttribute('class', 'noselect xlabel')
            gridNumber.innerHTML = `${10*i}`
            gridNumber.setAttribute('x', 0.5*Math.round((20*i-2)*sqWidth)+2)
            gridNumber.setAttribute('y', 15)
            gridNumber.setAttribute('fill', '#666')
            gridNumber.style.fontSize = '14px'
            patternLayer.appendChild(gridNumber)
        }
    }

    for (let i = 0; i <= 9; i++) {
        let line = document.createElementNS(svgns,'line')
        line.setAttribute('y1', 0.5*Math.round(20*i*sqWidth))
        line.setAttribute('x1', 0)
        line.setAttribute('y2', 0.5*Math.round(20*i*sqWidth))
        line.setAttribute('x1', 90*sqWidth)
        line.setAttribute('stroke', '#666')
        line.setAttribute('stroke-width', '2px')
        patternLayer.appendChild(line)
        if (i !== 0) {
            let gridNumber = document.createElementNS(svgns, 'text')
            gridNumber.setAttribute('class', 'noselect ylabel')
            gridNumber.innerHTML = `${10*i}`
            gridNumber.setAttribute('x', 3)
            gridNumber.setAttribute('y', 0.5*Math.round(20*i*sqWidth) - 3)
            gridNumber.setAttribute('fill', '#666')
            gridNumber.style.fontSize = '14px'
            patternLayer.appendChild(gridNumber)
        }
    }

    zoom(minX, maxX, minY, maxY)

})
