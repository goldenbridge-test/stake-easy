import React from 'react';
import ReactDOM from 'react-dom';
import Headers from './Headers';
import About from './About';
import Projects from './Projects';
import Experience from './Experience';
import Social from './Social';
import Footer from './Footer';

function Team() {
  return (
    <div className="Team">
      <Headers />
      <About />
      <Projects />
      <Experience />
      <Social />
      <Footer />
    </div>
  );
}

ReactDOM.render(<Team />, document.getElementById('root'));

export default Team;
