const {app, BrowserWindow, Menu, globalShortcut, ipcMain, shell} = require('electron')
const path = require('path')
const os = require('os')
const imagemin = require('imagemin')
const imageminMozJpeg = require('imagemin-mozjpeg')
const imageminPngQuant = require('imagemin-pngquant')
const slash = require('slash')


let mainWindow;

let aboutWindow;


function  createAboutWindow(){
  
  if(!aboutWindow){
    aboutWindow = new BrowserWindow({
      title: 'About',
      width: 300,
      height: 300,
      icon: `${__dirname}/assets/icons/Icon_256x256.png`,
      resizable: false,
      backgroundColor: 'white',
      webPreferences:{
        nodeIntegration: true
      }
  
    })
  
    aboutWindow.loadFile(`${__dirname}/app/about.html`) 
      .then(value => aboutWindow.on('close', ()=>aboutWindow=null))
  }
  
}


function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: false,
    webPreferences:{
      nodeIntegration: true
    }
  })

  globalShortcut.register('CmdOrCtrl+R', ()=>mainWindow.reload())
  globalShortcut.register('F12', ()=>mainWindow.toggleDevTools())

  mainWindow.loadFile(`${__dirname}/app/index.html`)
}

app.on('ready', ()=>{
  createMainWindow()

  const mainMenu = Menu.buildFromTemplate(menu)

  Menu.setApplicationMenu(mainMenu)

  mainWindow.on('close', ()=>mainWindow=null)
  
})

const menu = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+W',
        click: ()=>app.quit()
      }
    ]
  },
  {
    label: 'About',
    click: async ()=> createAboutWindow()
  }
]

app.on('window-all-closed', ()=>{
  if(process.platform!=='darwin'){
    app.quit()
  }
})

app.on('activate', ()=>{
  if(BrowserWindow.getAllWindows().length===0){
    createMainWindow()
  }
})

ipcMain.on('image:minimize', (e, options)=>{
  const newOptions = {...options}
  newOptions.dest = path.join(os.homedir(), 'imageshrink')
  shrinkImage(newOptions)
})

function shrinkImage({imgPath, quality, dest}){
  try{

    console.log('teste-antes')
    // const files = await imagemin([slash(imgPath)], {
    //   destination: dest,
    //   plugins: [
    //     imageminMozJpeg({quality}),
    //     imageminPngQuant({
    //       quality: [quality/100, quality/100 ]
    //     })
    //   ]
    // })

    imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozJpeg({quality}),
        imageminPngQuant({
          quality: [quality/100, quality/100 ]
        })
      ]
    }).then((files)=>{
      console.log(files)
      shell.openPath(dest)
      mainWindow.webContents.send('image:done')
    })

    

    // shell.openPath(dest)

    // mainWindow.webContents.send('image:done')
  }catch (error){
    console.log(error)
  }
}