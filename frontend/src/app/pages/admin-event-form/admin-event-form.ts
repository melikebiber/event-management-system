import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  Category,
  CategoryService
} from '../../services/category';

import {
  Location,
  LocationService
} from '../../services/location';

import { EventService } from '../../services/event';

interface CurrentUser {
  id: number;
  role?: string;
}

@Component({
  selector: 'app-admin-event-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './admin-event-form.html',
  styleUrl: './admin-event-form.css'
})
export class AdminEventForm implements OnInit {

  categories: Category[] = [];
  locations: Location[] = [];

  isLoadingOptions = true;
  isSubmitting = false;

  errorMessage = '';
  successMessage = '';

  showLocationForm = false;
isCreatingLocation = false;
locationErrorMessage = '';

  eventForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3)
      ]
    }),

    description: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(10)
      ]
    }),

    event_date: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    start_time: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    end_time: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    capacity: new FormControl<number | null>(
      null,
      {
        validators: [
          Validators.required,
          Validators.min(1)
        ]
      }
    ),

    status: new FormControl('active', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    category_id: new FormControl<number | null>(
      null,
      {
        validators: [
          Validators.required
        ]
      }
    ),

    location_id: new FormControl<number | null>(
      null,
      {
        validators: [
          Validators.required
        ]
      }
    )
  });
  locationForm = new FormGroup({
  location_name: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(3)
    ]
  }),

  address: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required
    ]
  }),

  city: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required
    ]
  }),

  district: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required
    ]
  }),

  capacity: new FormControl<number | null>(
    null,
    {
      validators: [
        Validators.required,
        Validators.min(1)
      ]
    }
  )
});

  constructor(
    private categoryService: CategoryService,
    private locationService: LocationService,
    private eventService: EventService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFormOptions();
  }

  loadFormOptions(): void {
    this.isLoadingOptions = true;
    this.errorMessage = '';

    this.categoryService
      .getAllCategories()
      .subscribe({
        next: (response) => {
          this.categories = response.data ?? [];

          this.finishOptionLoading();
        },

        error: (error) => {
          console.error(
            'Kategoriler alınamadı:',
            error
          );

          this.errorMessage =
            'Kategoriler yüklenemedi.';

          this.finishOptionLoading();
        }
      });

    this.locationService
      .getAllLocations()
      .subscribe({
        next: (response) => {
          this.locations = response.data ?? [];

          this.finishOptionLoading();
        },

        error: (error) => {
          console.error(
            'Konumlar alınamadı:',
            error
          );

          this.errorMessage =
            'Konumlar yüklenemedi.';

          this.finishOptionLoading();
        }
      });
  }

  finishOptionLoading(): void {
    if (
      this.categories.length > 0 &&
      this.locations.length > 0
    ) {
      this.isLoadingOptions = false;
    }

    if (this.errorMessage) {
      this.isLoadingOptions = false;
    }

    this.changeDetector.detectChanges();
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();

      this.errorMessage =
        'Lütfen zorunlu alanları doğru şekilde doldur.';

      return;
    }

    const currentUserText =
      localStorage.getItem('currentUser');

    if (!currentUserText) {
      this.router.navigate(['/login']);
      return;
    }

    let currentUser: CurrentUser;

    try {
      currentUser = JSON.parse(
        currentUserText
      ) as CurrentUser;
    } catch {
      this.errorMessage =
        'Kullanıcı bilgileri okunamadı.';

      return;
    }

    if (!currentUser.id) {
      this.errorMessage =
        'Organizatör kullanıcı bilgisi bulunamadı.';

      return;
    }

    const formData =
      this.eventForm.getRawValue();

    if (
      formData.start_time >=
      formData.end_time
    ) {
      this.errorMessage =
        'Bitiş saati başlangıç saatinden sonra olmalıdır.';

      return;
    }

    if (
      formData.capacity === null ||
      formData.category_id === null ||
      formData.location_id === null
    ) {
      this.errorMessage =
        'Kapasite, kategori ve konum alanları zorunludur.';

      return;
    }

    const eventData = {
      title: formData.title.trim(),
      description:
        formData.description.trim(),
      event_date: formData.event_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      capacity: formData.capacity,
      status: formData.status,
      organizer_id: currentUser.id,
      category_id: formData.category_id,
      location_id: formData.location_id
    };

    this.isSubmitting = true;

    this.eventService
      .createEvent(eventData)
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;

          this.successMessage =
            response.message ??
            'Etkinlik başarıyla oluşturuldu.';

          this.changeDetector.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 1000);
        },

        error: (error) => {
          console.error(
            'Etkinlik oluşturulamadı:',
            error
          );

          this.isSubmitting = false;

          this.errorMessage =
            error.error?.message ??
            error.error?.error ??
            'Etkinlik oluşturulurken bir hata oluştu.';

          this.changeDetector.detectChanges();
        }
      });
  }
toggleLocationForm(): void {
  this.showLocationForm =
    !this.showLocationForm;

  this.locationErrorMessage = '';

  if (!this.showLocationForm) {
    this.locationForm.reset();
  }
}

createLocation(): void {
  this.locationErrorMessage = '';

  if (this.locationForm.invalid) {
    this.locationForm.markAllAsTouched();

    this.locationErrorMessage =
      'Lütfen konum bilgilerini eksiksiz doldur.';

    return;
  }

  const formData =
    this.locationForm.getRawValue();

  if (formData.capacity === null) {
    this.locationErrorMessage =
      'Konum kapasitesi zorunludur.';

    return;
  }

  const locationData = {
    location_name:
      formData.location_name.trim(),

    address:
      formData.address.trim(),

    city:
      formData.city.trim(),

    district:
      formData.district.trim(),

    capacity:
      formData.capacity
  };

  this.isCreatingLocation = true;

  this.locationService
    .createLocation(locationData)
    .subscribe({
      next: (response) => {
        this.isCreatingLocation = false;

        const newLocation =
          response.data ?? response.location;

        if (newLocation) {
          this.locations = [
            ...this.locations,
            newLocation
          ];

          this.eventForm.controls.location_id
            .setValue(
              newLocation.location_id
            );
        } else {
          this.locationService
            .getAllLocations()
            .subscribe({
              next: (locationResponse) => {
                this.locations =
                  locationResponse.data ?? [];
              }
            });
        }

        this.locationForm.reset();
        this.showLocationForm = false;

        this.changeDetector.detectChanges();
      },

      error: (error) => {
        console.error(
          'Konum oluşturulamadı:',
          error
        );

        this.isCreatingLocation = false;

        this.locationErrorMessage =
          error.error?.message ??
          error.error?.error ??
          'Konum oluşturulurken hata oluştu.';

        this.changeDetector.detectChanges();
      }
    });
}
  cancel(): void {
    this.router.navigate(['/admin']);
  }
}