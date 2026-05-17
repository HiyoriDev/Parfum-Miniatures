import bcrypt from "bcryptjs";

async function main() {
  const password = "Miniature";

  const hash = "$2b$12$LgbGaFxBrfrzBzERhr/hLuW5mQY8KVYJHGlatYWGQVDzzHPFMvlUa";

  const result = await bcrypt.compare(password, hash);

  console.log(result);
}

main();
