import snackbar from './alert'

import './snackbar.css'

const {client, xml} = require('@xmpp/client')
const debug = require('@xmpp/debug')

class Chatbot extends Object {
  CONFERENCE = process.env.REACT_APP_XMPP_CONFERENCE
  SERVICE = process.env.REACT_APP_XMPP_SERVICE
  DOMAIN = process.env.REACT_APP_XMPP_DOMAIN
  USERNAME = process.env.REACT_APP_XMPP_USERNAME
  PASSWORD = process.env.REACT_APP_XMPP_PASSWORD

  xmpp = client({
    service: this.SERVICE,
    domain: this.DOMAIN,
    username: this.USERNAME,
    password: this.PASSWORD,
  })

  constructor(){
    super()
    debug(this.xmpp, true)

    this.xmpp.on('error', err=>{
      console.log("error", err)
    })

    this.xmpp.on('offline', () =>{
      console.log("offline")
    })

    this.xmpp.on("stanza", stanza => {
      if (stanza.is('message')) {
        if (stanza.attrs.from.indexOf('chatbot')===-1){
          if (stanza.children[2]){
            console.log("received message:" , stanza.children[2].attrs.stamp)
          }
          console.log(stanza)
        }
      }
    })

    this.xmpp.on('online', async address =>{
      console.log("online")
      // make chatbot available in all the rooms
      this.setOnline()
    })

    this.xmpp.on('connect', async address=> {
      console.log("connected");
    })

    this.xmpp.start().catch(console.error)
  }

  async init(){
    var settings = {
      conference: this.CONFERENCE,
      domain: this.DOMAIN,
      username: this.USERNAME,
      password: this.PASSWORD,
      service: this.SERVICE,
    }
    console.log("using ", settings )

  }

  checkMessages(startTime, simStart){
    return () =>  {
      var delta = Date.now() - startTime;
      this.messages.forEach((msg, idx) =>{
        console.log('check: ', msg)
        
        var deltaSec = Math.floor(delta/1000); // convert to seconds
        console.log(deltaSec)
        // for each msg, if time has passed, send messages
        console.log((msg.timestamp - simStart)/1000)

        var deltaSimSec = ((msg.timestamp - simStart)/ 1000 )

        if (deltaSec >= deltaSimSec){
          console.log("send message", msg)
          this.setPresence(msg.window)
          this.sendMessage(msg.window, msg.text)
          this.messages.splice(idx, 1)
        }
      })
    }
  }

  async setOnline(){
    await this.xmpp.send(xml('presence'))
  }

  async setPresence(room, id=this.xmpp.jid.local){
    await this.xmpp.send(xml('presence', 
    {to: room+'@' +process.env.REACT_APP_XMPP_CONFERENCE+'/'+id}))
  }

  async setPresenceInRooms(rooms, id=this.xmpp.jid.local){
    rooms.forEach((room)=>{
      console.log("Online in room: " + room.window, id)
      this.setPresence(room.window, id)
    })
  }

  async sendMessage(room, text){
    const msg = xml(
      'message',
      {type: 'groupchat', to: room+"@"+this.CONFERENCE},
      xml('body', {}, text)
    )
    await this.xmpp.send(msg)
  }

  play = (windows, msgs) => {
    return async () => {
      console.log("---- PLAY ----")
      
      msgs.forEach((msg) => {
        var date = new Date()
        var month = date.getMonth()
        var day = date.getDate()
        var year = date.getFullYear()

        var timeSplit = msg.time.split(":")
        
        var dt = new Date(year, month, day, parseInt(timeSplit[0]), parseInt( timeSplit[1]), parseInt(timeSplit[2]))

        msg.timestamp = dt.getTime()
        console.log('converted msg ts', msg.timestamp)
      })

      this.messages = msgs
      this.windows = windows

      if (!this.interval){
        this.init()
            
        console.log("trying to set presence in rooms...")
      this.setPresenceInRooms(this.windows)
        console.log("sending test message")
      this.sendMessage("#test", "text")

        snackbar.alert("Injector started!", 3000, 'green')
        var simStart = new Date(2020, 9, 22, 16, 30, 0).getTime();
        this.interval = setInterval(this.checkMessages(Date.now(), simStart),500)
      }
    }
  } 
  
  pause = () => {
    clearInterval(this.interval)
    this.interval = undefined
    snackbar.alert("Injector paused", 3000, 'yellow')
  }
  
  reset = () => {
    this.idx =0;
    snackbar.alert("Injector reset", 3000, "yellow")
  }
}

export default new Chatbot()