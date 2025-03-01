import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  Validators,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Cars, User } from '../../interfaces/user';
import { UserService } from '../../services/user.service';
import { AuthenticatorService } from '../../services/authenticator.service';
import { Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { UserDialogComponent } from '../../edit/edit-user/edit-user.component';
import Swal from 'sweetalert2';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MessageService } from '../../services/message.service';
import { MatDivider } from '@angular/material/divider';

import { MatSelectModule } from '@angular/material/select';
import { CarsService } from '../../services/cars.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DeleteConfirmationSnackbarComponent } from '../../component/delete-confirmation-snackbar/delete-confirmation-snackbar.component';

import { ChangePasswordComponent } from '../../component/change-password/change-password.component';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
	FormsModule,
	CommonModule,
	RouterModule,
	ReactiveFormsModule,
	MatCardModule,
	MatFormFieldModule,
	MatInputModule,
	MatButtonModule,
	MatCheckboxModule,
	MatDivider,
	MatSelectModule,
	MatSnackBarModule,
  ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent implements OnInit {
  user: any;
  cars: Cars[] = [];
  errorMessage: { [key: string]: any } = {};
  userForm!: FormGroup;
  editingIndex: number | null = null;
  originalCarData: any[] = [];
  isEditing: boolean = false;
  isCreating: boolean = false;
  originalUser: User | null = null;
  userID: string = '';
  setEnd: boolean = false;

  constructor(
	private route: ActivatedRoute,
	private userService: UserService,
	private router: Router,
	public authenticatorService: AuthenticatorService,
	private dialog: MatDialog,
	private messageService: MessageService,
	private fb: FormBuilder,
	private snackBar: MatSnackBar,
	private carsService: CarsService
  ) {
	this.userForm = this.fb.group({
	  userID: [''],
	  name: [''],
	  email: [''],
	  role: [''],
	  phoneNumber: [''],
	  NIF: [''],
	  status: [''],
	  birthDate: [''],
	  driverRating: [''],
	  driverRatingCount: [''],
	  passengerRating: [''],
	  passengerRatingCount: [''],
	  driversLicense: [''],
	  cars: this.fb.array([]),
	});
  }

  loadUserData(): void {
	this.userService.getUserByUserID(this.userID).subscribe({
	  next: (data) => {
		this.user = data;
		this.userForm.patchValue(data);
	  },
	  error: (error) => {
		console.error('Error fetching the user:', error);
	  },
	});
  }

  ngOnInit(): void {
	const roleFromToken = this.authenticatorService.getUserRole();
	{
	  if (roleFromToken === 'admin') {
		this.route.paramMap.subscribe((params) => {
		  const userIDFromRoute = params.get('userID');

		  if (userIDFromRoute) {
			this.userID = userIDFromRoute;
			this.loadAllData(this.userID);
			this.isEditing = true;
			this.loadCarBrands();
		  } else {
			console.error('No userID found in route');
			this.router.navigate(['/users']);
		  }
		});
	  } else {
		const userIDFromToken = this.authenticatorService.getUserID();

		if (userIDFromToken) {
		  this.userID = userIDFromToken;
		  this.loadAllData(this.userID);
		  this.isEditing = true;
		  this.loadCarBrands();
		} else {
		  return;
		}
	  }
	}
  }

  loadAllData(userID: string): void {
	if (this.userID) {
	  this.userService.getUserByUserID(this.userID).subscribe({
		next: (data) => {
		  this.user = data;
		  if (this.user) {
			this.populateUserForm(this.user);
			this.isEditing = true;
		  }
		},
		error: (error) => {
		  console.error('Error loading user data:', error);
		},
	  });
	} else {
	  console.error('Cannot load data: userID is not defined!');
	}
  }

  populateUserForm(user: User): void {
	if (user) {
	  this.userForm.patchValue({
		userID: user.userID || '',
		name: user.name || '',
		email: user.email || '',
		role: user.role || '',
		phoneNumber: user.phoneNumber || '',
		NIF: user.NIF || '',
		birthDate: user.birthDate || '',
		status: user.status === 'active' ? 'active' : 'inactive',
		driverRating: user.driverRating || '',
		driverRatingCount: user.driverRatingCount || '',
		passengerRating: user.passengerRating || '',
		passengerRatingCount: user.passengerRatingCount || '',
		driversLicense: user.driversLicense || '',
	  });

	  const carsArray = this.carsFormArray;
	  carsArray.clear();

	  if (Array.isArray(user.cars)) {
		user.cars.forEach((car: Cars) => {
		  carsArray.push(
			this.fb.group({
			  brand: [car.brand || ''],
			  model: [car.model || ''],
			  color: [car.color || ''],
			  licensePlate: [car.licensePlate || ''],
			})
		  );
		});
	  }
	}
  }

  get carsFormArray(): FormArray {
	return this.userForm.get('cars') as FormArray;
  }

  isAllCarsValid(): boolean {
	let allCarsValid = true;
	this.carsFormArray.controls.forEach((carFormGroup) => {
	  if (!carFormGroup.valid) {
		allCarsValid = false;
	  }
	});
	return allCarsValid;
  }

  onSubmit(): void {
	if (this.userForm.valid && this.isAllCarsValid()) {
	  const formData = this.userForm.value;
	  formData.status = formData.status === 'active' ? 'active' : 'inactive';

	  console.log('Dados do utilizador a serem enviados:', formData); 

	  this.userService.updateUserByUserID(formData.userID, formData).subscribe({
		next: (response) => {
		  this.userForm.patchValue({
			status: formData.status,
		  });

		  if (this.user) {
			this.user.status =
			  formData.status === 'active' ? 'active' : 'inactive';
		  }

		  this.carsFormArray.controls.forEach((carGroup, index) => {
			const carData = carGroup.value;

			if (
			  this.originalCarData[index] &&
			  JSON.stringify(this.originalCarData[index]) !==
				JSON.stringify(carData)
			) {
			  console.log(
				`Dados do carro #${index + 1} a serem enviados:`,
				carData
			  );

			  const carID = carData.licensePlate;
			  this.carsService.updateCar(this.userID, carData).subscribe({
				next: () => {
				  console.log(`Carro ${carID} atualizado com sucesso!`);
				},
				error: (error) => {
				  console.error(`Error while updating car ${carID}:`, error);
				},
			  });
			}
		  });

		  this.loadUserData();
		},
		error: (error) => {
		  console.error('Error updating user:', error);
		},
	  });
	} else {
	  console.log('Invalid form');
	}
  }

  toggleEditMode(): void {
	this.isEditing = true;
	this.userForm.patchValue({ ...this.user! });
  }

  editUser(user: User): void {
	const dialogRef = this.dialog.open(UserDialogComponent, {
	  width: '1200px',
	  data: { user: this.user },
	  autoFocus: true,
	  disableClose: true,
	});

	dialogRef.afterClosed().subscribe((result) => {
	  if (result) {
		const updatedUser: User = {
		  ...this.user,
		  name: result.name ?? this.user.name,
		  email: result.email ?? this.user.email,
		  phoneNumber: result.phoneNumber ?? this.user.phoneNumber,
		  NIF: result.NIF ? result.NIF.toString() : this.user.NIF,
		  birthDate: result.birthDate ?? this.user.birthDate,
		  driversLicense: result.driversLicense ?? this.user.driversLicense,
		  status: result.status ?? this.user.status,
		};
		console.log('User updated:', updatedUser);

		this.userService
		  .updateUserByUserID(this.user.userID, updatedUser)
		  .subscribe({
			next: () => {
			  console.log('User updated successfully!');
			  this.router.navigate(['/user', updatedUser.userID]).then(() => {
				this.loadUserData();
			  });
			},
			error: (error) => {
			  console.error('Error updating user:', error);
			  this.messageService.showSnackbar(error.error.error, 'error');
			},
		  });
	  }
	});
  }

  brandOptions: string[] = [];
  modelOptions: string[] = [];
  colorOptions = [
	'Red',
	'Blue',
	'Green',
	'Yellow',
	'Orange',
	'Purple',
	'Pink',
	'Brown',
	'Black',
	'White',
	'Gray',
	'Cyan',
	'Magenta',
	'Lime',
	'Indigo',
	'Violet',
	'Maroon',
	'Olive',
	'Teal',
	'Navy',
	'Gold',
	'Silver',
	'Beige',
	'Turquoise',
	'Lavender',
  ];

  loadCarBrands(): void {
	this.carsService.getAllCarBrands().subscribe(
	  (response) => {
		this.brandOptions = response;
	  },
	  (error) => {
	  }
	);
  }

  loadCarModels(brand: string): void {
	//console.log('Marca recebida para carregar modelos:', brand);

	this.carsService.getCarModels(brand).subscribe(
	  (response) => {
		if (response && response.length > 0) {
		  //console.log(`Modelos de carros para ${brand}:`, response);
		  this.modelOptions = response;
		  //console.log('modelOptions atualizados:', this.modelOptions);
		} else {
		  //console.warn('Nenhum modelo encontrado para:', brand);
		  this.modelOptions = [];
		}
	  },
	  (error) => {
		console.error('Error finding model cars:', error);
	  }
	);
  }
  loadModelsForExistingBrand(index: number): void {
	const car = this.carsFormArray.at(index);
	const brand = car.get('brand')?.value;

	if (brand) {
	  this.carsService.getCarModels(brand).subscribe(
		(response) => {
		  if (response && response.length > 0) {
			console.log(`Modelos de carros para ${brand}:`, response);
			this.modelOptionsMap[index] = response;
		  }
		},
		(error) => {
		  console.error('Error fetching car models:', error);
		}
	  );
	}
  }

  editCar(index: number): void {
	this.isAddingCar = false;
	this.editingIndex = index;
	const car = this.carsFormArray.at(index).value;
	this.originalCarData[index] = { ...car };
	this.loadModelsForExistingBrand(index);
  }

  onBrandChange(selectedBrand: string | null, index: number): void {
	console.log(
	  `Evento disparado - Marca selecionada para carro ${index}:`,
	  selectedBrand
	);

	if (selectedBrand && selectedBrand.trim() !== '') {
	  console.log('Buscando modelos para:', selectedBrand);
	  this.carsService.getCarModels(selectedBrand).subscribe(
		(response) => {
		  if (response && response.length > 0) {
			console.log(`Modelos de carros para ${selectedBrand}:`, response);
			this.modelOptionsMap[index] = response;

			const currentModel = this.carsFormArray
			  .at(index)
			  .get('model')?.value;
			if (!this.modelOptionsMap[index].includes(currentModel)) {
			  this.carsFormArray.at(index).patchValue({ model: '' });
			}
		  }
		},
		(error) => {
		  console.error('Error while fetching car models:', error);
		}
	  );
	} else {
	  this.modelOptionsMap[index] = [];
	  this.carsFormArray.at(index).patchValue({ model: '' });
	}
  }

  modelOptionsMap: { [key: number]: string[] } = {};

  isEditing1(index: number): boolean {
	return this.editingIndex === index;
  }

  handleSave(index: number): void {
	if (!this.isAddingCar && this.isEditing1(index)) {
	  this.saveCarUpdate(index);
	} else {
	  this.saveCar(index);
	}
  }

  saveCarUpdate(index: number): void {
	const carData = this.carsFormArray.at(index).value;

	if (
	  !carData.brand ||
	  !carData.model ||
	  !carData.color ||
	  !carData.licensePlate
	) {
	  Swal.fire(
		'Erro',
		'Por favor, preencha todos os detalhes do carro',
		'error'
	  );
	  return;
	}

	if (
	  this.originalCarData[index] &&
	  JSON.stringify(this.originalCarData[index]) !== JSON.stringify(carData)
	) {
	  this.carsService.updateCar(this.userID, carData).subscribe({
		next: (response) => {
		  console.log('Car updated successfully:', response);
		  Swal.fire('Sucesso', 'Carro atualizado com sucesso!', 'success');
		  this.originalCarData[index] = null;
		  this.editingIndex = null;
		  this.loadAllData(this.userID);
		},
		error: (error) => {
		  console.error('Error updating car:', error);
		  Swal.fire(
			'Erro',
			'Falha ao atualizar o carro. Tente novamente.',
			'error'
		  );
		},
	  });
	}
  }

  cancelEdit(index: number): void {
	if (this.originalCarData[index]) {
	  this.carsFormArray.at(index).patchValue(this.originalCarData[index]);
	} else {
	  this.carsFormArray.removeAt(index);
	}
	this.originalCarData[index] = null;
	this.editingIndex = null;
	this.isAddingCar = false;
  }

  deleteCar(index: number): void {
	const car = this.carsFormArray.at(index).value;
	const licensePlate = car.licensePlate;

	if (licensePlate) {
	  this.carsService
		.deleteCarByLicensePlate(this.userID, licensePlate)
		.subscribe({
		  next: (response) => {
			console.log(
			  `Car with license plate ${licensePlate} successfully deleted`
			);
			this.carsFormArray.removeAt(index);
		  },
		  error: (error) => {
			console.error('Error deleting car:', error);
		  },
		});
	} else {
	  console.warn('Car license plate not found!');
	}
  }

  isAddingCar: boolean = false;

  addCar() {
	this.isAddingCar = true;
	const newCarGroup = this.fb.group({
	  brand: [''],
	  model: [''],
	  color: [''],
	  licensePlate: [''],
	});
	this.carsFormArray.push(newCarGroup);
	const newIndex = this.carsFormArray.length - 1;
	this.editingIndex = newIndex;
	console.log('Adicionando carro:', newIndex);

	setTimeout(() => {
	  window.scrollTo(0, document.body.scrollHeight);
	}, 0);
  }

  saveCar(index: number): void {
	const carData = this.carsFormArray.at(index).value;

	if (
	  !carData.brand ||
	  !carData.model ||
	  !carData.color ||
	  !carData.licensePlate
	) {
	  Swal.fire('Error', 'Please fill in all car details', 'error');
	  return;
	}

	this.carsService.createCarInUser(this.userID, carData).subscribe({
	  next: (response) => {
		console.log('Car created successfully:', response);
		Swal.fire('Success', 'Car added successfully', 'success');

		this.editingIndex = null;
		this.isAddingCar = false;

		this.loadAllData(this.userID);
	  },
	  error: (error) => {
		console.error('Error creating car:', error);
		Swal.fire('Error', 'Failed to add car. Please try again.', 'error');
	  },
	});
  }

  desativarConta() {
	this.messageService
	  .showConfirmationDialog(
		'Are you sure you want to deactivate this account? (Enter your email to confirm)',
		'Deactivate Account',
		this.authenticatorService.getUserEmail() || ''
	  )
	  .subscribe((result) => {
		if (result) {
		  this.userService
			.changeStatusByEmail(
			  this.authenticatorService.getUserEmail() ?? '',
			  { status: 'inactive' }
			)
			.subscribe(
			  () => {
				this.messageService.showSnackbar(
				  'Account successfully deactivated!',
				  'success'
				);
				this.authenticatorService.logout();
			  },
			  (error) => {
				console.error('Error deactivating account', error);
				this.messageService.showSnackbar(
				  'Error deactivating account: ' + error.error.message,
				  'error'
				);
			  }
			);
		}
	  });
  }

  confirmDeleteCar(index: number): void {
	const snackBarRef = this.snackBar.openFromComponent(
	  DeleteConfirmationSnackbarComponent,
	  {
		data: { message: `Are you sure you want to delete car #${index + 1}?` },
		duration: 10000,
		panelClass: ['center-snackbar'],
	  }
	);

	snackBarRef.afterDismissed().subscribe(() => {
	  console.log('Snackbar closed');
	});

	snackBarRef.onAction().subscribe(() => {
	  this.deleteCar(index);
	});
  }

  formatLicensePlate(event: any): void {
	let value = event.target.value.toUpperCase(); 
	value = value.replace(/[^A-Z0-9]/gi, '');

	if (value.length > 2) {
	  value = value.substring(0, 2) + '-' + value.substring(2);
	}
	if (value.length > 5) {
	  value = value.substring(0, 5) + '-' + value.substring(5);
	}

	const parts = value.split('-');
	if (parts.length > 3) {
	  value = parts.slice(0, 3).join('-');
	}
	event.target.value = value;
  }
}
