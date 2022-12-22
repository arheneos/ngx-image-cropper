import { ElementRef, Injectable } from '@angular/core';
import { CropperPosition, ImageCroppedEvent, LoadedImage } from '../interfaces';
import { CropperSettings } from '../interfaces/cropper.settings';
import { resizeCanvas } from '../utils/resize.utils';
import { percentage } from '../utils/percentage.utils';

@Injectable({providedIn: 'root'})
export class CropService {

  deg2rad(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  crop(sourceImage: ElementRef, loadedImage: LoadedImage, cropper: CropperPosition, settings: CropperSettings, rotation: number): ImageCroppedEvent | null {
    const imagePosition = this.getImagePosition(sourceImage, loadedImage, cropper, settings);
    const origin_width = Math.max(imagePosition.x1 - imagePosition.x2, imagePosition.x2 - imagePosition.x1);
    const origin_height = Math.max(imagePosition.y1 - imagePosition.y2, imagePosition.y2 - imagePosition.y1);
    const cropCanvas = document.createElement('canvas') as HTMLCanvasElement;
    const center = {
      x: (imagePosition.x1 + imagePosition.x2) / 2,
      y: (imagePosition.y1 + imagePosition.y2) / 2,
      pw: Math.max(imagePosition.x1 - imagePosition.x2, imagePosition.x2 - imagePosition.x1),
      ph: Math.max(imagePosition.y1 - imagePosition.y2, imagePosition.y2 - imagePosition.y1),
    };
    const width = origin_width;
    const height = origin_height;

    cropCanvas.width = width;
    cropCanvas.height = height;

    const ctx = cropCanvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    if (settings.backgroundColor != null) {
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(width / 2, height / 2); // Zero Point
    ctx.rotate((-rotation || 0) * Math.PI / 180);
    ctx.drawImage(
      loadedImage.transformed.image,
      -center.x,
      -center.y,
    );
    const output: ImageCroppedEvent = {
      width, height,
      imagePosition,
      cropperPosition: {...cropper}
    };
    if (settings.containWithinAspectRatio) {
      output.offsetImagePosition = this.getOffsetImagePosition(sourceImage, loadedImage, cropper, settings);
    }
    const resizeRatio = this.getResizeRatio(width, height, settings);
    if (resizeRatio !== 1) {
      output.width = Math.round(width * resizeRatio);
      output.height = settings.maintainAspectRatio
        ? Math.round(output.width / settings.aspectRatio)
        : Math.round(height * resizeRatio);
      resizeCanvas(cropCanvas, output.width, output.height);
    }
    output.base64 = cropCanvas.toDataURL('image/' + settings.format, this.getQuality(settings));
    return output;
  }

  private getCanvasTranslate(sourceImage: ElementRef, loadedImage: LoadedImage, settings: CropperSettings): { translateH: number, translateV: number } {
    if (settings.transform.translateUnit === 'px') {
      const ratio = this.getRatio(sourceImage, loadedImage);
      return {
        translateH: (settings.transform.translateH || 0) * ratio,
        translateV: (settings.transform.translateV || 0) * ratio
      };
    } else {
      return {
        translateH: settings.transform.translateH ? percentage(settings.transform.translateH, loadedImage.transformed.size.width) : 0,
        translateV: settings.transform.translateV ? percentage(settings.transform.translateV, loadedImage.transformed.size.height) : 0
      };
    }
  }

  private getRatio(sourceImage: ElementRef, loadedImage: LoadedImage): number {
    const sourceImageElement = sourceImage.nativeElement;
    return loadedImage.transformed.size.width / sourceImageElement.offsetWidth;
  }

  private getImagePosition(sourceImage: ElementRef, loadedImage: LoadedImage, cropper: CropperPosition, settings: CropperSettings): CropperPosition {
    const ratio = this.getRatio(sourceImage, loadedImage);
    const out: CropperPosition = {
      x1: Math.round(cropper.x1 * ratio),
      y1: Math.round(cropper.y1 * ratio),
      x2: Math.round(cropper.x2 * ratio),
      y2: Math.round(cropper.y2 * ratio)
    };
    return out;
  }

  private getOffsetImagePosition(sourceImage: ElementRef, loadedImage: LoadedImage, cropper: CropperPosition, settings: CropperSettings): CropperPosition {
    const canvasRotation = settings.canvasRotation + loadedImage.exifTransform.rotate;
    const sourceImageElement = sourceImage.nativeElement;
    const ratio = loadedImage.transformed.size.width / sourceImageElement.offsetWidth;
    let offsetX: number;
    let offsetY: number;

    if (canvasRotation % 2) {
      offsetX = (loadedImage.transformed.size.width - loadedImage.original.size.height) / 2;
      offsetY = (loadedImage.transformed.size.height - loadedImage.original.size.width) / 2;
    } else {
      offsetX = (loadedImage.transformed.size.width - loadedImage.original.size.width) / 2;
      offsetY = (loadedImage.transformed.size.height - loadedImage.original.size.height) / 2;
    }

    const out: CropperPosition = {
      x1: Math.round(cropper.x1 * ratio) - offsetX,
      y1: Math.round(cropper.y1 * ratio) - offsetY,
      x2: Math.round(cropper.x2 * ratio) - offsetX,
      y2: Math.round(cropper.y2 * ratio) - offsetY
    };

    if (!settings.containWithinAspectRatio) {
      out.x1 = Math.max(out.x1, 0);
      out.y1 = Math.max(out.y1, 0);
      out.x2 = Math.min(out.x2, loadedImage.transformed.size.width);
      out.y2 = Math.min(out.y2, loadedImage.transformed.size.height);
    }

    return out;
  }

  getResizeRatio(width: number, height: number, settings: CropperSettings): number {
    const ratioWidth = settings.resizeToWidth / width;
    const ratioHeight = settings.resizeToHeight / height;
    const ratios = new Array<number>();

    if (settings.resizeToWidth > 0) {
      ratios.push(ratioWidth);
    }
    if (settings.resizeToHeight > 0) {
      ratios.push(ratioHeight);
    }

    const result = ratios.length === 0 ? 1 : Math.min(...ratios);

    if (result > 1 && !settings.onlyScaleDown) {
      return result;
    }
    return Math.min(result, 1);
  }

  getQuality(settings: CropperSettings): number {
    return Math.min(1, Math.max(0, settings.imageQuality / 100));
  }
}
