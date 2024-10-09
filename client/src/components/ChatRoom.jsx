import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './ChatRoom.css';

const socket = io('http://localhost:3500');

function ChatRoom() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [users, setUsers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [activity, setActivity] = useState('');

    const chatDisplayRef = useRef(null);

    useEffect(() => {
        socket.on('message', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        socket.on('userList', ({ users }) => {
            setUsers(users);
        });

        socket.on('roomList', ({ rooms }) => {
            setRooms(rooms);
        });

        socket.on('activity', (name) => {
            setActivity(`${name} is typing...`);
            setTimeout(() => setActivity(''), 3000);
        });

        return () => {
            socket.off('message');
            socket.off('userList');
            socket.off('roomList');
            socket.off('activity');
        };
    }, []);

    useEffect(() => {
        if (chatDisplayRef.current) {
            chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (name && inputMessage && room) {
            socket.emit('message', {
                name: name,
                text: inputMessage
            });
            setInputMessage('');
        }
    };

    const enterRoom = (e) => {
        e.preventDefault();
        if (name && room) {
            socket.emit('enterRoom', {
                name: name,
                room: room
            });
        }
    };

    return (
        <main>
            <form onSubmit={enterRoom}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                />
                <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="Chat room"
                    required
                />
                <button type="submit">Join</button>
            </form>

            <ul className="chat-display" ref={chatDisplayRef}>
                {messages.map((msg, index) => (
                    <li key={index} className={`post ${msg.name === name ? 'post--right' : 'post--left'}`}>
                        <div className={`post__header ${msg.name === name ? 'post__header--user' : 'post__header--reply'}`}>
                            <span className="post__header--name">{msg.name}</span>
                            <span className="post__header--time">{msg.time}</span>
                        </div>
                        <div className="post__text">{msg.text}</div>
                    </li>
                ))}
            </ul>

            <p className="activity">{activity}</p>

            <form onSubmit={sendMessage}>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => {
                        setInputMessage(e.target.value);
                        socket.emit('activity', name);
                    }}
                    placeholder="Your message"
                    required
                />
                <button type="submit">Send</button>
            </form>

            <div className="user-list">
                <h3>Users in room:</h3>
                {users.map((user, index) => (
                    <span key={index}>{user.name}{index < users.length - 1 ? ', ' : ''}</span>
                ))}
            </div>

            <div className="room-list">
                <h3>Active Rooms:</h3>
                {rooms.map((room, index) => (
                    <span key={index}>{room}{index < rooms.length - 1 ? ', ' : ''}</span>
                ))}
            </div>
        </main>
    );
}

export default ChatRoom;
