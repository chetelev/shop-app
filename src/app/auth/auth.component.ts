import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthResponseData, AuthService} from './auth.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent {
  isLoading = false;
  isLoginMode = true;
  error: string = null;

  formGroup = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl(''),
  });

  constructor(private authService: AuthService, private router: Router) {
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit() {
    if (!this.formGroup.valid) {
      return;
    }
    const email = this.formGroup.value.email;
    const password = this.formGroup.value.password;
    let authObs: Observable<AuthResponseData>;
    this.isLoading = true;

    if (this.isLoginMode) {
      authObs = this.authService.logIn(email, password);
    } else {
      authObs = this.authService.signUp(email, password);
    }
    authObs.subscribe(responseData => {
      this.isLoading = false;
      this.router.navigate(['/recipes']);
    }, errorMsg => {
      this.error = errorMsg;
      this.isLoading = false;
    });
    this.formGroup.reset();
  }
}
