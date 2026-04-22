import { ValidationResult } from "../../../Domain/types/ValidationResult";

export const validateLogin = (username: string, password: string): ValidationResult => {
  if (!username || username.trim().length < 3) {
    return { uspesno: false, poruka: "Korisničko ime mora imati najmanje 3 karaktera." };
  }
  if (!password || password.length < 6) {
    return { uspesno: false, poruka: "Lozinka mora imati najmanje 6 karaktera." };
  }
  return { uspesno: true, poruka: "" };
};

export const validateRegister = (
  username: string,
  full_name: string,
  email: string,
  password: string
): ValidationResult => {
  if (!username || username.trim().length < 3 || username.trim().length > 50) {
    return { uspesno: false, poruka: "Korisničko ime mora imati između 3 i 50 karaktera." };
  }
  if (!full_name || full_name.trim().length < 2 || full_name.trim().length > 100) {
    return { uspesno: false, poruka: "Ime i prezime mora imati između 2 i 100 karaktera." };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { uspesno: false, poruka: "Email adresa nije ispravna." };
  }
  if (!password || password.length < 6) {
    return { uspesno: false, poruka: "Lozinka mora imati najmanje 6 karaktera." };
  }
  return { uspesno: true, poruka: "" };
};