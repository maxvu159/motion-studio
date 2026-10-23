#!/usr/bin/env bash
# Generated stand-in footage so the montage template renders without any licensed media.
# Replace with real clips (see .claude/skills/footage-hunt) for an actual project.
set -euo pipefail
cd "$(dirname "$0")"; mkdir -p local/footage
mk(){ ffmpeg -hide_banner -loglevel error -y -f lavfi -i "$1" -t 6 -r 30 -pix_fmt yuv420p "local/footage/$2.mp4"; }
mk "testsrc2=s=1280x720:r=30" a-testsrc
mk "mandelbrot=s=1280x720:r=30" b-mandelbrot
mk "life=s=1280x720:r=30:mold=10:ratio=0.1:death_color=#0B111C:life_color=#6EE7F9" c-life
mk "cellauto=s=1280x720:r=30:rule=110" d-cellauto
mk "smptehdbars=s=1280x720:r=30" e-bars
mk "rgbtestsrc=s=1280x720:r=30" f-rgb
echo "placeholders in local/footage/"
