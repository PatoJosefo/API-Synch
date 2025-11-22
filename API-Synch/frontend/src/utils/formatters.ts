export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, "")
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }
  return value
}

export const formatTelefone = (value: string): string => {
  const numbers = value.replace(/\D/g, "")

  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2")
  } else if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2")
  }

  return value
}

export const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, "")
  if (numbers.length <= 8) {
    return numbers.replace(/^(\d{5})(\d{1,3})$/, "$1-$2")
  }
  return value
}

export const removeFormatting = (value: string): string => {
  return value.replace(/\D/g, "")
}

export const validarCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, "")

  if (numbers.length !== 11) return false
  if (/^(\d)\1{10}$/.test(numbers)) return false

  let soma = 0
  let resto

  for (let i = 1; i <= 9; i++) {
    soma += Number.parseInt(numbers.substring(i - 1, i)) * (11 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== Number.parseInt(numbers.substring(9, 10))) return false

  soma = 0
  for (let i = 1; i <= 10; i++) {
    soma += Number.parseInt(numbers.substring(i - 1, i)) * (12 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== Number.parseInt(numbers.substring(10, 11))) return false

  return true
}

export const formatDataBR = (value: string): string => {
  value = value.replace(/\D/g, '');
  value = value.replace(/^(\d{2})(\d{2})(\d{4}).*/, '$1/$2/$3');
  return value.slice(0, 10);
};

export const convertDataBRtoISO = (dataBR: string): string => {
  if (!dataBR || dataBR.length !== 10) {
    return "";
  }
  const [dia, mes, ano] = dataBR.split('/');
  return `${ano}-${mes}-${dia}`;
};
