import React from 'react';
import ReactDOM from 'react-dom';
import { List } from 'react-virtualized';
import Chatkit from 'chatkit';

class Room extends React.Component {
    constructor(props) {
        super(props);
    }

    selected() {
        this.props.selected(this.props.index);
    }

    render() {
        return (
            <div className="card" onClick={this.selected.bind(this)}>
                <div className="card-body">{this.props.room.name}</div>
            </div>
        );
    }
}

class Message extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="card">
                <div className="card-body">
                    {this.props.message.text}
                </div>
            </div>
        );
    }
}

class Messages extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="card" >
                {this.props.children}
            </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {username: '', userRooms: [], joinableRooms: [],
            users: [], currentView: null, selected: 0, currentMessage: '',
            messages: []};

        this.setupPusher = this.setupPusher.bind(this);
        this.getJoinableRooms = this.getJoinableRooms.bind(this);
        this.selected = this.selected.bind(this);
        this.subscribeToRoom = this.subscribeToRoom.bind(this);
        this.fetchMessages = this.fetchMessages.bind(this);
    }

    handleUsernamechange(event) {
        this.setState({username: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();

        // username and Name has been given by the user
        if (this.state.username !== "") {
            $("#myModal").modal("hide");

            this.setupPusher();
        }
    }

    componentDidMount() {
        // set up modal
        $("#myModal").modal({
            backdrop: 'static',
            keyboard: false
        });
        $('#myModal').on('shown.bs.modal', function () {
            $('#username').focus()
        });
        $("#myModal").modal('show');    }

    setupPusher() {
        // create a user and connect to chat server
        console.log('executed');
        //
        // let xhr = new XMLHttpRequest();
        // xhr.open('GET', 'https://us1.pusherplatform.io/services/chatkit/v1/725bf3f7-3373-4c90-811b-8addf4e23404/users/:' + "kunal");
        // xhr.setRequestHeader('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOiI3MjViZjNmNy0zMzczLTRjOTAtODExYi04YWRkZjRlMjM0MDQiLCJleHAiOjE1MTIxMjIxMDYsImlhdCI6MTUxMjAzNTcwNiwiaXNzIjoiYXBpX2tleXMvOTViNzVmMWYtYTM3MS00ZDgwLThhZDAtZjRkYThhNWE3NGJjIiwic3ViIjoiYXNzZGdnaCJ9.uFGwIs1DZzr4dVD6GR3RiRnpgzppoh7B44oLlXJmknE')
        // xhr.onreadystatechange = () => {
        //     if (xhr.readyState === 4 && xhr.status == 200) {
        //         console.log(xhr.responseText);
        //     }
        // }
        // xhr.send();

        const tokenProvider = new Chatkit.TokenProvider({
            url: "http://localhost:3000/token",
            userId: this.state.username
        });

        const chatManager = new Chatkit.ChatManager({
            instanceLocator: "v1:us1:725bf3f7-3373-4c90-811b-8addf4e23404",
            tokenProvider: tokenProvider
        });

        var that = this;
        chatManager.connect({
            onSuccess: (currentUser) => {
                console.log('user: ', currentUser);
                that.setState({user: currentUser});
                that.setState({userRooms: currentUser.rooms})
                // let arr = ['three', ];
                // for(let i = 0; i < arr.length; i++) {
                //     currentUser.createRoom(
                //         {
                //             name: arr[i],
                //         },
                //         (room) => {
                //             console.log(`Created public room called ${room.name}`);
                //         },
                //         (error) => {
                //             console.log(`Error creating room ${error}`);
                //         }
                //     );
                // }


                that.getJoinableRooms();
                // currentUser.getJoinableRooms(
                //     (rooms) => {
                //         console.log('Rooms: ', rooms);
                //     },
                //     (error) => {
                //         console.log(`Error getting joinable rooms: ${err}`);
                //     }
                // );
            },
            onError: (error) => {
                console.log(error);
                console.log('some error occured, please refresh the page');

                // let xhr = new XMLHttpRequest();
                // xhr.open('GET', '/user/?nickname=' + this.state.username);
                // xhr.onreadystatechange = () => {
                //     if (xhr.status === 200 && xhr.readyState === 4) {
                //         console.log('response: ', xhr.response);
                //
                //     }
                // }
                // xhr.send();
            }
        });



    }

    getJoinableRooms() {
        var that = this;
        this.state.user.getJoinableRooms(
            (rooms) => {
                console.log('rooms: ', rooms);
                that.setState({joinableRooms: rooms});
                let messages = [];
                for (let i = 0; i < rooms.length; i++) {
                    messages.push([]);
                }
                that.setState({messages: messages});
                for(let i = 0; i < rooms.length; i++) {
                    this.subscribeToRoom(rooms[i]);
                }
            },
            (error) => {
                console.log('error getting rooms: ', error);
            });
    }

    selected(index) {
        console.log(this.state.userRooms);
        console.log('clicked', index);
        this.setState({selected: index});
        console.log('selected: ', this.state.selected);
        this.fetchMessages(this.state.userRooms[index], index);
    }

    fetchMessages(room) {
        console.log('fetching messages');
        console.log(this.state.user, room);
        var that = this;
        this.state.user.fetchMessagesFromRoom(
            room,
            (messages) => {
                let allMessages = that.state.messages;
                allMessages[index] = messages;
                console.log('messages: ', messages);
                that.setState({messages: allMessages});
            },
            (error) => {
                console.log('error fetching messages: ');
                console.log('error: ', error[0].text);
                let allMessages = that.state.messages;
                allMessages[index] = error;
                that.setState({messages: allMessages});
            }
        )
    }

    // TO DO NEXT
    // ADD FEATURE TO CREATE NEW ROOMS
    // SHOW ALL ROOMS, EVEN THOSE WHICH HAVE NOT JOINED
    // WHEN CLICKED ON NOT JOINED, SEND REQUEST TO JOIN THEM
    // NOTIFY WHEN GET A NEW MESSAGE

    sendMessage(event) {
        event.preventDefault();
        console.log('sending message');
        let message = this.state.currentMessage;
        var that = this;
        this.state.user.addMessage(
            message,
            that.state.userRooms[that.state.selected],
            (messageId) => {
                console.log(`Added message to ${that.state.userRooms[that.state.selected].name}`);
            },
            (error) => {
                console.log('error sending message: ', error);
            });
    }

    subscribeToRoom(room) {
        this.state.user.subscribeToRoom(
            room,
            {
                newMessage: (message) => {
                    console.log(`Received new message ${message.text}`);
                }
            }
        )
    }

    handleCurrentMessage(event) {
        this.setState({currentMessage: event.target.value})
    }


    render() {

        // {this.state.userRooms.map((room, i) => <div><Room room={room}/><br/></div>)}
        // {this.state.joinableRooms.map((room, i) => <Room room={room} />)}
        var that = this;

        function rowRenderer ({
                                  key,         // Unique key within array of rows
                                  index,       // Index of row within collection
                                  isScrolling, // The List is currently being scrolled
                                  isVisible,   // This row is visible within the List (eg it is not an overscanned row)
                                  style        // Style object to be applied to row (to position it)
                              }) {
            return (
                <Room
                    key={key}
                    style={style}
                    index={index}
                    selected={that.selected} room={that.state.userRooms[index]}>

                </Room>
            );
        }

        var data;
        if (this.state.messages.length > 0) {
            data = this.state.messages[this.state.selected]
                .map((message, i) => <Message message={message} index={index} key={i} />);
            console.log('data: ', data);
        }

        return (
            <div className="container">
                <div className="modal fade" id="myModal" tabIndex="-1" role="dialog"
                     aria-labelledby="myModalLabel">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-body">
                                <form onSubmit={this.handleSubmit.bind(this)}>
                                    <input autoFocus="true" className="form-control"
                                           type="text" name="username" value={this.state.username}
                                           placeholder="Your Username"
                                           onChange={this.handleUsernamechange.bind(this)} required /><br/>
                                    <button type="submit" className="btn btn-primary">
                                        Start Chatting</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-4 card"><br/>
                        <List
                            width={210}
                            height={500}
                            rowCount={that.state.userRooms.length}
                            rowHeight={50}
                            rowRenderer={rowRenderer}
                        />
                    </div>
                    <div className="col-sm-8 card">
                        { data}
                        <form onSubmit={this.sendMessage.bind(this)} style={{marginTop: 480 + 'px'}}>
                            <div className="row">
                                <div className="col-sm-10">
                                    <input onChange={this.handleCurrentMessage.bind(this)}
                                           value={this.state.currentMessage} id="message" className="form-control"/>
                                </div>
                                <div className="col-sm-2 ">
                                    <button className="btn btn-primary">Send</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <div>
        <App />
    </div>,
    document.getElementById("root")
);