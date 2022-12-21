import { ElementRef, Injectable } from '@angular/core';
import { CropperPosition, Dimensions, MoveStart } from '../interfaces';
import { CropperSettings } from '../interfaces/cropper.settings';

@Injectable({ providedIn: 'root' })
export class CropperPositionService {

  resetCropperPosition(sourceImage: ElementRef, cropperPosition: CropperPosition, settings: CropperSettings): void {
    if (!sourceImage?.nativeElement) {
      return;
    }
    const sourceImageElement = sourceImage.nativeElement;
    if (settings.cropperStaticHeight && settings.cropperStaticWidth) {
      cropperPosition.x1 = 0;
      cropperPosition.x2 = sourceImageElement.offsetWidth > settings.cropperStaticWidth ?
        settings.cropperStaticWidth : sourceImageElement.offsetWidth;
      cropperPosition.y1 = 0;
      cropperPosition.y2 = sourceImageElement.offsetHeight > settings.cropperStaticHeight ?
        settings.cropperStaticHeight : sourceImageElement.offsetHeight;
    } else {
      const cropperWidth = Math.min(settings.cropperScaledMaxWidth, sourceImageElement.offsetWidth);
      const cropperHeight = Math.min(settings.cropperScaledMaxHeight, sourceImageElement.offsetHeight);
      if (!settings.maintainAspectRatio) {
        cropperPosition.x1 = 0;
        cropperPosition.x2 = cropperWidth;
        cropperPosition.y1 = 0;
        cropperPosition.y2 = cropperHeight;
      } else if (sourceImageElement.offsetWidth / settings.aspectRatio < sourceImageElement.offsetHeight) {
        cropperPosition.x1 = 0;
        cropperPosition.x2 = cropperWidth;
        const cropperHeightWithAspectRatio = cropperWidth / settings.aspectRatio;
        cropperPosition.y1 = (sourceImageElement.offsetHeight - cropperHeightWithAspectRatio) / 2;
        cropperPosition.y2 = cropperPosition.y1 + cropperHeightWithAspectRatio;
      } else {
        cropperPosition.y1 = 0;
        cropperPosition.y2 = cropperHeight;
        const cropperWidthWithAspectRatio = cropperHeight * settings.aspectRatio;
        cropperPosition.x1 = (sourceImageElement.offsetWidth - cropperWidthWithAspectRatio) / 2;
        cropperPosition.x2 = cropperPosition.x1 + cropperWidthWithAspectRatio;
      }
    }
  }

  move(event: any, moveStart: MoveStart, cropperPosition: CropperPosition) {
    const diffX = this.getClientX(event) - moveStart.clientX;
    const diffY = this.getClientY(event) - moveStart.clientY;

    cropperPosition.x1 = moveStart.x1 + diffX;
    cropperPosition.y1 = moveStart.y1 + diffY;
    cropperPosition.x2 = moveStart.x2 + diffX;
    cropperPosition.y2 = moveStart.y2 + diffY;
  }

  rotatePoint(pt: DOMRect, sin: number, cos: number): [number, number] {
    return [pt.x * cos + pt.y * sin, pt.y * cos - pt.x * sin];
  }

  deg2rad(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  resize(event: any, moveStart: MoveStart, cropperPosition: CropperPosition, maxSize: Dimensions, settings: CropperSettings, rotation: number): void {
    const cos = Math.cos(this.deg2rad(-rotation));
    const sin = Math.sin(this.deg2rad(-rotation));
    const tan = Math.tan(this.deg2rad(rotation));
    const center = {
      x: (cropperPosition.x1 + cropperPosition.x2) / 2,
      y: (cropperPosition.y1 + cropperPosition.y2) / 2,
      pw: Math.max(cropperPosition.x1 - cropperPosition.x2, cropperPosition.x2 - cropperPosition.x1),
      ph: Math.max(cropperPosition.y1 - cropperPosition.y2, cropperPosition.y2 - cropperPosition.y1),
      w: 0,
      h: 0
    };
    center.w = cos * center.pw;
    center.h = sin * center.ph;
    const delX = this.getClientX(event) - moveStart.clientX;
    const delY = this.getClientY(event) - moveStart.clientY;
    const angle = this.deg2rad(rotation);
    const moveX = delX * cos - delY * sin;
    const moveY = delX * sin + delY * cos;
    // 1. TL, TR, BL, BR 일 경우
    // Width, Height 구해서, 위치 알아서 변경할것
    let rotatingNames = [
      'topleft',
      'topright',
      'bottomright',
      'bottomleft',
    ];
    console.log(cos);
    console.log(sin);
    // Rotation Matrix
    const R = [
      [cos, -sin],
      [sin, cos]
    ];
    const movement = [moveY, moveX];
    const finalMovement = []
    switch (moveStart.position) {
      case 'topright':
      case 'topleft':
      case 'bottomleft':
      case 'bottomright':
    }

    console.log(moveX);
    console.log(moveY);

    switch (moveStart.position) {
      case 'left':
        cropperPosition.x1 = Math.min(Math.max(moveStart.x1 + moveX, cropperPosition.x2 - settings.cropperScaledMaxWidth),
          cropperPosition.x2 - settings.cropperScaledMinWidth);
        cropperPosition.x2 = Math.max(Math.min(moveStart.x2 - moveX, cropperPosition.x1 + settings.cropperScaledMaxWidth),
          cropperPosition.x1 + settings.cropperScaledMinWidth);
        break;
      case 'topleft':
        cropperPosition.x1 = Math.min(Math.max(moveStart.x1 + moveX, cropperPosition.x2 - settings.cropperScaledMaxWidth),
          cropperPosition.x2 - settings.cropperScaledMinWidth);
        cropperPosition.x2 = Math.max(Math.min(moveStart.x2 - moveX, cropperPosition.x1 + settings.cropperScaledMaxWidth),
          cropperPosition.x1 + settings.cropperScaledMinWidth);
        cropperPosition.y1 = Math.min(Math.max(moveStart.y1 + moveY, cropperPosition.y2 - settings.cropperScaledMaxHeight),
          cropperPosition.y2 - settings.cropperScaledMinHeight);
        cropperPosition.y2 = Math.max(Math.min(moveStart.y2 - moveY, cropperPosition.y1 + settings.cropperScaledMaxHeight),
          cropperPosition.y1 + settings.cropperScaledMinHeight);
        break;
      case 'top':
        cropperPosition.y1 = Math.min(Math.max(moveStart.y1 + moveY, cropperPosition.y2 - settings.cropperScaledMaxHeight),
          cropperPosition.y2 - settings.cropperScaledMinHeight);
        cropperPosition.y2 = Math.max(Math.min(moveStart.y2 - moveY, cropperPosition.y1 + settings.cropperScaledMaxHeight),
          cropperPosition.y1 + settings.cropperScaledMinHeight);
        break;
      case 'topright':
        cropperPosition.x1 = Math.min(Math.max(moveStart.x1 - moveX, cropperPosition.x2 - settings.cropperScaledMaxWidth),
          cropperPosition.x2 - settings.cropperScaledMinWidth);
        cropperPosition.x2 = Math.max(Math.min(moveStart.x2 + moveX, cropperPosition.x1 + settings.cropperScaledMaxWidth),
          cropperPosition.x1 + settings.cropperScaledMinWidth);
        cropperPosition.y1 = Math.min(Math.max(moveStart.y1 + moveY, cropperPosition.y2 - settings.cropperScaledMaxHeight),
          cropperPosition.y2 - settings.cropperScaledMinHeight);
        cropperPosition.y2 = Math.max(Math.min(moveStart.y2 - moveY, cropperPosition.y1 + settings.cropperScaledMaxHeight),
          cropperPosition.y1 + settings.cropperScaledMinHeight);
        break;
      case 'right':
        cropperPosition.x1 = Math.min(Math.max(moveStart.x1 - moveX, cropperPosition.x2 - settings.cropperScaledMaxWidth),
          cropperPosition.x2 - settings.cropperScaledMinWidth);
        cropperPosition.x2 = Math.max(Math.min(moveStart.x2 + moveX, cropperPosition.x1 + settings.cropperScaledMaxWidth),
          cropperPosition.x1 + settings.cropperScaledMinWidth);
        break;
      case 'bottomright':
        cropperPosition.x2 = Math.max(Math.min(moveStart.x2 + moveX * cos, cropperPosition.x1 + settings.cropperScaledMaxWidth),
          cropperPosition.x1 + settings.cropperScaledMinWidth);
        cropperPosition.x1 = Math.min(Math.max(moveStart.x1 - moveX * cos, cropperPosition.x2 - settings.cropperScaledMaxWidth),
          cropperPosition.x2 - settings.cropperScaledMinWidth);
        cropperPosition.y2 = Math.max(Math.min(moveStart.y2 + moveY, cropperPosition.y1 + settings.cropperScaledMaxHeight),
          cropperPosition.y1 + settings.cropperScaledMinHeight);
        cropperPosition.y1 = Math.min(Math.max(moveStart.y1 - moveY, cropperPosition.y2 - settings.cropperScaledMaxHeight),
          cropperPosition.y2 - settings.cropperScaledMinHeight);
        break;
      case 'bottom':
        cropperPosition.y1 = Math.min(Math.max(moveStart.y1 - moveY, cropperPosition.y2 - settings.cropperScaledMaxHeight),
          cropperPosition.y2 - settings.cropperScaledMinHeight);
        cropperPosition.y2 = Math.max(Math.min(moveStart.y2 + moveY, cropperPosition.y1 + settings.cropperScaledMaxHeight),
          cropperPosition.y1 + settings.cropperScaledMinHeight);
        break;
      case 'bottomleft':
        cropperPosition.x1 = Math.min(Math.max(moveStart.x1 + moveX, cropperPosition.x2 - settings.cropperScaledMaxWidth),
          cropperPosition.x2 - settings.cropperScaledMinWidth);
        cropperPosition.x2 = Math.max(Math.min(moveStart.x2 - moveX, cropperPosition.x1 + settings.cropperScaledMaxWidth),
          cropperPosition.x1 + settings.cropperScaledMinWidth);
        cropperPosition.y2 = Math.max(Math.min(moveStart.y2 + moveY, cropperPosition.y1 + settings.cropperScaledMaxHeight),
          cropperPosition.y1 + settings.cropperScaledMinHeight);
        cropperPosition.y1 = Math.min(Math.max(moveStart.y1 - moveY, cropperPosition.y2 - settings.cropperScaledMaxHeight),
          cropperPosition.y2 - settings.cropperScaledMinHeight);
        break;
      case 'center':
        const scale = event.scale;
        const newWidth = Math.min(
          Math.max(settings.cropperScaledMinWidth, (Math.abs(moveStart.x2 - moveStart.x1)) * scale),
          settings.cropperScaledMaxWidth);
        const newHeight = Math.min(
          Math.max(settings.cropperScaledMinHeight, (Math.abs(moveStart.y2 - moveStart.y1)) * scale),
          settings.cropperScaledMaxHeight);
        cropperPosition.x1 = moveStart.clientX - newWidth / 2;
        cropperPosition.x2 = moveStart.clientX + newWidth / 2;
        cropperPosition.y1 = moveStart.clientY - newHeight / 2;
        cropperPosition.y2 = moveStart.clientY + newHeight / 2;
        if (cropperPosition.x1 < 0) {
          cropperPosition.x2 -= cropperPosition.x1;
          cropperPosition.x1 = 0;
        } else if (cropperPosition.x2 > maxSize.width) {
          cropperPosition.x1 -= (cropperPosition.x2 - maxSize.width);
          cropperPosition.x2 = maxSize.width;
        }
        if (cropperPosition.y1 < 0) {
          cropperPosition.y2 -= cropperPosition.y1;
          cropperPosition.y1 = 0;
        } else if (cropperPosition.y2 > maxSize.height) {
          cropperPosition.y1 -= (cropperPosition.y2 - maxSize.height);
          cropperPosition.y2 = maxSize.height;
        }
        break;
    }

    if (settings.maintainAspectRatio) {
      this.checkAspectRatio(moveStart.position!, cropperPosition, maxSize, settings);
    }
  }

  checkAspectRatio(position: string, cropperPosition: CropperPosition, maxSize: Dimensions, settings: CropperSettings): void {
    let overflowX = 0;
    let overflowY = 0;

    switch (position) {
      case 'top':
        cropperPosition.x2 = cropperPosition.x1 + (cropperPosition.y2 - cropperPosition.y1) * settings.aspectRatio;
        overflowX = Math.max(cropperPosition.x2 - maxSize.width, 0);
        overflowY = Math.max(0 - cropperPosition.y1, 0);
        if (overflowX > 0 || overflowY > 0) {
          cropperPosition.x2 -= (overflowY * settings.aspectRatio) > overflowX ? (overflowY * settings.aspectRatio) : overflowX;
          cropperPosition.y1 += (overflowY * settings.aspectRatio) > overflowX ? overflowY : overflowX / settings.aspectRatio;
        }
        break;
      case 'bottom':
        cropperPosition.x2 = cropperPosition.x1 + (cropperPosition.y2 - cropperPosition.y1) * settings.aspectRatio;
        overflowX = Math.max(cropperPosition.x2 - maxSize.width, 0);
        overflowY = Math.max(cropperPosition.y2 - maxSize.height, 0);
        if (overflowX > 0 || overflowY > 0) {
          cropperPosition.x2 -= (overflowY * settings.aspectRatio) > overflowX ? (overflowY * settings.aspectRatio) : overflowX;
          cropperPosition.y2 -= (overflowY * settings.aspectRatio) > overflowX ? overflowY : (overflowX / settings.aspectRatio);
        }
        break;
      case 'topleft':
        cropperPosition.y1 = cropperPosition.y2 - (cropperPosition.x2 - cropperPosition.x1) / settings.aspectRatio;
        overflowX = Math.max(0 - cropperPosition.x1, 0);
        overflowY = Math.max(0 - cropperPosition.y1, 0);
        if (overflowX > 0 || overflowY > 0) {
          cropperPosition.x1 += (overflowY * settings.aspectRatio) > overflowX ? (overflowY * settings.aspectRatio) : overflowX;
          cropperPosition.y1 += (overflowY * settings.aspectRatio) > overflowX ? overflowY : overflowX / settings.aspectRatio;
        }
        break;
      case 'topright':
        cropperPosition.y1 = cropperPosition.y2 - (cropperPosition.x2 - cropperPosition.x1) / settings.aspectRatio;
        overflowX = Math.max(cropperPosition.x2 - maxSize.width, 0);
        overflowY = Math.max(0 - cropperPosition.y1, 0);
        if (overflowX > 0 || overflowY > 0) {
          cropperPosition.x2 -= (overflowY * settings.aspectRatio) > overflowX ? (overflowY * settings.aspectRatio) : overflowX;
          cropperPosition.y1 += (overflowY * settings.aspectRatio) > overflowX ? overflowY : overflowX / settings.aspectRatio;
        }
        break;
      case 'right':
      case 'bottomright':
        cropperPosition.y2 = cropperPosition.y1 + (cropperPosition.x2 - cropperPosition.x1) / settings.aspectRatio;
        overflowX = Math.max(cropperPosition.x2 - maxSize.width, 0);
        overflowY = Math.max(cropperPosition.y2 - maxSize.height, 0);
        if (overflowX > 0 || overflowY > 0) {
          cropperPosition.x2 -= (overflowY * settings.aspectRatio) > overflowX ? (overflowY * settings.aspectRatio) : overflowX;
          cropperPosition.y2 -= (overflowY * settings.aspectRatio) > overflowX ? overflowY : overflowX / settings.aspectRatio;
        }
        break;
      case 'left':
      case 'bottomleft':
        cropperPosition.y2 = cropperPosition.y1 + (cropperPosition.x2 - cropperPosition.x1) / settings.aspectRatio;
        overflowX = Math.max(0 - cropperPosition.x1, 0);
        overflowY = Math.max(cropperPosition.y2 - maxSize.height, 0);
        if (overflowX > 0 || overflowY > 0) {
          cropperPosition.x1 += (overflowY * settings.aspectRatio) > overflowX ? (overflowY * settings.aspectRatio) : overflowX;
          cropperPosition.y2 -= (overflowY * settings.aspectRatio) > overflowX ? overflowY : overflowX / settings.aspectRatio;
        }
        break;
      case 'center':
        cropperPosition.x2 = cropperPosition.x1 + (cropperPosition.y2 - cropperPosition.y1) * settings.aspectRatio;
        cropperPosition.y2 = cropperPosition.y1 + (cropperPosition.x2 - cropperPosition.x1) / settings.aspectRatio;
        const overflowX1 = Math.max(0 - cropperPosition.x1, 0);
        const overflowX2 = Math.max(cropperPosition.x2 - maxSize.width, 0);
        const overflowY1 = Math.max(cropperPosition.y2 - maxSize.height, 0);
        const overflowY2 = Math.max(0 - cropperPosition.y1, 0);
        if (overflowX1 > 0 || overflowX2 > 0 || overflowY1 > 0 || overflowY2 > 0) {
          cropperPosition.x1 += (overflowY1 * settings.aspectRatio) > overflowX1 ? (overflowY1 * settings.aspectRatio) : overflowX1;
          cropperPosition.x2 -= (overflowY2 * settings.aspectRatio) > overflowX2 ? (overflowY2 * settings.aspectRatio) : overflowX2;
          cropperPosition.y1 += (overflowY2 * settings.aspectRatio) > overflowX2 ? overflowY2 : overflowX2 / settings.aspectRatio;
          cropperPosition.y2 -= (overflowY1 * settings.aspectRatio) > overflowX1 ? overflowY1 : overflowX1 / settings.aspectRatio;
        }
        break;
    }
  }

  getClientX(event: any): number {
    return event.touches?.[0].clientX || event.clientX || 0;
  }

  getClientY(event: any): number {
    return event.touches?.[0].clientY || event.clientY || 0;
  }
}
