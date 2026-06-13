import { useEffect, useRef, useCallback } from 'react';
import { useAppState } from '../contexts/AppStateContext';

/**
 * Creates an analog-style clipping distortion curve for Web Audio WaveShaperNode.
 * Mimics high-gain tube saturation and industrial solid-state grit.
 */
function makeIndustrialDistortionCurve(amount = 40) {
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    // Classic hyperbolic tangent-like waveshaper curve for warm analog overdrive
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

export function useAudio() {
  const { pilotConfig, phase, telemetry } = useAppState();
  const audioCtxRef = useRef<AudioContext | null>(null);

  // References for active continuous synthesizer nodes to update pitch/damping in real-time
  const humGroupRef = useRef<{
    oscs: OscillatorNode[];
    noiseNode: AudioBufferSourceNode | null;
    noiseFilter: BiquadFilterNode | null;
    lfo: OscillatorNode | null;
    lfoGain: GainNode | null;
    distortion: WaveShaperNode | null;
    filter: BiquadFilterNode | null;
    gainNode: GainNode | null;
  } | null>(null);

  // References for our generative space ambient background music engine
  const musicGroupRef = useRef<{
    activeChords: OscillatorNode[];
    activeGains: GainNode[];
    masterMusicGain: GainNode | null;
    delayNode: DelayNode | null;
    delayFeedback: GainNode | null;
    melodyTimeoutId: any;
    chordTimeoutId: any;
    sequencerIntervalId: any;
    glitchTimeoutId: any;
    activeSequenceOscs: OscillatorNode[];
    currentChordIndex: number;
    isPlaying: boolean;
  } | null>(null);

  // Initialize Audio Context on user action (bypasses browser autoplay blocks)
  const initAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  /**
   * Continuous Cockpit Hum (Gothic Analog Drone with metallic beats)
   * Inspired by Nine Inch Nails atmospheric noise tracks (e.g., Ghosts, The Downward Spiral)
   */
  const startHum = useCallback((freq: number) => {
    initAudioCtx();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Avoid double creation
    if (humGroupRef.current) return;

    try {
      // 1. Create multiple detuned analog oscillators for a massive chorus beating effect
      const osc1 = ctx.createOscillator(); // Principal pitch
      const osc2 = ctx.createOscillator(); // Detuned high fifth
      const oscSub = ctx.createOscillator(); // Sub-harmonizer
      const oscGrit = ctx.createOscillator(); // Guttural FM sync

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, ctx.currentTime);

      osc2.type = 'triangle';
      // Detuned fifth (perfect ratio 1.5 + offset) for industrial dissonance
      osc2.frequency.setValueAtTime(freq * 1.503, ctx.currentTime);

      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(freq * 0.5, ctx.currentTime); // Sub-bass

      oscGrit.type = 'sawtooth';
      oscGrit.frequency.setValueAtTime(freq * 1.018, ctx.currentTime); // Beating detune

      // 2. Synthesize heavy mechanical breath (filtered noise background)
      const bufferSize = ctx.sampleRate * 2.0;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.Q.setValueAtTime(4.0, ctx.currentTime);
      noiseFilter.frequency.setValueAtTime(120, ctx.currentTime); // dynamic low wind thrum

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.008, ctx.currentTime); // subtle low-end pressure

      // 3. Modulate filter with a slow LFO (iconic NIN tension wave)
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // slow pulse (once every 8 seconds)

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(45.0, ctx.currentTime); // sweeps cutoff frequency up and down

      // 4. Analog warmth & distortion unit
      const distortion = ctx.createWaveShaper();
      distortion.curve = makeIndustrialDistortionCurve(50);
      distortion.oversample = '4x';

      // 5. Main cockpit lowpass filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, ctx.currentTime);
      filter.Q.setValueAtTime(3.5, ctx.currentTime);

      // 6. Output control
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 2.0); // smooth, menacing fade-in

      // 7. Wire LFO to filter frequency
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // 8. Connect audio lines
      osc1.connect(distortion);
      osc2.connect(distortion);
      oscSub.connect(filter); // keep clean low sub-bass bypass to prevent mud
      oscGrit.connect(distortion);

      distortion.connect(filter);
      
      // Wire noise channel
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Start all sound generator streams
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      oscSub.start(ctx.currentTime);
      oscGrit.start(ctx.currentTime);
      noiseSource.start(ctx.currentTime);
      lfo.start(ctx.currentTime);

      // Keep tracking references for easy dynamic pitch modulation
      humGroupRef.current = {
        oscs: [osc1, osc2, oscSub, oscGrit],
        noiseNode: noiseSource,
        noiseFilter: noiseFilter,
        lfo,
        lfoGain,
        distortion,
        filter,
        gainNode: masterGain
      };
    } catch (err) {
      console.warn('NIN-Synth engine failed to start:', err);
    }
  }, [initAudioCtx]);

  const stopHum = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (humGroupRef.current && ctx) {
      const g = humGroupRef.current;
      g.gainNode?.gain.cancelScheduledValues(ctx.currentTime);
      g.gainNode?.gain.setValueAtTime(g.gainNode.gain.value, ctx.currentTime);
      g.gainNode?.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

      setTimeout(() => {
        try {
          g.oscs.forEach(osc => { try { osc.stop(); } catch (e) {} });
          try { g.noiseNode?.stop(); } catch (e) {}
          try { g.lfo?.stop(); } catch (e) {}
        } catch (e) {}
        humGroupRef.current = null;
      }, 550);
    }
  }, []);

  /**
   * Generative Galactic Space Music Engine (Procedural Ambient Soundscape)
   * Plays evolving cosmic drones combined with starry crystal echoing delay lines
   */
  const startMusic = useCallback(() => {
    initAudioCtx();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (musicGroupRef.current && musicGroupRef.current.isPlaying) return;

    // Flush any preceding music schedule leftovers
    if (musicGroupRef.current) {
      const g = musicGroupRef.current;
      if (g.chordTimeoutId) clearTimeout(g.chordTimeoutId);
      if (g.melodyTimeoutId) clearTimeout(g.melodyTimeoutId);
      if (g.sequencerIntervalId) clearInterval(g.sequencerIntervalId);
      if (g.glitchTimeoutId) clearTimeout(g.glitchTimeoutId);
    }

    try {
      const masterMusicGain = ctx.createGain();
      // Set to soft background level
      masterMusicGain.gain.setValueAtTime(0, ctx.currentTime);
      masterMusicGain.gain.linearRampToValueAtTime(0.40, ctx.currentTime + 3.0); // slow cinematic fade-in
      masterMusicGain.connect(ctx.destination);

      // Create feedback space delay node
      const delayNode = ctx.createDelay(2.5);
      delayNode.delayTime.setValueAtTime(0.66, ctx.currentTime); // 660ms echo spacing

      const delayFeedback = ctx.createGain();
      delayFeedback.gain.setValueAtTime(0.55, ctx.currentTime); // high decay persistence

      const delayFilter = ctx.createBiquadFilter();
      delayFilter.type = 'lowpass';
      delayFilter.frequency.setValueAtTime(1200, ctx.currentTime); // warm dark echo tails

      delayNode.connect(delayFilter);
      delayFilter.connect(delayFeedback);
      delayFeedback.connect(delayNode);
      delayNode.connect(masterMusicGain);

      musicGroupRef.current = {
        activeChords: [],
        activeGains: [],
        masterMusicGain,
        delayNode,
        delayFeedback,
        melodyTimeoutId: null,
        chordTimeoutId: null,
        sequencerIntervalId: null,
        glitchTimeoutId: null,
        activeSequenceOscs: [],
        currentChordIndex: 0,
        isPlaying: true,
      };

      const stateObj = musicGroupRef.current;

      // Mellow, majestic dark space minor/suspended suites (NIN and Blade Runner harmony)
      const spaceChords = [
        [110.00, 130.81, 164.81, 196.00, 246.94], // A minor 9 (Melancholic void core)
        [87.31, 130.81, 174.61, 220.00, 246.94],  // F major 7 #11 (Shattered skyline)
        [73.42, 110.00, 146.83, 174.61, 220.00],  // D minor 9 (Heavy radioactive dusk)
        [82.41, 123.47, 146.83, 164.81, 220.00],  // E7 sus4 (Unresolved cosmic horizon)
      ];

      // Step sequencer frequencies (A1, F1, D1, E1)
      const seqRoots = [55.00, 43.65, 36.71, 41.20];

      // Melodic motifs matching the mood of each chord sector
      const leadNotes = [
        [220.00, 261.63, 329.63, 440.00, 493.88], // Am family
        [174.61, 220.00, 329.63, 440.00, 523.25], // F family
        [146.83, 174.61, 220.00, 293.66, 329.63], // Dm family
        [164.81, 220.00, 246.94, 415.30, 493.88], // E7sus4 family
      ];

      const playNextSpaceChord = () => {
        if (!musicGroupRef.current || !musicGroupRef.current.isPlaying) return;

        const currentObj = musicGroupRef.current;
        const idx = currentObj.currentChordIndex;
        const chordFreqs = spaceChords[idx];
        const nowTime = ctx.currentTime;

        // Gracefully crossfade active chord voices
        const oldOscs = currentObj.activeChords;
        const oldGains = currentObj.activeGains;
        oldGains.forEach((gn) => {
          try {
            gn.gain.cancelScheduledValues(nowTime);
            gn.gain.setValueAtTime(gn.gain.value, nowTime);
            gn.gain.exponentialRampToValueAtTime(0.0001, nowTime + 4.0);
          } catch (e) {}
        });
        setTimeout(() => {
          oldOscs.forEach((osc) => {
            try { osc.stop(); } catch (e) {}
          });
        }, 4200);

        currentObj.activeChords = [];
        currentObj.activeGains = [];

        // Build elegant detuned drone oscillators of various scale frequencies
        chordFreqs.forEach((freq, chordVoiceIdx) => {
          const oscNode1 = ctx.createOscillator();
          const oscNode2 = ctx.createOscillator();
          const gainNode = ctx.createGain();
          const filterNode = ctx.createBiquadFilter();
          const pannerNode = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

          oscNode1.type = 'triangle';
          oscNode1.frequency.setValueAtTime(freq, nowTime);
          oscNode1.detune.setValueAtTime((Math.random() - 0.5) * 8.0, nowTime);

          oscNode2.type = 'sawtooth';
          oscNode2.frequency.setValueAtTime(freq * 0.998, nowTime);
          oscNode2.detune.setValueAtTime((Math.random() - 0.5) * 12.0, nowTime);

          filterNode.type = 'lowpass';
          filterNode.frequency.setValueAtTime(180, nowTime);
          filterNode.Q.setValueAtTime(1.5, nowTime);

          gainNode.gain.setValueAtTime(0, nowTime);
          // Slow attack progression is calming and majestic
          gainNode.gain.linearRampToValueAtTime(0.016, nowTime + 4.5);

          oscNode1.connect(filterNode);
          oscNode2.connect(filterNode);

          if (pannerNode) {
            const panVal = ((chordVoiceIdx / (chordFreqs.length - 1)) * 2.0 - 1.0) * 0.75;
            pannerNode.pan.setValueAtTime(panVal, nowTime);
            filterNode.connect(pannerNode);
            pannerNode.connect(gainNode);
          } else {
            filterNode.connect(gainNode);
          }

          gainNode.connect(masterMusicGain);
          
          oscNode1.start(nowTime);
          oscNode2.start(nowTime);

          currentObj.activeChords.push(oscNode1, oscNode2);
          currentObj.activeGains.push(gainNode);
        });

        // Rotate index
        currentObj.currentChordIndex = (idx + 1) % spaceChords.length;

        // Loop space chord cycle every 14.5 seconds
        currentObj.chordTimeoutId = setTimeout(playNextSpaceChord, 14500);
      };

      // Pulsing Step Sequencer Bassline - A hypnotic, dark thumping drive like "Hand Covers Bruise"
      let stepIndex = 0;
      const playSequencerStep = () => {
        if (!musicGroupRef.current || !musicGroupRef.current.isPlaying) return;

        const currentObj = musicGroupRef.current;
        const nowTime = ctx.currentTime;
        const currentChordIdx = (currentObj.currentChordIndex === 0 ? spaceChords.length : currentObj.currentChordIndex) - 1;
        const rootFreq = seqRoots[currentChordIdx] || 55.00;

        // Dynamic 8-step volume/pulse envelope weights
        const weights = [1.0, 0.4, 0.8, 0.3, 0.9, 0.4, 0.8, 0.5];
        const gainMult = weights[stepIndex % 8];

        // Occasional double-tap glitch trigger
        const isGlitchDoubleStep = (stepIndex % 16 === 11 || stepIndex % 16 === 15) && Math.random() < 0.6;
        const stepTriggerDelay = isGlitchDoubleStep ? 110 : 0;

        const fireBassTrigger = (delayMs: number, customVolume: number) => {
          const oscLow = ctx.createOscillator();
          const oscSub = ctx.createOscillator();
          const bassFilter = ctx.createBiquadFilter();
          const bassGain = ctx.createGain();
          const waveShaper = ctx.createWaveShaper();

          waveShaper.curve = makeIndustrialDistortionCurve(35);
          waveShaper.oversample = '2x';

          oscLow.type = 'sawtooth';
          oscLow.frequency.setValueAtTime(rootFreq, nowTime + delayMs / 1000);
          oscLow.detune.setValueAtTime(-15, nowTime + delayMs / 1000);

          oscSub.type = 'triangle';
          oscSub.frequency.setValueAtTime(rootFreq * 0.5, nowTime + delayMs / 1000); // Sub bass register thrum

          bassFilter.type = 'lowpass';
          bassFilter.frequency.setValueAtTime(140, nowTime + delayMs / 1000);
          bassFilter.frequency.exponentialRampToValueAtTime(55, nowTime + delayMs / 1000 + 0.16);
          bassFilter.Q.setValueAtTime(3.0, nowTime + delayMs / 1000);

          bassGain.gain.setValueAtTime(0, nowTime + delayMs / 1000);
          // High intensity mechanical thump
          bassGain.gain.linearRampToValueAtTime(0.04 * customVolume, nowTime + delayMs / 1000 + 0.006);
          bassGain.gain.exponentialRampToValueAtTime(0.0001, nowTime + delayMs / 1000 + 0.20);

          oscLow.connect(waveShaper);
          oscSub.connect(bassFilter); // bypass sub clean
          waveShaper.connect(bassFilter);
          bassFilter.connect(bassGain);
          bassGain.connect(masterMusicGain);

          oscLow.start(nowTime + delayMs / 1000);
          oscSub.start(nowTime + delayMs / 1000);

          oscLow.stop(nowTime + delayMs / 1000 + 0.24);
          oscSub.stop(nowTime + delayMs / 1000 + 0.24);

          // Clean up finished notes
          setTimeout(() => {
            if (musicGroupRef.current && musicGroupRef.current.isPlaying) {
              const iLo = musicGroupRef.current.activeSequenceOscs.indexOf(oscLow);
              if (iLo > -1) musicGroupRef.current.activeSequenceOscs.splice(iLo, 1);
              const iSub = musicGroupRef.current.activeSequenceOscs.indexOf(oscSub);
              if (iSub > -1) musicGroupRef.current.activeSequenceOscs.splice(iSub, 1);
            }
          }, 400);

          musicGroupRef.current.activeSequenceOscs.push(oscLow, oscSub);
        };

        // Fire main step
        fireBassTrigger(0, gainMult);

        // Fire micro double-step syncopation for NIN modular beat feel
        if (stepTriggerDelay > 0) {
          fireBassTrigger(stepTriggerDelay, gainMult * 0.45);
        }

        stepIndex++;
      };

      // Start sequencer at tight 220ms rhythm (approximately 136 bpm of industrial machine thrashing)
      stateObj.sequencerIntervalId = setInterval(playSequencerStep, 220);

      // Soaring Vangelis-style CS-80 Brass Solos (Plays elegant, haunting lead melody)
      let motifStep = 0;
      const playSpaceMelodyChime = () => {
        if (!musicGroupRef.current || !musicGroupRef.current.isPlaying) return;

        const currentObj = musicGroupRef.current;
        const nowTime = ctx.currentTime;
        const currentChordIdx = (currentObj.currentChordIndex === 0 ? spaceChords.length : currentObj.currentChordIndex) - 1;
        const activeScale = leadNotes[currentChordIdx] || leadNotes[0];

        // Haunting repeating melodic sequences
        const melodyPattern = [2, 4, 3, 0, 1, 3, 2, 4, 0, 1];
        const scaleIndex = melodyPattern[motifStep % melodyPattern.length];
        const pitch = activeScale[scaleIndex % activeScale.length];

        const oscV1 = ctx.createOscillator();
        const oscV2 = ctx.createOscillator();
        const pitchLfo = ctx.createOscillator();
        const pitchLfoGain = ctx.createGain();
        const leadGain = ctx.createGain();
        const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const filter = ctx.createBiquadFilter();

        oscV1.type = 'sawtooth';
        oscV1.frequency.setValueAtTime(pitch, nowTime);
        oscV1.detune.setValueAtTime(-12, nowTime);

        oscV2.type = 'sawtooth';
        oscV2.frequency.setValueAtTime(pitch * 1.002, nowTime);
        oscV2.detune.setValueAtTime(12, nowTime);

        // Slow luxurious analog brass pitch vibrato (Vangelis styling)
        pitchLfo.type = 'sine';
        pitchLfo.frequency.setValueAtTime(5.4 + Math.random() * 0.4, nowTime);
        pitchLfoGain.gain.setValueAtTime(8.0, nowTime); // depth of vibrato

        pitchLfo.connect(pitchLfoGain);
        pitchLfoGain.connect(oscV1.frequency);
        pitchLfoGain.connect(oscV2.frequency);

        filter.type = 'lowpass';
        filter.Q.setValueAtTime(5.8, nowTime); // highly resonant CS-80 sweep
        // Brassy filter swell synced with tone attack!
        filter.frequency.setValueAtTime(260, nowTime);
        filter.frequency.linearRampToValueAtTime(1450, nowTime + 0.9);
        filter.frequency.exponentialRampToValueAtTime(380, nowTime + 3.8);

        // Linear volume attack (Vangelis style swelling envelope)
        leadGain.gain.setValueAtTime(0, nowTime);
        leadGain.gain.linearRampToValueAtTime(0.024, nowTime + 0.84); // gorgeous sweep peaks
        leadGain.gain.setValueAtTime(0.024, nowTime + 2.0);
        leadGain.gain.exponentialRampToValueAtTime(0.0001, nowTime + 3.8); // elegant trail release

        oscV1.connect(filter);
        oscV2.connect(filter);

        if (panner) {
          // Slow scenic stereo sweep
          const randomPan = (motifStep % 2 === 0 ? -0.58 : 0.58) + (Math.random() - 0.5) * 0.15;
          panner.pan.setValueAtTime(randomPan, nowTime);
          panner.pan.linearRampToValueAtTime(-randomPan * 0.5, nowTime + 3.5);
          filter.connect(panner);
          panner.connect(leadGain);
        } else {
          filter.connect(leadGain);
        }

        // Direct send to delay buffer node for gorgeous echoing spatial trails!
        leadGain.connect(delayNode);
        leadGain.connect(masterMusicGain);

        oscV1.start(nowTime);
        oscV2.start(nowTime);
        pitchLfo.start(nowTime);

        oscV1.stop(nowTime + 4.0);
        oscV2.stop(nowTime + 4.0);
        pitchLfo.stop(nowTime + 4.0);

        setTimeout(() => {
          if (musicGroupRef.current && musicGroupRef.current.isPlaying) {
            const idx1 = musicGroupRef.current.activeSequenceOscs.indexOf(oscV1);
            if (idx1 > -1) musicGroupRef.current.activeSequenceOscs.splice(idx1, 1);
            const idx2 = musicGroupRef.current.activeSequenceOscs.indexOf(oscV2);
            if (idx2 > -1) musicGroupRef.current.activeSequenceOscs.splice(idx2, 1);
          }
        }, 4500);

        musicGroupRef.current.activeSequenceOscs.push(oscV1, oscV2);

        motifStep++;
        // Lead triggers every 4.8 seconds
        currentObj.melodyTimeoutId = setTimeout(playSpaceMelodyChime, 4800);
      };

      // Ambient Telemetry Glitches, analog solar wind crackles in backing track
      const playAnalogGlitchTick = () => {
        if (!musicGroupRef.current || !musicGroupRef.current.isPlaying) return;

        const currentObj = musicGroupRef.current;
        const nowTime = ctx.currentTime;

        const noiseOsc = ctx.createOscillator();
        const noiseFilter = ctx.createBiquadFilter();
        const noiseGain = ctx.createGain();

        // High pitch communication sweep
        noiseOsc.type = 'square';
        noiseOsc.frequency.setValueAtTime(11000 + Math.random() * 4000, nowTime);
        noiseOsc.frequency.exponentialRampToValueAtTime(800 + Math.random() * 400, nowTime + 0.08);

        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(4500, nowTime);

        noiseGain.gain.setValueAtTime(0, nowTime);
        noiseGain.gain.linearRampToValueAtTime(0.008, nowTime + 0.002);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, nowTime + 0.09);

        noiseOsc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(delayNode); // Feed with long echoes!
        noiseGain.connect(masterMusicGain);

        noiseOsc.start(nowTime);
        noiseOsc.stop(nowTime + 0.12);

        const nextLaunch = 2800 + Math.random() * 4500;
        currentObj.glitchTimeoutId = setTimeout(playAnalogGlitchTick, nextLaunch);
      };

      // Fire off initial generators!
      playNextSpaceChord();

      // Delay lead melody and glitch starts slightly to let rich chord beds establish
      setTimeout(() => {
        if (musicGroupRef.current && musicGroupRef.current.isPlaying) {
          playSpaceMelodyChime();
          playAnalogGlitchTick();
        }
      }, 1500);

    } catch (e) {
      console.warn('Silent fallback for dark industrial Synth loop engine:', e);
    }
  }, [initAudioCtx]);

  const stopMusic = useCallback(() => {
    if (musicGroupRef.current) {
      const stateObj = musicGroupRef.current;
      stateObj.isPlaying = false;

      if (stateObj.chordTimeoutId) clearTimeout(stateObj.chordTimeoutId);
      if (stateObj.melodyTimeoutId) clearTimeout(stateObj.melodyTimeoutId);
      if (stateObj.sequencerIntervalId) clearInterval(stateObj.sequencerIntervalId);
      if (stateObj.glitchTimeoutId) clearTimeout(stateObj.glitchTimeoutId);

      const ctx = audioCtxRef.current;
      if (ctx && stateObj.masterMusicGain) {
        const mg = stateObj.masterMusicGain;
        mg.gain.cancelScheduledValues(ctx.currentTime);
        mg.gain.setValueAtTime(mg.gain.value, ctx.currentTime);
        mg.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      }

      // Stop all playing drone chord voices and sequence elements
      const tempChords = stateObj.activeChords;
      const tempSeqs = stateObj.activeSequenceOscs;
      setTimeout(() => {
        tempChords.forEach((osc) => {
          try { osc.stop(); } catch (e) {}
        });
        tempSeqs.forEach((osc) => {
          try { osc.stop(); } catch (e) {}
        });
      }, 1400);

      musicGroupRef.current = null;
    }
  }, []);

  // Update engine frequency, filter harmonics and volumes dynamically based on pilot speed dial and actual flight velocity
  useEffect(() => {
    if (humGroupRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      const g = humGroupRef.current;
      
      const baseFreq = pilotConfig.humFrequency; // Base dial frequency (e.g. 80 Hz)
      
      // Speed factor from 0.0 to 1.5 based on ship velocity
      const velocityRatio = telemetry ? Math.min(1.5, telemetry.velocity / 2200.0) : 0.0;
      
      // Pitch goes up with velocity to simulate turbine engine loading!
      const currentPitchFactor = 1.0 + (velocityRatio * 0.42); // pitch rises up to +42%
      
      const f = baseFreq * currentPitchFactor;

      g.oscs[0].frequency.cancelScheduledValues(ctx.currentTime);
      g.oscs[0].frequency.linearRampToValueAtTime(f, ctx.currentTime + 0.15); // Faster, snappier slide

      g.oscs[1].frequency.cancelScheduledValues(ctx.currentTime);
      g.oscs[1].frequency.linearRampToValueAtTime(f * 1.503, ctx.currentTime + 0.15);

      g.oscs[2].frequency.cancelScheduledValues(ctx.currentTime);
      g.oscs[2].frequency.linearRampToValueAtTime(f * 0.5, ctx.currentTime + 0.15);

      g.oscs[3].frequency.cancelScheduledValues(ctx.currentTime);
      g.oscs[3].frequency.linearRampToValueAtTime(f * 1.018, ctx.currentTime + 0.15);

      // Lowpass Filter cutoff dynamically opens up at higher speeds to let rich bright grit sizzle!
      const baseCutoff = Math.max(120, Math.min(300, baseFreq * 1.8));
      const targetCutoff = baseCutoff * (1.0 + velocityRatio * 1.5); // filter swells up with speed!
      
      g.filter?.frequency.cancelScheduledValues(ctx.currentTime);
      g.filter?.frequency.linearRampToValueAtTime(Math.min(1400, targetCutoff), ctx.currentTime + 0.25);
      
      // Modulate the noise Filter to resemble rushing cosmic gas as velocity surges
      if (g.noiseFilter) {
        g.noiseFilter.frequency.cancelScheduledValues(ctx.currentTime);
        g.noiseFilter.frequency.linearRampToValueAtTime(100 + velocityRatio * 280, ctx.currentTime + 0.3);
      }

      // Speed up lfo rhythm with frequency setting and velocity thrust loading
      if (g.lfo) {
        g.lfo.frequency.cancelScheduledValues(ctx.currentTime);
        g.lfo.frequency.setValueAtTime(0.08 + (baseFreq - 40) * 0.002 + velocityRatio * 0.45, ctx.currentTime);
      }
    }
  }, [pilotConfig.humFrequency, telemetry?.velocity]);

  // Handle phase-linked synthesizer drone and mellow background music activation
  useEffect(() => {
    if (phase === 'FLIGHT' || phase === 'DESTINATION') {
      startHum(pilotConfig.humFrequency);
      startMusic();
    } else if (phase === 'BOOT') {
      // In BOOT phase, let the space ambient music play extremely softly in the diagnostic background
      startMusic();
    } else {
      stopHum();
      stopMusic();
    }
    return () => {
      stopHum();
      stopMusic();
    };
  }, [phase, startHum, stopHum, startMusic, stopMusic, pilotConfig.humFrequency]);

  /**
   * Diagnostic / Button Sound Effect (The Machined-Clicker)
   * Fully re-designed with NIN industrial sound signature.
   * Leverages custom dissonant ring frequencies, noise ticks, and distortion.
   */
  const playDiagnosticBlip = useCallback((freq = 800, duration = 0.08) => {
    initAudioCtx();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator(); // Metallic ring-modulator clone
      const noise = ctx.createBufferSource();
      const noiseFilter = ctx.createBiquadFilter();
      const distNode = ctx.createWaveShaper();
      const gainNode = ctx.createGain();

      distNode.curve = makeIndustrialDistortionCurve(30);
      distNode.oversample = '2x';

      // Low industrial thrum / structural hit for low bleep boundaries
      if (freq < 300) {
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + duration);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 0.5, ctx.currentTime); // deep sub reinforcement

        gainNode.gain.setValueAtTime(0.0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration + 0.05);

        osc1.connect(distNode);
        osc2.connect(gainNode); // Keep sub bass clean and heavy
        distNode.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + duration + 0.05);
        osc2.stop(ctx.currentTime + duration + 0.05);
        return;
      }

      // High cyberneedle spike for high-pitch diagnostic items
      if (freq > 1000) {
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(freq * 0.1, ctx.currentTime + duration * 0.5);

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(freq * 1.59, ctx.currentTime); // glass metallic dissonance

        gainNode.gain.setValueAtTime(0.0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.002);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc1.connect(distNode);
        osc2.connect(distNode);
        distNode.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + duration);
        osc2.stop(ctx.currentTime + duration);
        return;
      }

      // Default console panel actions: Machined digital-relay click (metallic snaps)
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, ctx.currentTime);
      osc1.frequency.linearRampToValueAtTime(freq * 0.45, ctx.currentTime + duration * 0.8);

      // Create a highly dissonant bell-like resonance overlay
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.4142, ctx.currentTime); // Tritone metallic overlap

      // White noise transient to capture switch mechanical resistance
      const bufferSize = ctx.sampleRate * 0.015; // 15ms short snap
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noise.buffer = buffer;

      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(2500, ctx.currentTime); // high mechanical friction rustle

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 0.004); // Instantaneous attack
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc1.connect(distNode);
      osc2.connect(distNode);
      noise.connect(noiseFilter);
      
      distNode.connect(gainNode);
      noiseFilter.connect(gainNode);

      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      noise.start();

      osc1.stop(ctx.currentTime + duration);
      osc2.stop(ctx.currentTime + duration);
      noise.stop(ctx.currentTime + duration);

    } catch (e) {}
  }, [initAudioCtx]);

  /**
   * Warp Whoosh / Propulsion Flame ignition
   * Sweeping resonant bandpass sweep modeling rocket jet streams blended with solid-state screams
   */
  const playWarpWhoosh = useCallback(() => {
    initAudioCtx();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const waveFolder = ctx.createWaveShaper();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      waveFolder.curve = makeIndustrialDistortionCurve(70);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      // Aggressive low-scream pitch envelope simulation
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.14);
      osc.frequency.exponentialRampToValueAtTime(75, ctx.currentTime + 0.5);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2600, ctx.currentTime + 0.14);
      filter.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.5);
      filter.Q.setValueAtTime(16, ctx.currentTime); // highly resonant whistling sweeps

      // Feed random noise stream for propulsion breath
      const bSize = ctx.sampleRate * 0.5;
      const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
      const bData = b.getChannelData(0);
      for (let i = 0; i < bSize; i++) {
        bData[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = b;

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1); 
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

      osc.connect(waveFolder);
      noise.connect(waveFolder);
      waveFolder.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      noise.start();
      osc.stop(ctx.currentTime + 0.5);
      noise.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  }, [initAudioCtx]);

  // Massive sci-fi explosion sound (Not completely muted here since asteroid destruction relies on playProceduralExplosionAudio, we can let this act as backup)
  const playMassiveExplosion = useCallback(() => {
    return;
  }, []);

  /**
   * Gate Passage / Boundary crossing signal
   * Synthesizes a deep industrial alloy chime (dissonant modular ring modulated bells)
   * plus a heavy bass drop
   */
  const playPassagePulse = useCallback(() => {
    initAudioCtx();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    try {
      const parentOsc = ctx.createOscillator();
      const carrierOsc = ctx.createOscillator();
      const metalBeats = ctx.createOscillator();
      const gain = ctx.createGain();

      const shaper = ctx.createWaveShaper();
      shaper.curve = makeIndustrialDistortionCurve(35);

      parentOsc.type = 'sine';
      parentOsc.frequency.setValueAtTime(90, ctx.currentTime);
      parentOsc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.4); // classic thud

      carrierOsc.type = 'sawtooth';
      carrierOsc.frequency.setValueAtTime(220, ctx.currentTime);
      carrierOsc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.4);

      metalBeats.type = 'triangle';
      metalBeats.frequency.setValueAtTime(415, ctx.currentTime); // dissonant chime interval
      metalBeats.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.20, ctx.currentTime + 0.015); // hard metal slam
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);

      parentOsc.connect(shaper);
      carrierOsc.connect(shaper);
      metalBeats.connect(shaper);

      shaper.connect(gain);
      gain.connect(ctx.destination);

      parentOsc.start();
      carrierOsc.start();
      metalBeats.start();

      parentOsc.stop(ctx.currentTime + 0.45);
      carrierOsc.stop(ctx.currentTime + 0.45);
      metalBeats.stop(ctx.currentTime + 0.45);
    } catch (e) {}
  }, [initAudioCtx]);

  /**
   * Spatial Near-Miss vacuum swoosh sound.
   * Generates a sweeping bandpass filter sweep with dynamic stereo panning.
   */
  const playNearMissSwoosh = useCallback((pan = 0.0, intensity = 1.0) => {
    initAudioCtx();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    try {
      const bufferSize = ctx.sampleRate * 0.48; // Peak-centered 480ms whoosh duration
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      
      // Sweep bandpass frequency up and down for aerodynamic/gravitational whistle
      filter.frequency.setValueAtTime(60, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(140 + intensity * 480, ctx.currentTime + 0.16);
      filter.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.42);
      filter.Q.setValueAtTime(6.0, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12 * intensity, ctx.currentTime + 0.16); // peak alignment
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);

      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (panner) {
        // Dynamic pan sweep across the head-capsule to indicate moving past!
        panner.pan.setValueAtTime(pan, ctx.currentTime);
        panner.pan.linearRampToValueAtTime(-pan * 0.4, ctx.currentTime + 0.35);
        
        noise.connect(filter);
        filter.connect(panner);
        panner.connect(gain);
      } else {
        noise.connect(filter);
        filter.connect(gain);
      }

      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 0.45);
    } catch (e) {}
  }, [initAudioCtx]);

  return {
    initAudioCtx,
    playDiagnosticBlip,
    playWarpWhoosh,
    playPassagePulse,
    playMassiveExplosion,
    playNearMissSwoosh,
    startMusic,
    stopMusic,
  };
}
