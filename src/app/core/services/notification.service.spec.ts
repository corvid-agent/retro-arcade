import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty toasts', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('should add a toast', () => {
    service.show('Hello', 'info');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Hello');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('should dismiss a toast', () => {
    service.show('Hello', 'info');
    const id = service.toasts()[0].id;
    service.dismiss(id);
    expect(service.toasts()).toEqual([]);
  });

  it('should auto-dismiss after duration', async () => {
    service.show('Hello', 'info', 100);
    expect(service.toasts().length).toBe(1);
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(service.toasts().length).toBe(0);
  });

  it('should support multiple toasts', () => {
    service.show('First', 'info');
    service.show('Second', 'success');
    service.show('Third', 'error');
    expect(service.toasts().length).toBe(3);
  });

  it('should assign unique IDs', () => {
    service.show('A', 'info');
    service.show('B', 'info');
    const ids = service.toasts().map((t) => t.id);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('should default to info type', () => {
    service.show('Test');
    expect(service.toasts()[0].type).toBe('info');
  });
});
