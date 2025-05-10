import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My React App 6999</h1>
        <p className="subtitle">A modern web application built with React and TypeScript</p>
      </header>
      <main className="App-main">
        <section className="features">
          <div className="feature-card">
            <h2>🚀 Fast Development</h2>
            <p>Built with modern tools and best practices</p>
          </div>
          <div className="feature-card">
            <h2>💻 TypeScript</h2>
            <p>Type-safe code for better development experience</p>
          </div>
          <div className="feature-card">
            <h2>🎨 Modern Design</h2>
            <p>Clean and responsive user interface</p>
          </div>
        </section>
      </main>
      <footer className="App-footer">
        <p>Created with ❤️ using Create React App</p>
      </footer>
    </div>
  );
}

export default App;
