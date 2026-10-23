# /// script
# requires-python = ">=3.9"
# dependencies = ["mlx-whisper"]
# ///
"""Word-level timestamps for speech in clips (Apple Silicon, runs locally).

    uv run tools/words.py clip1.mp4 clip2.mp4 ...

Prints every word as word[start-end] in seconds within the file. Use it to:
  - cut a quote to the exact words ("Greed, ... is good." = two slices),
  - place the voice cue on a beat and sync the picture (video in-point = audio in-point),
  - type captions in step with the speech.
Screams and singing do not transcribe — pick those moments from loudness instead.
"""
import sys
import mlx_whisper

for f in sys.argv[1:]:
    r = mlx_whisper.transcribe(f, path_or_hf_repo='mlx-community/whisper-small.en-mlx', word_timestamps=True)
    print('==', f)
    for s in r['segments']:
        print('  ' + ' '.join(f"{w['word'].strip()}[{w['start']:.2f}-{w['end']:.2f}]" for w in s['words']))
