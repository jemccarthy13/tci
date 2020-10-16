import React from 'react'

/**
 * FileAccept is just a stylized box for a successful upload notification.
 */
export default class FileAccept extends React.Component {

    style={
        backgroundColor: "#08AE2A",
        color: "white",
        borderRadius:"10px",
        opacity:"75%",
        padding: "5px"
    }

    render(){
        return (
            <div style={this.style}>
                {this.props.acceptedFile.name}
            </div>
        )
    }
}