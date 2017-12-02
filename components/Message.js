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
            <div className="row mr-1">
                <div className="offset-sm-4 col-sm-8 card message" >
                    <div className="card-header text-right" style={{marginLeft: -15 + 'px', marginRight: -15 + 'px'}}>
                        <strong>You</strong>
                    </div>
                    <div className="card-body">
                        {this.props.text}
                    </div>
                    <span className="mb-1 text-right">
                        <span className="badge badge-secondary">{time}</span> <span className="badge badge-primary">{this.props.status}</span>
                    </span>
                </div>
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
            <div className="row">
                <div className="ml-3 col-sm-8 card message">
                    <div className="card-header" style={{marginLeft: -15 + 'px', marginRight: -15 + 'px'}}>
                        <strong>{this.props.sender}</strong>
                    </div>
                    <div className="card-body">
                        {this.props.text}
                    </div>
                    <span className="mb-1 text-right">
                        <span className="badge badge-secondary">{time}</span> <span className="badge badge-primary">{this.props.status}</span>
                    </span>
                </div>
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