import EventEmitter from "./EventEmitter.js";

export default class AudioListener extends EventEmitter {
  constructor() {
    super();

    // State
    this.amplitude = 0;
    this.frequency = 0;
    this.pitch = 0;

    // Setup
    this.audioContext = null;
    this.audioSource = null;
    this.analyser = null;
    this.bufferLength = null;
    this.dataArrayTime = null;
    this.dataArrayFrequency = null;

    this.startListener();
  }

  startListener() {
    if (navigator.mediaDevices.getUserMedia) {
      // Pedir acceso al micrófono
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          this.setupAudioProcessing(stream);
        })
        .catch(function (err) {
          console.log("Error al acceder al micrófono: " + err);
        });
    } else {
      console.log("getUserMedia no soportado en este navegador");
    }
  }

  setupAudioProcessing(stream) {
    this.audioContext = new AudioContext();
    this.audioSource = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.audioSource.connect(this.analyser);
    this.analyser.fftSize = 256; // Puede ajustarse para mayor precisión
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArrayTime = new Uint8Array(this.bufferLength); // Para datos del dominio del tiempo

    this.dataArrayFrequency = new Uint8Array(this.bufferLength); // Para datos del dominio de la frecuencia
  }

  update() {
    if (
      !this.audioContext ||
      !this.audioSource ||
      !this.analyser ||
      !this.bufferLength ||
      !this.dataArrayTime ||
      !this.dataArrayFrequency
    )
      return;
    // Medir y normalizar la amplitud
    this.analyser.getByteTimeDomainData(this.dataArrayTime);
    let sum = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      const value = this.dataArrayTime[i] / 128 - 1; // Ya está más o menos normalizado, pero ajustamos para claridad
      sum += value * value;
    }
    this.amplitude = Math.sqrt(sum / this.bufferLength); // Esto ya es un valor entre 0 y 1

    // Obtener y normalizar la frecuencia dominante
    this.analyser.getByteFrequencyData(this.dataArrayFrequency);
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      if (this.dataArrayFrequency[i] > maxValue) {
        maxValue = this.dataArrayFrequency[i];
        maxIndex = i;
      }
    }
    const nyquistFrequency = this.audioContext.sampleRate / 2;
    this.frequency =
      (maxIndex / this.bufferLength) *
      (this.audioContext.sampleRate / nyquistFrequency); // Normalización de la frecuencia
  }
}
