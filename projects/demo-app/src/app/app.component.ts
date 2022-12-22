import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Dimensions, ImageCroppedEvent, ImageTransform } from '../../../ngx-image-cropper/src';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  imageChangedEvent: any = '';
  croppedImage: any = '';
  canvasRotation = 0;
  rotation?: number;
  translateH = 0;
  translateV = 0;
  scale = 1;
  aspectRatio = 4 / 3;
  showCropper = false;
  containWithinAspectRatio = false;
  transform: ImageTransform = {
    translateUnit: 'px'
  };
  imageURL = '/assets/test.png';
  loading = false;
  allowMoveImage = false;
  hidden = false;
  x = 0;
  img = new Image();
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  fileChangeEvent(event: any): void {
    this.loading = true;
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  imageLoaded() {
    this.showCropper = true;
    console.log('Image loaded');
  }

  cropperReady(sourceImageDimensions: Dimensions) {
    console.log('Cropper ready', sourceImageDimensions);
    this.loading = false;
  }

  loadImageFailed() {
    console.error('Load image failed');
  }

  rotateLeft() {
    this.loading = true;
    setTimeout(() => { // Use timeout because rotating image is a heavy operation and will block the ui thread
      this.canvasRotation--;
      this.flipAfterRotate();
    });
  }

  rotateRight() {
    this.loading = true;
    setTimeout(() => {
      this.canvasRotation++;
      this.flipAfterRotate();
    });
  }

  moveLeft() {
    this.transform = {
      ...this.transform,
      translateH: ++this.translateH
    };
  }

  moveRight() {
    this.transform = {
      ...this.transform,
      translateH: --this.translateH
    };
  }

  moveTop() {
    this.transform = {
      ...this.transform,
      translateV: ++this.translateV
    };
  }

  moveBottom() {
    this.transform = {
      ...this.transform,
      translateV: --this.translateV
    };
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH
    };
    this.translateH = 0;
    this.translateV = 0;
  }

  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH
    };
  }

  flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV
    };
  }

  resetImage() {
    this.scale = 1;
    this.rotation = 0;
    this.canvasRotation = 0;
    this.transform = {
      translateUnit: 'px'
    };
  }

  zoomOut() {
    this.scale -= .1;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  zoomIn() {
    this.scale += .1;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  toggleContainWithinAspectRatio() {
    this.containWithinAspectRatio = !this.containWithinAspectRatio;
  }

  updateRotation() {
    this.transform = {
      ...this.transform,
      rotate: this.rotation
    };
  }

  toggleAspectRatio() {
    this.aspectRatio = this.aspectRatio === 4 / 3 ? 16 / 5 : 4 / 3;
  }

  deg2rad(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  ngOnInit(): void {
    /*
    this.img.src = this.imageURL;
    setTimeout(() => {
      if (this.canvas.nativeElement) {
        this.canvas.nativeElement.width = 1000;
        this.canvas.nativeElement.height = 1000;
        const ctx = this.canvas.nativeElement.getContext('2d')!;
        const cos = Math.cos(this.deg2rad(30));
        const sin = Math.sin(this.deg2rad(30));
        const rcos = Math.cos(this.deg2rad(-30));
        const rsin = Math.sin(this.deg2rad(-30));
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(0, 0);
        ctx.translate(200, 200); // Zero Point
        ctx.rotate(this.deg2rad(-30));
        // ??? 1. a + b = 100
        // ??? not dependent via box size
        // image size 와 관련?? 각도랑도?
        // ctx.drawImage(this.img, -((this.img.width / 2) + 274 - 70), -((this.img.height / 2) + 92 + 170));
        ctx.drawImage(this.img, -902, -291);
        ctx.resetTransform();
        ctx.globalAlpha = 0.2;
        ctx.resetTransform();
        ctx.fillRect(0, 0, 400, 400);
        ctx.resetTransform();
        ctx.fillRect(190, 190, 20, 20);
        ctx.resetTransform();
        // ctx.fillRect(200, 200, 400, 400);

      }
    }, 100);
     */
  }

  changeX(): void {
    const ctx = this.canvas.nativeElement.getContext('2d')!;
  }
}
