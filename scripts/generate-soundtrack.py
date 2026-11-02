"""Render the game's original 40-second D-minor score as a stereo WAV."""
import argparse
import array
import math
import wave


def render(output):
    rate = 32000
    duration = 40
    size = rate * duration
    left = array.array('f', [0]) * size
    right = array.array('f', [0]) * size

    def frequency(midi):
        return 440 * 2 ** ((midi - 69) / 12)

    def note(midi, start, length, level, pan=0, bell=False):
        hz = frequency(midi)
        first = int(start * rate)
        frames = min(int(length * rate), size - first)
        for i in range(frames):
            t = i / rate
            envelope = (1 - math.exp(-t * (55 if bell else 2)))
            envelope *= math.exp(-t * (1.5 if bell else .12))
            envelope *= min(1, (frames - i) / (rate * .35))
            value = math.sin(2 * math.pi * hz * t)
            value += (.32 if bell else .16) * math.sin(2 * math.pi * hz * 2.002 * t)
            value += .1 * math.sin(2 * math.pi * hz * 3 * t)
            value *= envelope * level
            left[first + i] += value * (1 - pan * .35)
            right[first + i] += value * (1 + pan * .35)

    # Eight five-second bars: Dm(add9), Bbmaj7, Gm(add9), Asus4.
    chords = [(50, 57, 60, 64), (46, 53, 57, 60), (43, 50, 57, 58), (45, 52, 55, 62)] * 2
    motifs = [(74, 77, 76, 69), (74, 72, 69, 65), (70, 69, 67, 74), (69, 67, 64, 73)] * 2
    for bar, chord in enumerate(chords):
        start = bar * 5
        for index, pitch in enumerate(chord):
            note(pitch, start, 5, .028, (index - 1.5) / 2)
        note(chord[0] - 12, start, 4.8, .045)
        for beat, pitch in enumerate(motifs[bar]):
            note(pitch, start + beat * 1.25, min(2.3, 5 - beat * 1.25), .13, (-1 if beat % 2 else 1) * .45, True)

    pcm = array.array('h')
    for i in range(size):
        # Matching fade edges prevent clicks at the loop boundary.
        edge = min(1, i / (rate * .035), (size - i - 1) / (rate * .15))
        pcm.extend(int(max(-1, min(1, channel[i] * edge)) * 32767) for channel in (left, right))
    with wave.open(str(output), 'wb') as audio:
        audio.setnchannels(2)
        audio.setsampwidth(2)
        audio.setframerate(rate)
        audio.writeframes(pcm.tobytes())


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', help='Output WAV path; encode to MP3 with FFmpeg.')
    render(parser.parse_args().output)
