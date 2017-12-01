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
                <div className="mb-1 card text-primary" style={{cursor: 'pointer'}}
                     onClick={this.selected.bind(this)}>
                    <div className="card-body">{this.props.room.name}</div>
                </div>
            )
        } else {
            return (
                <div className="mb-1 card" style={{cursor: 'pointer'}}
                     onClick={this.selected.bind(this)}>
                    <div className="card-body">{this.props.room.name}</div>
                </div>
            );
        }
    }
}

export default Room;