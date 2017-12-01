import React from 'react';

class Alert extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="text-center mt-3">
                <p className="text-info">{this.props.text}</p>
            </div>
        );
    }
}

export default Alert;