"""Synthèse Piper par lot, appelée par scripts/tts/piper.ts.

Entrée (stdin, JSON) :
  {"items": [{"model": "...onnx", "text": "...", "out": "...wav",
              "length_scale": 1.0, "volume": 1.0}]}
Sortie (stdout, JSON) :
  {"ok": true, "piper": "<version>", "results": [{"out": "...", "samples": n,
   "sample_rate": 22050, "alignments": bool}]}

Chaque modèle n'est chargé qu'une fois par lot. `alignments` indique si le
modèle fournit des alignements de phonèmes (rare pour les voix publiques) ;
le minutage des mots est alors estimé côté TypeScript.
"""
import json
import sys
import wave
from importlib.metadata import version


def main() -> int:
    try:
        from piper import PiperVoice, SynthesisConfig
    except Exception as exc:  # noqa: BLE001
        print(json.dumps({"ok": False, "error": f"piper-tts introuvable : {exc}"}))
        return 2

    req = json.load(sys.stdin)
    voices = {}
    results = []
    for item in req["items"]:
        model = item["model"]
        if model not in voices:
            voices[model] = PiperVoice.load(model)
        voice = voices[model]
        cfg = SynthesisConfig(
            length_scale=float(item.get("length_scale", 1.0)),
            volume=float(item.get("volume", 1.0)),
            normalize_audio=True,
        )
        rate = voice.config.sample_rate
        samples = 0
        has_align = False
        with wave.open(item["out"], "wb") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(rate)
            for chunk in voice.synthesize(item["text"], syn_config=cfg, include_alignments=True):
                if chunk.phoneme_alignments:
                    has_align = True
                wav.writeframes(chunk.audio_int16_bytes)
                samples += len(chunk.audio_int16_bytes) // 2
        if samples == 0:
            print(json.dumps({"ok": False, "error": f"audio vide pour : {item['text'][:60]}"}))
            return 3
        results.append({
            "out": item["out"], "samples": samples, "sample_rate": rate,
            "alignments": has_align,
        })
    print(json.dumps({"ok": True, "piper": version("piper-tts"), "results": results}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
