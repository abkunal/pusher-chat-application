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
            username: '',
            userRooms: [],
            joinableRooms: [],
            users: [],
            user: null,
            selected: 0,
            currentMessage: '',
            messages: [],
            roomName: '',
            createdAt: new Date(),
            newUser: '',
            private: false,
            userStatus: '',
            reload: 'none'
        };

        this.setupPusher = this.setupPusher.bind(this);
        this.getJoinableRooms = this.getJoinableRooms.bind(this);
        this.selected = this.selected.bind(this);
        this.subscribeToRoom = this.subscribeToRoom.bind(this);
        this.fetchMessages = this.fetchMessages.bind(this);
        this.addRoom = this.addRoom.bind(this);
    }

    handleRoomNameChange(event) {
        this.setState({roomName: event.target.value});
    }

    handleCheckbox(event) {
        console.log(this.state.private);
        this.setState({private: event.target.checked});
    }

    addRoomHandler(event) {
        event.preventDefault();
        if (this.state.roomName.trim() !== '') {
            this.addRoom(this.state.roomName);
            this.setState({roomName: ''});
        }
    }

    handleUsernamechange(event) {
        this.setState({username: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();

        // username and Name has been given by the user
        if (this.state.username.trim() !== "") {
            this.setState({userStatus: 'Connecting...'});
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
        $("#myModal").modal('show');
    }

    addRoom(roomName) {
        console.log('add room ', roomName);
        var that = this;
        this.state.user.createRoom({name: roomName, private: this.state.private},
            (room) => {
                //console.log('created public room called ', room.name);
                let rooms = that.state.userRooms;
                rooms.push(room);
                let messages = that.state.messages;
                messages.push([]);
                that.setState({userRooms: rooms, messages: messages});
                that.subscribeToRoom(room);
                that.removeDuplicates();
            }, (error) => {
                //console.log('Error creating room ', error);
            });
    }


    setupPusher() {
        // create a user and connect to chat server
        console.log('executed');


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
                addedToRoom: (room) => {
                    console.log('Added to room ' + room.name);
                    let index  = -1;
                    let rooms = that.state.userRooms;
                    let messages= that.state.messages;
                    for (let i = 0; i < rooms.length; i++) {
                        if (rooms[i].id === room.id) {
                            index = i;
                            break;
                        }
                    }
                    if (index === -1) {
                        rooms.push(room);
                        console.log('first one', messages);
                        messages.push([{isAlert: true, text: 'You have been added to ' + room.name}]);
                        that.setState({userRooms: rooms, messages: messages});
                        that.subscribeToRoom(room);
                    } else {
                        console.log('second one', messages);
                        try {
                            messages[index].push({isAlert: true, text: 'You have been added to ' + room.name});
                        } catch (e) {
                            messages[index] = [{isAlert: true, text: 'You have been added to ' + room.name}];
                        }
                        that.setState({messages: messages});
                        that.subscribeToRoom(room);
                    }
                },
                // userCameOnline: (user) => {
                //     console.log(`user ${user.id} came online`);
                //     let messages = that.state.messages;
                //     console.log('userCameOnline ', messages);
                //     for (let i = 0; i < that.state.userRooms.length; i++) {
                //         if (that.state.userRooms[i].userIds.indexOf(user.id) !== -1) {
                //             console.log(i);
                //             messages[i].push({isAlert: true, text: `${user.id} came online`});
                //         }
                //     }
                //     that.setState({messages: messages});
                //
                // },
                // userWentOffline: (user) => {
                //     console.log(`user ${user.id} went offline`);
                //     let messages = that.state.messages;
                //     console.log('userWentOffline ', messages);
                //     for (let i = 0; i < that.state.userRooms.length; i++) {
                //         if (that.state.userRooms[i].userIds.indexOf(user.id) !== -1) {
                //             console.log(i);
                //             messages[i].push({isAlert: true, text: `${user.id} went offline`});
                //         }
                //     }
                //     that.setState({messages: messages});
                //
                // }
            },
            onSuccess: (currentUser) => {
                console.log('user: ', currentUser);
                this.setState({userStatus: 'Connected'});
                $("#myModal").modal("hide");

                let messages = [];
                for (let i = 0; i < currentUser.rooms.length; i++) {
                    messages.push([]);
                }
                that.setState({
                    user: currentUser,
                    userRooms: currentUser.rooms,
                    messages: messages,
                });
                for (let i = 0; i < currentUser.rooms.length; i++) {
                   that.subscribeToRoom(currentUser.rooms[i]);
                }
                this.setState({createdAt: new Date()});

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
                //console.log(error);
                //console.log('some error occured, please refresh the page');

                that.setState({userStatus: 'Creating user, please wait...'});

                let xhr = new XMLHttpRequest();
                xhr.open('GET', '/user/?nickname=' + that.state.username);
                xhr.onreadystatechange = () => {
                    if (xhr.status === 200 && xhr.readyState === 4) {
                        //console.log('response: ', xhr.response);
                        if (xhr.response === 'success') {
                            $("#modalBody").html(`Reload the page and use the username ${that.state.username} to continue`);
                            // that.setState({userStatus: 'User created, reload the page and enter the username - ' + that.state.username + ' to continue'});
                            // that.setState({reload: 'inherit'});
                        }
                    }
                }
                xhr.send();
            }
        });



    }

    getJoinableRooms() {
        var that = this;
        this.state.user.getJoinableRooms(
            (rooms) => {
                console.log('rooms: ', rooms);

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
                console.log('Joinable rooms messages: ', messages);
                that.setState({userRooms: userRooms,messages: messages});
                // for(let i = 0; i < rooms.length; i++) {
                //     this.subscribeToRoom(rooms[i]);
                // }
            },
            (error) => {
                console.log('error getting rooms: ', error);
            });
    }

    joinRoom(roomId, index) {
        console.log('joinRoom');
        var that = this;
        this.state.user.joinRoom(
            roomId,
            (room) => {
                //console.log(`Joined room with ID: ${room.id}`);

                let messages = that.state.messages;
                messages[index] = [{text: 'Room joined', isAlert: true}];

                that.setState({messages: messages});

                // subscribe to the room after joining it
                this.subscribeToRoom(this.state.userRooms[index]);
            },
            (error) => {
                //console.log(`Error joining room ${roomId}: ${error}`);
            }
        );
    }

    selected(index) {
        console.log('selected');
        // show selected room messages
        let rooms = this.state.userRooms;
        rooms[this.state.selected].selected = false;
        rooms[index].selected = true;
        rooms[index].unread = '';

        this.setState({userRooms: rooms, selected: index});

        // whether user belong to this room or not
        let present = this.state.userRooms[index].userIds.indexOf(this.state.user.id);

        if (present === -1) {
            //console.log('not a member');

            // show joining room message to the user while joining room
            let messages = this.state.messages;
            messages[index] = [{text: 'Joining Room, please wait', isAlert: true}];
            this.setState({messages: messages});
            this.joinRoom(this.state.userRooms[index].id, index);
        }
    }


    fetchMessages(room, index) {
        console.log('fetching messages');
        var that = this;
        this.state.user.fetchMessagesFromRoom(
            room,
            (messages) => {
                let allMessages = that.state.messages;
                allMessages[index] = messages;
                //console.log('messages: ', messages);
                that.setState({messages: allMessages});
            },
            (error) => {
                //console.log('error fetching messages: ');
                //console.log('error: ', error);
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
                    console.log(`Added message to ${that.state.userRooms[that.state.selected].name}`);

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

    subscribeToRoom(room) {
        //console.log('subscribeToRoom');
        var that = this;
        this.state.user.subscribeToRoom(
            room,
            {
                newMessage: (message) => {
                    console.log(`Received new message ${message.text} in room ${room.name}`);

                    //console.log(new Date(message.createdAt), that.state.createdAt);
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
                    } else if (message.sender.id !== that.state.user.id) {

                            // add message to list of messages to display
                            // display notification
                        document.getElementById('notificationSound').play();
                        if (room.id !== that.state.userRooms[that.state.selected].id) {

                                // play notification sound
                                //document.getElementById('notificationSound').play();
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
                    //console.log('userJoined');
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

    handleCurrentMessage(event) {
        this.setState({currentMessage: event.target.value})
    }

    handleAddUser(event) {
        this.setState({newUser: event.target.value});
    }



    addUserToRoom(event) {
        event.preventDefault();
        var that = this;

        if (this.state.newUser.trim() !== '') {
            let newUser = this.state.newUser;
            this.state.user.addUser(
                newUser,
                this.state.userRooms[this.state.selected].id,
                () => {
                    console.log(`Added ${this.state.newUser} to room ${this.state.userRooms[this.state.selected].id}`);
                    let messages = that.state.userRooms;
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

    removeDuplicates() {
        let rooms = this.state.userRooms;
        let newRooms = [];
        for (let i = 0; i < rooms.length; i++) {
            let index = -1;
            for (let j = 0; j < newRooms.length; j++) {
                if (rooms[i].id === newRooms[j].id) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                newRooms.push(rooms[i]);
            }
        }
        this.setState({userRooms: newRooms});
    }

    reloadPage() {
        document.location.reload();
    }

    render() {
        var that = this;
        var data, members;
        //console.log(this.state.userRooms, this.state.messages);
        if (this.state.messages.length > 0) {
            if (this.state.messages[this.state.selected] !== undefined &&
                this.state.messages[this.state.selected].length > 0) {
                try {
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
                                           placeholder="Your Username"
                                           onChange={this.handleUsernamechange.bind(this)} required /><br/>
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