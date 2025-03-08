import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterModule } from '@angular/router';
import { CarDatabaseService } from '../../services/cardatabase.service';
import { CarsService } from '../../services/cars.service';
import { MessageService } from '../../services/message.service';
import { DatabaseCars } from '../../interfaces/car';
import { CarsEditComponent } from '../../edit/cars-edit/cars-edit.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as Papa from 'papaparse';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-car-database',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    RouterModule,
    MatSelectModule,
  ],
  templateUrl: './car-database.component.html',
  styleUrl: './car-database.component.scss',
})
export class CarDatabaseComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['brand', 'actions'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<DatabaseCars>();

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  brandOptions: string[] = [];
  modelOptions: string[] = [];

  constructor(
    private http: HttpClient,
    private carDatabaseService: CarDatabaseService,
    private carsService: CarsService,
    private messageService: MessageService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadCarBrands();

    this.dataSource.sortingDataAccessor = (item: DatabaseCars, property: keyof DatabaseCars) => {
      const value = item[property];
      if (typeof value === 'string') {
        return value.toLowerCase();
      }
      return value ?? '';
    };
  }

  loadCarBrands(): void {
    this.carDatabaseService.getBrandsList().subscribe({
      next: (brands: string[]) => {
        this.dataSource.data = brands.map(
          (brand: string) => ({ brand } as DatabaseCars)
        );
        console.log("cars retreived from database: ", this.dataSource.data);
      },
      error: (error) => {
        this.messageService.showSnackbar('Error loading brands', 'error');
      },
    });
  }

  filterBrands(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  dataBaseCars: DatabaseCars[] = [];

  addNewCar(): void {
    const dialogRef = this.dialog.open(CarsEditComponent, {
      width: '900px',
      data: {
        brand: '',
        model: '',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Dados recebidos após fechamento do diálogo:', result);

        const newCar: DatabaseCars = {
          brand: result.brand,
          model: result.model,
        };

        console.log('Novo objeto de carsDB a ser enviado:', newCar);

        this.carDatabaseService.addNewCar(newCar).subscribe(
          (response) => {
            this.messageService.showSnackbar(
              'Car created successfully!',
              'success'
            );

            this.loadCarBrands();
          },
          (error) => {
            console.error('Error while creating car:', error);
            this.messageService.showSnackbar(
              'Error while creating car: ' +
              (error.error?.error ? error.error.error : error.message)
            );
          }
        );
      } else {
        console.log('Ação de criação de car foi cancelada');
      }
    });
  }
  loadCSVFile(): void {
    this.http.get('/carros.csv', { responseType: 'text' }).subscribe(
      (data) => {
        const result = Papa.parse(data, {
          header: true,
          skipEmptyLines: true,
        });

        const cars = result.data;
        console.log('json gerado: ', cars);
        this.carDatabaseService.loadCsv(result).subscribe(
          (response) => {
            this.messageService.showSnackbar(
              'CSV loaded successfully!',
              'success'
            );

            this.loadCarBrands();
          },
          (error) => {
            console.error('Error while creating car:', error);
            this.messageService.showSnackbar(
              'Error while uploading csv: ' +
              (error.error?.error ? error.error.error : error.message)
            );
          }
        );
        // this.loadCarBrands();
      },
      (error) => {
        console.error('Error reading the csv file:', error);
      }
    );
  }

  renameBrand(brand: string): void {
    this.messageService
      .showRenameBrandDialog(brand)
      .subscribe((newBrandName: string | null) => {
        if (newBrandName && newBrandName.trim() !== '') {
          this.carDatabaseService
            .renameBrand(brand, newBrandName.trim())
            .subscribe({
              next: () => {
                this.messageService.showSnackbar(
                  'Car maker successfully rebranded!',
                  'success'
                );
                this.loadCarBrands();
              },
              error: (error) => {
                console.error('Error while changing brand name:', error);
                this.messageService.showSnackbar(
                  'Error while changing brand name',
                  'error'
                );
              },
            });
        } else {
          this.messageService.showSnackbar('Invalid brand name.', 'warning');
        }
      });
  }

  viewBrandDetails(brand: string): void {
    this.router.navigate(['/cars', brand]);
  }
}
