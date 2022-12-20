import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperComponent } from './component/image-cropper.component';
import {MatSliderModule} from "@angular/material/slider";

@NgModule({
    imports: [
        CommonModule,
        MatSliderModule
    ],
  declarations: [
    ImageCropperComponent,

  ],
  exports: [
    ImageCropperComponent
  ]
})
export class ImageCropperModule {
}
