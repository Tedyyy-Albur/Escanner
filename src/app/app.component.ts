import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'scanner';
  @ViewChild('video', { static: true }) videoElement!: ElementRef;
  @ViewChild('canvas', { static: true }) canvasElement!: ElementRef;
  private video!: HTMLVideoElement;
  private canvas!: HTMLCanvasElement;
  private mediaStream!: MediaStream;
  context!: any;
  imageData: any = '';
  translateH = 0;
  transform: ImageTransform = {
    translateUnit: 'px'
  };
  
  croppedImage: any = 'https://img.yumpu.com/29093014/1/500x640/documentos-administrativos-documento-3-pemex-gas-y-.jpg';
  imgSalida: any = '';
  anchoDeLaHoja: number = 8.5 * 96; 
  altoDeLaHoja: number = 11 * 96;  

  constructor(private sanitizer: DomSanitizer) { }
  ngOnInit() {
    this.video = this.videoElement.nativeElement;
    this.canvas = this.canvasElement.nativeElement;
    this.initCamera();
  }
  // Evento cuando se recorta la imagen
  imageCropped(event: ImageCroppedEvent): void {
    this.imgSalida = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl || event.base64 || '');
    console.log(event);
  }
  initCamera() {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const cameras = devices.filter(device => device.kind === 'videoinput');
        if (cameras.length > 0) {
          // Aquí podrías ofrecer opciones al usuario para elegir la cámara
          const selectedCamera = cameras[0]; // Selecciona la primera cámara por defecto
          this.startCamera(selectedCamera.deviceId);
        } else {
          console.error('No se encontraron cámaras disponibles.');
        }
      })
      .catch(error => {
        console.error('Error al enumerar dispositivos:', error);
      });
  }

  startCamera(deviceId: string) {
    const constraints: MediaStreamConstraints = {
      video: { 
        deviceId: deviceId, 
        width: 8.5 * 96,
        height: 11 * 96
      }
    };
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        this.mediaStream = stream;
        this.video.srcObject = stream;
        this.video.onloadedmetadata = () => {
          this.canvas.width = this.video.videoWidth;
          this.canvas.height = this.video.videoHeight;
        };
      })
      .catch((error) => {
        console.error('Error al acceder a la cámara:', error);
      });
  }

  capture() {
    this.moveLeft();
    this.context = this.canvas.getContext('2d');
    this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    
    this.imageData = this.canvas.toDataURL('image/png');
    console.log('Captured Image:', this.imageData);

    // Desactivar la cámara después de tomar la foto
    if (this.mediaStream) {
      const tracks = this.mediaStream.getTracks();
      tracks.forEach(track => track.stop());
    }

  }
  moveLeft() {
    this.transform = {
      ...this.transform,
      translateH: ++this.translateH
    };
  }

  reiniciarValores(){
    this.initCamera();
    this.imageData = '';
  }

}
