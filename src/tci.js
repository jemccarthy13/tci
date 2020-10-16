import React from 'react';
import './App.css';
import FileUploader from './fileupload/fileuploader';

function TCI() {
  return (
    <div className="App">
      <header className="App-header">
        <button>
          Upload File
        </button>
        <FileUploader/>
      </header>
    </div>
  );
}

export default TCI;
