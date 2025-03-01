import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticatorService } from '../../services/authenticator.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from '../../app.component';
import { provideAnimations } from '@angular/platform-browser/animations';


@Component({
	selector: 'app-user',
	standalone: true,
	imports: [
		FormsModule,
		CommonModule,
		MatTableModule,
		MatPaginatorModule,
		MatSortModule,
		MatInputModule,
		MatFormFieldModule,
		MatIconModule,
		MatListModule,
		MatButtonModule,
		RouterModule,
		MatCardModule,
		ReactiveFormsModule,
		MatCheckboxModule,
	],
	templateUrl: './user.component.html',
	styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit {
	displayedColumns: string[] = [
		'userID',
		'name',
		'email',
		'phoneNumber',
		'status',
		'acoes',
	];
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	user: User[] = [];
	dataSource!: MatTableDataSource<User>;

	constructor(
		private userService: UserService,
		private dialog: MatDialog,
		private router: Router,
		public authenticatorService: AuthenticatorService
	) {}

	ngOnInit(): void {
		this.getAllUsers();
	}

	filterChange(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();
	}

	getAllUsers(): void {
		this.userService.getAllUsers().subscribe({
			next: (data: User[]) => {
				this.user = data;
				this.user = this.user.map((user) => {
					return { ...user };
				});
				console.log('USERS:', this.user);

				this.dataSource = new MatTableDataSource(this.user);
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
				this.dataSource.filterPredicate = (
					data: User,
					filter: string
				) => {
					const dataStr = data.userID + data.name + data.email + data.phoneNumber;
					return dataStr.toLowerCase().includes(filter.toLowerCase());
				};
			},
			error: (error: any) => {
				console.error('Error while loading USERS:', error);
			},
		});
	}

	showDetails(userID: string) {
		this.router.navigate(['/user', userID]);
		console.log('ESTOU_AQUI');
	}
}
