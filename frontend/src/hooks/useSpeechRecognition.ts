import { useEffect, useRef, useState } from "react";

export function speak(text: string, lang: "en" | "ur" = "en") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "ur" ? "ur-PK" : "en-US";
    u.rate = 1;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  } catch {}
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {}
}

type SR = {
  supported: boolean;
  listening: boolean;
  transcript: string;
  interim: string;
  start: () => void;
  stop: () => void;
  reset: () => void;
};

export function useSpeechRecognition(lang: "en" | "ur" = "en"): SR {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang === "ur" ? "ur-PK" : "en-US";
    rec.onresult = (e: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript + " ";
        else interimText += res[0].transcript;
      }
      if (finalText) setTranscript((p) => (p + " " + finalText).trim());
      setInterim(interimText);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    return () => {
      try { rec.stop(); } catch {}
      recRef.current = null;
    };
  }, [lang]);

  return {
    supported,
    listening,
    transcript,
    interim,
    start: () => {
      if (!recRef.current) return;
      try { recRef.current.start(); setListening(true); } catch {}
    },
    stop: () => {
      if (!recRef.current) return;
      try { recRef.current.stop(); } catch {}
      setListening(false);
    },
    reset: () => { setTranscript(""); setInterim(""); },
  };
}
