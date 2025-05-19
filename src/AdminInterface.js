import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import QRCode from "react-qr-code";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

const AdminInterface = () => {
  const [gameCode, setGameCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const savedGameCode = localStorage.getItem("adminGameCode");
    if (savedGameCode) {
      setGameCode(savedGameCode);
      socket.emit("create_game", { gameCode: savedGameCode });
      setGameStarted(true);
    }
  }, []);

  useEffect(() => {
    socket.on("player_list", (players) => {
      setPlayers(players);
    });

    socket.on("buzz_update", (players) => {
      setPlayers(players);
    });

    socket.on("buzz_reset", (players) => {
      setPlayers(players);
    });

    return () => {
      socket.off("player_list");
      socket.off("buzz_update");
      socket.off("buzz_reset");
    };
  }, []);

  const generateGameCode = () => {
    const code = uuidv4().slice(0, 6).toUpperCase();
    setGameCode(code);
    setPlayers([]);
    setGameStarted(false);
    socket.emit("create_game", { gameCode: code });
    localStorage.setItem("adminGameCode", code);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const unlockBuzzers = () => {
    socket.emit("reset_buzzers", { gameCode });
    socket.emit("buzzers_ready", { gameCode });
  };

  const awardPoints = (playerName, points) => {
    socket.emit("update_score", { gameCode, playerName, points });
  };

  const resetGame = () => {
    localStorage.removeItem("adminGameCode");
    setGameCode("");
    setGameStarted(false);
    setPlayers([]);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Admin Interface</h1>

      {!gameCode && (
        <button onClick={generateGameCode} style={buttonStyle}>Start New Game</button>
      )}

      {gameCode && !gameStarted && (
        <>
          <p><strong>Game Code:</strong> {gameCode}</p>
          <QRCode value={gameCode} size={128} />
          <h2 style={{ fontWeight: 'bold', marginTop: '1rem' }}>Players Joined:</h2>
          <ul>
            {players.map((p, i) => <li key={i}>{p.name}</li>)}
          </ul>
          <button onClick={startGame} style={{ ...buttonStyle, marginTop: '1rem' }}>Begin Game</button>
          <button onClick={resetGame} style={{ ...buttonStyle, marginTop: '0.5rem', backgroundColor: '#ef4444' }}>Reset Game</button>
        </>
      )}

      {gameStarted && (
        <>
          <h2 style={{ fontWeight: 'bold', marginTop: '2rem' }}>Game Screen</h2>
          <button onClick={unlockBuzzers} style={{ ...buttonStyle, marginBottom: '1rem' }}>
            Unlock Buzzers
          </button>
          <button onClick={resetGame} style={{ ...buttonStyle, marginBottom: '1rem', backgroundColor: '#ef4444' }}>
            Reset Game
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {players.map((player, index) => (
              <div key={index} style={cardStyle}>
                <p style={{ fontWeight: 'bold', textAlign: 'center' }}>
                  {player.buzzOrder ? `#${player.buzzOrder}` : player.name}
                </p>
                <p style={{ textAlign: 'center' }}>Score: {player.score}</p>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '0.5rem' }}>
                  {[100, 200, 300, 400, 500].map((pts) => (
                    <button
                      key={pts}
                      onClick={() => awardPoints(player.name, pts)}
                      style={smallButtonStyle}
                    >
                      +{pts}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
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

const smallButtonStyle = {
  backgroundColor: '#10b981',
  color: 'white',
  padding: '0.25rem 0.5rem',
  border: 'none',
  borderRadius: '0.25rem',
  cursor: 'pointer'
};

const cardStyle = {
  border: '1px solid #ccc',
  padding: '1rem',
  borderRadius: '1rem',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
};

export default AdminInterface;



