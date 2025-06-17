import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError } from "rxjs";
import { BASE_URL } from "../tokens/base-url.token";

export interface ApiRequest {
  api: string;
  url: string;
  query?: Record<string, string>;
  body?: unknown;
}

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private baseUrl = inject(BASE_URL);

  constructor(private http: HttpClient) {}

  get<T>(request: ApiRequest) {
    return this.http
      .get<T>(
        `${this.baseUrl}/${request.api}/${request.url}${this.getQueryParams(
          request.query
        )}`
      )
      .pipe(
        catchError((error: Error) => {
          throw error;
        })
      );
  }

  put<T>(request: ApiRequest) {
    return this.http
      .put<T>(`${this.baseUrl}/${request.api}/${request.url}`, request.body)
      .pipe(
        catchError((error: Error) => {
          throw error;
        })
      );
  }

  post<T>(request: ApiRequest) {
    return this.http
      .post<T>(`${this.baseUrl}/${request.api}/${request.url}`, request.body)
      .pipe(
        catchError((error: Error) => {
          throw error;
        })
      );
  }

  delete<T>(request: ApiRequest) {
    return this.http
      .delete<Response & T>(
        `${this.baseUrl}/${request.api}/${request.url}${this.getQueryParams(
          request.query
        )}`
      )
      .pipe(
        catchError((error: Error) => {
          throw error;
        })
      );
  }

  private getQueryParams(query: Record<string, string> | undefined) {
    return query
      ? "?" +
          Object.keys(query)
            .reduce((acc: string[], key: string) => {
              const val: string = query[`${key}`];
              acc.push(`${key}=${val}`);
              return acc;
            }, [])
            .join("&")
      : "";
  }
}
