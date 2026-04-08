import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {


  formRegister = new FormGroup(
    //Datos Personales
    {
      nombre: new FormControl('',[Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
      apellidos: new FormControl('',[Validators.required, Validators.minLength(2), Validators.maxLength(100)]),

    //Fecha de nacimiento
     fechaNacimiento: new FormControl('',[Validators.required]),
     
    //Cuenta
    email: new FormControl('',[Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    password: new FormControl('',[Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
    confirmPassword: new FormControl('',[Validators.required]),

    //Verificación de estudiante
    carnetEstudiante: new FormControl('',[Validators.required]),
    selfieCarnet: new FormControl('',[Validators.required]),
    }
  );


  //Funcion para validar que las contraseñas coinciden
  passwordsMatch(): boolean{
    const password = this.formRegister.get('password')?.value;
    const  confirmPassword = this.formRegister.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  //Funcion para validar fecha de nacimiento
  isFechaValida(): boolean{
    const fecha = this.formRegister.get('fechaNacimiento')?.value;
    if(!fecha){
      return false;
    }

    const fechaRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;
    if(!fechaRegex.test(fecha)){
      return false;
    }

    const [dia, mes, anio] = fecha.split('/').map(Number);
    const fechaObj = new Date(anio, mes -1, dia);

    //Verificar que la fecha sea válida
    if(fechaObj.getFullYear() !== anio || fechaObj.getMonth() !== mes -1 || fechaObj.getDate() !== dia){
      return false;
    }

    //Verificar que sea mayor de edad (18 años)
    const hoy = new Date();
    let edad = hoy.getFullYear() - anio;
    const mesDiff = hoy.getMonth() - (mes -1);
    if(mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < dia)){
      edad--;
    }
    return edad >= 18;
  }


  //Manejar subida de archivos
  onFileChange(event:any, fieldName:string){
    const file = event.target.files[0];
    if(file){
      this.formRegister.get(fieldName)?.setValue(file.name)
    }
  }


  submit():void{
    //Validar fecha manualmente
    if(!this.isFechaValida()){
      alert('Fecha de nacimiento inválida. Debes ser mayor de 18 años y usar formato DD/MM/YYYY');
      return;
    }

    //Validar contraseñas manualmente
    if(!this.passwordsMatch()){
      alert('Las contraseñas no coinciden');
      return;
    }

    if(this.formRegister.valid){
      console.log('Formulario válido:', this.formRegister.value);
      alert('¡Registro exitoso! Revisa la consola para ver los datos.');
    }else{
      alert('Por favor, comleta todos los campos correctamente.');
      //Marcar todos los campos como touched para mostrar errores
      Object.keys(this.formRegister.controls).forEach(key =>{
        const control = this.formRegister.get(key);
        control?.markAsTouched();
      })
    }
  }
}
