import React from 'react';
import './css/App.css';
import './css/styles.css'
import FileUploader from './fileupload/fileuploader';

import Chatbot from './chatbot.js'

export default class TCI extends React.Component {

  constructor(){
    super()
    this.state={
      messages:[],
      fileName:undefined,
    }
  }

  handleUpload = (messages, windows, file) => {
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
        <Chatbot 
          filename={this.state.fileName}
          windows = {this.state.windows}
          messages ={this.state.messages}
        />
        
        <div id="snackbar"></div>
      </header>
    </div>)
  }
}
