// V4
export function formatName(name: string): string {
    if (/\t+/.test(name) || /\n+/.test(name)) {
        throw new Error("O nome não pode conter tabulações ou quebras de linha.");
    }

    const formattedName = name.trim().split(/\s+/).join(" ");
    if (formattedName === "") {
        throw new Error("O nome não pode ser vazio.");
    }
    return formattedName;
}

export function normalizeName(name: string): string {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase();
}