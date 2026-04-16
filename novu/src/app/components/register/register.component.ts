import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserAPIService } from '../../services/user-api.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  providers: [UserAPIService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

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
    const file = event.target.files[0];
    if (file) {
      this.formRegister.get(fieldName)?.setValue(file.name);
      this.formRegister.get(fieldName)?.markAsTouched();
    }
  }

  submit(): void {
    if (this.isFormReady) {
      console.log('Formulario válido:', this.formRegister.value);
      // this.userAPI.createRegisterRequest(this.formRegister.value)
      // alert('¡Registro exitoso! Revisa la consola para ver los datos.');
       this.userAPI.createRegisterRequest(this.formRegister.value).subscribe({
       next: (res) => console.log(res),
      error: (err) => console.error(err)
  });

    }

  }


}
