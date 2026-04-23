import { ValidationResult } from "../../../Domain/types/ValidationResult";

export const validateGame = (
  title: string,
  min_players: number,
  max_players: number,
  duration_min: number,
  weight: number,
  year: number,
  publisher: string
): ValidationResult => {
  if (!title || title.trim().length < 1 || title.trim().length > 120) {
    return { uspesno: false, poruka: "Naziv igre mora imati između 1 i 120 karaktera." };
  }
  if (!min_players || min_players < 1) {
    return { uspesno: false, poruka: "Minimalni broj igrača mora biti najmanje 1." };
  }
  if (!max_players || max_players < min_players) {
    return { uspesno: false, poruka: "Maksimalni broj igrača mora biti veći ili jednak minimalnom." };
  }
  if (!duration_min || duration_min < 5) {
    return { uspesno: false, poruka: "Trajanje mora biti najmanje 5 minuta." };
  }
  if (!weight || weight < 1.0 || weight > 5.0) {
    return { uspesno: false, poruka: "Težina mora biti između 1.0 i 5.0." };
  }
  const currentYear = new Date().getFullYear();
  if (!year || year < 1900 || year > currentYear) {
    return { uspesno: false, poruka: `Godina mora biti između 1900 i ${currentYear}.` };
  }
  if (!publisher || publisher.trim().length < 1 || publisher.trim().length > 100) {
    return { uspesno: false, poruka: "Publisher mora imati između 1 i 100 karaktera." };
  }
  return { uspesno: true, poruka: "" };
};
