import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook for Socket.IO connection with authentication
 * @returns {Object} Socket instance and connection state
 */
export function useSocket() {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.log('No token found, skipping socket connection');
            return;
        }

        // Initialize socket with auth
        const socket = io('http://localhost:3000', {
            auth: {
                token
            },
            autoConnect: true
        });

        socket.on('connect', () => {
            console.log('✓ Socket connected');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('✗ Socket disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            setIsConnected(false);
        });

        socketRef.current = socket;

        // Cleanup on unmount
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    return {
        socket: socketRef.current,
        isConnected
    };
}

/**
 * Hook to listen to socket events
 * @param {string} eventName - Event to listen to
 * @param {Function} handler - Event handler function
 */
export function useSocketEvent(eventName, handler) {
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on(eventName, handler);

        return () => {
            socket.off(eventName, handler);
        };
    }, [socket, eventName, handler]);
}
