export interface Persona {
  id: string;
  name: string;
  firstName: string;
  role: string;
  initials: string;
  /** Tailwind 300-shade hex used for avatar + accents */
  color: string;
}

export const PERSONAS: Persona[] = [
  {
    id: "arjun",
    name: "Arjun Mehta",
    firstName: "Arjun",
    role: "Frontend Developer",
    initials: "AM",
    color: "#93c5fd", // blue-300
  },
  {
    id: "maya",
    name: "Maya Chen",
    firstName: "Maya",
    role: "UX Designer",
    initials: "MC",
    color: "#67e8f9", // cyan-300
  },
  {
    id: "kavya",
    name: "Kavya Rao",
    firstName: "Kavya",
    role: "HR Manager",
    initials: "KR",
    color: "#f9a8d4", // pink-300
  },
];

export const DEFAULT_PERSONA_ID = "arjun";

export function getPersona(id: string): Persona {
  return PERSONAS.find((persona) => persona.id === id) ?? PERSONAS[0];
}

/** Solid pastel background + dark text — readable in both light and dark themes. */
export function personaAvatarStyle(persona: Persona): React.CSSProperties {
  return { backgroundColor: persona.color, color: "#1e293b" }; // slate-800 on 300-shade pastel
}
