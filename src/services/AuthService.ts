class AuthService {
  private static TOKEN_KEY = 'token';
  private static ROLE_KEY = 'userRole';

  static login(username: string, password: string) {
    return fetch(`${process.env.REACT_APP_API_URL}/v1/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then((res) => res.json());
  }

  static saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static isLoggedIn() {
    return !!this.getToken();
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static saveRole(role: string) {
    localStorage.setItem(this.ROLE_KEY, role);
  }

  static getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  static logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }

  static clearAuthData() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }
}

export default AuthService;
