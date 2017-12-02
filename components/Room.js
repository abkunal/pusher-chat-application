import React from "react";

class Room extends React.Component {
    constructor(props) {
        super(props);
    }

    selected() {
        this.props.selected(this.props.index);
    }

    render() {
        if (this.props.selectedIndex === this.props.index) {
            return (
                <div className="mb-1 card alert alert-primary" style={{cursor: 'pointer'}}
                     onClick={this.selected.bind(this)}>
                    <div className="row card-body">
                        <div className="col-sm-8">
                            <strong>{this.props.room.name}</strong>
                        </div>
                        <div  className="col-sm-4 text-right">
                            <span className="badge badge-secondary">{this.props.unread}</span>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="mb-1 card" style={{cursor: 'pointer'}}
                     onClick={this.selected.bind(this)}>
                    <div className="row card-body">
                        <div className="col-sm-8">
                            {this.props.room.name}
                        </div>
                        <div  className="col-sm-4 text-right">
                            <span className="badge badge-secondary">{this.props.unread}</span>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default Room;