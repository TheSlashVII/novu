import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, formatCurrency } from '@angular/common';
import { UserAPIService } from '../../services/user-api.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  providers: [UserAPIService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  private studentIdFile:File | null = null;
  private selfieFile:File | null = null;
  errorMessage: string = '';
  studentSelfieButtonLabel:string = 'Choose a file...'
  studentIdButtonLabel:string = 'Choose a file...'

  constructor(private userAPI: UserAPIService, private router: Router) {}
  formRegister = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    surnames: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
    date_of_birth: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
    confirmPassword: new FormControl('', [Validators.required]),
    photo_student_id: new FormControl('', [Validators.required]),
    photo_id_selfie: new FormControl('', [Validators.required]),
  });

  // Getter que comprueba si el formulario está listo para enviar
  get isFormReady(): boolean {
    return this.formRegister.valid && this.passwordsMatch();
  }

  passwordsMatch(): boolean {
    const password = this.formRegister.get('password')?.value;
    const confirmPassword = this.formRegister.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  isDateValid(): boolean {
    const date = this.formRegister.get('date_of_birth')?.value;
    if (!date) return false;

    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;
    if (!dateRegex.test(date)) return false;

    const [day, month, year] = date.split('/').map(Number);
    const dateObj = new Date(year, month - 1, day);

    if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
      return false;
    }

    const hoy = new Date();
    let age = hoy.getFullYear() - year;
    const monthDiff = hoy.getMonth() - (month - 1);
    if (monthDiff < 0 || (monthDiff === 0 && hoy.getDate() < day)) {
      age--;
    }
    return age >= 18;
  }

  onFileChange(event: any, fieldName: string) {
    const inputField = event.target as HTMLInputElement;
    const file = inputField.files![0]
    if (file) {
      // check if the field is the student ID field or the selfie with the id field
      if (fieldName === "photo_student_id"){
        this.studentIdFile = file // set the variable as the file
          this.studentIdButtonLabel = file.name
      }
      if (fieldName === "photo_id_selfie"){
        this.selfieFile = file // set the variable as the file
          this.studentSelfieButtonLabel = file.name
      }
      this.formRegister.get(fieldName)?.setValue(file.name); // set the name of the file in the field
      this.formRegister.get(fieldName)?.markAsTouched();
    }
  }
    goToLogin(){
      this.router.navigateByUrl("/login").catch((error: Error) => {console.log(`Something went wrong: ${error.message}`)});
    }
    goToWelcome(){
      this.router.navigateByUrl("").catch((error: Error) => {console.log(`Something went wrong: ${error.message}`)});
    }
  submit(): void {
    if (this.isFormReady) {
      const formData= new FormData(); // new empty object to colect the form data since the formRegister.value only returns strings
      // name field
      formData.append("name", this.formRegister.get("name")?.value!)
      // surname field
      formData.append("surnames", this.formRegister.get("surnames")?.value!)

      // restructure the date field to be sent as the expected django date format
        /*
      const dateValue = this.formRegister.get('date_of_birth')?.value;
        if (dateValue) {
          const [day, month, year] = dateValue.split('/'); // Destructuring the date components into seperate variables
          formData.append('date_of_birth', `${year}-${month}-${day}`);
        }
        */
        formData.append('date_of_birth', this.formRegister.get("date_of_birth")?.value!)


        // email field
        formData.append('email', this.formRegister.get('email')?.value!);
        // password field
        formData.append('password', this.formRegister.get('password')?.value!);

        // add student photos
        formData.append('photo_student_id', this.studentIdFile!);
        formData.append('photo_id_selfie', this.selfieFile!);

        let dataToSend:Record<string, FormDataEntryValue> = {}; // Record is like an ArrayList or HashMap from Java. You can store key value pairs in objects

        formData.forEach((value, key) => {
          dataToSend[key] = value; // this will generate a line of {"key" : "value"} inside the record
        })




      console.log('Formulario válido:', dataToSend);
      // this.userAPI.createRegisterRequest(this.formRegister.value)
      // alert('¡Registro exitoso! Revisa la consola para ver los datos.');
       this.userAPI.createRegisterRequest(formData).subscribe({
       next: (res) => {
         //console.log(res);
         this.router.navigateByUrl("/postRegister");
       },
      error: (err) => {
       if(err.error?.error) {
        this.errorMessage = err.error.error;
       } else {
        this.errorMessage = 'Algo ha ido mal. Intentalo de nuevo.';
       }
      }
  });

    }

  }


}
