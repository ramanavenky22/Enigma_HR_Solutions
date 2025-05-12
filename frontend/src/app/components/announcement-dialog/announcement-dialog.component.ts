import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

export interface AnnouncementDialogData {
  mode: 'create' | 'edit' | 'view';
  announcement?: {
    id?: string;
    title: string;
    description: string;
    created_by?: string;
    time?: string;
  };
}

@Component({
  selector: 'app-announcement-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <div class="announcement-dialog">
      <h2 mat-dialog-title>
        {{ data.mode === 'create' ? 'New Announcement' : 
           data.mode === 'edit' ? 'Edit Announcement' : 
           'Announcement Details' }}
      </h2>
      
      <div mat-dialog-content>
        <ng-container *ngIf="data.mode === 'view'; else editForm">
          <h3 class="view-title">{{announcement.title}}</h3>
          <p class="view-description">{{announcement.description}}</p>
          <div class="view-meta">
            <span class="time">{{announcement.time}}</span>
            <span class="author" *ngIf="announcement.created_by">by {{announcement.created_by}}</span>
          </div>
        </ng-container>

        <ng-template #editForm>
          <div class="form-field">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Title</mat-label>
              <input matInput [(ngModel)]="announcement.title" required>
            </mat-form-field>
          </div>

          <div class="form-field">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput [(ngModel)]="announcement.description" rows="4" required></textarea>
            </mat-form-field>
          </div>
        </ng-template>
      </div>

      <div mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">{{ data.mode === 'view' ? 'Close' : 'Cancel' }}</button>
        <button 
          *ngIf="data.mode !== 'view'"
          mat-raised-button 
          color="primary" 
          (click)="onSubmit()"
          [disabled]="!announcement.title || !announcement.description"
        >
          {{ data.mode === 'create' ? 'Create' : 'Update' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .announcement-dialog {
      padding: 1rem;
      min-width: 400px;
    }

    .form-field {
      margin-bottom: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .view-title {
      font-size: 1.25rem;
      font-weight: 500;
      color: #2d3748;
      margin: 0 0 1rem;
    }

    .view-description {
      font-size: 0.9375rem;
      line-height: 1.5;
      color: #4a5568;
      white-space: pre-line;
      margin: 0 0 1rem;
    }

    .view-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.75rem;
      color: #718096;
    }
  `]
})
export class AnnouncementDialogComponent {
  announcement: {
    id?: string;
    title: string;
    description: string;
    created_by?: string;
    time?: string;
  };



  constructor(
    public dialogRef: MatDialogRef<AnnouncementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AnnouncementDialogData
  ) {
    this.announcement = data.announcement ? 
      { ...data.announcement } : 
      { title: '', description: '' };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.announcement.title && this.announcement.description) {
      this.dialogRef.close(this.announcement);
    }
  }
}
