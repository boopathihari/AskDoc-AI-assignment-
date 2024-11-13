import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleQuestionChange = (e) => setQuestion(e.target.value);

  const handleSubmit = async () => {
    if (!file || !question.trim()) {
      alert("Please upload a file and enter a question.");
      return;
    }

    // Display user's question
    setChatMessages([...chatMessages, { sender: 'You', text: question }]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("question", question);

    setLoading(true); // Start loading animation

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const answer = response.data.answer || "No answer received.";
      
      // Display bot's response
      setChatMessages([...chatMessages, { sender: 'You', text: question }, { sender: 'Bot', text: answer }]);
    } catch (error) {
      console.error("Error uploading file or sending question:", error);
    } finally {
      setLoading(false); // Stop loading animation
    }
  };

  return (
    <div className="App">
      <div className="uploadForm">
        <h1>ASK DOC</h1>
        <div className="inputContainer">
          {/* Custom file button */}
          <label className="customButton" htmlFor="fileUpload">
            Choose a file
          </label>
          <input
            type="file"
            id="fileUpload"
            className="fileInput"
            onChange={handleFileChange}
          />
          {/* Display file name after selecting a file */}
          {file && <p className="fileName">Selected: {file.name}</p>}
        </div>
        
        <div className="inputContainer">
          <label htmlFor="fileQuestion">Question:</label>
          <input
            type="text"
            id="fileQuestion"
            placeholder="Enter your question"
            value={question}
            onChange={handleQuestionChange}
          />
        </div>
        
        <button className="submitButton" onClick={handleSubmit}>
          {loading ? "Loading..." : "Send"}
        </button>
      </div>
      
      <div className="chatContainer">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`chatMessage ${msg.sender === 'You' ? 'userMessage' : 'botMessage'}`}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
