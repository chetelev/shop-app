import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {BehaviorSubject, throwError} from 'rxjs';
import {User} from './user.model';
import {Router} from '@angular/router';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = new BehaviorSubject<User>(null);
  tokenExpirationTimer;

  constructor(private http: HttpClient, private router: Router) {
  }

  signUp(email: string, password: string) {
    return this.http
      .post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyA62Wkzizqom9fhMEwb799f_M6OssQNlmY',
        {
          email,
          password,
          returnSecureToken: true
        })
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handleAuthentication(resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn);
        })
      );
  }

  logIn(email: string, password: string) {
    return this.http
      // tslint:disable-next-line:max-line-length
      .post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyA62Wkzizqom9fhMEwb799f_M6OssQNlmY',
        {
          email,
          password,
          returnSecureToken: true
        })
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handleAuthentication(resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn);
        }));
  }

  private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(errRes: HttpErrorResponse) {
    let errMessage = 'An unknown error occurred!';
    switch (errRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errMessage = 'This email already exists!';
        break;
      case 'EMAIL_NOT_FOUND':
        errMessage = 'This email does not exist!';
        break;
      case 'INVALID_PASSWORD':
        errMessage = 'Incorrect password!';
        break;
      case 'USER_DISABLED':
        errMessage = 'User is disabled!';
        break;
    }
    return throwError(errMessage);
  }

  autoLogin() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!this.user) {
      return;
    }
    const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }
}
