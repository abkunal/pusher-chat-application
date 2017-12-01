import React from "react";

class Messages extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let div = document.getElementById('messages');
        div.scrollTop = div.scrollHeight;
    }

    componentDidUpdate() {
        let div = document.getElementById('messages');
        div.scrollTop = div.scrollHeight;
    }

    render() {
        return (
            <div id="messages" className="col-sm-12" style={{height: 550 + 'px', overflowY: 'auto'}}>
                {this.props.children}
            </div>
        );
    }
}

export default Messages;