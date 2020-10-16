import React from 'react'
import Dropzone from 'react-dropzone'

import XLSX from 'xlsx'

import FileReject from './filereject'
import FileAccept from './fileaccept'

import '../fileuploader.css'

/**
 * FileUploader provides a Component to render a File Dropzone.
 * 
 * Props can include "maxFileCount" (int) and "accept", which is a
 * comma-separated string containing acceptable MIME types and/or 
 * file extensions.
 */
export default class FileUploader extends React.Component {
    
    // Callback for when a file is dropped into the Dropzone
    onDrop =(acceptedFiles, rejectedFiles)=>{
        // if theres a limit to the number of files
        // then we adjust the list of accepted/rejected files
        if (this.props.maxFileCount){
            if (acceptedFiles.length > this.props.maxFileCount){
                for (var i=1; i<acceptedFiles.length; i++){
                    console.log(acceptedFiles[i])
                    rejectedFiles.push({
                        file: acceptedFiles[i],
                        errors: [{message:"Limited to upload " + this.props.maxFileCount + " at a time."}]
                    })
                }
                // slice after parsing files to be rejected
                acceptedFiles = acceptedFiles.slice(0,1)
            }
        }
        this.setState({
            acceptedFiles: acceptedFiles,
            rejectedFiles: rejectedFiles
        })

        this.uploadFiles();
    }

    // Actually perform the upload POST request
    async uploadFiles(){
        this.loadFileXLSX()
    }

    excelToJson(reader) {
        var fileData = reader.result;
        var wb = XLSX.read(fileData, {type:'binary'});
        var data ={}
        wb.SheetNames.forEach((sheetName) => {
            var rowObj = XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName])
            var rowString = rowObj
            data[sheetName] = rowString
        });
        this.props.handleUpload(data.messages, data.windows, this.state.acceptedFiles[0])
    }

    loadFileXLSX(){
        var reader = new FileReader();
        reader.onload=this.excelToJson.bind(this, reader)
        reader.readAsBinaryString(this.state.acceptedFiles[0])
    }

    style = {
        outline: "2px dashed #92b0b3",
        outlineOffset: "-10px",
        WebkitTransition: "outline-offset .15s ease-in-out, background-color .15s linear",
        transition: "outline-offset .15s ease-in-out, background-color .15s linear",
        padding: "60px 0px 20px 0px",
        textAlign: "center !important",
        margin: "0",
        backgroundColor: "white !important",
    }

    browseStyle={
        marginLeft:"15px",
        display:"inline-flex", 
        borderRadius:"15px",
        width:"fit-content",
        size:"0px"
    }

    // main Component render
    render() {
        return (
            <Dropzone 
                accept={this.props.accept}
                onDrop={this.onDrop}>
                {({getRootProps, getInputProps, isDragActive, isDragReject, rejectedFiles}) => (
                <div style={this.props.style}>
                    <div {...getRootProps()}>
                    <div className="files">
                    <input {...getInputProps()} />
                        {isDragActive ? 
                        <div style={{...this.style, height:"37px"}}>Drop files here</div>
                        : <div style={this.style}><div>Drag files here, or click <button style={this.browseStyle}>Browse</button></div> </div>}
                    </div>
                    </div>
                    {this.state && this.state.rejectedFiles && this.state.rejectedFiles.length > 0 && this.state.rejectedFiles.map(rejectedFile => (
                        <FileReject key={rejectedFile.name} rejectedFile={rejectedFile} />
                    ))}
                    {this.state && this.state.uploadedFiles && this.state.uploadedFiles.length > 0 && this.state.uploadedFiles.map(acceptedFile => (
                        <FileAccept key={acceptedFile.name} acceptedFile={acceptedFile} />
                    ))}
                </div>  
            )}
          </Dropzone>
        )
    }
}