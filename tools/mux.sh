#!/usr/bin/env bash
# Put the mixed audio on the silent render and write the deliverable.
#   tools/mux.sh render.mp4 mix.wav out.mp4 [poster_second]
# Video stream is copied (no re-encode). Output: yuv420p / bt709 / AAC 256k / faststart.
# A poster PNG is written next to the output when poster_second is given.
set -euo pipefail
video="$1"; audio="$2"; out="$3"; poster="${4:-}"
ffmpeg -hide_banner -loglevel error -y -i "$video" -i "$audio" -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$out"
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,pix_fmt,color_range \
  -of compact=p=0 "$out"
if [[ -n "$poster" ]]; then
  ffmpeg -hide_banner -loglevel error -y -ss "$poster" -i "$out" -frames:v 1 "${out%.*}-poster.png"
  echo "poster: ${out%.*}-poster.png"
fi
