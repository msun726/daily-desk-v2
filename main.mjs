import {app,BrowserWindow,ipcMain,session,shell} from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {identifyOutline} from './ai-server.mjs';
import {extractJob} from './job-ai.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));let window,apiKey='';
app.setName('Daily Desk');app.setAppUserModelId('local.daily-desk');
const dataDir=process.env.DAILY_DESK_DATA_DIR||path.join(path.dirname(process.execPath),'Data');fs.mkdirSync(dataDir,{recursive:true});app.setPath('userData',dataDir);
const entry=pathToFileURL(path.join(root,'index.html')).href;
function external(value){let url;try{url=new URL(value)}catch{return}if(url.protocol!=='https:')return;const chrome=['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe','C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'].find(p=>fs.existsSync(p));if(chrome){const appShortcut=true;const args=appShortcut?['--user-data-dir='+path.join(dataDir,'WebApps'),'--no-first-run','--no-default-browser-check','--app='+url.href,'--window-size=1100,760','--window-position=100,80']:['--new-window',url.href];const child=spawn(chrome,args,{detached:true,stdio:'ignore',windowsHide:true});child.on('error',()=>shell.openExternal(url.href));child.unref()}else shell.openExternal(url.href)}
function validSender(event){if(!window||event.sender!==window.webContents||event.senderFrame?.url!==entry)throw Error('请求来源无效')}
let aiBusy=false;async function aiCall(event,payload,fn){validSender(event);throw Error('AI 功能已停用');if(aiBusy)throw Error('正在处理另一个 AI 请求');aiBusy=true;try{return await fn(payload,{apiKey})}finally{aiBusy=false}}
ipcMain.handle('desk:health',event=>{validSender(event);return {configured:!!apiKey,service:'daily-desk-ai'}});
ipcMain.handle('desk:set-key',(event,key)=>{validSender(event);throw Error('AI 功能已停用');if(typeof key!=='string'||key.length>2048||!key.trim())throw Error('请输入 API Key');apiKey=key.trim();return {configured:true}});
ipcMain.handle('desk:clear-key',event=>{validSender(event);apiKey='';return {configured:false}});
ipcMain.handle('desk:course',(event,payload)=>aiCall(event,payload,identifyOutline));
ipcMain.handle('desk:job',(event,payload)=>aiCall(event,payload,extractJob));
ipcMain.handle('desk:window',(event,action)=>{validSender(event);if(action==='minimize')window.minimize();if(action==='maximize')window.isMaximized()?window.unmaximize():window.maximize();if(action==='close')window.close()});
if(!app.requestSingleInstanceLock())app.quit();else{
app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.focus()}});
app.whenReady().then(async()=>{session.defaultSession.setPermissionRequestHandler((_wc,permission,callback)=>callback(false));session.defaultSession.setPermissionCheckHandler(()=>false);window=new BrowserWindow({title:'Daily Desk',width:1180,height:800,fullscreen:false,fullscreenable:false,minWidth:850,minHeight:580,frame:false,backgroundColor:'#203449',icon:path.join(root,'workbench.ico'),show:false,webPreferences:{preload:path.join(root,'preload.cjs'),sandbox:true,contextIsolation:true,nodeIntegration:false,webSecurity:true,plugins:true}});window.removeMenu();window.webContents.setWindowOpenHandler(({url})=>{external(url);return {action:'deny'}});window.webContents.on('will-navigate',(event,url)=>{if(url!==entry){event.preventDefault();external(url)}});window.webContents.on('will-attach-webview',event=>event.preventDefault());await window.loadFile(path.join(root,'index.html'));window.show();if(process.argv.includes('--smoke-test')){try{await new Promise(r=>setTimeout(r,800));const result=await window.webContents.executeJavaScript(`({title:document.title,desktop:!!window.dailyDeskDesktop,bodyHeight:document.body.scrollHeight,viewport:innerHeight,courses:document.querySelectorAll('.course-card').length,scripts:[...document.scripts].map(s=>s.src).filter(Boolean)})`);const out=process.env.DAILY_DESK_TEST_OUTPUT;if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'app-smoke.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(out,'app-preview.png'),(await window.webContents.capturePage()).toPNG())}app.quit()}catch{process.exitCode=1;app.quit()}}});app.on('window-all-closed',()=>app.quit());}
