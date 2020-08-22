const listSongs = document.querySelector('.list-songs'),
    audio = document.querySelector('.audio'),
    canvas = document.getElementById('analyzer-render')
let contextAudio,
    contextCanvas,
    analyzer,
    fbc_array,
    bars,
    bar_x,
    bar_width,
    bar_height,
    source

const frameLooper = ()=>{
    window.requestAnimationFrame(frameLooper)
    fbc_array = new Uint8Array(analyzer.frequencyBinCount)
    analyzer.getByteFrequencyData(fbc_array)
    contextCanvas.clearRect(0,0,canvas.width,canvas.height)
    contextCanvas.fillStyle = "#83F442"
    bars = 100
    for(let i=0;i<bars;i++){
        bar_x= i*3
        bar_width= 2
        bar_height= -(fbc_array[i]/2)
        contextCanvas.fillRect(bar_x,canvas.height,bar_width,bar_height)
    }
}

const initMp3Player = ()=>{
    if(!source){
        contextAudio = new AudioContext()
        analyzer = contextAudio.createAnalyser()
        contextCanvas = canvas.getContext('2d')
        source = contextAudio.createMediaElementSource(audio)
        source.connect(analyzer)
        analyzer.connect(contextAudio.destination)
    }
    frameLooper()
}

const ajax = async (uri, method, song) => {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')

    const myInit = {
        method,
        headers,
        body : JSON.stringify(song)
    }

    const resp = await fetch(uri, myInit)
    if (resp.status === 401) {
        return {type: 'error', data: 'No autorizado'}
    }
    const json = await resp.json()
    return json
}

const loadingSong = async()=>{
    const songs = await ajax('/songs','GET')
    const fragment = document.createDocumentFragment()
    songs.forEach(song=>{
        const li = document.createElement('li')
        li.textContent = song.name
        li.className= 'song'
        fragment.appendChild(li)
    })
    listSongs.appendChild(fragment)
}
const play = name=>{
    audio.pause = true
    audio.src= `/songs/${name}`
    audio.autoplay=true
    initMp3Player()
}
loadingSong()
listSongs.addEventListener('click',event=>{
    event.preventDefault()
    const target = event.target
    if(target.tagName==='LI')
        return play(target.textContent)
})