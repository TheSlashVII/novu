import { Component } from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CardTab} from '../../services/card-tab.service';

@Component({
  selector: 'app-card-creation',
    imports: [
        FormsModule,
        ReactiveFormsModule
    ],
  templateUrl: './card-creation.component.html',
  styleUrl: './card-creation.component.css'
})
export class CardCreationComponent {
    choosePhoto:string = "Elige una foto para subir";
    cardTitle: string = 'Tu titulo irá aquí';
    cardSubtitle: string = 'Tu subtitulo irá aquí';
    cardBiography: string = 'Tu biografía irá aquí';
    cardAge: string | number = '';
    form = new FormGroup({
        cardTitle:     new FormControl('', [Validators.required, Validators.maxLength(50)]),
        cardSubtitle:  new FormControl('', [Validators.required, Validators.maxLength(50)]),
        cardAge:       new FormControl<number | null>(null, [Validators.required, Validators.min(16), Validators.max(99)]),
        cardBiography: new FormControl('', [Validators.maxLength(100)]),
        photo:         new FormControl<File | null>(null),
    });


    get cardTitleValue()     { return this.form.get('cardTitle')!; }
    get cardSubtitleValue()  { return this.form.get('cardSubtitle')!; }
    get cardAgeValue()       { return this.form.get('cardAge')!; }
    get cardBiographyValue() { return this.form.get('cardBiography')!; }



    onPhotoChange(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0] ?? null;
        this.form.patchValue({ photo: file });
        this.choosePhoto = "Una foto de fondo ha sido elegida"
    }

    onSubmit() {
        if (this.form.invalid) return;
        console.log(this.form.value);

    }

    updateValue($event:any, fieldName:string):void{
        const inputField = $event.target as HTMLInputElement; // gets the field selected
        if (inputField.value == "") {
            // changes the values on the example to their default values
            if (fieldName == "cardTitle") {
                this.cardTitle = "Tu titulo irá aquí"
            } else if (fieldName == "cardSubtitle") {
                this.cardSubtitle = 'Tu subtitulo irá aquí';
            } else if(fieldName == "cardBiography") {
                this.cardBiography = "Tu biografía irá aquí";
            } else if (fieldName == "cardAge"){
                this.cardAge = '';
            }

        } else {
            // changes values on the example card to their new values
            if (fieldName == "cardTitle") {
                this.cardTitle = inputField.value;
            } else if (fieldName == "cardSubtitle") {
                this.cardSubtitle = inputField.value;
            } else if (fieldName == "cardBiography") {
                this.cardBiography = inputField.value;
            } else if (fieldName == "cardAge"){
                this.cardAge = inputField.value;
            }


        }

    }
    newBackgroundPhoto(event:any, fileName:string){
        const inputField:any = event.target as HTMLInputElement;
        const file = inputField.files![0];
        console.log(file.name);
    }
}
