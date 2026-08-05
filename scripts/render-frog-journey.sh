#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRAME_DIR="$ROOT_DIR/assets/image/frog-sequence/keyframes"
VIDEO_DIR="$ROOT_DIR/assets/video"
ALPHA_VIDEO="$VIDEO_DIR/frog-journey-alpha.webm"
FALLBACK_VIDEO="$VIDEO_DIR/frog-journey.mp4"

mkdir -p "$VIDEO_DIR"

ffmpeg -y \
  -loop 1 -t 10 -i "$FRAME_DIR/single-egg.png" \
  -loop 1 -t 10 -i "$FRAME_DIR/tadpole.png" \
  -loop 1 -t 10 -i "$FRAME_DIR/froglet.png" \
  -loop 1 -t 10 -i "$FRAME_DIR/adult-frog.png" \
  -loop 1 -t 10 -i "$FRAME_DIR/jumping-frog.png" \
  -f lavfi -i "color=c=black@0.0:s=1280x720:r=30:d=10,format=rgba" \
  -filter_complex "\
    [0:v]scale=500:500:force_original_aspect_ratio=decrease,format=rgba,fade=t=out:st=1.6:d=0.7:alpha=1,setpts=PTS-STARTPTS[egg];\
    [1:v]scale=570:570:force_original_aspect_ratio=decrease,format=rgba,fade=t=in:st=1.5:d=0.7:alpha=1,fade=t=out:st=3.6:d=0.7:alpha=1,setpts=PTS-STARTPTS[tadpole];\
    [2:v]scale=610:610:force_original_aspect_ratio=decrease,format=rgba,fade=t=in:st=3.5:d=0.7:alpha=1,fade=t=out:st=5.7:d=0.7:alpha=1,setpts=PTS-STARTPTS[froglet];\
    [3:v]scale=640:640:force_original_aspect_ratio=decrease,format=rgba,fade=t=in:st=5.6:d=0.7:alpha=1,fade=t=out:st=7.8:d=0.7:alpha=1,setpts=PTS-STARTPTS[adult];\
    [4:v]scale=680:680:force_original_aspect_ratio=decrease,format=rgba,fade=t=in:st=7.7:d=0.7:alpha=1,setpts=PTS-STARTPTS[jump];\
    [5:v][egg]overlay=x=W-w-70:y=(H-h)/2:format=auto[a];\
    [a][tadpole]overlay=x=W-w-70:y=(H-h)/2:format=auto[b];\
    [b][froglet]overlay=x=W-w-70:y=(H-h)/2:format=auto[c];\
    [c][adult]overlay=x=W-w-70:y=(H-h)/2:format=auto[d];\
    [d][jump]overlay=x=W-w-40:y=(H-h)/2:format=auto,format=yuva420p[out]" \
  -map "[out]" -an -r 30 -t 10 \
  -c:v libvpx-vp9 -crf 30 -b:v 0 -g 15 -row-mt 1 \
  "$ALPHA_VIDEO"

ffmpeg -y \
  -f lavfi -i "color=c=0x102d27:s=1280x720:r=30:d=10" \
  -c:v libvpx-vp9 -i "$ALPHA_VIDEO" \
  -filter_complex "[0:v][1:v]overlay=format=auto,format=yuv420p[out]" \
  -map "[out]" -an -r 30 -t 10 \
  -c:v libx264 -preset medium -crf 23 -g 15 -keyint_min 15 -movflags +faststart \
  "$FALLBACK_VIDEO"

printf '%s\n' "$ALPHA_VIDEO" "$FALLBACK_VIDEO"
