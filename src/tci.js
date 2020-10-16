import React from 'react';
import './App.css';
import './styles.css'
import FileUploader from './fileupload/fileuploader';

import chatbot from './chatbot.js'

export default class TCI extends React.Component {

  constructor(){
    super()
    this.state={
      messages:[],
      fileName:undefined,
    }
  }

  btnStyle = {
    margin: "5px"
  };

  handleUpload = (messages, windows, file) => {
    console.log(file.name, windows)
    this.setState({messages, windows, fileName:file.name})
  }

  render(){
    return (
    <div className="App">
      <header className="App-header">
        <div> Drop script file or upload here. </div><br/>
        <FileUploader
          style={{width:"50%"}}
          maxFileCount={1}
          handleUpload = {this.handleUpload}
        />
        {this.state.fileName && 
        <div>Using: {this.state.fileName}</div>}
        <br/>
        <div style={{display:"inline-flex"}}>
          <button style={this.btnStyle} onClick={chatbot.play(this.state.windows, this.state.messages)}>
            Play
          </button>
          <button style={this.btnStyle} onClick={chatbot.pause}>
            Pause
          </button>
          <button style={this.btnStyle} onClick={chatbot.reset}>
            Reset
          </button>
        </div>
        
        <div id="snackbar"></div>
      </header>
    </div>)
  }
}
