import { HttpProvider } from '../../providers/http-provider/http-provider';
import { Component,ElementRef,Input,Output,EventEmitter } from '@angular/core';
import { App,ActionSheetController } from 'ionic-angular';
import { Camera } from 'ionic-native';

/*
  Generated class for the ImgLoader component.

  See https://angular.io/docs/ts/latest/api/core/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/

@Component({
  selector: 'img-loader',
  templateUrl: 'img-loader.html'
})
export class ImgLoader {

  label: any;
  fileIn: any;
  canvas: any;
  el: any;
  
  @Input("id") imgId: string;
  @Input("src") firstSrc: string;
  @Output("change") imgChange: any = new EventEmitter();
  
  unid: string = "";
  file: any = "";
  imgSrc: any = "";
  
  imgTop: any = "0";
  imgLeft: any = "0";
  imgHeight: any = "0";
  imgWidth: any = "0";
  oriHeight: any = 0;
  oriWidth: any = 0;

  constructor(public actionSheetCtrl: ActionSheetController,public http: HttpProvider,public app: App,public ref: ElementRef) {
    this.el = ref.nativeElement;
 }
  
  ngAfterViewInit(): void{
        
        this.label = this.el.childNodes[1];
        
        this.canvas = this.label.childNodes[1];
        
        let style = window.getComputedStyle(this.el, null);
        this.label.style.borderRadius = style.getPropertyValue("border-radius");
        
        if(this.firstSrc && this.firstSrc != ""){
            this.drawPreview(this.firstSrc);
        }
        
    }
    
    ngOnChanges(evt){
        if(evt.firstSrc){
            this.drawPreview(this.firstSrc);
        }
    }
    
    drawPreview(imgSrc: any): void{
        
        let tmpImg = new Image();
        tmpImg.onload = ()=>{
            
            let style = window.getComputedStyle(this.canvas, null);
            
            let tmpW: any = style.getPropertyValue("width");
            let tmpH: any = style.getPropertyValue("height");
            
            tmpW = parseFloat(tmpW.slice(0,tmpW.indexOf("px")));
            tmpH = parseFloat(tmpH.slice(0,tmpH.indexOf("px")));
            
            let canRatio = tmpW/tmpH;
            
            let oldW = tmpImg.width;
            let oldH = tmpImg.height;
            
            let imgRatio = oldW/oldH;
            
            let srcW = 0;
            let srcH = 0;
            let srcXPos = 0;
            let srcYPos = 0;
            
            if(canRatio > imgRatio){
                srcW = tmpW;
                srcH = tmpH*canRatio/imgRatio;
                srcYPos = (srcH - tmpH) / 2
            }else if(imgRatio > canRatio){
                srcW = tmpW*imgRatio/canRatio;
                srcH = tmpH;
                srcXPos = (srcW - tmpW) / 2
            }else{
                srcW = tmpW;
                srcH = tmpH;
            }
            
            
            this.oriHeight = oldH;
            this.oriWidth = oldW;
            
            this.imgTop = (-srcYPos).toString()+"px";
            this.imgLeft = (-srcXPos).toString()+"px";
            this.imgWidth = (srcW).toString()+"px";
            this.imgHeight = (srcH).toString()+"px";
            this.imgSrc = imgSrc;
            
        }
        tmpImg.src = imgSrc;
        this.file = imgSrc;
    }
    
    moveImg(x: number,y: number){
        
        let rX: number = x/Math.abs(x);
        let rY: number = y/Math.abs(y);
        
        let cStyle = window.getComputedStyle(this.canvas, null);
        let style = window.getComputedStyle(this.canvas.childNodes[1], null);
           
        let cTmpW: any = cStyle.getPropertyValue("width");
        let cTmpH: any = cStyle.getPropertyValue("height");
        let tmpW: any = style.getPropertyValue("width");
        let tmpH: any = style.getPropertyValue("height");
            
        cTmpW = parseFloat(cTmpW.slice(0,cTmpW.indexOf("px")));
        cTmpH = parseFloat(cTmpH.slice(0,cTmpH.indexOf("px")));
        tmpW = parseFloat(tmpW.slice(0,tmpW.indexOf("px")));
        tmpH = parseFloat(tmpH.slice(0,tmpH.indexOf("px")));
            
        let deltaX = tmpW - cTmpW;
        let deltaY = tmpH - cTmpH
            
        let tmpT: any = style.getPropertyValue("top");
        let tmpL: any = style.getPropertyValue("left");
        
        tmpT = parseFloat(tmpT.slice(0,tmpT.indexOf("px")));
        tmpL = parseFloat(tmpL.slice(0,tmpL.indexOf("px")));
        
            
        if(tmpL+rX < -deltaX){
            this.imgLeft = (-deltaX).toString()+"px";
        }else if(tmpL+rX > 0){
            this.imgLeft = "0px";
        }else{
            this.imgLeft = (tmpL+rX*2).toString()+"px";
        }
        
        if(tmpT+rY < -deltaY){
            this.imgTop = (-deltaY).toString()+"px";
        }else if(tmpT+rY > 0){
            this.imgTop = "0px";
        }else{
            this.imgTop = (tmpT+rY*2).toString()+"px";
        }
    }
    
    panAction(evt: any){
        this.moveImg(Math.round(evt.deltaX/2),Math.round(evt.deltaY/2));
    }
    
    getCropInfo(){
        
        let cStyle = window.getComputedStyle(this.canvas, null);
        let style = window.getComputedStyle(this.canvas.childNodes[1], null);
           
        let cTmpW: any = cStyle.getPropertyValue("width");
        let cTmpH: any = cStyle.getPropertyValue("height");
        let tmpW: any = style.getPropertyValue("width");
        let tmpH: any = style.getPropertyValue("height");
            
        cTmpW = parseFloat(cTmpW.slice(0,cTmpW.indexOf("px")));
        cTmpH = parseFloat(cTmpH.slice(0,cTmpH.indexOf("px")));
        tmpW = parseFloat(tmpW.slice(0,tmpW.indexOf("px")));
        tmpH = parseFloat(tmpH.slice(0,tmpH.indexOf("px")));
            
            
        let tmpT: any = style.getPropertyValue("top");
        let tmpL: any = style.getPropertyValue("left");
        
        tmpT = parseFloat(tmpT.slice(0,tmpT.indexOf("px")));
        tmpL = parseFloat(tmpL.slice(0,tmpL.indexOf("px")));
        
        let zoomX = this.oriWidth / tmpW;
        let zoomY = this.oriHeight / tmpH;
        
        return {"x":Math.round(Math.abs(tmpL*zoomX)),"y":Math.round(Math.abs(tmpT*zoomY)),"oriWidth":Math.round(cTmpW*zoomX),"oriHeight":Math.round(cTmpH*zoomY)};
        
    }
    
    choosePicture() {
        let actionSheet = this.actionSheetCtrl.create({
        title: 'Picture',
        buttons: [
            {
            text: 'Take a picture',
            handler: () => {
                this.createPrev(true)
                console.log('Destructive clicked');
            }
            },{
            text: 'Get a picture',
            handler: () => {
                this.createPrev(false)
                console.log('Archive clicked');
            }
            },{
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
                console.log('Cancel clicked');
            }
            }
        ]
        });
        actionSheet.present();
    }
    
    createPrev(take: boolean): void{
        if(take){
            let options= { correctOrientation: true,};
            Camera.getPicture(options).then((imageData) => {
                
                this.imgChange.emit({
                    value: "Image change ..."
                });
                
                this.drawPreview(imageData);
                
            }, (err) => {
                // Handle error
            }); 
        }else{
            let options= { correctOrientation: true,sourceType:2};
            Camera.getPicture(options).then((imageData) => {
                
                this.imgChange.emit({
                    value: "Image change ..."
                });
                
                this.drawPreview(imageData);
                
            }, (err) => {
                // Handle error
            }); 
        }
        
    }
    
    errLog(text: string): void{
        console.log(text);
    }
  
}
