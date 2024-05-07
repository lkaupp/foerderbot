import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class RagService {
  apiUrl: string = "";
  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl;
  }

  getAnswer(question: string): Observable<string> {
    return this.http.get(this.apiUrl + 'query?text=' + question, {responseType: 'text'});
  }
}
