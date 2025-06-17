import { InjectionToken } from '@angular/core';

export const BASE_URL = new InjectionToken<string>(
  "base url, e.g. 'http://localhost:8080/api'"
);
