const express = require('express'),
    mediaserver = require('mediaserver'),
    fs = require('fs'),
    multer = require('multer'),
    app = express(),
    optionsMulter = multer.diskStorage({
        destination: (req,file,callback)=>{
            callback(null,`${__dirname}/songs`)
        },
        filename:(req,file,callback)=>{
            callback(null,file.originalname)
        }
    }),
    upload = multer({
        storage:optionsMulter
    })


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(`${__dirname}/public`))


app.get('/songs',(req,res)=>{
    fs.readFile(`${__dirname}/songs.json`,'utf8',(err,songs)=>{
        if(err) throw err
        return res.json(JSON.parse(songs))
    })
})
app.post('/songs',upload.single('song'),(req,res)=>{
    const {originalname} = req.file
    fs.readFile(`${__dirname}/songs.json`,'utf8',(err,file)=>{
        if(err) throw err
        const songs = JSON.parse(file)
        songs.push({
            name:originalname
        })
        fs.writeFile(`${__dirname}/songs.json`,JSON.stringify(songs, null, 4),err=>{
            if(err)  return res.redirect('/')
        })
    })
    return res.redirect('/')
})

app.get('/songs/:name',(req,res)=>{
    const {name} = req.params
    if(!name) return res.json({
        message:'Canción no válida'
    })
    const SONG_URL = `${__dirname}/songs/${name}`
    mediaserver.pipe(req,res,SONG_URL)
})
app.use((req,res,next)=>{
    res.redirect("/");
})
app.listen(process.env.PORT || 8000, '0.0.0.0', ()=>{
    console.log('Listen in port 8000')
})