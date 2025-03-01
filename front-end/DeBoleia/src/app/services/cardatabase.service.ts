// src/app/services/cardatabase.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarDatabaseService {
  private baseUrl = 'http://localhost:8082/api/cars';
  private baseUrlCarros = 'http://localhost:8083/api/cars';

  constructor(private http: HttpClient) { }

  getAllCars(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  getCarsByBrand(brand: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/models`, { brand });
  }

  getBrandsList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/brands`);
  }

  renameBrand(oldBrand: string, newBrand: string): Observable<any> {
    return this.http.put(`${this.baseUrlCarros}/${oldBrand}`, { newBrand });
  }

  updateCarModel(brand: string, model: string, updates: { 
    newBrand?: string, 
    newModel?: string 
  }): Observable<any> {
    return this.http.put(`${this.baseUrlCarros}/${brand}/${model}`, updates);
  }

  addNewCar(carData: { brand: string, model: string }): Observable<any> {
    return this.http.post(`${this.baseUrlCarros}`, carData);
  }

  createCarModel(brand: string, model: string): Observable<any> {
    return this.http.post(`${this.baseUrlCarros}/${brand}/models`, { model });
  }

}