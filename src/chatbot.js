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
      snackbar.alert("chatbot error: " + err, 5000, "red")
    })

    xmpp.on("stanza", stanza => {
      if (stanza.is('message')) {
        if (stanza.attrs.from.indexOf('chatbot')===-1){
          if (stanza.children[3]){
            if (stanza.children[3].attrs.stamp !== undefined){
              // console.log("read old message")
            }
          } else {
            if (stanza.children[0]){
              if (stanza.children[0].name !=="subject"){
                // Read message text with 
                // stanza.children[0].children[0]
                // AI could respond here with messages

                // This just autocopies every message (demo response)
                  // var msg = {
                  //   window: "#c2_coord",
                  //   text: "copy",
                  //   callsign: "chatbot"
                  // }
                  // this.sendMessage(msg)
              }
            }
          }
        }
      }
    })

    xmpp.on('online', async address =>{
      this.setOnline()      
      this.systemMsg("Connected to XMPP server ("+this.state.service+") as " + this.xmpp.jid.local)
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
  SIMTIME = process.env.REACT_APP_XMPP_SIMTIME

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
      simtime:this.SIMTIME,
      isEditSettings: false,
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
        var deltaSec = Math.floor(delta/1000); // convert to second
        this.setState({time:deltaSec})
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

  getUserSimTime =() =>{
    return {
      hours: parseInt(this.state.simtime.substring(0,2)),
      minutes: parseInt(this.state.simtime.substring(3,5)),
      seconds: parseInt(this.state.simtime.substring(6,8)),
    }
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
      if (this.xmpp === undefined){
        // TODO - connect using newXmpp -- tricky to wait for 'connected' before proceeding to 
        // next JS event. For now, error and have the user press "connect"
        snackbar.alert("Chatbot is not connected! Press the connect button.", 5000, "red")
        return;
      } else if (this.xmpp.status !== "online"){
        snackbar.alert("Chatbot is not online. Check connection settings.", 5000, "red")
        return;
      }

      var regex = new RegExp("[0-9][0-9]:[0-9][0-9]:[0-9][0-9]")
      var goodTime = regex.test(this.state.simtime)
      if (this.props.filename === undefined){
        snackbar.alert("No file was selected!",5000,"red"); 
        return;
      }
      else if (this.props.messages.length === 0){
        snackbar.alert("No messages were loaded!",5000,"yellow"); 
        return;
      } else if (!goodTime){
        snackbar.alert("Invalid start time. Check settings.", 5000, "red")
        return;
      }

      this.setPresenceInRooms()
      this.setState({messages:[...this.props.messages], initMessages: [...this.props.messages]})

      snackbar.alert("Injector started!", 3000, 'green')
      
      var today = new Date()
      var time = this.getUserSimTime()
      await this.setState({simStart:new Date(
        today.getFullYear(), 
        today.getMonth(),
        today.getDate(),
        time.hours,
        time.minutes,
        time.seconds) 
      })
    
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

  toggleEdit = () =>{
    this.setState({isEditSettings:!this.state.isEditSettings})
  }

  getCurrentTime = () => { 
    if (this.state.time === undefined){
      return this.state.simtime
    } else {
      var d = new Date(this.state.simStart.getTime() + this.state.time*1000);
      var hrs = ("0" + d.getHours()).slice(-2)
      var mins = ("0" + d.getMinutes()).slice(-2)
      var secs = ("0" + d.getSeconds()).slice(-2)
      return hrs +":" + mins + ":" + secs
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
        <div><div style={{display:"inline-flex"}}>
                Settings: 
                <button onClick={this.toggleEdit} style={{marginLeft:"10px"}}>{this.state.isEditSettings ? "-":"+"}</button></div>
          {this.state.isEditSettings && <table>
            <tbody>
              <tr>
                <td>Sim Time:</td><td><input defaultValue={this.SIMTIME} onChange={this.handleInputChange("simtime")}/></td>
              </tr>
              <tr>
                <td>XMPP Service:</td><td><input defaultValue={this.SERVICE} onChange={this.handleInputChange("service")}/></td>
              </tr>
              <tr>
                <td>Domain:</td><td><input defaultValue={this.DOMAIN} onChange={this.handleInputChange("domain")}/></td>
              </tr>
              <tr>
                <td>Conference:</td><td><input defaultValue={this.CONFERENCE} onChange={this.handleInputChange("conference")}/></td>
              </tr>
              <tr>
                <td>Username:</td><td><input defaultValue={this.USERNAME} onChange={this.handleInputChange("username")}/></td>
              </tr>
              <tr>
                <td>Password:</td><td><input defaultValue={this.PASSWORD} onChange={this.handleInputChange("password")}/></td>
              </tr>
            </tbody>
          </table>}
          <br/>
          <button style={{width:"25%"}} onClick={this.connect}>Connect</button>
          <br/><br/>
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
        <div>{this.getCurrentTime()}</div>
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