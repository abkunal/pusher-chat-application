import React from 'react';
import ReactDOM from 'react-dom';
import Chatkit from './chatkit';
import Room from './Room';
import Message from './Message';
import Alert from './Alert';
import Messages from './Messages';


class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',          // username of the user
            userRooms: [],         // all publicly visible rooms and private rooms of current user
            user: null,            // current user
            selected: 0,           // indicates which user is currently selected
            currentMessage: '',    // stores the message currently being typed
            messages: [],          // stores the messages across the rooms
            roomName: '',          // name of room to be created by user
            createdAt: new Date(), // the time at which user came to chatting
            newUser: '',           // username of the user to be added
            private: false,        // indicates whether the new room will be private or public
            userStatus: '',        // to show the loading process as user comes to chat
            reload: 'none'         // indicates to user when to reload
        };

        // bindings for helper functions
        this.setupPusher = this.setupPusher.bind(this);
        this.getJoinableRooms = this.getJoinableRooms.bind(this);
        this.selected = this.selected.bind(this);
        this.subscribeToRoom = this.subscribeToRoom.bind(this);
        this.addRoom = this.addRoom.bind(this);
    }

    // show initial modal to ask for username
    componentDidMount() {
        // set up modal
        $("#myModal").modal({
            backdrop: 'static',
            keyboard: false
        });
        $('#myModal').on('shown.bs.modal', function () {
            $('#username').focus()
        });
        $("#myModal").modal('show');
    }

    handleRoomNameChange(event) {
        this.setState({roomName: event.target.value});
    }

    handleCheckbox(event) {
        console.log(this.state.private);
        this.setState({private: event.target.checked});
    }

    handleUsernameChange(event) {
        this.setState({username: event.target.value});
    }

    // user provides the username
    handleSubmit(event) {
        event.preventDefault();

        // username has been given by the user
        if (this.state.username.trim() !== "") {
            this.setState({userStatus: 'Connecting...'});

            // fetch user information from pusher servers
            this.setupPusher();
        }
    }

    handleCurrentMessage(event) {
        this.setState({currentMessage: event.target.value})
    }

    handleAddUser(event) {
        this.setState({newUser: event.target.value});
    }

    // user creates a room
    addRoomHandler(event) {
        event.preventDefault();
        if (this.state.roomName.trim() !== '') {
            this.addRoom(this.state.roomName);
            this.setState({roomName: ''});
        }
    }

    // create a room
    addRoom(roomName) {
        console.log('add room ', roomName);
        var that = this;
        this.state.user.createRoom({name: roomName, private: this.state.private},
            (room) => {
                that.subscribeToRoom(room);
            }, (error) => {
                //console.log('Error creating room ', error);
            });
    }

    // user adds some other user to a room
    addUserToRoom(event) {
        event.preventDefault();
        var that = this;

        // validate username
        if (this.state.newUser.trim() !== '') {
            let newUser = this.state.newUser;

            this.state.user.addUser(
                newUser,
                this.state.userRooms[this.state.selected].id,
                () => {
                    // inform that a user has been added
                    let messages = that.state.messages;
                    try {
                        messages[that.state.selected].push({
                            text: `${this.state.user.id} added ${newUser} to room`,
                            isAlert: true
                        });
                    } catch (e) {
                        messages[that.state.selected] = [{
                            text: `${this.state.user.id} added ${newUser} to room`,
                            isAlert: true
                        }];
                    }
                    that.setState({messages: messages});
                },
                (error) => {
                    console.log(`Error adding ${newUser} to room ${this.state.userRooms[this.state.selected].id}: ${error}`);
                }
            );
            this.setState({newUser: ''});
        }

    }

    // create a new user if necessary and connect to Chatkit Server
    setupPusher() {
        // create a user and connect to chat server
        const tokenProvider = new Chatkit.TokenProvider({
            url: "/token",
            userId: this.state.username
        });

        const chatManager = new Chatkit.ChatManager({
            instanceLocator: "v1:us1:6b4c65c1-949b-4807-99ad-d5ad8c8ac52a",
            tokenProvider: tokenProvider
        });

        var that = this;
        chatManager.connect({
            delegate: {
                // when the current user is added to a room by some other user
                addedToRoom: (room) => {
                    that.subscribeToRoom(room);
                }
            },
            // username entered by the user is valid,
            onSuccess: (currentUser) => {
                //console.log('user: ', currentUser);
                this.setState({userStatus: 'Connected'});
                $("#myModal").modal("hide");

                // create messages array to store messages
                let messages = [];
                for (let i = 0; i < currentUser.rooms.length; i++) {
                    messages.push([]);
                }
                that.setState({
                    user: currentUser,
                    userRooms: currentUser.rooms,
                    messages: messages,
                });

                // subscribe user to all the rooms of which he/she is a member
                for (let i = 0; i < currentUser.rooms.length; i++) {
                   that.subscribeToRoom(currentUser.rooms[i]);
                }
                this.setState({createdAt: new Date()});

                // get all the public rooms of which user is not a member
                that.getJoinableRooms();

            },
            // username doesn't exist, so create a user with the given username
            onError: (error) => {
                that.setState({userStatus: 'Creating user, please wait...'});

                let xhr = new XMLHttpRequest();
                xhr.open('GET', '/user/?nickname=' + that.state.username);
                xhr.onreadystatechange = () => {
                    if (xhr.status === 200 && xhr.readyState === 4) {
                        // user created sucessfully, refresh page to continue
                        if (xhr.response === 'success') {
                            $("#modalBody").html(`Reload the page and use the username ${that.state.username} to continue`);
                        }
                    }
                }
                xhr.send();
            }
        });
    }

    // get all public rooms of which user is not a part
    getJoinableRooms() {
        var that = this;
        this.state.user.getJoinableRooms(
            (rooms) => {

                // store rooms and message
                let userRooms = that.state.userRooms;
                let messages = that.state.messages;
                for (let i = 0; i < rooms.length; i++) {
                    let index = -1;
                    for (let j = 0; j < userRooms.length; j++) {
                        if (rooms[i].id === userRooms[j].id) {
                            index = i;
                            break;
                        }
                    }
                    if (index === -1) {
                        userRooms.push(rooms[i]);
                        messages.push([]);
                    }
                }
                that.setState({userRooms: userRooms,messages: messages});
            },
            (error) => {
                console.log('error getting rooms: ', error);
            });
    }

    // user joins a room by clicking on the room in the rooms tab
    joinRoom(roomId, index) {
        var that = this;
        this.state.user.joinRoom(
            roomId,
            (room) => {
                let messages = that.state.messages;
                messages[index] = [{text: 'Room joined', isAlert: true}];

                that.setState({messages: messages});

                // subscribe to the room after joining it
                this.subscribeToRoom(this.state.userRooms[index]);
            },
            (error) => {
                console.log(`Error joining room ${roomId}: ${error}`);
            }
        );
    }

    // user has clicked on a room and hence selected it
    selected(index) {
        // show selected room messages
        let rooms = this.state.userRooms;
        rooms[this.state.selected].selected = false;
        rooms[index].selected = true;
        rooms[index].unread = '';

        this.setState({userRooms: rooms, selected: index});

        // whether user belong to this room or not
        let present = this.state.userRooms[index].userIds.indexOf(this.state.user.id);
        if (present === -1) {

            // show joining room message to the user while joining room
            let messages = this.state.messages;
            messages[index] = [{text: 'Joining Room, please wait', isAlert: true}];
            this.setState({messages: messages});
            this.joinRoom(this.state.userRooms[index].id, index);
        }
    }

    // send message to the currently selected group
    sendMessage(event) {
        event.preventDefault();

        // validate message
        if (this.state.currentMessage.trim() !== '') {
            if (this.state.userRooms[this.state.selected].length === 1) {
                if (this.state.userRooms[this.state.selected][0].isAlert === true &&
                    this.state.userRooms[this.state.selected][0].text.startsWith('Joining Room')) {
                    return;
                }
            }
            // get message from input field
            let message = this.state.currentMessage;

            // reset input field to empty
            this.setState({currentMessage: ''});
            var that = this;

            // add message to messages showing on the screen
            let allMessages = this.state.messages;
            let currentMsg = {
                text: message,
                sender: {
                    id: that.state.user.id,
                },
                status: 'sending',
                createdAt: ''
            };
            try {
                allMessages[this.state.selected].push(currentMsg);
            } catch (e) {
                allMessages[this.state.selected] = [];
                allMessages[this.state.selected].push(currentMsg);
            }
            let index = allMessages[this.state.selected].length - 1;
            this.setState({messages: allMessages});

            // scroll to the bottom
            let div = document.getElementById('messages');
            div.scrollTop = div.scrollHeight + 100;

            // add message to the specified
            this.state.user.addMessage(message, that.state.userRooms[that.state.selected],
                (messageId) => {

                    // message has been sent, update status of message
                    let allMessages = that.state.messages;
                    let currentMsg = {
                        text: message,
                        id: messageId,
                        sender: {
                            id: that.state.user.id,
                        },
                        status: 'sent',
                        createdAt: new Date().toISOString()
                    };

                    allMessages[that.state.selected][index] = currentMsg;
                    that.setState({messages: allMessages});
                },
                (error) => {
                    console.log('error sending message: ', error);

                    // set message status to failed
                    let allMessages = that.state.messages;
                    let currentMsg = {
                        text: message,
                        id: messageId,
                        sender: {
                            id: that.state.user.id,
                        },
                        status: 'message could not be sent'
                    };
                    allMessages[that.state.selected][index] = currentMsg;

                    that.setState({messages: allMessages});
                });
        }
    }

    // subscribe to the given room to get messages
    subscribeToRoom(room) {
        var that = this;
        this.state.user.subscribeToRoom(
            room,
            {
                newMessage: (message) => {
                    // fetch older messages
                    if (new Date(message.createdAt) < that.state.createdAt) {
                        let messages = that.state.messages;
                        for (let i = 0; i < that.state.userRooms.length; i++) {
                            if (that.state.userRooms[i].id === room.id) {
                                try {
                                    messages[i].push(message);
                                } catch (e) {
                                    messages[i] = [message];
                                }
                                break;
                            }
                        }
                        that.setState({messages: messages});
                    // show new messages in realtime
                    } else if (message.sender.id !== that.state.user.id) {

                        // play notification sound
                        document.getElementById('notificationSound').play();

                        // show number of unread messages
                        if (room.id !== that.state.userRooms[that.state.selected].id) {
                            let index = -1;
                            let rooms = that.state.userRooms;
                            for (let i = 0; i < rooms.length; i++) {
                                if (rooms[i].id === room.id) {
                                    if (rooms[i].unread) {
                                        rooms[i].unread += 1;
                                    } else {
                                        rooms[i].unread = 1;
                                    }
                                    index = i;
                                    break;
                                }
                            }
                            that.setState({userRooms: rooms});
                        }
                        // add message to list of messages to display
                        let messages = that.state.messages;
                        for (let i = 0; i < that.state.userRooms.length; i++) {
                            if (that.state.userRooms[i].id === room.id) {
                                try {
                                    messages[i].push(message);
                                } catch (e) {
                                    messages[i] = [message];
                                }
                                break;
                            }
                        }
                        that.setState({messages: messages});
                    }
                },
                userJoined: (user) => {
                    // a user joined a room
                    let messages = that.state.messages;
                    for (let i = 0; i < that.state.userRooms.length; i++) {
                        if (that.state.userRooms[i].id === room.id) {
                            try {
                                messages[i].push({isAlert: true, text: `${user.id} joined the room`});
                            } catch (e) {
                                messages[i] = [{isAlert: true, text: `${user.id} joined the room`}];
                            }
                            break;
                        }
                    }
                    that.setState({messages: messages});
                }
            }
        )
    }

    reloadPage() {
        document.location.reload();
    }

    render() {
        var that = this;
        var data, members;
        if (this.state.messages.length > 0) {
            if (this.state.messages[this.state.selected] !== undefined &&
                this.state.messages[this.state.selected].length > 0) {
                try {
                    // display members of the currently selected rooms
                    members = this.state.userRooms[this.state.selected].userIds
                        .map((id, i) => {
                            if (id === that.state.user.id) {
                                return <span key={i} className="text-success">You </span>
                            }
                            return <span key={i} className="text-success">{id} </span>
                        });

                } catch (e) {
                    members = '';
                }

                try {
                    // display messages
                    data = this.state.messages[this.state.selected]
                        .map((message, i) => {

                            if (message.isAlert === true) {
                                return <Alert key={i} text={message.text} />
                            } else {
                                return <Message userId={that.state.user.id} text={message.text} sender={message.sender.id}
                                                id={message.id}  index={i} time={message.createdAt}
                                                key={i} status={message.status}/>
                            }
                        });
                } catch (e) {
                    data = '';
                }

            } else {
                data = 'No messages so far';
            }
        }

        return (
            <div className="container"><br/>
                <div className="modal fade" id="myModal" tabIndex="-1" role="dialog"
                     aria-labelledby="myModalLabel">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-body" id="modalBody">
                                <form onSubmit={this.handleSubmit.bind(this)}>
                                    <input autoFocus="true" className="form-control"
                                           type="text" name="username" value={this.state.username}
                                           placeholder="Enter a nickname"
                                           onChange={this.handleUsernameChange.bind(this)} required /><br/>
                                    <button type="submit" className="btn btn-primary">
                                        Start Chatting</button>
                                </form>
                                <p className="text-center">{this.state.userStatus}</p>
                                <button id="reload" style={{display: this.state.reload}} onClick={this.reloadPage.bind(this)}>Reload Page</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-4 card" id="rooms">
                        <h3 className="text-center mt-3">Rooms</h3>
                        <br/>
                        <form onSubmit={this.addRoomHandler.bind(this)}>
                            <div className="row">
                            <div className="col-sm-12 text-center">
                                <input type="checkbox" value={this.state.private}
                                       onChange={this.handleCheckbox.bind(this)}/> private
                            </div>
                            <div className="col-sm-12"><br/>
                                <input value={this.state.roomName} className="form-control"
                                       type="text" id="roomName" placeholder="Room Name"
                                       onChange={this.handleRoomNameChange.bind(this)} required />
                            </div></div><br/>
                            <button className="btn btn-outline-info btn-block">Add Room</button><br/>

                            <br/>
                        </form>
                        <div  style={{height: 450 + 'px', overflowY: 'auto'}}>
                            {that.state.userRooms.map((room, i) => <Room selected={that.selected} unread={room.unread} selectedIndex={that.state.selected} key={i} index={i} room={room} />)}

                        </div>
                    </div>
                    <div className="col-sm-8 card">
                        <h3 className="mt-3 mb-3 text-center">Messages</h3>
                        <form onSubmit={this.addUserToRoom.bind(this)}>
                            <div className="row">
                                <div className="col-12 col-sm-6">
                                    <input required onChange={this.handleAddUser.bind(this)}
                                           value={this.state.newUser} id="message"
                                           className="form-control" placeholder="Username" /><br/>
                                </div>
                                <div className="col-12 col-sm-6 ">
                                    <button className="btn btn-outline-primary btn-block">Add User to Room</button>
                                </div>
                            </div>
                        </form>
                        <p>Members: {members}</p>
                        <div className="row">
                            <Messages>
                                {data}
                            </Messages>
                            <div className="col-sm-12">
                                <form onSubmit={this.sendMessage.bind(this)}>
                                    <div className="row">
                                        <div className="col-sm-10">
                                            <input required onChange={this.handleCurrentMessage.bind(this)}
                                                   value={this.state.currentMessage} id="message" placeholder="Type a message" className="form-control"/>
                                        </div>
                                        <div className="col-sm-2 ">
                                            <button className="btn btn-primary">Send</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
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