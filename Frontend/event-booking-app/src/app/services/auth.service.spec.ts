import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, LoginRequest, LoginResponse } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully', () => {
    const credentials: LoginRequest = {
      username: 'testuser',
      password: 'testpassword'
    };

    const mockResponse: LoginResponse = {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      },
      message: 'Login successful'
    };

    service.login(credentials).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(service.isAuthenticated()).toBeTruthy();
      expect(service.getToken()).toBe('mock-jwt-token');
    });

    const req = httpMock.expectOne(`${environment.backendurl}login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush(mockResponse);
  });

  it('should logout successfully', () => {
    // First set some auth data
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user'
    };
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('current_user', JSON.stringify(mockUser));

    service.logout();

    expect(service.isAuthenticated()).toBeFalsy();
    expect(service.getCurrentUser()).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('current_user')).toBeNull();
  });

  it('should load stored authentication on initialization', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user'
    };
    localStorage.setItem('auth_token', 'stored-token');
    localStorage.setItem('current_user', JSON.stringify(mockUser));

    // Create new service instance to test initialization
    const newService = new AuthService(TestBed.inject(HttpClientTestingModule) as any);
    
    expect(newService.isAuthenticated()).toBeTruthy();
    expect(newService.getToken()).toBe('stored-token');
    expect(newService.getCurrentUser()).toEqual(mockUser);
  });
});