import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("https://jeopardy-buzzer-app.onrender.com");

const PlayerInterface = () => {
  const [joined, setJoined] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [scores, setScores] = useState([]);
  const [buzzerReady, setBuzzerReady] = useState(false);
  const [buzzOrder, setBuzzOrder] = useState(null);
  const [hasBuzzed, setHasBuzzed] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    const storedGame = localStorage.getItem("gameCode");
    if (storedName && storedGame) {
      setPlayerName(storedName);
      setGameCode(storedGame);
      socket.emit("join_game", { gameCode: storedGame, playerName: storedName });
      setJoined(true);
    }
  }, []);

  useEffect(() => {
    socket.on("player_list", (players) => {
      setScores(players);
    });

    socket.on("buzz_update", (players) => {
      const player = players.find((p) => p.name === playerName);
      if (player) {
        setBuzzOrder(player.buzzOrder);
        setHasBuzzed(true);
      }
    });

    socket.on("buzz_reset", () => {
      setBuzzOrder(null);
      setHasBuzzed(false);
      setBuzzerReady(false);
    });

    socket.on("buzzers_ready", () => {
      setBuzzerReady(true);
    });

    return () => {
      socket.off("player_list");
      socket.off("buzz_update");
      socket.off("buzz_reset");
      socket.off("buzzers_ready");
    };
  }, [playerName]);

  const joinGame = () => {
    if (playerName && gameCode) {
      localStorage.setItem("playerName", playerName);
      localStorage.setItem("gameCode", gameCode);
      socket.emit("join_game", { gameCode, playerName });
      setJoined(true);
    }
  };

  const handleBuzz = () => {
    if (!hasBuzzed && buzzerReady) {
      socket.emit("buzz", { gameCode });
    }
  };

  if (!joined) {
    return (
      <div style={{ padding: '1rem', maxWidth: '400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Join Game</h1>
        <input
          type="text"
          placeholder="Enter Game Code"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Enter Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          style={inputStyle}
        />
        <button onClick={joinGame} style={buttonStyle}>Join Game</button>
      </div>
    );
  }

  if (buzzerReady) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
        <button
          onClick={handleBuzz}
          style={{ width: '75%', height: '300px', borderRadius: '9999px', backgroundColor: '#f43f5e', color: 'white', fontSize: '2rem', border: 'none' }}
        >
          BUZZ
        </button>
        {buzzOrder !== null && (
          <p style={{ marginTop: '1rem', fontSize: '1.25rem' }}>You buzzed in #{buzzOrder}</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Players & Scores</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
        {scores.map((player, idx) => (
          <div key={idx} style={cardStyle}>
            <p style={{ fontWeight: 'bold', textAlign: 'center' }}>{player.name}</p>
            <p style={{ textAlign: 'center' }}>{player.score} pts</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '0.5rem',
  marginBottom: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  fontSize: '1rem'
};

const buttonStyle = {
  backgroundColor: '#4f46e5',
  color: 'white',
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const cardStyle = {
  border: '1px solid #ccc',
  padding: '0.75rem',
  borderRadius: '1rem',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
};

export default PlayerInterface;


