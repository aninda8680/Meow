# Voice Integration for Meow

Adding voice capabilities to **Meow** can make the app feel more like a living companion. Here are the three main ways to implement voice, ranging from simple to advanced.

---

## 1. Text-to-Speech (TTS) - Meow Speaks
The easiest way to let Meow "talk" to the user is using the built-in **Web Speech API**.

### Basic Implementation
Create a custom hook or utility:

```typescript
// meow/utils/voice.ts
export const speak = (text: string) => {
  if (typeof window !== 'undefined') {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.5; // High pitch for a cat-like voice
    utterance.rate = 1.0;
    
    // Optional: Select a specific voice
    const voices = window.speechSynthesis.getVoices();
    const kittyVoice = voices.find(v => v.name.includes('Google') || v.lang === 'en-US');
    if (kittyVoice) utterance.voice = kittyVoice;

    window.speechSynthesis.speak(utterance);
  }
};
```

### Usage
```tsx
<button onClick={() => speak("Hello! I am watching your productivity!")}>
  Talk to Me
</button>
```

---

## 2. Speech-to-Text (STT) - Voice Commands
To let Meow listen for commands (like "Turn off camera" or "Show history"), use the `SpeechRecognition` interface.

### Example Code
```typescript
const startListening = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    console.log("Command received:", command);

    if (command.includes("turn off camera")) {
      // Trigger camera toggle logic
    }
  };

  recognition.start();
};
```

---

## 3. Advanced: AI Voice with ElevenLabs (Premium)
If you want Meow to have a high-quality, realistic, or "kawaii" voice, you can use **ElevenLabs API**.

1.  **Get API Key:** Sign up at [ElevenLabs](https://elevenlabs.io/).
2.  **Install Library:** `npm install elevenlabs-node`
3.  **Setup Backend Route:** Create a route in Electron or Next.js to proxy the request and return audio.

---

## Next Steps
1.  **Voice Feedback:** Add a voice line when a "Wave" is detected in `HandTracker.tsx`.
2.  **Voice Commands:** Implement a "Meow, what's my status?" command to read out the current tracking time.
3.  **Cat Sounds:** Use HTML5 `<audio>` tags to play actual cat "purrs" or "meows" for subtle notifications.

---
*Generated for the Meow Project*
