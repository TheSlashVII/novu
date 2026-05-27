import {Component, OnDestroy} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CardTab, CardTabService} from '../../services/card-tab.service';
import {UserAPIService} from '../../services/user-api.service';
import {Router} from '@angular/router';
import {UserProfile} from '../home/home.component';

@Component({
  selector: 'app-card-creation',
    imports: [
        FormsModule,
        ReactiveFormsModule
    ],
  templateUrl: './card-creation.component.html',
  styleUrl: './card-creation.component.css'
})
export class CardCreationComponent implements OnDestroy {
    choosePhoto:string = "Elige una foto para subir";
    cardTitle: string = 'Tu titulo irá aquí';
    cardSubtitle: string = 'Tu subtitulo irá aquí';
    cardBiography: string = 'Tu biografía irá aquí';
    cardAge: string | number = '';
    name: string = '';
    photoPreviewUrl: string | null = null;
    form = new FormGroup({
        cardTitle:     new FormControl('', [Validators.required, Validators.maxLength(50)]),
        cardSubtitle:  new FormControl('', [Validators.required, Validators.maxLength(50)]),
        cardAge:       new FormControl<number | null>(null, [Validators.required, Validators.min(16), Validators.max(99)]),
        cardBiography: new FormControl('', [Validators.maxLength(100)]),
        photo:         new FormControl<File | null>(null),
    });
    errorMessage:string = ''
    isErrorMessageDisplaying:boolean = false;

    constructor(private userAPI:UserAPIService, private router: Router, private cardAPI:CardTabService) {
        const token = userAPI.decodeToken();

        this.userAPI.getUserById(token.user_id).subscribe({
            next: (res:any) => {
                if(res.restricted){
                    this.router.navigateByUrl('');
                }
                if (!res.is_new) {
                    this.router.navigate(['/home']);
                }
                this.name = res.name;
            }
        })
    }
    get cardTitleValue()     { return this.form.get('cardTitle')!; }
    get cardSubtitleValue()  { return this.form.get('cardSubtitle')!; }
    get cardAgeValue()       { return this.form.get('cardAge')!; }
    get cardBiographyValue() { return this.form.get('cardBiography')!; }


/*
    onPhotoChange(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0] ?? null;
        this.form.patchValue({ photo: file });
        this.choosePhoto = `Se ha elegido: "${file!.name}". (Los otros usuarios podran ver la foto de fondo)`
    }


 */
    onPhotoChange(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0] ?? null;
        this.form.patchValue({ photo: file });
        if (file) {
            if (this.photoPreviewUrl) URL.revokeObjectURL(this.photoPreviewUrl); // checks if the image was removed
            this.photoPreviewUrl = URL.createObjectURL(file);
        }
        this.choosePhoto = `Se ha elegido: "${file!.name}".`;
    }
    updateUserAge(){
        const token = this.userAPI.decodeToken();
        this.userAPI.updateUserAge(token.user_id, this.form.value.cardAge!).subscribe({
            next: (res:any) => {
                console.log(res)
            }, error: (err:any) => {
                console.log(err)
            }
        })

    }
    ngOnDestroy() {
        if (this.photoPreviewUrl) URL.revokeObjectURL(this.photoPreviewUrl);
    }
    onSubmit() {
        if (this.form.invalid) return;
        const formData = new FormData();
        const token = this.userAPI.decodeToken()
        this.updateUserAge();
        // update cardTab #1
        const tab:CardTab ={
            background_photo: this.form.value.photo!,
            header: this.form.value.cardTitle!,
            id_card: Number(token.user_id),
            id_section: 1, // will always point the first card tab made
            sub_header: this.form.value.cardSubtitle!,
            tab_biography: this.form.value.cardBiography!
        }
        console.log(this.form.value.photo?.name);
        const photoToUpload = new FormData();
        photoToUpload.append("background_photo", this.form.value.photo!)
        this.userAPI.uploadPhoto(Number(token.user_id), photoToUpload).subscribe(
            {
                next: (res) => {
                    let newBackgroundPhotoUrl = res.photo.url.slice(1)
                    formData.append("background_photo",newBackgroundPhotoUrl);
                    formData.append("header", this.form.value.cardTitle!);
                    formData.append("sub_header",this.form.value.cardSubtitle!);
                    formData.append("tab_biography", this.form.value.cardBiography!)
                    formData.append("id_card", String(token.user_id));
                    formData.append("id_section", "1");

                    let dataToSend:Record<string, FormDataEntryValue> = {}
                    formData.forEach((value, key) => {
                        dataToSend[key] = value;
                    })
                    console.log(formData)
                    console.log(dataToSend)
                    this.cardAPI.patchCardTab(Number(token.user_id), 1, dataToSend).subscribe({
                        next: value =>{
                            this.userAPI.updateIsUserNewStatus(token.user_id).subscribe({
                                next: (res) => {
                                    this.router.navigateByUrl("/home")
                                }, error: (err:any) => {
                                    this.errorMessage = "Error actualizando al usuario"
                                    this.isErrorMessageDisplaying = true;
                                    setTimeout(() => {
                                        this.isErrorMessageDisplaying = false;
                                    }, 2000)
                                }
                            })

                        },
                        error: err => {
                            this.errorMessage = "Error guardando la carta de presentacion"
                            this.isErrorMessageDisplaying = true;
                            setTimeout(() => {
                                this.isErrorMessageDisplaying = false;
                            }, 2000)
                        }

                    })
                }
            }
        )




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
}
