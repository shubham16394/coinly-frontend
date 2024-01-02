import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class SnackbarService {
    constructor(private _snackBar: MatSnackBar) {}

    openSnackBar(msg: string) {
        this._snackBar.open(msg, 'Close', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 5000
        });
    }
}