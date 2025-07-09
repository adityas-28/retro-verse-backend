# RetroVerse Multiplayer Integration Context

## Overview
RetroVerse is a web-based virtual arcade room where players can log in, move their avatars around a shared map, and interact in real time. The frontend is built with Phaser (for the game) and React (for the UI), and the backend is an Express server with MongoDB for user management and persistent data.

---

## Current State

### Frontend
- Phaser game with a player character that can move around a map.
- Animations for movement in four directions.
- Camera follows and zooms on the player.
- No multiplayer yet (only local movement).

### Backend
- Express server with endpoints for:
  - **Sign up**
  - **Login**
  - **Logout**
- MongoDB stores:
  - Player name
  - Coins
  - Tickets

---

## Goal: Add Real-Time Multiplayer

**Objective:**
Integrate real-time multiplayer so that:
- Each logged-in player can see other players moving in the same arcade room.
- Player positions and movements are synchronized in real time.
- The server manages the state of all connected players and broadcasts updates.

---

## What Needs to Be Achieved on the Server Side

1. **Integrate Socket.IO with the existing Express server:**
   - Allow real-time, bidirectional communication between the server and all connected clients.

2. **Player Session Management:**
   - When a player connects via Socket.IO, associate their socket with their authenticated user session (from login).
   - Only allow authenticated users to join the multiplayer room.

3. **Player State Synchronization:**
   - When a player moves, the client sends their new position/direction to the server via Socket.IO.
   - The server broadcasts this update to all other connected clients.
   - When a new player joins, the server sends them the current state of all other players.

4. **Player Join/Leave Handling:**
   - When a player connects, add them to the list of active players and notify others.
   - When a player disconnects, remove them and notify others.

5. **(Optional, for future):**
   - Persist player positions, coins, and tickets in MongoDB as needed.
   - Add features like chat, mini-games, or item interactions.

---

## Example Server-Side Flow

1. **Client connects via Socket.IO after login.**
2. **Server authenticates the socket connection.**
3. **Server adds the player to the active player list and sends the current player list to the new client.**
4. **When a player moves, the client emits a `move` event with their new position.**
5. **Server receives the move, updates the player’s state, and broadcasts the new position to all other clients.**
6. **When a player disconnects, the server removes them from the active list and notifies others.**

---

## Summary Table

| Feature                | Current | Goal (with Socket.IO)         |
|------------------------|---------|-------------------------------|
| Login/Signup/Logout    | Yes     | Yes                           |
| Player Data (DB)       | Yes     | Yes                           |
| Real-Time Multiplayer  | No      | Yes (with Socket.IO)          |
| Player Movement Sync   | No      | Yes (server broadcasts moves) |
| Player Join/Leave Sync | No      | Yes                           |

---

## What You Need from the Backend Team

- Integrate Socket.IO into the existing Express server.
- Add logic to manage real-time player connections, movement, and state broadcasting.
- Ensure only authenticated users can connect to the multiplayer room.
- Provide endpoints/events for the frontend to send/receive player state. 