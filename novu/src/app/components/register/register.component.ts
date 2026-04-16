import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, formatCurrency } from '@angular/common';
import { UserAPIService } from '../../services/user-api.service';

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
  constructor(private userAPI: UserAPIService) {}
  formRegister = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    surname: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
    date_of_birth: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
    confirmPassword: new FormControl('', [Validators.required]),
    photo_student_id: new FormControl('', [Validators.required]),
    photo_id_selfie: new FormControl('', [Validators.required]),
  });

  // Getter que comprueba si el formulario está listo para enviar
  get isFormReady(): boolean {
    return this.formRegister.valid &&
           this.isFechaValida() &&
           this.passwordsMatch();
  }

  passwordsMatch(): boolean {
    const password = this.formRegister.get('password')?.value;
    const confirmPassword = this.formRegister.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  isFechaValida(): boolean {
    const fecha = this.formRegister.get('date_of_birth')?.value;
    if (!fecha) return false;

    const fechaRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;
    if (!fechaRegex.test(fecha)) return false;

    const [dia, mes, anio] = fecha.split('/').map(Number);
    const fechaObj = new Date(anio, mes - 1, dia);

    if (fechaObj.getFullYear() !== anio || fechaObj.getMonth() !== mes - 1 || fechaObj.getDate() !== dia) {
      return false;
    }

    const hoy = new Date();
    let age = hoy.getFullYear() - anio;
    const mesDiff = hoy.getMonth() - (mes - 1);
    if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < dia)) {
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
      }
      if (fieldName === "photo_id_selfie"){
        this.selfieFile = file // set the variable as the file
      }
      this.formRegister.get(fieldName)?.setValue(file.name); // set the name of the file in the field
      this.formRegister.get(fieldName)?.markAsTouched();
    }
  }

  submit(): void {
    if (this.isFormReady) {
      const formData= new FormData(); // new empty object to colect the form data since the formRegister.value only returns strings
      // name field
      formData.append("name", this.formRegister.get("name")?.value!)
      // surname field
      formData.append("surnames", this.formRegister.get("surnames")?.value!)

      // restructure the date field to be sent as the expected django date format
      const dateValue = this.formRegister.get('date_of_birth')?.value;
        if (dateValue) {
          const [dia, mes, anio] = dateValue.split('/'); // Destructuring the date components into seperate variables
          formData.append('date_of_birth', `${anio}-${mes}-${dia}`);
        }

        // email field
        formData.append('email', this.formRegister.get('email')?.value!);
        // password field
        formData.append('password', this.formRegister.get('password')?.value!);

        // add student photos
        formData.append('photo_student_id', this.studentIdFile!);
        formData.append('photo_id_selfie', this.selfieFile!);
        let dataToSend:Record<string, FormDataEntryValue> = {};

        formData.forEach((value, key) => {
          dataToSend[key] = value;
        })




      console.log('Formulario válido:', dataToSend);
      // this.userAPI.createRegisterRequest(this.formRegister.value)
      // alert('¡Registro exitoso! Revisa la consola para ver los datos.');
       this.userAPI.createRegisterRequest(formData).subscribe({
       next: (res) => console.log(res),
      error: (err) => console.error(err)
  });

    }

  }


}
