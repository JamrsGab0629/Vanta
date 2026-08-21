import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 10 * 60;

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './otp.html',
  styleUrl: './otp.css',
})
export class Otp implements OnInit, OnDestroy {
  /** Where the OTP was sent. shown to the user in masked form (e.g "ab*****@gmail.com") */
  @Input() email = '';

  /** Emits the entered OTP once all digits are filled and the user hits verify. */
  @Output() verified = new EventEmitter<string>();

  /** Emits when the user asks for a new OTP (only fires once the cooldown has elapsed). */
  @Output() resend = new EventEmitter<void>();

  /** Emits when the user wants to go back and edit their details instead. */
  @Output() back = new EventEmitter<void>();

  @ViewChildren('digitInput') private digitInputs!: QueryList<ElementRef<HTMLInputElement>>;

  readonly digits: FormControl<string>[] = Array.from({ length: CODE_LENGTH }, () =>
    new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^[0-9]$/)] })
  );

  errorMessage = '';

  /**
   * Reactive cooldown state. This has to be a signal.
   * Signals explicitly notify the renderer on every set/update, so the countdown ticks correctly.
   */
  readonly secondsRemaining = signal(RESEND_COOLDOWN_SECONDS);
  readonly canResend = computed(() => this.secondsRemaining() <= 0);

  /** displays remaining cooldown as m:ss 9:45 */
  readonly resendCountdownLabel = computed(() => {
    const total = this.secondsRemaining();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.startCooldown();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  // masks the email abcde@gmail.com - "ab*****@gmail.com"
  get maskedEmail(): string {
    const [name, domain] = this.email.split('@');
    if (!name || !domain) {
      return this.email;
    }
    const visible = name.slice(0, Math.min(2, name.length));
    return `${visible}${'•'.repeat(Math.max(name.length - visible.length, 3))}@${domain}`;
  }

  get isComplete(): boolean {
    return this.digits.every((control) => /^[0-9]$/.test(control.value));
  }

  onDigitInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '').slice(-1);

    this.digits[index].setValue(value);
    input.value = value;
    this.errorMessage = '';

    if (value && index < CODE_LENGTH - 1) {
      this.focusDigit(index + 1);
    }
  }

  onKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digits[index].value && index > 0) {
      this.focusDigit(index - 1);
    }
  }

  onPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text').replace(/[^0-9]/g, '') ?? '';
    if (!pasted) {
      return;
    }
    event.preventDefault();

    pasted
      .slice(0, CODE_LENGTH)
      .split('')
      .forEach((char, i) => this.digits[i].setValue(char));

    const nextEmpty = this.digits.findIndex((control) => !control.value);
    this.focusDigit(nextEmpty === -1 ? CODE_LENGTH - 1 : nextEmpty);
  }

  onVerify(): void {
    if (!this.isComplete) {
      this.errorMessage = 'Enter the full 6-digit code.';
      return;
    }

    // this connects to backend for verification endpoint
    const code = this.digits.map((control) => control.value).join('');
    this.verified.emit(code);
  }

  onResend(): void {
    if (!this.canResend()) {
      return;
    }

    this.digits.forEach((control) => control.setValue(''));
    this.errorMessage = '';
    this.focusDigit(0);
    this.startCooldown();
    this.resend.emit();
  }

  onBack(): void {
    this.back.emit();
  }

  private startCooldown(): void {
    this.secondsRemaining.set(RESEND_COOLDOWN_SECONDS);
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      this.secondsRemaining.update((value) => Math.max(value - 1, 0));
      if (this.secondsRemaining() === 0 && this.timer) {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  private focusDigit(index: number): void {
    setTimeout(() => this.digitInputs?.get(index)?.nativeElement.focus());
  }
}
