import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, Subject} from "rxjs";
import {environment} from "../../../environments/environment.development";
import {DefaultResponseType} from "../../../types/default-response.type";
import {UserInfoType} from "../../../types/userInfo.type";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  count: number = 0;
  count$: Subject<number> = new Subject<number>();

  private http = inject(HttpClient);

  getUserInfo(): Observable<UserInfoType | DefaultResponseType> {
    return this.http.get<UserInfoType | DefaultResponseType>(environment.api + 'user');
  }
  updateUserInfo(params: UserInfoType): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'user', params);
  }
}
