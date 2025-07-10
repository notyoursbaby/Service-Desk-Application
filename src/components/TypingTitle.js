import React, { useState, useEffect } from 'react';

const messages = [
  'Welcome to Service Desk',
  'सर्विस डेस्क में आपका स्वागत ',
  'సర్వీస్ డెస్క్‌కి స్వాగతం',
];

const TYPING_SPEED = 80; // ms per character
const PAUSE_BETWEEN = 1200; // ms pause after typing a message

const TypingTitle = ({
  style = {},
  className = '',
}) => {
  const [displayed, setDisplayed] = useState('');
  const [msgIdx, setMsgIdx] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let timeout;
    if (typing) {
      if (displayed.length < messages[msgIdx].length) {
        timeout = setTimeout(() => {
          setDisplayed(messages[msgIdx].slice(0, displayed.length + 1));
        }, TYPING_SPEED);
      } else {
        timeout = setTimeout(() => setTyping(false), PAUSE_BETWEEN);
      }
    } else {
      // Erase effect (optional, or just switch)
      timeout = setTimeout(() => {
        setDisplayed('');
        setMsgIdx((msgIdx + 1) % messages.length);
        setTyping(true);
      }, 600);
    }
    return () => clearTimeout(timeout);
  }, [displayed, typing, msgIdx]);

  return (
    <span className={className} style={style}>
      {displayed}
      <span style={{ color: '#1976d2', fontWeight: 700 }}></span>
    </span>
  );
};

export default TypingTitle; 
