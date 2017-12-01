import React from 'react';
import ReactDOM from 'react-dom';
import { List } from 'react-virtualized';
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
            newUser: ''
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

    addRoomHandler(event) {
        event.preventDefault();
        this.addRoom(this.state.roomName);
        this.setState({roomName: ''});
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
        $("#myModal").modal('show');
    }

    addRoom(roomName) {
        console.log('add room ', roomName);
        var that = this;
        this.state.user.createRoom({name: roomName},
            (room) => {
                console.log('created public room called ', room.name);
                let rooms = that.state.userRooms;
                rooms.push(room);
                let messages = that.state.messages;
                messages.push([]);
                that.setState({userRooms: rooms, messages: messages});
            }, (error) => {
                console.log('Error creating room ', error);
            });
    }

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
            url: "/token",
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

                let userRooms = that.state.userRooms;
                userRooms = userRooms.concat(rooms);
                let messages = that.state.messages;
                for (let i = 0; i < rooms.length; i++) {
                    messages.push([]);
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
                console.log(`Joined room with ID: ${room.id}`);

                let userRooms = that.state.userRooms;
                userRooms[index].userIds.push(that.state.user.id);

                let messages = that.state.messages;
                messages[index] = [{text: 'Room joined', isAlert: true}];

                that.setState({userRooms: userRooms, messages: messages});

                // subscribe to the room after joining it
                this.subscribeToRoom(this.state.userRooms[index]);
            },
            (error) => {
                console.log(`Error joining room ${roomId}: ${error}`);
            }
        );
    }

    selected(index) {
        console.log('selected');
        // show selected room messages
        let rooms = this.state.userRooms;
        rooms[this.state.selected].selected = false;
        rooms[index].selected = true;

        this.setState({userRooms: rooms, selected: index});

        // whether user belong to this room or not
        let present = this.state.userRooms[index].userIds.indexOf(this.state.user.id);

        if (present === -1) {
            console.log('not a member');

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
                console.log('messages: ', messages);
                that.setState({messages: allMessages});
            },
            (error) => {
                console.log('error fetching messages: ');
                console.log('error: ', error);
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

        // if user is still joining the room, don't send the message
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
        allMessages[this.state.selected].push(currentMsg);
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
                console.log(allMessages, messageId);
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

    subscribeToRoom(room) {
        console.log('subscribeToRoom');
        var that = this;
        this.state.user.subscribeToRoom(
            room,
            {
                newMessage: (message) => {
                    //console.log(`Received new message ${message.text} in room ${room.name}`);

                    console.log(new Date(message.createdAt), that.state.createdAt);
                    if (new Date(message.createdAt) < that.state.createdAt) {
                        let messages = that.state.messages;
                        for (let i = 0; i < that.state.userRooms.length; i++) {
                            if (that.state.userRooms[i].id === room.id) {
                                messages[i].push(message);
                                break;
                            }
                        }
                        that.setState({messages: messages});
                    } else if (message.sender.id !== that.state.user.id) {

                            // add message to list of messages to display
                            let messages = that.state.messages;
                            for (let i = 0; i < that.state.userRooms.length; i++) {
                                if (that.state.userRooms[i].id === room.id) {
                                    messages[i].push(message);
                                    break;
                                }
                            }
                            that.setState({messages: messages});
                    }
                },
                userJoined: (user) => {
                    let messages = that.state.messages;
                    for (let i = 0; i < that.state.userRooms.length; i++) {
                        if (that.state.userRooms[i].id === room.id) {
                            messages[i].push({isAlert: true, text: `${user.id} joined the room`});
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

        this.state.user.addUser(
            this.state.newUser,
            this.state.userRooms[this.state.selected].id,
            () => {
                console.log(`Added ${this.state.newUser} to room 
                    ${this.state.userRooms[this.state.selected].id}`);
                let messages = that.state.userRooms;
                messages[that.state.selected].push({
                    text: `${this.state.user.id} added ${this.state.userRooms[this.state.selected].id} to room`,
                    isAlert: true
                });
                that.setState({messages: messages});
            },
            (error) => {
                console.log(`Error adding ${this.state.newUser} to room 
                    ${this.state.userRooms[this.state.selected].id}: ${error}`);
            }
        );
        this.setState({newUser: ''});
    }

    render() {
        var that = this;
        var data, members;
        if (this.state.messages.length > 0) {
            if (this.state.messages[this.state.selected] !== undefined &&
                this.state.messages[this.state.selected].length > 0) {
                members = this.state.userRooms[this.state.selected].userIds
                    .map((id, i) => {
                        if (id === that.state.user.id) {
                            return <span className="text-success">You </span>
                        }
                        return <span className="text-success">{id} </span>
                    });

                console.log(members);
                if (this.state.userRooms[this.state.selected].userIds.indexOf(this.state.user.id) === -1) {
                    members.push(<span className="text-success">You </span>)
                }

                data = this.state.messages[this.state.selected]
                    .map((message, i) => {

                        if (message.isAlert === true) {
                            return <Alert text={message.text} />
                        } else {
                            return <Message userId={that.state.user.id} text={message.text} sender={message.sender.id}
                                            id={message.id}  index={i} time={message.createdAt}
                                            key={i} status={message.status}/>
                        }
                    });
            } else {
                data = 'No messages so far';
            }
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
                    <div className="col-sm-4 card" id="rooms"><br/>
                        <form onSubmit={this.addRoomHandler.bind(this)}>
                            <button className="btn btn-outline-info btn-block">Add Room</button><br/>
                            <input value={this.state.roomName} className="form-control"
                                   type="text" id="roomName" placeholder="Room Name"
                                    onChange={this.handleRoomNameChange.bind(this)}/><br/>
                        </form>
                        <p className="text-center">Rooms</p>
                        <div  style={{height: 450 + 'px', overflowY: 'auto'}}>
                            {that.state.userRooms.map((room, i) => <Room selected={that.selected} selectedIndex={that.state.selected} key={i} index={i} room={room} />)}

                        </div>
                    </div>
                    <div className="col-sm-8 card"><br/>
                        <form onSubmit={this.addUserToRoom.bind(this)}>
                            <div className="row">
                                <div className="col-sm-10">
                                    <input onChange={this.handleAddUser.bind(this)}
                                           value={this.state.newUser} id="message"
                                           className="form-control" placeholder="Username" />
                                </div>
                                <div className="col-sm-2 ">
                                    <button className="btn btn-primary">Add User</button>
                                </div>
                            </div>
                        </form><br/>
                        <p>Members - {members}</p>
                        <div className="row">
                            <Messages>
                                {data}
                            </Messages>
                            <div className="col-sm-12">
                                <form onSubmit={this.sendMessage.bind(this)}>
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