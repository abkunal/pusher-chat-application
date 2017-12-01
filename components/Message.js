import React from "react";

class Message extends React.Component {
    constructor(props) {
        super(props);
        this.sent = this.sent.bind(this);
        this.received = this.received.bind(this);
    }

    sent() {
        let time = '';

        if (this.props.time !== '') {
            time = new Date(this.props.time).toDateString().substring(4) + ' ' +
                new Date(this.props.time).toLocaleString().substring(12, 17);
        }

        return (
            <div className="card message">
                <div className="card-title text-right">You</div>
                <div className="card-body">
                    {this.props.text}
                </div>
                <span className="text-right">
                    {time} {this.props.status}
                </span>
            </div>
        );
    }

    received() {
        let time = '';

        if (this.props.time !== '') {
            time = new Date(this.props.time).toDateString().substring(4) + ' ' +
                new Date(this.props.time).toLocaleString().substring(12, 17);
        }

        return (
            <div className="card message">
                <div className="card-title">{this.props.sender}</div>
                <div className="card-body">
                    {this.props.text}
                </div>
                <span className="text-right">
                    {time} {this.props.status}
                </span>
            </div>
        )
    }

    render() {
        if (this.props.userId === this.props.sender) {
            return this.sent();
        } else {
            return this.received();
        }
    }
}

export default Message;