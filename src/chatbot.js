import snackbar from './alert'
import React from 'react'

import './css/snackbar.css'

const {client, xml} = require('@xmpp/client')
const debug = require('@xmpp/debug')

export default class Chatbot extends React.Component {

  newXmpp(service, domain, username, password){
    let xmpp = client({
      service: service,
      domain: domain,
      username: username,
      password: password
    })
    debug(xmpp, true)

    xmpp.on('error', err=>{
      console.log("error", err)
    })

    xmpp.on("stanza", stanza => {
      if (stanza.is('message')) {
        if (stanza.attrs.from.indexOf('chatbot')===-1){
          if (stanza.children[2]){
            console.log("received message:" , stanza.children[2].attrs.stamp)
          }
          console.log(stanza)
        }
      }
    })

    xmpp.on('online', async address =>{
      this.setOnline()      
      this.systemMsg("Connected to XMPP server as " + this.xmpp.jid.local)
      snackbar.alert("Connected to XMPP server as " + this.xmpp.jid.local, 5000, "green")
    })

    xmpp.start().catch(this.addErrorMsg)
    return xmpp;
  }

  CONFERENCE = process.env.REACT_APP_XMPP_CONFERENCE
  SERVICE = process.env.REACT_APP_XMPP_SERVICE
  DOMAIN = process.env.REACT_APP_XMPP_DOMAIN
  USERNAME = process.env.REACT_APP_XMPP_USERNAME
  PASSWORD = process.env.REACT_APP_XMPP_PASSWORD

  constructor(){
    super()

    this.state={
      sentMessages:[],
      roomsOnline:[],
      messages:[],
      initMessages:[],
      conference:this.CONFERENCE,
      domain:this.DOMAIN,
      username:this.USERNAME,
      password:this.PASSWORD,
      service:this.SERVICE,
    }
  }
  
  btnStyle = {
    margin: "5px",
    width:"25%",
    textAlign:"center"
  };

  textAreaStyle = {
    width:"90%",
    height:"400px",
    margin:"10px",
  }

  addErrorMsg=()=>{
    this.systemMsg("Error connecing to XMPP server. Please check settings and credentials.")
    snackbar.alert("Error connecing to XMPP server. Please check settings and credentials.", 10000, "red")
  }

  systemMsg(myText){
    let onlinemsgs = []
      let msg={
        time:"",
        window:"",
        callsign:"system",
        text: myText
      }
      onlinemsgs.push(msg)
      this.setState({sentMessages: this.state.sentMessages.concat(onlinemsgs)})
  }

  checkMessages = (startTime) => {
    return () =>  {
      var delta = Date.now() - startTime;
      this.state.messages.forEach((msg, idx) =>{
        var deltaSec = Math.floor(delta/1000); // convert to seconds
        var deltaSimSec = ((msg.timestamp - this.state.simStart)/ 1000 )
        if (deltaSec >= deltaSimSec){
          this.sendMessage(msg)

          var sentMsg = this.state.messages.splice(idx, 1)
          
          this.setState({sentMessages: this.state.sentMessages.concat(sentMsg)})

          if (this.state.messages.length === 0){
            snackbar.alert("Finished simulation", 5000, "green")
            clearInterval(this.state.interval)
            this.setState({interval:undefined})
          }
        }
      })
    }
  }

  async setOnline(){
    await this.xmpp.send(xml('presence'))
  }

  async setPresence(room, id=this.xmpp.jid.local){
    await this.xmpp.send(xml('presence', 
    {to: room+'@' +this.state.conference+'/'+id}))
  }

  setPresenceInRooms = async (id=this.xmpp.jid.local) => {
    let onlinemsgs = []
    this.props.windows.forEach(async (room)=>{
      let msg = {
        time: "",
        window:"",
        callsign:"system",
        text:"Online in room: " + room.window,
      }
      onlinemsgs.push(msg)
      this.setPresence(room.window, id)
    })
    
    this.setState({sentMessages: this.state.sentMessages.concat(onlinemsgs)})
  }

  async sendMessage(message){
    const msg = xml(
      'message',
      {type: 'groupchat', to: message.window+"@"+this.state.conference},
      xml('body', {}, "<"+message.callsign+"> "+message.text)
    )
    await this.xmpp.send(msg)
  }

  connect = () =>{
    this.xmpp = this.newXmpp(this.state.service, this.state.domain, this.state.username, this.state.password)
  }

  play = async () => {
    this.props.messages.forEach((msg) => {
      var date = new Date()
      var month = date.getMonth()
      var day = date.getDate()
      var year = date.getFullYear()

      var timeSplit = msg.time.split(":")
      
      var dt = new Date(year, month, day, parseInt(timeSplit[0]), parseInt( timeSplit[1]), parseInt(timeSplit[2]))

      msg.timestamp = dt.getTime()
    })

    if (!this.state.interval){
      this.setPresenceInRooms()
      this.setState({messages:[...this.props.messages], initMessages: [...this.props.messages]})

      snackbar.alert("Injector started!", 3000, 'green')
      await this.setState({simStart:new Date(2020, 9, 23, 16, 30, 0).getTime() })
    
      this.setState( {
        interval: setInterval(this.checkMessages(Date.now()),500)
      })
    }
  } 
  
  pause = () => {
    clearInterval(this.state.interval)
    this.setState({interval:undefined})
    snackbar.alert("Injector paused", 3000, 'yellow')
  }
  
  reset = () => {
    this.setState({messages:this.state.initMessages, sentMessages:[]})
    snackbar.alert("Injector reset", 3000, "yellow")
  }

  handleInputChange = (val) =>{
    return(event)=>{
      switch(val){
        case "domain":
          this.setState({domain:event.target.value})
          break;
        case "service":
          this.setState({service:event.target.value})
          break;
        case "username":
          this.setState({username:event.target.value})
          break;
        case "password":
          this.setState({password:event.target.value})
          break;
        case "simtime":
          this.setState({simtime:event.target.value})
          break;
        case "conference":
          this.setState({conference:event.target.value})
          break;
        default:
          break;
      }
    }
  }

  render(){

    var msgStr = ""
    this.state.messages.forEach((msg) =>{
      msgStr += msg.time+"-"+msg.window+"-<"+msg.callsign+"> "+msg.text+"\r\n-------------\r\n"
    })
    var msgSentStr = ""
    this.state.sentMessages.forEach((msg) =>{
      msgSentStr += msg.time+"-"+msg.window+"-<"+msg.callsign+"> "+msg.text+"\r\n-------------\r\n"
    })
    return (<div style={{width:"100%"}}>
        <div>Settings:
          <div><label>Sim Time: </label><input defaultValue="hh:mm:ss" onChange={this.handleInputChange("simtime")}/></div>
          <div><label>XMPP Service: </label><input defaultValue={this.SERVICE} onChange={this.handleInputChange("service")}/></div>
          <div><label>Domain: </label><input defaultValue={this.DOMAIN} onChange={this.handleInputChange("domain")}/></div>
          <div><label>Conference: </label><input defaultValue={this.CONFERENCE} onChange={this.handleInputChange("conference")}/></div>
          <div><label>Usename: </label><input defaultValue={this.USERNAME} onChange={this.handleInputChange("username")}/></div>
          <div><label>Password: </label><input defaultValue={this.PASSWORD} onChange={this.handleInputChange("password")}/></div>
          <button onClick={this.connect}>Connect</button>
        </div>
        <div style={{width:"100%", textAlign:"center", alignItems:"center"}}>
          <button style={this.btnStyle} onClick={this.play}>
            Play
          </button>
          <button style={this.btnStyle} onClick={this.pause}>
            Pause
          </button>
          <button style={this.btnStyle} onClick={this.reset}>
            Reset
          </button>
        </div>
        <div>Timer</div>
        <div style={{display:"inline-flex", width:"100%"}}>
          <table style={{border:"none"}}>
            <tbody>
            <tr style={{border:"none"}}>
              <th style={{border:"none"}}>Messages:</th>
              <th style={{border:"none"}}>Sent Messages:</th>
            </tr>
            <tr style={{border:"none"}}>
              <td style={{border:"none"}}><textarea id="msgTextArea" style={this.textAreaStyle} readOnly value={msgStr} /></td>
              <td style={{border:"none"}}><textarea id="msgSentTextArea" style={this.textAreaStyle} readOnly value={msgSentStr} /></td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>)
  }
}