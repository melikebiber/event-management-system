import { Component } from '@angular/core';
import {
  FormControl, //tek bir form alanını yönetir. Örneğin e-posta kutusu bir FormControl olur.
  FormGroup, //birden fazla form alanını tek form altında toplar.
  ReactiveFormsModule, //HTML içinde [formGroup] ve formControlName kullanabilmemizi sağlar.
  Validators //kullanıcının girdiği verileri kontrol eder.
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginMessage = ''; //Backend'den gelen başarılı veya hatalı giriş mesajını tutar.
  isLoading = false; //Backend isteğinin devam edip etmediğini kontrol eder.

  loginForm = new FormGroup({ //loginForm adında bir form grubu oluşturduk.
    email: new FormControl('', {
      nonNullable: true, //Bu alanın değerinin null olmasını engeller.
      validators: [
        Validators.required, //Alan boş bırakılamaz.
        Validators.email //Girilen metin e-posta biçiminde olmalıdır.
      ]
    }),

    password: new FormControl('', {
      nonNullable: true, //Şifre değerinin null olmasını engeller.
      validators: [
        Validators.required,
        Validators.minLength(6)
      ]
    })
  });

  constructor(
    private authService: Auth,
  private router: Router) {}

  onSubmit() { //Kullanıcı giriş butonuna bastığında bu fonksiyonu çalıştıracağız.
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true; //Backend isteği başladığında yükleniyor durumunu aktif eder.
    this.loginMessage = ''; //Daha önce gösterilmiş mesajı temizler.

    const loginData = this.loginForm.getRawValue(); //Formdaki email ve password değerlerini alır.

    console.log('Form bilgileri:', loginData);

    this.authService.login(loginData).subscribe({
      next: (response) => {
        //Backend başarılı bir cevap gönderirse bu bölüm çalışır.
        this.isLoading = false;
        this.loginMessage = 'Giriş işlemi başarılı.';

        console.log('Backend cevabı:', response);

        if (response.token) {
          //Backend JWT token gönderirse tarayıcının localStorage alanına kaydeder.
          localStorage.setItem('token', response.token);

          this.router.navigate(['/events']);
        }
      },

      error: (error) => {
        //Backend hata gönderirse veya sunucuya ulaşılamazsa bu bölüm çalışır.
        this.isLoading = false;

        this.loginMessage =
          error.error?.message ||
          error.error?.error ||
          'Giriş işlemi başarısız.';

        console.error('Giriş hatası:', error);
      }
    });
  }
}