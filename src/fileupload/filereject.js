import React from 'react'

/**
 * FileReject is just a stylized box for a successful upload notification.
 */
export default class FileReject extends React.Component {

    style={
        backgroundColor: "#EC3C3C",
        color: "white",
        borderRadius:"10px",
        opacity:"75%",
        padding: "5px"
    }

    render(){
        return (
            <div style={this.style}>
                {this.props.rejectedFile.file.path} - {this.props.rejectedFile.errors[0].message}
            </div>
        )
    }
}